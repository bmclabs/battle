/**
 * Checks if the application is in maintenance mode
 * 
 * @returns {boolean} True if maintenance mode is enabled
 */
export const isMaintenanceMode = (): boolean => {
  // During build or when environment variable is undefined, 
  // default to false to prevent build issues
  if (typeof process.env.NEXT_PUBLIC_IS_MAINTENANCE === 'undefined') {
    return false;
  }
  
  return process.env.NEXT_PUBLIC_IS_MAINTENANCE === 'true';
};

/**
 * Gets the current maintenance status as a readable string
 * 
 * @returns {string} 'active' if in maintenance, 'inactive' otherwise
 */
export const getMaintenanceStatus = (): string => {
  return isMaintenanceMode() ? 'active' : 'inactive';
}; 