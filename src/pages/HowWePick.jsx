import { useEffect } from 'react';
import { createPageUrl } from '@/utils';

// Redirect from old HowWePick URL to new Top100OS page
export default function HowWePick() {
  useEffect(() => {
    window.location.href = createPageUrl('Top100OS');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf8f5' }}>
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}