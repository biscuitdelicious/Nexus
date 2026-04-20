const API_BASE_URL = 'http://localhost:8080';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorMsg = await response.text();
    console.error("API Error:", errorMsg);
    throw new Error(`Eroare de la server: ${response.status}`);
  }
  return response.json();
};

export const fetchDevices = async () => {
  try {
    const data = await fetch(`${API_BASE_URL}/sensors`);
    const parsed = await handleResponse(data);

    return (parsed || []).map(sensor => ({
      id: sensor.id || sensor.ID || Math.random(),
      name: sensor.name || sensor.Name || sensor.sensor_name || 'Unnamed Sensor',
      type: sensor.type || sensor.Type || 'Sensor',
      status: sensor.status || sensor.Status || 'Healthy',
      ip: sensor.ip || sensor.IP || sensor.ip_address || 'N/A'
    }));
  } catch (err) {
    console.error("Fetch sensors failed", err);
    return [];
  }
};

export const fetchTickets = async () => {
  try {
    const data = await fetch(`${API_BASE_URL}/events/open`);
    const parsed = await handleResponse(data);

    return (parsed || []).map(event => ({
      id: event.id || event.ID || `TK-${Math.floor(Math.random() * 1000)}`,
      ts: event.created_at || event.CreatedAt || event.time || new Date().toISOString(),
      source: event.sensor_name || event.Source || 'Sistem',
      message: event.description || event.Description || event.message || event.Message || 'Fără descriere',
      severity: event.severity || event.Severity || 'ALARM',
      status: event.status || event.Status || 'PENDING'
    }));
  } catch (err) {
    console.error("Fetch tickets failed", err);
    return [];
  }
};

export const acknowledgeTicket = async (ticketId) => {
  try {
    await fetch(`${API_BASE_URL}/events/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACKNOWLEDGED' })
    });

    return { success: true, id: ticketId, status: 'ACKNOWLEDGED' };
  } catch (err) {
    console.error("Ack failed", err);
    return { success: false };
  }
};

export const fetchLiveFeed = async () => {
  try {
    const data = await fetch(`${API_BASE_URL}/events`);
    const parsed = await handleResponse(data);

    return (parsed || []).map(event => ({
      id: event.id || event.ID || `LOG-${Math.floor(Math.random() * 1000)}`,
      ts: event.created_at || event.CreatedAt || event.time || new Date().toLocaleTimeString(),
      type: event.severity || event.Severity || 'EVENT',
      message: event.description || event.Description || event.message || event.Message || 'Fără detalii',
      source: event.sensor_name || event.Source || 'System'
    }));
  } catch (err) {
    return [];
  }
};

const mockMetrics = [
  { id: 1, title: 'SYS.CPU_LOAD', value: '87%' },
  { id: 2, title: 'MEM.ALLOCATED', value: '6.2 GB' },
  { id: 3, title: 'NET.TRAFFIC_IO', value: '340 Mb/s' },
  { id: 4, title: 'API.LATENCY', value: '142 ms' },
];

const mockChartData = [
  { time: '10:00', cpu: 45, ram: 40, board: 35 },
  { time: '10:05', cpu: 48, ram: 42, board: 36 },
  { time: '10:10', cpu: 52, ram: 47, board: 37 },
];

const mockSeverityData = [
  { name: 'ALARM', value: 11, color: '#FF003C' },
  { name: 'INCIDENT', value: 31, color: '#FFA500' },
  { name: 'EVENT', value: 64, color: '#888888' }
];

const mockResolutionData = [
  { day: 'Mon', time: 120 },
  { day: 'Tue', time: 85 },
  { day: 'Wed', time: 100 }
];

const mockObservabilityMetrics = [
  { id: 1, label: 'UPTIME', value: '99.99%', sublabel: 'Last 30 days' },
  { id: 2, label: 'ERROR RATE', value: '0.12%', sublabel: 'vs 0.15% avg' },
];

export const fetchDashboardMetrics = async () => mockMetrics;
export const fetchChartData = async () => mockChartData;
export const fetchSeverityData = async () => mockSeverityData;
export const fetchResolutionData = async () => mockResolutionData;
export const fetchObservabilityMetrics = async () => mockObservabilityMetrics;