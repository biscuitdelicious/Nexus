const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorMsg = await response.text();
    console.error('API Error:', errorMsg);
    throw new Error(`Server error: ${response.status}`);
  }
  return response.json();
};

// Map backend severity -> UI label used by existing components.
const severityToUi = (sev) => {
  switch ((sev || '').toLowerCase()) {
    case 'incident': return 'INCIDENT';
    case 'alarm':    return 'ALARM';
    case 'warning':  return 'ALARM';
    case 'critical': return 'INCIDENT';
    case 'notification':
    case 'info':
    case 'event':    return 'EVENT';
    default:         return (sev || 'EVENT').toUpperCase();
  }
};

const statusToUi = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'acknowledged': return 'ACKNOWLEDGED';
    case 'resolved':     return 'RESOLVED';
    default:             return 'PENDING';
  }
};

const formatTimestamp = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const formatClockLabel = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  } catch {
    return '';
  }
};

// ─────────────────────────────────────── Sensors / devices

// Priority used to pick worst status per sensor: higher = worse.
const STATUS_PRIORITY = { Healthy: 0, Event: 1, Incident: 2, Alarm: 3 };

const severityToDeviceStatus = (uiSeverity) => {
  switch (uiSeverity) {
    case 'ALARM':    return 'Alarm';
    case 'INCIDENT': return 'Incident';
    case 'EVENT':    return 'Event';
    default:         return 'Event';
  }
};

export const fetchDevices = async () => {
  try {
    const [sensorsRes, eventsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/sensors`).then(handleResponse).catch(() => []),
      fetch(`${API_BASE_URL}/events/open`).then(handleResponse).catch(() => []),
    ]);

    // Keep only events without ACK (PENDING). `/events/open` already excludes
    // resolved, but acknowledged events can still be open.
    const pending = (eventsRes || []).filter((e) => {
      const s = (e.Status || e.status || '').toLowerCase();
      return s !== 'acknowledged' && s !== 'resolved';
    });

    // sensor_id -> worst UI status
    const worstBySensor = new Map();
    for (const e of pending) {
      const sid = e.SensorID ?? e.sensor_id;
      if (sid == null) continue;
      const status = severityToDeviceStatus(severityToUi(e.Severity || e.severity));
      const prev = worstBySensor.get(sid);
      if (!prev || STATUS_PRIORITY[status] > STATUS_PRIORITY[prev]) {
        worstBySensor.set(sid, status);
      }
    }

    return (sensorsRes || []).map((sensor) => {
      const id = sensor.SensorID ?? sensor.sensor_id ?? sensor.id;
      const derived = worstBySensor.get(id);
      return {
        id,
        name: sensor.Name || sensor.name || sensor.SensorNo || 'Unnamed Sensor',
        type: sensor.Type || sensor.type || 'Sensor',
        status: derived || sensor.status || sensor.Status || 'Healthy',
        ip: sensor.ip || sensor.IP || sensor.SensorNo || 'N/A',
        locationId: sensor.LocationID ?? sensor.location_id,
      };
    });
  } catch (err) {
    console.error('Fetch sensors failed', err);
    return [];
  }
};

// ─────────────────────────────────────── Tickets / events

export const fetchTickets = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/events/open`);
    const parsed = await handleResponse(res);
    return (parsed || []).map((event) => ({
      id: event.EventID ?? event.event_id ?? event.id ?? `TK-${Math.random().toString(36).slice(2, 8)}`,
      ts: formatTimestamp(event.CreatedAt || event.created_at),
      source: `SN-${String(event.SensorID ?? event.sensor_id ?? '').padStart(3, '0')}`,
      message: event.Message || event.message || 'Fara descriere',
      severity: severityToUi(event.Severity || event.severity),
      status: statusToUi(event.Status || event.status),
      metricValue: event.MetricValue ?? event.metric_value ?? null,
    }));
  } catch (err) {
    console.error('Fetch tickets failed', err);
    return [];
  }
};

export const acknowledgeTicket = async (ticketId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/events/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'acknowledged' }),
    });
    if (!res.ok) throw new Error('ack failed');
    return { success: true, id: ticketId, status: 'ACKNOWLEDGED' };
  } catch (err) {
    console.error('Ack failed', err);
    return { success: false };
  }
};

