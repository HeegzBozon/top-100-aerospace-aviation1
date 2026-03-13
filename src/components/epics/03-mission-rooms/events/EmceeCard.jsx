import React from 'react';
import { Sparkles } from 'lucide-react';

export default function EmceeCard() {
  return (
    <div className="bg-gradient-to-tr from-[var(--accent)]/10 to-[var(--accent-2)]/10 border border-[var(--accent)]/20 rounded-2xl p-6 flex items-start gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center shadow-lg">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-bold text-[var(--text)] text-lg mb-1">A Message from your Emcee</h3>
        <p className="text-[var(--muted)]">
          Welcome to the Aerospace Festival! This week is all about recognition and connection. Dive into the TOP 100 results, then continue the celebration at the Leading Ladies Summit After Party. Complete quests along the way to boost your profile!
        </p>
      </div>
    </div>
  );
}