import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Vote, Edit, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MobileQuickActions({ onSearchClick }) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-20 left-0 right-0 p-4 md:hidden z-40"
    >
      <div className="bg-[var(--card)]/80 backdrop-blur-2xl p-2 rounded-full shadow-lg border border-[var(--border)] flex justify-around items-center">
        <Link to={createPageUrl('BallotBox')}>
          <Button variant="ghost" className="flex-col h-auto p-2">
            <Vote className="w-5 h-5 mb-1" />
            <span className="text-xs">Vote</span>
          </Button>
        </Link>
        <Link to={createPageUrl('Submit')}>
          <Button variant="ghost" className="flex-col h-auto p-2">
            <Edit className="w-5 h-5 mb-1" />
            <span className="text-xs">Nominate</span>
          </Button>
        </Link>
        <Button variant="ghost" className="flex-col h-auto p-2" onClick={onSearchClick}>
          <Search className="w-5 h-5 mb-1" />
          <span className="text-xs">Search</span>
        </Button>
      </div>
    </motion.div>
  );
}