// Format wallet address to show only first and last few characters
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

/**
 * Format a number with custom decimal logic:
 * - If the number is an integer, display it without decimals
 * - If all three decimal digits are the same, display 1 decimal place
 * - If the 2nd and 3rd decimal digits are the same, display 2 decimal places
 * - Otherwise display 3 decimal places
 */
export const formatSolAmount = (value: number | string): string => {
  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN, undefined or null
  if (isNaN(numValue) || numValue === undefined || numValue === null) {
    return '0';
  }
  
  // Check if the number is an integer (no decimal part)
  if (Number.isInteger(numValue)) {
    return numValue.toString();
  }

  // Convert to string with enough precision to analyze
  const strValue = numValue.toFixed(4);
  
  // Split by decimal point
  const parts = strValue.split('.');
  const decimalPart = parts[1];
  
  // Check decimal digits
  const firstDigit = decimalPart.charAt(0);
  const secondDigit = decimalPart.charAt(1);
  const thirdDigit = decimalPart.charAt(2);
  
  // If all three decimal digits are the same (e.g., 1.111)
  if (firstDigit === secondDigit && secondDigit === thirdDigit) {
    return numValue.toFixed(1);
  }
  
  // If second and third digits are the same (e.g., 1.122)
  if (secondDigit === thirdDigit) {
    return numValue.toFixed(2);
  }
  
  // Otherwise show 3 decimal places (e.g., 1.123)
  return numValue.toFixed(3);
};