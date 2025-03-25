'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
  const router = useRouter();
  
  // Check if maintenance mode is disabled (do this on client-side only)
  useEffect(() => {
    const isMaintenanceMode = process.env.NEXT_PUBLIC_IS_MAINTENANCE === 'true';
    
    // If maintenance mode is off, redirect to home page after a short delay
    if (!isMaintenanceMode) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-2xl p-8 bg-black/80 border-2 border-primary text-center retro-container">
        <div className="space-y-4 mb-8">
          <p className="text-lg text-white">
            Maintenance Mode
          </p>
          <p className="text-gray-400">
            This feature is currently under development.
          </p>
        </div>
      </div>
    </div>
  );
} 