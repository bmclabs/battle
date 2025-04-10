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
    <div className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-black py-3 px-4 text-center shadow-md">
      <div className="container mx-auto flex items-center justify-center gap-3 flex-wrap">
        <span className="font-bold flex items-center">
          <span className="text-lg mr-2">⚙️</span> 
          {message}
        </span>
        {scheduledTime && (
          <span className="text-sm bg-black/10 px-2 py-1 rounded">
            <span className="font-semibold">Scheduled for:</span> {scheduledTime}
          </span>
        )}
        <span className="text-sm">
          Battles will remain active until maintenance begins.
        </span>
        <Link 
          href="https://discord.gg/Knnvu9zf5x" 
          className="ml-2 text-black font-medium hover:text-white transition-colors duration-200 bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-sm" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Join Discord for Updates
        </Link>
      </div>
    </div>
  );
};

export default MaintenanceBanner; 