import subprocess
import time
import os
import struct
import apprise
import platform
from dotenv import load_dotenv

load_dotenv()

email_expeditor="victor05florea@gmail.com"
parola_aplicatie=os.getenv("GMAIL_PASSWORD")

mod_testare=True
email_test="victor05florea@gmail.com"
emailuri_nokia=["nokia-support@nokia.ro","nokia-staff@nokia.ro"]

prag_critic=68.0
secunde_pauza=600
sistem_operare=platform.system()

def obtine_temperatura():
    try:
        if sistem_operare=="Windows":
            iesire=subprocess.check_output(
                ["wmic", "/namespace:\\\\root\\wmi","PATH","MSAcpi_ThermalZoneTemperature", "get",
                 "CurrentTemperature"]).decode("utf-8")
            valoare_bruta=int(iesire.split("\n")[1].strip())
            return (valoare_bruta-2732)/10.0

        elif sistem_operare=="Linux":
            with open("/sys/class/thermal/thermal_zone0/temp","r") as fisier:
                return int(fisier.read().strip())/1000.0

        elif sistem_operare=="Darwin":
            cale_smc="/Applications/smcFanControl.app/Contents/Resources/smc"
            cheie_cpu="Tp0P"
            iesire_raw=subprocess.check_output([cale_smc, "-k", cheie_cpu, "-r"]).decode("utf-8")
            string_hex=iesire_raw.split("bytes ")[1].split(")")[0].replace(" ","")
            return struct.unpack("<f",bytes.fromhex(string_hex))[0]
    except:
        pass
    return None


def executa_notificare(temp_citita, motiv):
    user_gmail=email_expeditor.split("@")[0]
    destinatari=[email_test] if mod_testare else emailuri_nokia

    manager=apprise.Apprise()
    for adresa in destinatari:
        manager.add(f"mailto://{user_gmail}:{parola_aplicatie}@gmail.com?to={adresa}")

    manager.notify(
        title=f"Alarma Nokia(InfraPulse) ({sistem_operare}): {temp_citita:.1f}°C",
        body=f"Motiv: {motiv}. Temperatura: {temp_citita:.1f}°C. Prag critic: {prag_critic}°C"
    )

if __name__=="__main__":

    incident_activ=False
    timp_start_incident=0
    numar_incidente=0
    timp_start_fereastra=0

    while True:
        temperatura=obtine_temperatura()
        if numar_incidente>0 and (time.time()-timp_start_fereastra>100):
            numar_incidente=0
            print("Resetare interval")

        if temperatura is not None:
            if temperatura>prag_critic:
                if not incident_activ:
                    incident_activ=True
                    timp_start_incident=time.time()
                    if numar_incidente==0:
                        timp_start_fereastra=time.time()
                    numar_incidente+=1
                    print(
                        f"[{time.strftime('%H:%M:%S')}] Incident pornit \nTotal: {numar_incidente} incident(e). Temp: {temperatura:.1f}°C")

                durata_incident=time.time()-timp_start_incident

                #Regula 1: incident persista peste 10 secunde (pentru demonstratie)
                if durata_incident>=10:
                    print(f"[{time.strftime('%H:%M:%S')}] Alarma: Incident persista > 10s!")
                    executa_notificare(temperatura, "Incidentul a persistat mai mult de  10 secunde")
                    incident_activ=False
                    numar_incidente=0
                    time.sleep(secunde_pauza)
                    continue

                #Regula 2: numarul de incidente > 3
                elif numar_incidente>=3:
                    print(f"[{time.strftime('%H:%M:%S')}] Alarma: 3 Incidente atinse!")
                    executa_notificare(temperatura,"3 Incidente recurente")
                    incident_activ=False
                    numar_incidente=0
                    time.sleep(secunde_pauza)
                    continue

            else:
                if incident_activ:
                    incident_activ=False
                    print(f"[{time.strftime('%H:%M:%S')}] Incident inchis(Temperatura a scazut)")
                else:
                    print(f"[{time.strftime('%H:%M:%S')}] OK: {temperatura:.1f}°C")
        else:
            print(f"[{time.strftime('%H:%M:%S')}] Eroare citire senzor.")

        time.sleep(3)