'use client';

import React from 'react';
import Link from 'next/link';
import { isMaintenanceMode } from '../utils/maintenance';

interface MaintenanceBannerProps {
  message?: string;
  scheduledTime?: string;
  showInMaintenanceMode?: boolean;
}

const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({
  message = 'Scheduled maintenance coming soon',
  scheduledTime,
  showInMaintenanceMode = false
}) => {
  // Don't show the banner in maintenance mode unless explicitly enabled
  if (isMaintenanceMode() && !showInMaintenanceMode) {
    return null;
  }

  return (
    <div className="w-full bg-yellow-600 text-black py-2 px-4 text-center">
      <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap">
        <span className="font-bold">⚠️ {message}</span>
        {scheduledTime && (
          <span className="text-sm">Scheduled for: {scheduledTime}</span>
        )}
        <Link href="/maintenance" className="ml-2 underline text-black hover:text-white">
          More info
        </Link>
      </div>
    </div>
  );
};

export default MaintenanceBanner; 