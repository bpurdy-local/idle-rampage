/**
 * Format large numbers with suffixes (K, M, B, T, etc.)
 */
export const formatNumber = (num: number): string => {
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

/**
 * Format a date relative to now
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

/**
 * Format scrap amount with icon
 */
export const formatScrap = (amount: number): string => {
  return `${formatNumber(amount)} Scrap`;
};

/**
 * Format blueprints amount
 */
export const formatBlueprints = (amount: number): string => {
  return `${formatNumber(amount)} BP`;
};
