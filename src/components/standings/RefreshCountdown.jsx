import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function RefreshCountdown({ isActive }) {
  const [countdown, setCountdown] = useState(120); // Changed to 2 minutes

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 120; // Reset to 2 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
      <RefreshCw className="w-3 h-3 animate-spin" />
      <span>Refresh in {minutes}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
}