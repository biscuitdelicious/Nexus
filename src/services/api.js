import { COLORS } from '../theme/colors';
import { getChatApiBaseUrl } from './chatApi';
import { apiFetch } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


/**
 * Read the currently logged-in user from sessionStorage.
 * Returns the parsed user object, or null if nobody is logged in.
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('nexus_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Returns the user_id of the logged-in user, or null. */
export const getCurrentUserId = () => getCurrentUser()?.user_id ?? null;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorMsg = await response.text();
    console.error('API Error:', errorMsg);
    throw new Error(`Server error: ${response.status}`);
  }
  return response.json();
};

// Lightweight read cache: dedupes identical GETs fired close together by the
// many independent pollers (dashboard, tickets, charts, notifications) and
// serves a short-TTL cached body. Cuts redundant requests + DB hits.
const _readCache = new Map();   // url -> { ts, data }
const _inflight = new Map();    // url -> Promise

const cachedGetJSON = async (url, ttlMs = 4000) => {
  const now = Date.now();
  const hit = _readCache.get(url);
  if (hit && now - hit.ts < ttlMs) return hit.data;
  if (_inflight.has(url)) return _inflight.get(url);

  const p = apiFetch(url)
    .then(handleResponse)
    .then((data) => {
      _readCache.set(url, { ts: Date.now(), data });
      _inflight.delete(url);
      return data;
    })
    .catch((err) => {
      _inflight.delete(url);
      throw err;
    });

  _inflight.set(url, p);
  return p;
};

// Drop cached reads after a mutation so the next poll sees fresh data.
const invalidateReadCache = () => {
  _readCache.clear();
  _inflight.clear();
};

// Map backend severity -> UI label used by existing components.
const severityToUi = (sev) => {
  switch ((sev || '').toLowerCase()) {
    case 'incident': return 'INCIDENT';
    case 'alarm':    return 'ALARM';
    case 'warning':  return 'ALARM';
    case 'critical': return 'INCIDENT';
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

// Formats the timestamp from BE to string for UI
const formatTimestamp = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) 
      return iso;
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
      cachedGetJSON(`${API_BASE_URL}/sensors`).catch(() => []),
      cachedGetJSON(`${API_BASE_URL}/events/open`).catch(() => []),
    ]);

    const pending = (eventsRes || []).filter((e) => {
      const s = (e.Status  || '').toLowerCase();
      return s !== 'acknowledged' && s !== 'resolved';
    });

    const worstBySensor = new Map();
    for (const e of pending) {
      const sid = e.SensorID;

      if (sid == null)
        continue;

      const status = severityToDeviceStatus(severityToUi(e.Severity));
      const prev = worstBySensor.get(sid);
      if (!prev || STATUS_PRIORITY[status] > STATUS_PRIORITY[prev]) {
        worstBySensor.set(sid, status);
      }
    }

    return (sensorsRes || []).map((sensor) => {
      const id = sensor.SensorID;
      const derived = worstBySensor.get(id);
      return {
        id,
        name: sensor.Name || 'Unnamed Sensor',
        type: 'Sensor',
        status: derived || 'Healthy',
        ip: sensor.SensorNo || 'N/A',
        unit: sensor.Unit || '',
        locationId: sensor.LocationID,
      };
    });
  } catch (err) {
    console.error('Fetch sensors failed', err);
    return [];
  }
};

export const fetchLocations = async () => {
  try {
    const res = await apiFetch(`${API_BASE_URL}/locations`);
    const parsed = await handleResponse(res);
    return (parsed || []).map((loc) => ({
      id: loc.LocationID,
      name: loc.Name,
    }));
  } catch (err) {
    console.error('Fetch locations failed', err);
    return [];
  }
};

