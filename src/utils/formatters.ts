/**
 * Format large numbers with suffixes (K, M, B, T, etc.)
 */
export const formatNumber = (num: number): string => {
  if (num < 1) {
    // Show decimals for very small numbers
    if (num === 0) return '0';
    return num.toFixed(2);
  }

  if (num < 10) {
    // Show one decimal for small numbers
    return num.toFixed(1);
  }

  if (num < 1000) {
    return Math.floor(num).toString();
  }

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const exp = Math.min(Math.floor(Math.log10(num) / 3), suffixes.length - 1);
  const value = num / Math.pow(1000, exp);

  if (value >= 100) {
    return Math.floor(value) + suffixes[exp];
  } else if (value >= 10) {
    return value.toFixed(1) + suffixes[exp];
  } else {
    return value.toFixed(2) + suffixes[exp];
  }
};

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatOfflineDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const MAX_OFFLINE_HOURS = 8;
  const maxMs = MAX_OFFLINE_HOURS * 3600 * 1000;

  if (milliseconds >= maxMs) {
    return '8 hours (max)';
  }

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes} minutes`;
};
