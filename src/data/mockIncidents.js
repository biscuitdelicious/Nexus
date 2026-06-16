export const mockIncidents = [
  {
    id: '#40',
    title: 'CPU Critical Temperature Threshold Exceeded',
    status: 'OPEN',
    author: 'nexus_system_daemon',
    createdAt: '3 days ago',
    device: 'DB-Server-Primary-01',
    description:
      'Alarm automatically triggered by the telemetry system.\n\nThe thermal sensor recorded a temperature of 85.4°C (Critical threshold: 80.0°C) on the CPU package.\n\nRecent metrics:\n- CPU Load: 98%\n- Allocated Mem: 14.2 GB / 16.0 GB\n- Fan Speed: 3200 RPM (Max)\n\nPlease investigate the processes causing this high load. If the temperature reaches 90°C, the server will initiate an emergency shutdown to prevent physical hardware damage.',
    comments: [
      {
        id: 1,
        author: 'mihai.admin',
        time: '2 days ago',
        text: 'I checked the running processes. It looks like a Docker container (`data-indexer-v2`) entered an infinite loop and locked up the threads. I restarted the container, but the temperature is dropping very slowly.',
        isSystem: false,
      },
      {
        id: 2,
        author: 'NEXUS_SYSTEM',
        time: '1 day ago',
        text: 'SYSTEM LOG: Container `data-indexer-v2` restarted successfully by [mihai.admin]. CPU load dropped to 45%.',
        isSystem: true,
      },
      {
        id: 3,
        author: 'victor.oncall',
        time: '12 hours ago',
        text: "The temperature has stabilized at 72°C. It is still above the normal 65°C average. I suggest we check for dust accumulation on the heatsink or replace the thermal paste during Saturday's maintenance window.",
        isSystem: false,
      },
    ],
  },
  {
    id: '#39',
    title: 'High Latency on API Gateway',
    status: 'RESOLVED',
    author: 'mihai.admin',
    createdAt: '5 days ago',
    device: 'API-Gateway-02',
    description:
      'The API Gateway response time exceeded 2000ms for more than 5 minutes. This indicates a potential DDoS attack or an unoptimized database query.',
    comments: [
      {
        id: 1,
        author: 'victor.oncall',
        time: '5 days ago',
        text: 'I applied rate-limiting on the search endpoint. Response times have returned to normal operating parameters (under 100ms).',
        isSystem: false,
      },
    ],
  },
  {
    id: '#38',
    title: 'Memory Leak in Auth Service',
    status: 'OPEN',
    author: 'nexus_system_daemon',
    createdAt: '1 week ago',
    device: 'Auth-Node-01',
    description:
      'The authentication service is currently consuming 95% of the available system RAM. Immediate investigation required.',
    comments: [],
  },
];