export const createSensor = async ({ name, sensorNo, locationId, unit, lowerLimit, upperLimit }) => {
  try {
    const body = {
      Name: name,
      SensorNo: sensorNo,
      LocationID: Number(locationId),
      Unit: unit,
      UpdatedUserID: getCurrentUserId() ?? 1, // logged-in user; fallback admin (1)
      LowerLimit: lowerLimit !== '' && lowerLimit != null ? Number(lowerLimit) : null,
      UpperLimit: upperLimit !== '' && upperLimit != null ? Number(upperLimit) : null,
    };
    const res = await apiFetch(`${API_BASE_URL}/sensors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      return { ok: false, message: msg || `HTTP ${res.status}` };
    }
    const created = await res.json();
    invalidateReadCache();
    return { ok: true, sensor: created };
  } catch (err) {
    return { ok: false, message: err?.message || 'Network error' };
  }
};


export const fetchTickets = async () => {
  try {
    const parsed = await cachedGetJSON(`${API_BASE_URL}/events/open`);
    return (parsed || []).map((event) => ({
      id: event.EventID ?? `TK-${Math.random().toString(36).slice(2, 8)}`,
      ts: formatTimestamp(event.CreatedAt),
      source: `SN-${String(event.SensorID).padStart(3, '0')}`,
      message: event.Message || 'Fara descriere',
      severity: severityToUi(event.Severity),
      status: statusToUi(event.Status),
      metricValue: event.MetricValue ?? null,
    }));
  } catch (err) {
    console.error('Fetch tickets failed', err);
    return [];
  }
};

// Snoozed events dissapear from the open tickets till the timer expires
export const snoozeTicket = async (ticketId, duration) => {
  try {
    const res = await apiFetch(`${API_BASE_URL}/events/${ticketId}/snooze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      return { ok: false, message: msg || `HTTP ${res.status}` };
    }
    const data = await res.json();
    invalidateReadCache();
    return { ok: true, ...data };
  } catch (err) {
    return { ok: false, message: err?.message || 'Network error' };
  }
};

