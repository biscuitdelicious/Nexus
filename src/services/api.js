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
  { time: '10:15', cpu: 82, ram: 75, board: 42 },
  { time: '10:20', cpu: 78, ram: 72, board: 41 },
];

const mockDevices = [
  { id: 1, name: 'Web Server 01', type: 'Server', status: 'Healthy', ip: '192.168.1.10' },
  { id: 2, name: 'Database 01', type: 'Server', status: 'Event', ip: '192.168.1.11' },
  { id: 3, name: 'Core Router', type: 'Network', status: 'Healthy', ip: '192.168.1.1' },
  { id: 6, name: 'Cache Server', type: 'Server', status: 'Incident', ip: '192.168.1.12' },
  { id: 11, name: 'App Server 02', type: 'Server', status: 'Alarm', ip: '192.168.1.21' },
];

const mockSeverityData = [
  { name: 'ALARM', value: 11, color: '#FF003C' },
  { name: 'INCIDENT', value: 31, color: '#FFA500' },
  { name: 'EVENT', value: 64, color: '#888888' }
];

const mockResolutionData = [
  { day: 'Mon', time: 120 },
  { day: 'Tue', time: 85 },
  { day: 'Wed', time: 100 },
  { day: 'Thu', time: 60 },
  { day: 'Fri', time: 40 }
];

const mockTickets = [
  { id: 'TK-9022', ts: '2024-05-15 14:20:01', source: 'DB_CLUSTER_01', message: 'High memory usage', severity: 'ALARM', status: 'PENDING' },
];

const mockLogs = [
  { id: 'ALT-101', ts: '15:42:01', type: 'ALARM', message: 'Core switch packet loss > 15%', source: 'NET-SW-04' },
  { id: 'ALT-102', ts: '15:40:55', type: 'INCIDENT', message: 'Auth service timeout', source: 'API-GATEWAY' },
  { id: 'ALT-103', ts: '15:38:20', type: 'EVENT', message: 'Backup routine completed', source: 'BACKUP-MGR' },
];

const mockObservabilityMetrics = [
  { id: 1, label: 'UPTIME', value: '99.99%', sublabel: 'Last 30 days' },
  { id: 2, label: 'ERROR RATE', value: '0.12%', sublabel: 'vs 0.15% avg' },
  { id: 3, label: 'ACTIVE CONNS', value: '1,204', sublabel: 'Peak: 1,450' },
  { id: 4, label: 'AVG RESPONSE', value: '45ms', sublabel: 'p99: 120ms' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDashboardMetrics = async () => {
  await delay(600);
  return mockMetrics;
};

export const fetchChartData = async () => {
  await delay(900);
  return mockChartData;
};

export const fetchDevices = async () => {
  await delay(1100);
  return mockDevices;
};

export const fetchSeverityData = async () => {
  await delay(800);
  return mockSeverityData;
};

export const fetchResolutionData = async () => {
  await delay(1000);
  return mockResolutionData;
};

export const fetchTickets = async () => {
  await delay(1200);
  return mockTickets;
};

export const acknowledgeTicket = async (ticketId) => {
  await delay(500);
  return { success: true, id: ticketId, status: 'ACKNOWLEDGED' };
};

export const fetchLiveFeed = async () => {
  await delay(700);
  return mockLogs;
};

export const fetchObservabilityMetrics = async () => {
  await delay(700);
  return mockObservabilityMetrics;
};