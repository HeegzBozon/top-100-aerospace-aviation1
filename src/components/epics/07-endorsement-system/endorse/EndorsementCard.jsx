import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Check } from 'lucide-react';

export default function EndorsementCard({ nominee, onEndorse, isEndorsed, isProcessing }) {
  return (
    <div className="bg-[var(--glass)] border border-white/10 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <img
          src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=random`}
          alt={nominee.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[var(--text)]">{nominee.name}</h3>
          <p className="text-sm text-[var(--muted)]">{nominee.title || 'Community Nominee'}</p>
          <p className="text-sm text-[var(--muted)] font-semibold">{nominee.company || 'Top 100'}</p>
        </div>
      </div>
      <p className="text-[var(--muted)] text-sm mt-4 mb-6 line-clamp-3 h-[60px]">
        {nominee.description}
      </p>
      <Button
        onClick={() => onEndorse(nominee)}
        disabled={isEndorsed || isProcessing}
        className={`w-full transition-all duration-200 ${
          isEndorsed
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-[var(--accent)] hover:bg-[var(--accent-2)]'
        }`}
      >
        {isEndorsed ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Endorsed
          </>
        ) : (
          <>
            <Heart className="w-5 h-5 mr-2" />
            Endorse
          </>
        )}
      </Button>
    </div>
  );
}