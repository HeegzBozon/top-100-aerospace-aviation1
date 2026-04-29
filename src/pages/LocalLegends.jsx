import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import LLHero from '@/components/local-legends/LLHero';
import LLWhatThisIs from '@/components/local-legends/LLWhatThisIs';
import LLCategories from '@/components/local-legends/LLCategories';
import LLHowItWorks from '@/components/local-legends/LLHowItWorks';
import LLAffiliation from '@/components/local-legends/LLAffiliation';
import LLFooter from '@/components/local-legends/LLFooter';
import LLHeroVideoManager from '@/components/local-legends/LLHeroVideoManager';

export default function LocalLegends() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => setIsAdmin(u?.role === 'admin'))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen sf-pro">
      <LLHero />

      {isAdmin && (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => setShowManager(!showManager)}
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showManager ? '▾ Hide Video Manager' : '▸ Manage Hero Videos'}
          </button>
          {showManager && (
            <div className="mt-4">
              <LLHeroVideoManager />
            </div>
          )}
        </div>
      )}

      <LLWhatThisIs />
      <LLCategories />
      <LLHowItWorks />
      <LLAffiliation />
      <LLFooter />
    </div>
  );
}