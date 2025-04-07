'use client';

import React, { useState } from 'react';
import Button from './ui/Button';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  if (!isOpen) return null;
  
  const steps = [
    {
      title: "Welcome to Battle Memecoin Club",
      description: "The ultimate hub where memecoins compete in high-stakes battles with live betting.",
      content: (
        <div className="space-y-3 text-sm">
          <p>
            Battle Memecoin Club (BMC) represents a groundbreaking fusion of memecoin culture, competitive gaming mechanics, and Web3 financial infrastructure. Built on the Solana blockchain, BMC creates an immersive ecosystem where memecoins compete in high-stakes battles, with users placing bets on outcomes.
          </p>
          <p>
            Our platform captures the vibrant energy of memecoin communities while adding meaningful utility and genuine entertainment value.
          </p>
        </div>
      )
    },
    {
      title: "Battle Arena",
      description: "Watch live-streamed memecoin battles with real-time stats and interactive visuals.",
      content: (
        <div className="space-y-3 text-sm">
          <p>
            The Battle Arena is the heart of BMC, featuring:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Live-streamed memecoin battles</li>
            <li>Real-time price charts and statistics</li>
            <li>Live betting on your favorite memecoins</li>
            <li>Winner takes prize directly to your wallet</li>
          </ul>
        </div>
      )
    },
    {
      title: "Betting & Rewards",
      description: "Place bets on your favorite memecoins and win SOL rewards.",
      content: (
        <div className="space-y-3 text-sm">
          <p>
            Connect your Solana wallet to place bets on memecoin battles:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Bet with SOL on your favorite memecoin fighters</li>
            <li>Win proportional rewards based on odds</li>
            <li>Track your betting history and performance</li>
            <li>Claim rewards directly to your wallet</li>
          </ul>
        </div>
      )
    },
    {
      title: "Important Disclaimer",
      description: "Please read before using Battle Memecoin Club",
      content: (
        <div className="space-y-3 text-sm">
          <p className="font-bold text-yellow-400">
            Risk Warning:
          </p>
          <p>
            Cryptocurrency betting involves substantial risk. Only bet with funds you can afford to lose. BMC is intended for entertainment purposes.
          </p>
          <p className="font-bold text-yellow-400">
            Legal Compliance:
          </p>
          <p>
            Users are responsible for ensuring their participation complies with local laws and regulations. BMC is not available in jurisdictions where online betting is prohibited.
          </p>
          <p>
            By clicking &quot;I Understand & Accept&quot; below, you acknowledge that you have read and agree to these terms.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On last step, accept and close
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 border-2 border-primary/70 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl shadow-primary/20 retro-container">
        {/* Progress indicator */}
        <div className="flex mb-4 gap-1">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 flex-1 rounded-full ${index <= currentStep ? 'bg-[#14F195]' : 'bg-gray-700'}`}
            />
          ))}
        </div>
        
        {/* Step content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-300 mb-4">
            {steps[currentStep].description}
          </p>
          <div className="text-left bg-black/50 p-4 rounded-lg border border-[#14F195]/30 max-h-60 overflow-y-auto">
            {steps[currentStep].content}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep < steps.length - 1 ? (
            <>
              <Button 
                variant="dark" 
                size="md" 
                onClick={handleSkip}
                fullWidth
              >
                SKIP
              </Button>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleNext}
                fullWidth
              >
                NEXT
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleNext}
              fullWidth
            >
              I UNDERSTAND & ACCEPT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal; 