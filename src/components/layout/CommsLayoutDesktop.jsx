import React, { useState } from "react";
import CommsIconRail from "@/components/comms/CommsIconRail";
import Drawer from "@/components/comms/Drawer";
import CommsMainView from "@/components/comms/CommsMainView";
import CommsHeroCarousel from "@/components/comms/CommsHeroCarousel";
import { useConversation } from "@/components/contexts/ConversationContext";
import Season3ReOnboarding from "@/components/onboarding/Season3ReOnboarding";
import NewYearCountdownBar from "@/components/NewYearCountdownBar";

function CommsAwareContent({ children, currentPageName }) {
  const { activeConversation } = useConversation();

  if (activeConversation) {
    return <CommsMainView onOpenMobileSidebar={() => { }} />;
  }

  if (currentPageName === 'Comms') {
    return <NoConversationPlaceholder />;
  }

  return <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>;
}

export default function CommsLayoutDesktop({
  children,
  currentPageName,
  user,
  showReOnboarding,
  onReOnboardingComplete,
  onReOnboardingSkip,
  isBare = false,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="hidden md:flex h-screen overflow-hidden bg-white">
      {!isBare && (
        <>
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          <CommsIconRail currentPageName={currentPageName} totalUnread={0} />

          {!!user && (
            <div className={`
              fixed md:relative inset-y-0 left-0 z-50 md:z-auto
              ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              transition-transform duration-300 ease-out
            `}>
              <Drawer
                currentPageName={currentPageName}
                onMobileClose={() => setMobileSidebarOpen(false)}
                user={user}
              />
            </div>
          )}
        </>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {showReOnboarding && (
          <Season3ReOnboarding
            onComplete={onReOnboardingComplete}
            onSkip={onReOnboardingSkip}
          />
        )}

        <CommsAwareContent currentPageName={currentPageName}>
          {children}
        </CommsAwareContent>
      </main>

      {!isBare && !!user && <NewYearCountdownBar />}
    </div>
  );
}