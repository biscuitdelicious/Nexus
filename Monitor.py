import subprocess
import os
import time
import struct
import platform
import urllib.request
import urllib.error
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ─── Configuratie ─────────────────────────────────────────────────────────────

email_expeditor  = "victor05florea@gmail.com"
parola_aplicatie = os.getenv("GMAIL_PASSWORD")

mod_testare      = True
email_test       = "victor05florea@gmail.com"
emailuri_nokia   = ["nokia-support@nokia.ro", "nokia-staff@nokia.ro"]

prag_critic      = float(os.getenv("PRAG_CRITIC", "50.0"))
secunde_pauza    = int(os.getenv("SECUNDE_PAUZA", "600"))
interval_citire  = int(os.getenv("INTERVAL_CITIRE", "3"))
lhm_port         = int(os.getenv("LHM_PORT", "8085"))
senzor_nume      = os.getenv("SENSOR_NAME", "cpu_temp")

# ID-ul senzorului din tabela `sensors` (vezi 001_init.sql: SN-001 = CPU Monitor)
sensor_id_api    = int(os.getenv("SENSOR_ID", "1"))

# URL-ul backend-ului Go (containerul infrapulse-api)
api_base         = os.getenv("API_BASE_URL", "http://localhost:8080").rstrip("/")
readings_url     = f"{api_base}/readings"
webhook_url      = os.getenv("GRAFANA_WEBHOOK_URL", f"{api_base}/webhook/grafana")
api_activ        = os.getenv("API_ENABLED", "true").lower() == "true"
webhook_activ    = os.getenv("WEBHOOK_ENABLED", "true").lower() == "true"

sistem           = platform.system()

# ─── Temperatura ──────────────────────────────────────────────────────────────

def _lhm_web():
    def cauta(nod):
        valori = []
        nume = nod.get("Text", "")
        val_str = nod.get("Value", "")
        cuvinte = ["CPU Package", "Core #", "CPU Core", "CPU Total", "Core Average"]
        if any(k in nume for k in cuvinte) and "\u00b0C" in val_str:
            try:
                valori.append(float(val_str.replace("\u00b0C", "").replace(",", ".").strip()))
            except Exception:
                pass
        for copil in nod.get("Children", []):
            valori.extend(cauta(copil))
        return valori
    try:
        with urllib.request.urlopen(f"http://localhost:{lhm_port}/data.json", timeout=2) as r:
            date = json.loads(r.read().decode())
        toate = cauta(date)
        return max(toate) if toate else None
    except Exception:
        return None

def _acpi_wmi():
    try:
        out = subprocess.check_output(
            ["wmic", "/namespace:\\\\root\\wmi", "PATH",
             "MSAcpi_ThermalZoneTemperature", "get", "CurrentTemperature"],
            stderr=subprocess.DEVNULL, timeout=5
        ).decode("utf-8", errors="ignore")
        linii = [l.strip() for l in out.split("\n") if l.strip().isdigit()]
        if linii:
            return (int(linii[0]) - 2732) / 10.0
    except Exception:
        pass
    return None

def _linux_thermal():
    for i in range(10):
        try:
            with open(f"/sys/class/thermal/thermal_zone{i}/type") as f:
                tip = f.read().strip().lower()
            if "cpu" in tip or "x86" in tip or i == 0:
                with open(f"/sys/class/thermal/thermal_zone{i}/temp") as f:
                    return int(f.read().strip()) / 1000.0
        except FileNotFoundError:
            break
        except Exception:
            continue
    return None

def _macos_powermetrics():
    try:
        out = subprocess.check_output(
            ["sudo", "powermetrics", "--samplers", "smc", "-n", "1", "-i", "1"],
            stderr=subprocess.DEVNULL, timeout=5
        ).decode("utf-8")
        for linie in out.splitlines():
            if "CPU die temperature" in linie:
                return float(linie.split(":")[1].replace("C", "").strip())
    except Exception:
        pass
    return None

def _macos_smc():
    try:
        cale = "/Applications/smcFanControl.app/Contents/Resources/smc"
        out = subprocess.check_output([cale, "-k", "Tp0P", "-r"], timeout=3).decode()
        hex_str = out.split("bytes ")[1].split(")")[0].replace(" ", "")
        return struct.unpack("<f", bytes.fromhex(hex_str))[0]
    except Exception:
        pass
    return None

_lhm_avertizat = False

def obtine_temperatura():
    global _lhm_avertizat

    if sistem == "Windows":
        temp = _lhm_web()
        if temp is not None:
            _lhm_avertizat = False
            return temp
        if not _lhm_avertizat:
            print("[ATENTIE] LHM web server offline - temperatura ACPI imprecisa (~27C).")
            print(f"          Porneste LibreHardwareMonitor ca Admin si activeaza")
            print(f"          Options -> Remote Web Server -> Run (port {lhm_port})")
            _lhm_avertizat = True
        return _acpi_wmi()

    elif sistem == "Linux":
        return _linux_thermal()

    elif sistem == "Darwin":
        temp = _macos_powermetrics()
        return temp if temp is not None else _macos_smc()

    return None

# ─── Client HTTP pentru backend-ul Go ────────────────────────────────────────

