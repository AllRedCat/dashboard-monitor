import CpuMetric from './CpuMetric';
import MemoryMetric from './MemoryMetric';
import DiskMetric from './DiskMetric';
import NetworkMetric from './NetworkMetric';
import type { Metrics, NetworkDelta, NetworkDataPoint } from '../../types/metrics';

interface MetricsContainerProps {
  metrics: Metrics;
  networkRates: NetworkDelta;
  networkChartData: NetworkDataPoint[];
}

const MetricsContainer = ({ metrics, networkRates, networkChartData }: MetricsContainerProps) => {
  return (
    <div className='content'>
      <div className='box'>
        <CpuMetric cpuPercent={metrics.cpu_percent} />
        <MemoryMetric 
          memoryUsed={metrics.memory_used}
          memoryTotal={metrics.memory_total}
          memoryPercent={metrics.memory_percent}
        />
        <DiskMetric 
          diskUsed={metrics.disk_used}
          diskTotal={metrics.disk_total}
        />
      </div>
      <NetworkMetric 
        netRecv={metrics.net_recv}
        netSent={metrics.net_sent}
        networkRates={networkRates}
        networkChartData={networkChartData}
      />
    </div>
  );
};

export default MetricsContainer;
