'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextProps {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: (id: number) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextProps>({
  showToast: () => {},
  hideToast: () => {},
  toasts: [],
});

export const useToast = () => useContext(ToastContext);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(1);

  const hideToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const newToast = { id: nextId, message, type };
    setToasts(prev => [...prev, newToast]);
    setNextId(prev => prev + 1);

    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      hideToast(newToast.id);
    }, 5000);
  }, [nextId, hideToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`
              px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-xs animate-slide-in
              ${toast.type === 'success' ? 'bg-green-600' : ''}
              ${toast.type === 'error' ? 'bg-red-600' : ''}
              ${toast.type === 'info' ? 'bg-blue-600' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-600' : ''}
            `}
          >
            <div className="flex justify-between items-center">
              <p>{toast.message}</p>
              <button 
                onClick={() => hideToast(toast.id)}
                className="ml-4 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider; 