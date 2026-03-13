import React, { useState } from "react";
import { useConversation } from "@/components/capabilities/contexts/ConversationContext";
import MobileHomeView from "@/components/capabilities/comms/MobileHomeView";
import MobileCommsView from "@/components/capabilities/comms/MobileCommsView";
import Season3ReOnboarding from "@/components/capabilities/onboarding/Season3ReOnboarding";
import NewYearCountdownBar from "@/components/NewYearCountdownBar";
import MobileDock from "@/components/capabilities/comms/MobileDock";

function MobileCommsContent({
  children,
  currentPageName,
  user,
  showReOnboarding,
  onReOnboardingComplete,
  onReOnboardingSkip,
  isBare = false,
  isDarkMode,
  setIsDarkMode,

}) {
  const { activeConversation } = useConversation();
  const showDock = !isBare && !!user && !activeConversation;

  return (
    <>
      {showReOnboarding && (
        <Season3ReOnboarding
          onComplete={onReOnboardingComplete}
          onSkip={onReOnboardingSkip}
        />
      )}

      {!isBare && !!user && currentPageName?.toLowerCase() === 'comms' ? (
        <MobileCommsView isDarkMode={isDarkMode} />
      ) : !isBare && !!user && currentPageName?.toLowerCase() === 'home' ? (
        <MobileHomeView
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ background: 'var(--bg, #faf8f5)' }}>
          {children}
        </div>
      )}

      {!isBare && !!user && <NewYearCountdownBar />}

      {showDock && (
        <MobileDock
          isDarkMode={isDarkMode}
          currentPageName={currentPageName}
        />
      )}
    </>
  );
}

export default function CommsLayoutMobile({
  children,
  currentPageName,
  user,
  showReOnboarding,
  onReOnboardingComplete,
  onReOnboardingSkip,
  isBare = false,
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="md:hidden h-screen overflow-hidden flex flex-col">
      <MobileCommsContent
        currentPageName={currentPageName}
        user={user}
        showReOnboarding={showReOnboarding}
        onReOnboardingComplete={onReOnboardingComplete}
        onReOnboardingSkip={onReOnboardingSkip}
        isBare={isBare}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      >
        {children}
      </MobileCommsContent>
    </div>
  );
}