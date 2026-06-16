import { COLORS } from '../theme/colors';

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

const now = () => new Date();
const ts = () => now().toLocaleString();
const clock = (offsetMin = 0) => {
  const d = new Date(Date.now() - offsetMin * 60_000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

let nextSensorId = 10;
let nextEventId = 100;

const locations = [
  { id: 1, name: 'Data Center A' },
  { id: 2, name: 'Rack 12 — Floor 2' },
  { id: 3, name: 'Edge Site — Bucharest' },
];

let sensors = [
  { SensorID: 1, Name: 'CPU Temperature', SensorNo: 'SN-001', LocationID: 1, Unit: '°C' },
  { SensorID: 2, Name: 'Humidity Sensor', SensorNo: 'SN-002', LocationID: 1, Unit: '%' },
  { SensorID: 3, Name: 'Network Latency', SensorNo: 'SN-003', LocationID: 2, Unit: 'ms' },
  { SensorID: 4, Name: 'Power Draw', SensorNo: 'SN-004', LocationID: 3, Unit: 'W' },
  { SensorID: 5, Name: 'Disk I/O', SensorNo: 'SN-005', LocationID: 2, Unit: 'Mbps' },
];

let events = [
  { EventID: 1, SensorID: 2, Severity: 'alarm', Status: 'pending', Message: 'Humidity above threshold (78%)', CreatedAt: new Date().toISOString(), MetricValue: 78 },
  { EventID: 2, SensorID: 3, Severity: 'incident', Status: 'pending', Message: 'Latency spike detected on uplink', CreatedAt: new Date(Date.now() - 3600_000).toISOString(), MetricValue: 240 },
  { EventID: 3, SensorID: 1, Severity: 'event', Status: 'acknowledged', Message: 'Scheduled maintenance window started', CreatedAt: new Date(Date.now() - 7200_000).toISOString(), MetricValue: null },
  { EventID: 4, SensorID: 4, Severity: 'warning', Status: 'pending', Message: 'Power draw elevated — review load', CreatedAt: new Date(Date.now() - 900_000).toISOString(), MetricValue: 412 },
];

const severityToUi = (sev) => {
  switch ((sev || '').toLowerCase()) {
    case 'incident': return 'INCIDENT';
    case 'alarm':
    case 'warning': return 'ALARM';
    case 'critical': return 'INCIDENT';
    default: return 'EVENT';
  }
};

const statusToUi = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'acknowledged': return 'ACKNOWLEDGED';
    case 'resolved': return 'RESOLVED';
    default: return 'PENDING';
  }
};

const severityToDeviceStatus = (uiSeverity) => {
  switch (uiSeverity) {
    case 'ALARM': return 'Alarm';
    case 'INCIDENT': return 'Incident';
    case 'EVENT': return 'Event';
    default: return 'Event';
  }
};

const STATUS_PRIORITY = { Healthy: 0, Event: 1, Incident: 2, Alarm: 3 };

function buildDevices() {
  const pending = events.filter((e) => {
    const s = (e.Status || '').toLowerCase();
    return s !== 'acknowledged' && s !== 'resolved';
  });
  const worstBySensor = new Map();
  for (const e of pending) {
    const status = severityToDeviceStatus(severityToUi(e.Severity));
    const prev = worstBySensor.get(e.SensorID);
    if (!prev || STATUS_PRIORITY[status] > STATUS_PRIORITY[prev]) {
      worstBySensor.set(e.SensorID, status);
    }
  }
  return sensors.map((sensor) => ({
    id: sensor.SensorID,
    name: sensor.Name,
    type: 'Sensor',
    status: worstBySensor.get(sensor.SensorID) || 'Healthy',
    ip: sensor.SensorNo,
    unit: sensor.Unit,
    locationId: sensor.LocationID,
  }));
}

function buildChartPoints(limit = 60) {
  const points = [];
  let v = 42 + Math.random() * 8;
  for (let i = limit - 1; i >= 0; i--) {
    v = Math.max(20, Math.min(95, v + (Math.random() - 0.5) * 6));
    points.push({ time: clock(i), cpu: Math.round(v * 10) / 10 });
  }
  return points;
}

export async function fetchDevices() {
  await delay();
  return buildDevices();
}

export async function fetchLocations() {
  await delay(150);
  return locations.map((loc) => ({ id: loc.id, name: loc.name }));
}

export async function createSensor({ name, sensorNo, locationId, unit, lowerLimit, upperLimit }) {
  await delay(400);
  const created = {
    SensorID: nextSensorId++,
    Name: name,
    SensorNo: sensorNo,
    LocationID: Number(locationId),
    Unit: unit,
    LowerLimit: lowerLimit,
    UpperLimit: upperLimit,
  };
  sensors = [...sensors, created];
  return { ok: true, sensor: created };
}

