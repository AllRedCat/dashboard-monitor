import FullPieChart from '../fullPieChart';
import { formatPercentage, formatGB } from '../../utils/formatters';

interface DiskMetricProps {
  diskUsed: number;
  diskTotal: number;
}

const DiskMetric = ({ diskUsed, diskTotal }: DiskMetricProps) => {
  const diskUsagePercent = ((diskUsed / diskTotal) * 100).toFixed(2);
  const diskUsedGB = Math.round(diskUsed / 1024 / 1024 / 1024 * 100) / 100;
  const diskTotalGB = Math.round(diskTotal / 1024 / 1024 / 1024 * 100) / 100;
  const diskFreeGB = Math.round((diskTotal - diskUsed) / 1024 / 1024 * 100) / 100;

  return (
    <div className="container">
      {FullPieChart(300, 180, diskUsed, diskTotal)}
      <h2 className='m-bot-0'>DISK: {formatPercentage(Number(diskUsagePercent))}</h2>
      <p>
        <div className='disk-1'></div>Usage: {formatGB(diskUsed)}
        <br />
        <div className='disk-2'></div>Total: {formatGB(diskTotal)}
        <br />
        Free: {formatGB(diskTotal - diskUsed)}
      </p>
    </div>
  );
};

export default DiskMetric;
