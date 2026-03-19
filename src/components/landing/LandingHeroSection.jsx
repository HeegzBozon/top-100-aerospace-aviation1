import React, { useState, lazy, Suspense } from 'react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Sparkles, MessageCircle, Bot, Loader2, Handshake } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brandColors } from '@/components/core/brandTheme';

const LtPerryChat = lazy(() => import('@/components/chat/LtPerryChat'));

export default function LandingHeroSection({ user, onFooterLinkClick }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = () => {
    base44.analytics.track({ eventName: 'lt_perry_chat_opened' });
    setIsChatOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-10 w-72 h-72 rounded-full opacity-5" style={{ background: brandColors.goldPrestige }} />
        <div className="absolute bottom-0 right-20 w-96 h-96 rounded-full opacity-5" style={{ background: brandColors.navyDeep }} />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch relative z-10">
        {/* Left Column */}
        <div className="flex-1 px-6 sm:px-8 lg:px-20 py-16 lg:py-24 flex items-center justify-center lg:justify-start">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full" style={{ backgroundColor: brandColors.goldPrestige + '10' }}>
              <Sparkles className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
              <span className="text-sm font-semibold" style={{ color: brandColors.goldPrestige }}>
                Discover Exceptional Leaders
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-tight" style={{ color: brandColors.navyDeep }}>
              Built for the People Behind the Breakthroughs.
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl mb-6 leading-relaxed font-light" style={{ color: brandColors.navyMid }}>
              A recognition platform and community accelerator for aerospace's most influential contributors.
            </p>

            {/* Mantra */}
            <p className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: brandColors.goldPrestige }}>
              Celebrate. Connect. Elevate.
            </p>

            {/* Institutional Proof */}
            <p className="text-sm font-medium mb-8" style={{ color: brandColors.navyMid }}>
              Recognizing aerospace excellence across 30+ Countries · 6 Global Categories · Est. 2021
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('Top100Women2025')}>
                <Button
                  size="lg"
                  className="text-white text-lg h-14 px-10 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                  style={{ backgroundColor: brandColors.navyDeep }}
                >
                  View the 2025 Index
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={handleOpenChat}
                aria-label="Learn more — chat with Lt. Perry"
                className="text-lg h-14 px-10 font-semibold rounded-xl border-2 transition-all hover:-translate-y-1"
                style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
              >
                <MessageCircle className="mr-3 w-5 h-5" />
                Learn More
              </Button>
            </div>

            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DialogContent className="sm:max-w-lg h-[620px] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden border-0 shadow-2xl">
                {/* Hero Header */}
                <div className="shrink-0 px-6 py-5 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #1a2f5a 100%)` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #b8922a)` }}>
                    <Bot className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <DialogTitle className="text-sm font-bold text-white tracking-wide">Lt. Perry</DialogTitle>
                    <p className="text-xs font-medium" style={{ color: brandColors.goldPrestige }}>Platform Intelligence · Always Online</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                    <span className="text-xs text-emerald-400 font-medium">Live</span>
                  </div>
                </div>
                <Suspense fallback={
                  <div className="flex-1 flex items-center justify-center bg-slate-50">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" aria-hidden="true" />
                  </div>
                }>
                  <LtPerryChat />
                </Suspense>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right Column - Auth Card */}
        <div className="flex-1 px-6 sm:px-8 lg:px-20 py-8 lg:py-16 flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-sm rounded-3xl backdrop-blur-sm border shadow-2xl p-8 overflow-y-auto" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: brandColors.goldPrestige + '20'
          }}>
            {user ? (
              <div className="text-center">
                <div
                  className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` }}
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-4xl font-bold">{user.full_name?.charAt(0)}</span>
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>{user.full_name}</h2>
                <p className="text-sm mb-8" style={{ color: brandColors.navyMid }}>{user.email}</p>
                <Link to={createPageUrl('Home')}>
                  <Button
                    className="w-full text-white h-12 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    style={{ backgroundColor: brandColors.navyDeep }}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
                <button
                  onClick={async () => await base44.auth.logout()}
                  className="w-full mt-4 font-medium text-sm py-3 rounded-lg transition hover:opacity-60"
                  style={{ color: brandColors.navyMid }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3" style={{ color: brandColors.navyDeep }}>Join the Community</h2>
                <p className="text-sm mb-8" style={{ color: brandColors.navyMid }}>
                  Sign in to nominate, vote, and connect with aerospace leaders.
                </p>
                <Button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="w-full text-white h-12 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                  style={{ backgroundColor: brandColors.navyDeep }}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  variant="outline"
                  className="w-full mt-4 h-12 font-semibold rounded-xl border-2 transition hover:opacity-80"
                  style={{ borderColor: brandColors.goldPrestige, color: brandColors.goldPrestige }}
                >
                  Create Account
                </Button>
                <Link to="/DiscoveryQuestionnaire" className="block mt-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 font-semibold rounded-xl border-2 transition hover:opacity-80 gap-2"
                    style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
                  >
                    <Handshake className="w-4 h-4" />
                    Work With Us
                  </Button>
                </Link>
                <p className="text-xs mt-6 leading-relaxed" style={{ color: brandColors.navyMid }}>
                  By continuing, you agree to our Terms. Learn how we process your data in our Privacy Policy.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}