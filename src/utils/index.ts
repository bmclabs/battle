// Format wallet address to show only first and last few characters
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

/**
 * Format a SOL amount with proper precision
 * - Displays up to 4 decimal places
 * - Never rounds up
 * - Preserves trailing zeros if they are significant
 */
export const formatSolAmount = (value: number | string): string => {
  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN, undefined or null
  if (isNaN(numValue) || numValue === undefined || numValue === null) {
    return '0';
  }
  
  // Use Math.floor to prevent rounding up
  // First, multiply by 10000 to preserve 4 decimal places
  const flooredValue = Math.floor(numValue * 10000) / 10000;
  
  // Convert to string with fixed decimal places (up to 4)
  const strValue = flooredValue.toString();
  
  // If it's an integer, return as is
  if (strValue.indexOf('.') === -1) {
    return strValue;
  }
  
  // Split by decimal point
  const parts = strValue.split('.');
  const wholePart = parts[0];
  const decimalPart = parts[1];
  
  // If decimal part is shorter than 4 digits, keep it as is
  if (decimalPart.length <= 4) {
    return strValue;
  }
  
  // Otherwise, truncate to 4 decimal places without rounding
  return `${wholePart}.${decimalPart.substring(0, 4)}`;
};