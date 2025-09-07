export type Metrics = {
  cpu_percent: number;
  disk_free: number;
  disk_total: number;
  disk_used: number;
  memory_total: number;
  memory_used: number;
  memory_percent: number;
  net_recv: number;
  net_sent: number;
}

export type NetworkDelta = {
  net_recv_delta: number;
  net_sent_delta: number;
  net_recv_rate: number;
  net_sent_rate: number;
}

export interface NetworkDataPoint {
  name: string;
  received: number;
  sent: number;
  timestamp: number;
}