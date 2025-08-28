import { useState, useEffect, useRef } from 'react'
import ChartPie from './components/pieChart'
import FullPieChart from './components/fullPieChart'
import LineChart from './components/lineChart'
import './App.css'

type Metrics = {
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

type NetworkDelta = {
  net_recv_delta: number;
  net_sent_delta: number;
  net_recv_rate: number;
  net_sent_rate: number;
}

interface NetworkDataPoint {
  name: string;
  received: number;
  sent: number;
  timestamp: number;
}

// Função para criar dados iniciais
const createInitialData = (): NetworkDataPoint[] => {
  const data: NetworkDataPoint[] = [];
  for (let i = 1; i <= 10; i++) {
    data.push({
      name: i.toString(),
      received: 0,
      sent: 0,
      timestamp: Date.now()
    });
  }
  return data;
};

function App() {
  const [metrics, setMetrics] = useState<Metrics>();
  const [networkRates, setNetworkRates] = useState<NetworkDelta>({
    net_recv_delta: 0,
    net_sent_delta: 0,
    net_recv_rate: 0,
    net_sent_rate: 0
  });

  const [networkChartData, setNetworkChartData] = useState<NetworkDataPoint[]>(createInitialData);
  // Armazenar os valores anteriores de net_recv e net_sent sem causar re-renderizações
  const previousNetRef = useRef<{ net_recv: number; net_sent: number } | null>(null);
  const dataPointCount = useRef(0);

  // Formatar taxa de rede
  const formatNetworkRate = (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) {
      return `${bytesPerSecond.toFixed(2)} B/s`;
    } else if (bytesPerSecond < 1024 * 1024) {
      return `${(bytesPerSecond / 1024).toFixed(2)} KB/s`;
    } else if (bytesPerSecond < 1024 * 1024 * 1024) {
      return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
    } else {
      return `${(bytesPerSecond / (1024 * 1024 * 1024)).toFixed(2)} GB/s`;
    }
  };

  // Formatar bytes em unidades legíveis
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  const updateChartData = (receivedRate: number, sentRate: number) => {
    setNetworkChartData(prevData => {
      // Garantir que prevData não seja vazio
      if (!prevData || prevData.length === 0) {
        return createInitialData();
      }

      // Cria uma nova array shiftando todos os valores
      const newData = [...prevData.slice(1)]; // Remove o primeiro elemento

      // Adiciona o novo dado no final
      dataPointCount.current += 1;
      newData.push({
        name: (dataPointCount.current % 10 + 1).toString(),
        received: receivedRate || 0,
        sent: -(sentRate || 0), // Sent como negativo
        timestamp: Date.now()
      });

      return newData;
    });
  };

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.15.10:8080/ws');

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // setMetrics(data);
        setMetrics({
          cpu_percent: data.cpu_percent || 0,
          disk_free: data.disk_free || 0,
          disk_total: data.disk_total || 0,
          disk_used: data.disk_used || 0,
          memory_total: data.memory_total || 0,
          memory_used: data.memory_used || 0,
          memory_percent: Number(((data.memory_used / data.memory_total) * 100).toFixed(2)) || 0,
          net_recv: data.net_recv || 0,
          net_sent: data.net_sent || 0,
        })

        // Cálculo do delta para rede
        if (previousNetRef.current) {
          const deltaRecv = (data.net_recv || 0) - previousNetRef.current.net_recv || 0;
          const deltaSent = (data.net_sent || 0) - previousNetRef.current.net_sent || 0;

          // Taxa por segundo (considerando intervalo de 3 segundos)
          const rateRecv = deltaRecv / 3;
          const rateSent = deltaSent / 3;

          setNetworkRates({
            net_recv_delta: deltaRecv,
            net_sent_delta: deltaSent,
            net_recv_rate: rateRecv,
            net_sent_rate: rateSent
          });

          // Atualiza o gráfico com as novas taxas
          updateChartData(rateRecv, rateSent);
        }

        // Atualiza os valores anteriores
        previousNetRef.current = {
          net_recv: data.net_recv || 0,
          net_sent: data.net_sent || 0
        };
      } catch (e: any) {
        console.error('Error parsing WebSocket message:', e);
      }
    }

    return () => {
      ws.close();
    }
  }, []);

  return (
    <>
      <h1 className='m-top-0'>Dashboard metrics</h1>
      {metrics ? (
        <div className='content'>
          <div className='box'>
            <div className="container">
              {ChartPie(300, 180, Math.round(metrics.cpu_percent * 100) / 100)}
              <h2 className='m-bot-0'>CPU: {Math.round(metrics.cpu_percent * 100) / 100}%</h2>
            </div>
            <div className="container">
              {ChartPie(300, 180, metrics.memory_percent)}
              <h2 className='m-bot-0'>RAM: {((metrics.memory_used / metrics.memory_total) * 100).toFixed(2)}%</h2>
              <p>
                Usage: {Math.round(metrics.memory_used / 1024 / 1024 * 100) / 100}mb
                <br />
                Total: {Math.round(metrics.memory_total / 1024 / 1024 * 100) / 100}mb
                <br />
                Free: {Math.round((metrics.memory_total - metrics.memory_used) / 1024 / 1024 * 100) / 100}mb
              </p>
            </div>
            <div className="container">
              {FullPieChart(300, 180, metrics.disk_used, metrics.disk_total)}
              <h2 className='m-bot-0'>DISK: {((metrics.disk_used / metrics.disk_total) * 100).toFixed(2)}%</h2>
              <p>
                Usage: {Math.round(metrics.disk_used / 1024 / 1024 / 1024 * 100) / 100}gb
                <br />
                Total: {Math.round(metrics.disk_total / 1024 / 1024 / 1024 * 100) / 100}gb
                <br />
                Free: {Math.round((metrics.disk_total - metrics.disk_used) / 1024 / 1024 * 100) / 100}gb
              </p>
            </div>
          </div>
          <div className="box">
            <div className="container center">
              <h2 className='m-top-0'>Network Traffic (Last 30 seconds)</h2>
              {/* {LineChart(800, 300, networkChartData)} */}
              <LineChart width={800} height={300} data={networkChartData} />
              <div className='text'>
                <div>
                  <p>Network Received: {formatBytes(metrics.net_recv)}
                    <br />
                    {networkRates.net_recv_delta > 0 && (
                      <span> (Δ: {formatBytes(networkRates.net_recv_delta)} | Rate: {formatNetworkRate(networkRates.net_recv_rate)})</span>
                    )}
                  </p>
                </div>
                <div>
                  <p>Network Sent: {formatBytes(metrics.net_sent)}
                    <br />
                    {networkRates.net_sent_delta > 0 && (
                      <span> (Δ: {formatBytes(networkRates.net_sent_delta)} | Rate: {formatNetworkRate(networkRates.net_sent_rate)})</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading metrics...</p>
      )}
      {/* <div>
        {metrics ? (
          <div>
            <p>CPU Usage: {Math.round(metrics.cpu_percent * 100) / 100}%</p>
            <p>Disk Usage: {Math.round(metrics.disk_used / 1024 / 1024 / 1024 * 100) / 100}gb / {Math.round(metrics.disk_total / 1024 / 1024 / 1024 * 100) / 100}gb
              (Free: {Math.round((metrics.disk_total - metrics.disk_used) / 1024 / 1024 / 1024 * 100) / 100}gb)</p>
            <p>Memory Usage: {Math.round(metrics.memory_used / 1024 / 1024 * 100) / 100}mb / {Math.round(metrics.memory_total / 1024 / 1024 * 100) / 100}mb
              (Free: {Math.round((metrics.memory_total - metrics.memory_used) / 1024 / 1024 * 100) / 100}mb)
              <br />
              <strong>Usage: {metrics.memory_percent}%</strong>
            </p>
            <p>Network Received: {formatBytes(metrics.net_recv)}
              {networkRates.net_recv_delta > 0 && (
                <span> (Δ: {formatBytes(networkRates.net_recv_delta)} | Rate: {formatNetworkRate(networkRates.net_recv_rate)})</span>
              )}
            </p>
            <p>Network Sent: {formatBytes(metrics.net_sent)}
              {networkRates.net_sent_delta > 0 && (
                <span> (Δ: {formatBytes(networkRates.net_sent_delta)} | Rate: {formatNetworkRate(networkRates.net_sent_rate)})</span>
              )}
            </p>
          </div>
        ) : (
          <p>Loading metrics...</p>
        )}
      </div> */}
    </>
  )
}

export default App
