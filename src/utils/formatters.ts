// Formatar taxa de rede
export const formatNetworkRate = (bytesPerSecond: number): string => {
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
export const formatBytes = (bytes: number): string => {
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

// Formatar percentual
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

// Formatar megabytes
export const formatMB = (bytes: number): string => {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

// Formatar gigabytes
export const formatGB = (bytes: number): string => {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};
