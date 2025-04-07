'use client';

import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'bmc_onboarding_completed';

export const useOnboarding = () => {
  // Start with not showing the modal until we check localStorage
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  
  // Effect to check localStorage on component mount
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Check if user has completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    
    // Show onboarding if user hasn't completed it
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);
  
  // Function to mark onboarding as complete
  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };
  
  // Function to reset onboarding (for testing)
  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setShowOnboarding(true);
  };
  
  return {
    showOnboarding,
    completeOnboarding,
    resetOnboarding
  };
};

export default useOnboarding; 