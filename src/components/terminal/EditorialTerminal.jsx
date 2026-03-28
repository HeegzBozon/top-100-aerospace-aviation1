import EditorialTickerBar from './EditorialTickerBar';
import EditorialGlobeSection from './EditorialGlobeSection';
import EditorialLiveFeeds from './EditorialLiveFeeds';
import EditorialNewsFeed from './EditorialNewsFeed';
import EditorialLaunchWidget from './EditorialLaunchWidget';
import EditorialIntelFeed from './EditorialIntelFeed';
import EditorialIntelStrip from './EditorialIntelStrip';
import ErrorBoundary from '@/components/core/ErrorBoundary';

export default function EditorialTerminal({ children, heroSlot }) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5efe8 40%, #faf8f5 100%)' }}>
      {/* Ticker bar */}
      <EditorialTickerBar />

      {/* Main content area */}
      <div className="max-w-[1800px] mx-auto px-3 md:px-5 py-4">

        {/* ── Hero header above globe ── */}
         <div className="w-full mb-6">
           {heroSlot}
         </div>

         <div className="max-w-[1400px] mx-auto space-y-5">
           {/* ── Intel strip: 6 compact summary panels ── */}
           <ErrorBoundary>
             <EditorialIntelStrip />
           </ErrorBoundary>

           {/* ── Top row: Globe + Live Feeds ── */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
             <div className="lg:col-span-2">
               <ErrorBoundary>
                 <EditorialGlobeSection />
               </ErrorBoundary>
             </div>
             <div className="h-[420px] lg:h-auto">
               <ErrorBoundary>
                 <EditorialLiveFeeds />
               </ErrorBoundary>
             </div>
           </div>

          {/* ── Three-column intelligence grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ErrorBoundary>
              <EditorialNewsFeed />
            </ErrorBoundary>
            <ErrorBoundary>
              <EditorialIntelFeed />
            </ErrorBoundary>
            <ErrorBoundary>
              <EditorialLaunchWidget />
            </ErrorBoundary>
          </div>

          {/* ── Existing editorial sections injected as children ── */}
          {children}
        </div>
      </div>
    </div>
  );
}