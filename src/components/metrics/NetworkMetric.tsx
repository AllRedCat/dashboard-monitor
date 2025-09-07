import LineChart from '../lineChart';
import { formatBytes, formatNetworkRate } from '../../utils/formatters';
import type { NetworkDelta, NetworkDataPoint } from '../../types/metrics';

interface NetworkMetricProps {
  netRecv: number;
  netSent: number;
  networkRates: NetworkDelta;
  networkChartData: NetworkDataPoint[];
}

const NetworkMetric = ({ netRecv, netSent, networkRates, networkChartData }: NetworkMetricProps) => {
  return (
    <div className="box">
      <div className="container center">
        <h2 className='m-top-0'>Network Traffic (Last 30 seconds)</h2>
        <LineChart width={800} height={300} data={networkChartData} />
        <div className='text'>
          <div>
            <p>Network Received: {formatBytes(netRecv)}
              <br />
              {networkRates.net_recv_delta > 0 && (
                <span> (Δ: {formatBytes(networkRates.net_recv_delta)} | Rate: {formatNetworkRate(networkRates.net_recv_rate)})</span>
              )}
            </p>
          </div>
          <div>
            <p>Network Sent: {formatBytes(netSent)}
              <br />
              {networkRates.net_sent_delta > 0 && (
                <span> (Δ: {formatBytes(networkRates.net_sent_delta)} | Rate: {formatNetworkRate(networkRates.net_sent_rate)})</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMetric;
