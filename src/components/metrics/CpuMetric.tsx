import ChartPie from '../pieChart';
import { formatPercentage } from '../../utils/formatters';

interface CpuMetricProps {
  cpuPercent: number;
}

const CpuMetric = ({ cpuPercent }: CpuMetricProps) => {
  const roundedCpuPercent = Math.round(cpuPercent * 100) / 100;

  return (
    <div className="container">
      {ChartPie(300, 180, roundedCpuPercent)}
      <h2 className='m-bot-0'>CPU: {formatPercentage(roundedCpuPercent)}</h2>
    </div>
  );
};

export default CpuMetric;
