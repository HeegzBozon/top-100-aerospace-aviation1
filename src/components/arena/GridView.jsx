import React from 'react';
import NomineeCard from './NomineeCard';
import { AnimatePresence } from 'framer-motion';

export default function GridView({ nominees, onNomineeClick }) {
  if (!nominees || nominees.length === 0) {
    return (
       <div className="py-12 text-center text-[var(--muted)] bg-[var(--card)]/80 backdrop-blur-2xl border border-[var(--border)] rounded-2xl">
        <p>No nominees found for this season or filter.</p>
        <p className="text-sm mt-2">Try activating nominees in the Admin panel.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
      <AnimatePresence>
        {nominees.map((nominee, index) => (
          <NomineeCard
            key={nominee.nomineeId}
            nominee={nominee}
            onClick={() => onNomineeClick(nominee)}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}