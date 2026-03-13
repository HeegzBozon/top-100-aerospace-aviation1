import React, { useState, lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LtPerryChat = lazy(() => import('@/components/capabilities/comms/LtPerryChat'));

export default function LtPerryButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = () => {
    base44.analytics.track({ eventName: 'lt_perry_chat_opened_from_index' });
    setIsChatOpen(true);
  };

  return (
    <>
      {/* Floating Logo Button - Apple-style */}
      <button
        onClick={handleOpenChat}
        aria-label="Chat with Lt. Perry"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg active:shadow-md transition-all active:scale-95 flex items-center justify-center bg-white border border-slate-200"
      >
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/e751dcfd8_TOP100Aerospacelogo.png"
          alt="Top 100 Aerospace & Aviation"
          className="w-10 h-10 md:w-12 md:h-12 object-contain"
        />
      </button>

      {/* Chat Dialog - Apple-inspired */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-lg h-[620px] flex flex-col p-0 gap-0 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl">
          {/* Header with Lt. Perry Profile Photo */}
          <div className="shrink-0 px-6 py-6 flex items-center gap-4 bg-slate-50 border-b border-slate-200">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/96ea17d68_Gemini_Generated_Image_8b7xe68b7xe68b7x-3.png"
              alt="Lt. Perry"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shadow-sm"
            />
            <div className="flex-1">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Lt. Perry
              </DialogTitle>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                <p className="text-xs text-slate-500 font-medium">Always online</p>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center bg-white">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" aria-hidden="true" />
              </div>
            }
          >
            <LtPerryChat />
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
}