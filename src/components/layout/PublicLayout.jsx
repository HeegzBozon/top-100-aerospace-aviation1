import React from "react";
import TopNav from "@/components/TopNav";
import Landing2Sidebar from "@/components/landing/Landing2Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import DesktopDock from "@/components/dock/DesktopDock";
import NewYearCountdownBar from "@/components/NewYearCountdownBar";
import Season3ReOnboarding from "@/components/onboarding/Season3ReOnboarding";

export default function PublicLayout({
  children,
  currentPageName,
  showTopNav,
  showSidebar,
  showReOnboarding,
  onReOnboardingComplete,
  onReOnboardingSkip,
}) {
  const isNotFoundPage = currentPageName === 'NotFound';

  return (
    <div
      className="min-h-screen text-[var(--text)] font-sans transition-colors duration-500"
      style={{ background: 'var(--bg)' }}
    >
      {showTopNav && <TopNav />}

      {showReOnboarding && (
        <Season3ReOnboarding
          onComplete={onReOnboardingComplete}
          onSkip={onReOnboardingSkip}
        />
      )}

      <div className="flex">
        {showSidebar && <Landing2Sidebar activeItem={currentPageName} />}

        <main className={`flex-1 ${showTopNav ? "pt-2 md:pt-4 pb-20 lg:pb-24" : "pt-16 pb-20 lg:pb-24"}`}>
          {children}
        </main>
      </div>

      {!isNotFoundPage && showTopNav && <MobileBottomNav currentPageName={currentPageName} />}
      {!isNotFoundPage && showTopNav && <DesktopDock currentPageName={currentPageName} />}

      <NewYearCountdownBar />
    </div>
  );
}