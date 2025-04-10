'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
      <div className="w-full max-w-3xl p-8 bg-black/80 border-2 border-primary text-center retro-container">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo/bmc-logo.gif"
              alt="Battle Memecoin Club"
              width={240}
              height={100}
              className="object-contain"
            />
          </div>
        </div>
        
        <div className="space-y-5 mb-8">
          <h1 className="text-2xl text-[#14F195] font-pixel">System Upgrade in Progress</h1>
          
          <div className="bg-black/50 p-6 rounded-lg border border-[#14F195]/30">
            <p className="text-white text-lg mb-4">
              We're making Battle Memecoin Club even better!
            </p>
            
            <p className="text-gray-300 mb-3">
              Our team is currently implementing major performance improvements and exciting new features to enhance your gaming experience. During this time, all battles and betting functionalities are temporarily unavailable.
            </p>
            
            <p className="text-gray-300 mb-3">
              These upgrades include:
            </p>
            
            <p className="text-gray-300">
              We appreciate your patience while we make these important improvements. The system should be back online shortly.
            </p>
          </div>
          
          <div className="pt-4">
            <p className="text-gray-400 text-sm">
              For updates and more information, join our community:
            </p>
            <div className="flex justify-center space-x-6 mt-3">
              <Link 
                href="https://discord.gg/Knnvu9zf5x" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#14F195] text-sm"
              >
                Discord
              </Link>
              <Link 
                href="https://x.com/battlememecoin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#14F195] text-sm"
              >
                Twitter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 