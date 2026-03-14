import { useEffect } from 'react';
import { createPageUrl } from '@/utils';

export default function BallotBox() {
  useEffect(() => {
    // Redirect to Passport
    window.location.href = createPageUrl('Passport');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-[var(--muted)]">Redirecting to voting...</p>
      </div>
    </div>
  );
}