import { useState, useEffect, useRef } from 'react';
import type { Metrics, NetworkDelta, NetworkDataPoint } from '../types/metrics';
import { createInitialData } from '../utils/initialData';

interface UseWebSocketReturn {
  metrics: Metrics | undefined;
  networkRates: NetworkDelta;
  networkChartData: NetworkDataPoint[];
}

export const useWebSocket = (): UseWebSocketReturn => {
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
    const wsURL = import.meta.env.VITE_WS_URL;
    const ws = new WebSocket(wsURL);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
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
        });

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
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    metrics,
    networkRates,
    networkChartData
  };
};
