import { Button } from '@/components/ui/button';
import { CalendarRange, ArrowLeft } from 'lucide-react';

// Shown when a workspace tab is opened without a selected cohort.
export default function WorkspaceEmptyState({ onNavigate }) {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-14 h-14 rounded-full bg-editorial-cream border border-editorial-copper/30 flex items-center justify-center mx-auto mb-4">
        <CalendarRange className="w-6 h-6 text-editorial-copper" />
      </div>
      <h3 className="font-heading text-2xl text-editorial-navy">Select a cohort</h3>
      <p className="text-sm text-editorial-navy/60 mt-2 mb-6">
        The cohort workspace operates on one season at a time. Pick a cohort from the Season Manager to begin.
      </p>
      <Button onClick={() => onNavigate?.('seasons')} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Go to Season Manager
      </Button>
    </div>
  );
}