export const acknowledgeTicket = async (ticketId) => {
  try {
    const res = await apiFetch(`${API_BASE_URL}/events/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'acknowledged' }),
    });
    if (!res.ok)
      throw new Error('ack failed');
    invalidateReadCache();
    return { success: true, id: ticketId, status: 'ACKNOWLEDGED' };
  } catch (err) {
    console.error('Ack failed', err);
    return { success: false };
  }
};

// Clears all active alerts: DELETE /events removes every non-resolved event.
// Used by the Devices "Clear Alerts" button.
export const clearAllAlerts = async () => {
  try {
    const res = await apiFetch(`${API_BASE_URL}/events`, { method: 'DELETE' });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      return { ok: false, message: msg || `HTTP ${res.status}` };
    }
    const data = await res.json().catch(() => ({}));
    invalidateReadCache();
    return { ok: true, deleted: data.deleted ?? 0 };
  } catch (err) {
    return { ok: false, message: err?.message || 'Network error' };
  }
};

export const fetchLiveFeed = async () => {
  try {
    const parsed = await cachedGetJSON(`${API_BASE_URL}/events`);
    return (parsed || []).map((event) => ({
      id: event.EventID,
      ts: formatTimestamp(event.CreatedAt),
      type: severityToUi(event.Severity),
      message: event.Message || 'Fara detalii',
      source: `SN-${String(event.SensorID).padStart(3, '0')}`,
    }));
  } catch (error) {
    console.log("Error fecthing live events: ", error);
    return [];
  }
};


// Returns chart points for ChartWidget
export const fetchChartData = async ({ sensorId = 1, limit = 60, range = '' } = {}) => {
  try {
    const qs = new URLSearchParams({ sensor_id: String(sensorId), limit: String(limit) });
    if (range) 
      qs.set('range', range);

    const res = await apiFetch(`${API_BASE_URL}/readings?${qs.toString()}`);
    const parsed = await handleResponse(res);

    if (!Array.isArray(parsed)) 
      return [];
    return parsed.map((row) => ({
      time: formatClockLabel(row.Time),
      cpu: Number(row.Value),
    }));
  } catch (err) {
    console.error('fetchChartData failed', err);
    return [];
  }
};


export const fetchLatestReadings = async () => {
  try {
    const res = await apiFetch(`${API_BASE_URL}/readings/latest`);
    const parsed = await handleResponse(res);

    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
      console.log('Fetching latest readings failed: ', err);
      return [];
  }
};

// Top-N sensors by alarm count in window. Backend aggregates.
// range: Go duration string ('30m' | '1h' | '6h' | '24h' | '168h').
export const fetchAlarmFrequency = async ({ range = '1h', limit = 5 } = {}) => {
  try {
    const qs = new URLSearchParams({ range, limit: String(limit) });
    const res = await apiFetch(`${API_BASE_URL}/events/frequency?${qs.toString()}`);
    const rows = await handleResponse(res);
    if (!Array.isArray(rows)) return [];
    const data = rows.map((r) => ({ name: r.source, count: Number(r.count) }));
    if (data.length === 0) return [{ name: 'SYSTEM_STABLE', count: 0 }];
    return data;
  } catch (err) {
    console.error('fetchAlarmFrequency failed', err);
    return [{ name: 'SYSTEM_STABLE', count: 0 }];
  }
};


// Fetches chart data for one sensor over a range. Uses server-side downsampling
// (max_points) so payload stays bounded (~maxPoints) no matter how many raw
// rows the backend holds — scalable to huge datasets.
export const fetchChartDataStatus = async ({ sensorId = 2, range = '', maxPoints = 300 } = {}) => {
  try {
    const qs = new URLSearchParams({
      sensor_id: String(sensorId),
      max_points: String(maxPoints),
    });

    if (range)
      qs.set('range', range);

    const res = await apiFetch(`${API_BASE_URL}/readings?${qs.toString()}`);

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      return { 
        ok: false, status: res.status, message: msg || res.statusText || 'Request failed', data: [] 
      };
    }

    const parsed = await res.json();
    if (!Array.isArray(parsed)) return { ok: true, status: 200, message: '', data: [] };
    return {
      ok: true,
      status: 200,
      message: '',
      data: parsed.map((row) => ({
        t: Date.parse(row.time ?? row.Time),
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
    const parsed = await cachedGetJSON(`${API_BASE_URL}/events`);
    const counts = { ALARM: 0, INCIDENT: 0, EVENT: 0 };
    (parsed || []).forEach((e) => {
      const key = severityToUi(e.Severity || e.severity);
      counts[key] = (counts[key] || 0) + 1;
    });
    return [
      { name: 'ALARM',    value: counts.ALARM || 0,    color: COLORS.critical },
      { name: 'INCIDENT', value: counts.INCIDENT || 0, color: COLORS.warn },
      { name: 'EVENT',    value: counts.EVENT || 0,    color: COLORS.textMuted },
    ];
  } catch (err) {
    console.log(err);
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
    const hasAnyEvents = tickets.length > 0;
    return [
      {
        id: 1,
        title: 'CPU TEMP',
        value: chartRes?.ok === false ? 'ERR' : (latest !== null ? `${latest.toFixed(1)}°C` : 'No readings'),
      },
      { id: 2, title: 'OPEN TICKETS', value: hasAnyEvents ? String(pending) : 'No events' },
      { id: 3, title: 'TOTAL EVENTS', value: hasAnyEvents ? String(tickets.length) : 'No events' },
      { id: 4, title: 'SENSOR ID', value: 'SN-001' },
    ];
  } catch (err) {
    console.error('fetchDashboardMetrics failed', err);
    return [
      { id: 1, title: 'CPU TEMP', value: 'N/A' },
      { id: 2, title: 'OPEN TICKETS', value: 'N/A' },
      { id: 3, title: 'TOTAL EVENTS', value: 'N/A' },
      { id: 4, title: 'SENSOR ID', value: 'N/A' },
    ];
  }
};

// Real backend (Python chat_api on port 8002)
export const fetchResolutionData = async () => {
  try {
    const res = await apiFetch(`${getChatApiBaseUrl()}/metrics/resolution`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return [{ day: 'N/A', time: 0 }];
    }
    return data;
  } catch (err) {
    console.error('fetchResolutionData failed', err);
    return [{ day: 'N/A', time: 0 }];
  }
};

export const fetchObservabilityMetrics = async () => {
  try {
    const res = await apiFetch(`${getChatApiBaseUrl()}/metrics/observability`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return [
        { id: 1, label: 'UPTIME', value: 'N/A', sublabel: 'No data' },
        { id: 2, label: 'ERROR RATE', value: 'N/A', sublabel: 'No data' },
      ];
    }
    return data;
  } catch (err) {
    console.error('fetchObservabilityMetrics failed', err);
    return [
      { id: 1, label: 'UPTIME', value: 'OFFLINE', sublabel: 'Backend down' },
      { id: 2, label: 'ERROR RATE', value: 'N/A', sublabel: 'Backend down' },
    ];
  }
};