export async function fetchTickets() {
  await delay();
  return events
    .filter((e) => {
      const s = (e.Status || '').toLowerCase();
      return s !== 'resolved';
    })
    .map((event) => ({
      id: event.EventID,
      ts: ts(),
      source: `SN-${String(event.SensorID).padStart(3, '0')}`,
      message: event.Message,
      severity: severityToUi(event.Severity),
      status: statusToUi(event.Status),
      metricValue: event.MetricValue ?? null,
    }));
}

export async function snoozeTicket(ticketId) {
  await delay(300);
  events = events.filter((e) => e.EventID !== ticketId);
  return { ok: true };
}

export async function acknowledgeTicket(ticketId) {
  await delay(300);
  events = events.map((e) =>
    e.EventID === ticketId ? { ...e, Status: 'acknowledged' } : e
  );
  return { success: true, id: ticketId, status: 'ACKNOWLEDGED' };
}

export async function clearAllAlerts() {
  await delay(300);
  const open = events.filter((e) => {
    const s = (e.Status || '').toLowerCase();
    return s !== 'resolved';
  });
  const total = open.length;
  events = events.map((e) => ({ ...e, Status: 'resolved' }));
  return { ok: true, cleared: total, total };
}

export async function fetchLiveFeed() {
  await delay();
  return events.slice(0, 20).map((event) => ({
    id: event.EventID,
    ts: ts(),
    type: severityToUi(event.Severity),
    message: event.Message,
    source: `SN-${String(event.SensorID).padStart(3, '0')}`,
  }));
}

export async function fetchChartData() {
  await delay();
  return buildChartPoints(60);
}

export async function fetchLatestReadings() {
  await delay();
  return sensors.map((s) => ({
    SensorID: s.SensorID,
    Value: 40 + Math.random() * 30,
    Time: new Date().toISOString(),
  }));
}

export async function fetchAlarmFrequency() {
  await delay();
  return [
    { name: 'SN-002', count: 5 },
    { name: 'SN-003', count: 3 },
    { name: 'SN-004', count: 2 },
    { name: 'SN-001', count: 1 },
  ];
}

export async function fetchChartDataStatus({ limit = 60 } = {}) {
  await delay();
  const data = buildChartPoints(limit);
  return { ok: true, status: 200, message: '', data };
}

export async function fetchSeverityData() {
  await delay();
  const counts = { ALARM: 0, INCIDENT: 0, EVENT: 0 };
  events.forEach((e) => {
    const key = severityToUi(e.Severity);
    counts[key] = (counts[key] || 0) + 1;
  });
  return [
    { name: 'ALARM', value: counts.ALARM, color: COLORS.critical },
    { name: 'INCIDENT', value: counts.INCIDENT, color: COLORS.warn },
    { name: 'EVENT', value: counts.EVENT, color: COLORS.textMuted },
  ];
}

export async function fetchDashboardMetrics() {
  await delay();
  const tickets = await fetchTickets();
  const pending = tickets.filter((t) => t.status === 'PENDING').length;
  const latest = 45.0; 
  return [
    { id: 1, title: 'CPU TEMP', value: '45.0°C' },
    { id: 2, title: 'OPEN TICKETS', value: String(pending) },
    { id: 3, title: 'TOTAL EVENTS', value: String(tickets.length) },
    { id: 4, title: 'SENSOR ID', value: 'SN-001' },
    { id: 5, title: 'SYS.CPU_LOAD', value: '34%' },
    { id: 6, title: 'MEM.ALLOCATED', value: '6.2 GB' },
  ];
}

export async function fetchResolutionData() {
  await delay(100);
  return [
    { day: 'Mon', time: 120 },
    { day: 'Tue', time: 85 },
    { day: 'Wed', time: 100 },
    { day: 'Thu', time: 72 },
    { day: 'Fri', time: 95 },
  ];
}

export async function fetchObservabilityMetrics() {
  await delay(100);
  return [
    { id: 1, label: 'UPTIME', value: '99.2%', sublabel: 'Last 30 days' },
    { id: 2, label: 'ERROR RATE', value: '<1%', sublabel: 'vs 0.15% avg' },
    { id: 3, label: 'ACTIVE SENSORS', value: String(sensors.length), sublabel: 'mock data' },
  ];
}

export const MOCK_CHAT_REPLIES = [
  'Mock mode: backend is off. UI development only.',
  '3 open tickets in demo data. SN-002 has a humidity alarm.',
  '5 sensors registered. 2 need attention.',
];
