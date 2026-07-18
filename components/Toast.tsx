'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface ToastProps {
  message: string;
  show: boolean;
  onHide?: () => void;
}

export default function Toast({ message, show, onHide }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onHide?.(), 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <div
      className={clsx(
        'fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-control bg-text-primary px-5 py-3 text-sm font-medium text-white shadow-toast transition-all duration-225',
        show ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0 pointer-events-none'
      )}
    >
      {message}
    </div>
  );
}

// Hook for convenient toast usage
export function useToast() {
  const [toast, setToast] = useState({ message: '', show: false });

  const showToast = (message: string) => {
    setToast({ message, show: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  return { toast, showToast, hideToast };
}
