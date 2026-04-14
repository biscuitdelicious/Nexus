export const summaryMetrics = [
  { id: 'rps', label: 'Requests / min', value: '12.4k', sublabel: '+3.1% vs last hour' },
  { id: 'errors', label: 'Error rate', value: '0.28%', sublabel: 'SLO: < 0.5%' },
  { id: 'p99', label: 'Latency p99', value: '47 ms', sublabel: 'edge → origin' },
  { id: 'saturation', label: 'CPU (pool avg)', value: '62%', sublabel: '12 nodes' },
];

export const logEntries = [
  { id: '1', ts: '2026-04-11T14:32:01.204Z', level: 'alarm', source: 'api-gateway', message: 'Upstream timeout: payment-svc:443 (3 retries exhausted)' },
  { id: '2', ts: '2026-04-11T14:31:58.881Z', level: 'incident', source: 'lb-01', message: 'Backend app-07 marked unhealthy; removed from rotation' },
  { id: '3', ts: '2026-04-11T14:31:55.102Z', level: 'event', source: 'scheduler', message: 'Job backup-db-nightly completed in 18m 42s' },
  { id: '4', ts: '2026-04-11T14:31:44.330Z', level: 'event', source: 'auth', message: 'OIDC token refresh OK — tenant nokia-prod' },
  { id: '6', ts: '2026-04-11T14:31:22.900Z', level: 'incident', source: 'db-primary', message: 'Slow query (>2s) — SELECT … FROM events WHERE …' },
  { id: '7', ts: '2026-04-11T14:31:10.441Z', level: 'alarm', source: 'worker-ingest', message: 'Kafka lag threshold exceeded: topic=metrics-raw partition=4' },
  { id: '8', ts: '2026-04-11T14:30:59.200Z', level: 'event', source: 'deploy', message: 'Rollout nexus-ui@2.4.1 — 18/18 pods ready' },
];