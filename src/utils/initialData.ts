import type { NetworkDataPoint } from "../types/metrics";

// Função para criar dados iniciais
export const createInitialData = (): NetworkDataPoint[] => {
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