def _post_json(url, payload, timeout=5):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if 200 <= resp.status < 300:
                return True
            print(f"[{time.strftime('%H:%M:%S')}] POST {url} -> HTTP {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"[{time.strftime('%H:%M:%S')}] POST {url} HTTP error: {e.code}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] POST {url} eroare: {e}")
    return False

def trimite_reading(temp):
    """Publish a reading for the chart."""
    if not api_activ:
        return False
    payload = {
        "sensor_id": sensor_id_api,
        "value": round(float(temp), 2),
        "host": platform.node(),
        "time": datetime.now(timezone.utc).isoformat(),
    }
    return _post_json(readings_url, payload)

def trimite_alerta_grafana(temp, severity, summary):
    """
    Backend expects Grafana's alert-manager webhook shape. One 'firing' alert
    per call is enough to create a matching event/ticket.
    """
    if not webhook_activ:
        return False

    payload = {
        "status": "firing",
        "alerts": [
            {
                "status": "firing",
                "labels": {
                    "sensor_id": str(sensor_id_api),
                    "severity": severity,  # "critical" -> incident, "warning" -> alarm
                    "host": platform.node(),
                    "sensor": senzor_nume,
                },
                "annotations": {
                    "summary": summary,
                    "description": f"Temperatura {temp:.1f}°C (prag {prag_critic}°C)",
                },
                "startsAt": datetime.now(timezone.utc).isoformat(),
                "fingerprint": f"{sensor_id_api}-{severity}-{int(time.time())}",
            }
        ],
    }
    return _post_json(webhook_url, payload)

# ─── Notificare email ─────────────────────────────────────────────────────────

def executa_notificare(temp, motiv):
    destinatari = [email_test] if mod_testare else emailuri_nokia

    msg = MIMEMultipart()
    msg["From"] = email_expeditor
    msg["To"] = ", ".join(destinatari)
    msg["Subject"] = f"Alarma Nokia (InfraPulse) ({sistem}): {temp:.1f}°C"

    body = f"Motiv: {motiv}. Temperatura: {temp:.1f}°C. Prag critic: {prag_critic}°C"
    msg.attach(MIMEText(body, "plain"))

    if not parola_aplicatie:
        print(f"[{time.strftime('%H:%M:%S')}] GMAIL_PASSWORD lipsa; skip email.")
        return

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(email_expeditor, parola_aplicatie)
            server.sendmail(email_expeditor, destinatari, msg.as_string())
        print(f"[{time.strftime('%H:%M:%S')}] Notificare trimisa -> {destinatari}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Eroare trimitere email: {e}")

# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"[INFO] Monitor pornit pe {sistem}. Prag critic: {prag_critic}°C")
    print(f"[INFO] API backend: {api_base} (readings=on:{api_activ}, webhook=on:{webhook_activ})")
    print(f"[INFO] Sensor ID: {sensor_id_api}  |  interval: {interval_citire}s")

    incident_activ       = False
    timp_start_incident  = 0
    numar_incidente      = 0
    timp_start_fereastra = 0

    while True:
        temperatura = obtine_temperatura()

        if numar_incidente > 0 and (time.time() - timp_start_fereastra > 100):
            numar_incidente = 0
            print(f"[{time.strftime('%H:%M:%S')}] Resetare interval incidente")

        if temperatura is not None:
            trimite_reading(temperatura)

            if temperatura > prag_critic:
                if not incident_activ:
                    incident_activ       = True
                    timp_start_incident  = time.time()
                    if numar_incidente == 0:
                        timp_start_fereastra = time.time()
                    numar_incidente += 1
                    print(f"[{time.strftime('%H:%M:%S')}] Incident pornit | "
                          f"Total: {numar_incidente} | Temp: {temperatura:.1f}°C")
                    trimite_alerta_grafana(
                        temperatura,
                        severity="warning",
                        summary="Depasire prag critic temperatura CPU",
                    )

                durata = time.time() - timp_start_incident

                if durata >= 10:
                    print(f"[{time.strftime('%H:%M:%S')}] ALARMA: Incident > 10s!")
                    executa_notificare(temperatura, "Incident persistent > 10 secunde")
                    trimite_alerta_grafana(
                        temperatura,
                        severity="critical",
                        summary="Incident persistent > 10 secunde",
                    )
                    incident_activ  = False
                    numar_incidente = 0
                    time.sleep(secunde_pauza)
                    continue

                elif numar_incidente >= 3:
                    print(f"[{time.strftime('%H:%M:%S')}] ALARMA: 3 incidente recurente!")
                    executa_notificare(temperatura, "3 incidente recurente in 100 secunde")
                    trimite_alerta_grafana(
                        temperatura,
                        severity="critical",
                        summary="3 incidente recurente in 100 secunde",
                    )
                    incident_activ  = False
                    numar_incidente = 0
                    time.sleep(secunde_pauza)
                    continue

            else:
                if incident_activ:
                    incident_activ = False
                    print(f"[{time.strftime('%H:%M:%S')}] Incident inchis (temperatura normalizata)")
                else:
                    print(f"[{time.strftime('%H:%M:%S')}] OK: {temperatura:.1f}°C")
        else:
            print(f"[{time.strftime('%H:%M:%S')}] Eroare: senzor temperatura indisponibil.")

        time.sleep(interval_citire)