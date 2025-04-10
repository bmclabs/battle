'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { isMaintenanceMode } from '../utils/maintenance';

// Dynamically import the MaintenanceBanner to ensure it renders on client-side
const MaintenanceBanner = dynamic(() => import('./MaintenanceBanner'), {
  ssr: false,
});

export const MaintenanceBannerWrapper: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  
  // Check if there's a scheduled maintenance
  useEffect(() => {
    // This would typically come from an API or environment variable
    // Add safety check for build time
    const isScheduledMaintenance = 
      typeof process.env.NEXT_PUBLIC_SCHEDULED_MAINTENANCE !== 'undefined' && 
      process.env.NEXT_PUBLIC_SCHEDULED_MAINTENANCE === 'true';
    
    // Only show banner for scheduled maintenance, not during active maintenance
    setShowBanner(isScheduledMaintenance && !isMaintenanceMode());
  }, []);
  
  if (!showBanner) {
    return null;
  }
  
  return (
    <MaintenanceBanner 
      message="Scheduled system upgrade for performance and new features" 
      scheduledTime="July 15, 2024 at 04:00 UTC"
    />
  );
}; 