export const fetchLiveFeed = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/events`);
    const parsed = await handleResponse(res);
    return (parsed || []).map((event) => ({
      id: event.EventID ?? event.event_id ?? `LOG-${Math.random().toString(36).slice(2, 8)}`,
      ts: formatTimestamp(event.CreatedAt || event.created_at),
      type: severityToUi(event.Severity || event.severity),
      message: event.Message || event.message || 'Fara detalii',
      source: `SN-${String(event.SensorID ?? event.sensor_id ?? '').padStart(3, '0')}`,
    }));
  } catch {
    return [];
  }
};

// ─────────────────────────────────────── Time-series readings

// Returns chart points `[{ time: 'HH:MM:SS', cpu: 67.5 }, ...]` for ChartWidget.
export const fetchChartData = async ({ sensorId = 1, limit = 60, range = '' } = {}) => {
  try {
    const qs = new URLSearchParams({ sensor_id: String(sensorId), limit: String(limit) });
    if (range) qs.set('range', range);
    const res = await fetch(`${API_BASE_URL}/readings?${qs.toString()}`);
    const parsed = await handleResponse(res);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => ({
      time: formatClockLabel(row.time ?? row.Time),
      cpu: Number(row.value ?? row.Value ?? 0),
    }));
  } catch (err) {
    console.error('fetchChartData failed', err);
    return [];
  }
};

export const fetchLatestReadings = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/readings/latest`);
    const parsed = await handleResponse(res);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ─────────────────────────────────────── Derived stats for widgets

// Returns meta + mapped chart points so UI can distinguish:
// - API error vs empty dataset (no readings yet)
export const fetchChartDataStatus = async ({ sensorId = 1, limit = 60, range = '' } = {}) => {
  try {
    const qs = new URLSearchParams({ sensor_id: String(sensorId), limit: String(limit) });
    if (range) qs.set('range', range);
    const res = await fetch(`${API_BASE_URL}/readings?${qs.toString()}`);
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      return { ok: false, status: res.status, message: msg || res.statusText || 'Request failed', data: [] };
    }
    const parsed = await res.json();
    if (!Array.isArray(parsed)) return { ok: true, status: 200, message: '', data: [] };
    return {
      ok: true,
      status: 200,
      message: '',
      data: parsed.map((row) => ({
        time: formatClockLabel(row.time ?? row.Time),
        cpu: Number(row.value ?? row.Value ?? 0),
      })),
    };
  } catch (err) {
    return { ok: false, status: 0, message: err?.message || 'Network error', data: [] };
  }
};

// Counts open+all events grouped by severity for SeverityPieChart.
export const fetchSeverityData = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/events`);
    const parsed = await handleResponse(res);
    const counts = { ALARM: 0, INCIDENT: 0, EVENT: 0 };
    (parsed || []).forEach((e) => {
      const key = severityToUi(e.Severity || e.severity);
      counts[key] = (counts[key] || 0) + 1;
    });
    return [
      { name: 'ALARM', value: counts.ALARM || 0, color: '#FF003C' },
      { name: 'INCIDENT', value: counts.INCIDENT || 0, color: '#FFA500' },
      { name: 'EVENT', value: counts.EVENT || 0, color: '#888888' },
    ];
  } catch {
    return [
      { name: 'ALARM', value: 0, color: '#FF003C' },
      { name: 'INCIDENT', value: 0, color: '#FFA500' },
      { name: 'EVENT', value: 0, color: '#888888' },
    ];
  }
};

// Latest reading-based quick stats for the top cards on Dashboard.
export const fetchDashboardMetrics = async () => {
  try {
    const [chartRes, tickets] = await Promise.all([
      fetchChartDataStatus({ sensorId: 1, limit: 5 }),
      fetchTickets(),
    ]);
    const chart = chartRes?.data || [];
    const latest = chart.length ? chart[chart.length - 1].cpu : null;
    const pending = tickets.filter((t) => t.status !== 'ACKNOWLEDGED' && t.status !== 'RESOLVED').length;
    return [
      {
        id: 1,
        title: 'CPU TEMP',
        value: chartRes?.ok === false ? 'ERR' : (latest !== null ? `${latest.toFixed(1)}°C` : '—'),
      },
      { id: 2, title: 'OPEN TICKETS', value: String(pending) },
      { id: 3, title: 'TOTAL EVENTS', value: String(tickets.length) },
      { id: 4, title: 'SENSOR ID', value: 'SN-001' },
    ];
  } catch {
    return [
      { id: 1, title: 'CPU TEMP', value: '—' },
      { id: 2, title: 'OPEN TICKETS', value: '0' },
      { id: 3, title: 'TOTAL EVENTS', value: '0' },
      { id: 4, title: 'SENSOR ID', value: 'SN-001' },
    ];
  }
};

// Average resolution bar chart – still synthetic until backend aggregates.
export const fetchResolutionData = async () => [
  { day: 'Mon', time: 120 },
  { day: 'Tue', time: 85 },
  { day: 'Wed', time: 100 },
];

export const fetchObservabilityMetrics = async () => [
  { id: 1, label: 'UPTIME', value: '0h 53 m', sublabel: 'Last 30 days' },
  { id: 2, label: 'ERROR RATE', value: '<1%', sublabel: 'vs 0.15% avg' },
];
