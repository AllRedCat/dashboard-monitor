import { useState, useEffect, useRef } from 'react'
import ChartPie from './components/pieChart'
import FullPieChart from './components/fullPieChart'
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

function App() {
  const [metrics, setMetrics] = useState<Metrics>();
  const [networkRates, setNetworkRates] = useState<NetworkDelta>({
    net_recv_delta: 0,
    net_sent_delta: 0,
    net_recv_rate: 0,
    net_sent_rate: 0
  });

  // Armazenar os valores anteriores de net_recv e net_sent sem causar re-renderizações
  const previousNetRef = useRef<{ net_recv: number; net_sent: number } | null>(null);

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

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.15.10:8080/ws');

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // setMetrics(data);
      setMetrics({
        cpu_percent: data.cpu_percent,
        disk_free: data.disk_free,
        disk_total: data.disk_total,
        disk_used: data.disk_used,
        memory_total: data.memory_total,
        memory_used: data.memory_used,
        memory_percent: Number(((data.memory_used / data.memory_total) * 100).toFixed(2)),
        net_recv: data.net_recv,
        net_sent: data.net_sent,
      })

      // Cálculo do delta para rede
      if (previousNetRef.current) {
        const deltaRecv = data.net_recv - previousNetRef.current.net_recv;
        const deltaSent = data.net_sent - previousNetRef.current.net_sent;

        // Taxa por segundo (considerando intervalo de 3 segundos)
        const rateRecv = deltaRecv / 3;
        const rateSent = deltaSent / 3;

        setNetworkRates({
          net_recv_delta: deltaRecv,
          net_sent_delta: deltaSent,
          net_recv_rate: rateRecv,
          net_sent_rate: rateSent
        });
      }

      // Atualiza os valores anteriores
      previousNetRef.current = {
        net_recv: data.net_recv,
        net_sent: data.net_sent
      };
    }

    return () => {
      ws.close();
    }
  }, []);

  return (
    <>
      <h1>Dashboard metrics</h1>
      {metrics ? (
        <div>
          <div className='box'>
            <div className="container">
              {ChartPie(300, 180, Math.round(metrics.cpu_percent * 100) / 100)}
              <h2>CPU: {Math.round(metrics.cpu_percent * 100) / 100}%</h2>
            </div>
            <div className="container">
              {ChartPie(300, 180, metrics.memory_percent)}
              <h2>RAM: {((metrics.memory_used / metrics.memory_total) * 100).toFixed(2)}%</h2>
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
              <h2>DISK: {((metrics.disk_used / metrics.disk_total) * 100).toFixed(2)}%</h2>
              <p>
                Usage: {Math.round(metrics.disk_used / 1024 / 1024 / 1024 * 100) / 100}gb
                <br />
                Total: {Math.round(metrics.disk_total / 1024 / 1024 / 1024 * 100) / 100}gb
                <br />
                Free: {Math.round((metrics.disk_total - metrics.disk_used) / 1024 / 1024 * 100) / 100}gb
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading metrics...</p>
      )}
      <div>
        {metrics ? (
          <div>
            {/* <p>CPU Usage: {Math.round(metrics.cpu_percent * 100) / 100}%</p> */}
            <p>Disk Usage: {Math.round(metrics.disk_used / 1024 / 1024 / 1024 * 100) / 100}gb / {Math.round(metrics.disk_total / 1024 / 1024 / 1024 * 100) / 100}gb
              (Free: {Math.round((metrics.disk_total - metrics.disk_used) / 1024 / 1024 / 1024 * 100) / 100}gb)</p>
            {/* <p>Memory Usage: {Math.round(metrics.memory_used / 1024 / 1024 * 100) / 100}mb / {Math.round(metrics.memory_total / 1024 / 1024 * 100) / 100}mb
              (Free: {Math.round((metrics.memory_total - metrics.memory_used) / 1024 / 1024 * 100) / 100}mb)
              <br />
              <strong>Usage: {metrics.memory_percent}%</strong>
            </p> */}
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
      </div>
    </>
  )
}

export default App
