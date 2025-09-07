import ChartPie from '../pieChart';
import { formatPercentage, formatMB } from '../../utils/formatters';

interface MemoryMetricProps {
  memoryUsed: number;
  memoryTotal: number;
  memoryPercent: number;
}

const MemoryMetric = ({ memoryUsed, memoryTotal, memoryPercent }: MemoryMetricProps) => {
  const memoryUsagePercent = ((memoryUsed / memoryTotal) * 100).toFixed(2);
  const memoryUsedMB = Math.round(memoryUsed / 1024 / 1024 * 100) / 100;
  const memoryTotalMB = Math.round(memoryTotal / 1024 / 1024 * 100) / 100;
  const memoryFreeMB = Math.round((memoryTotal - memoryUsed) / 1024 / 1024 * 100) / 100;

  return (
    <div className="container">
      {ChartPie(300, 180, memoryPercent)}
      <h2 className='m-bot-0'>RAM: {formatPercentage(Number(memoryUsagePercent))}</h2>
      <p>
        Usage: {formatMB(memoryUsed)}
        <br />
        Total: {formatMB(memoryTotal)}
        <br />
        Free: {formatMB(memoryTotal - memoryUsed)}
      </p>
    </div>
  );
};

export default MemoryMetric;
