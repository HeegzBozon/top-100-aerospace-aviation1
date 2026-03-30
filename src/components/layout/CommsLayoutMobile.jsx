import { useState } from "react";
import { useConversation } from "@/components/contexts/ConversationContext";
import MobileHomeView from "@/components/comms/MobileHomeView";
import MobileCommsView from "@/components/comms/MobileCommsView";
import Season3ReOnboarding from "@/components/onboarding/Season3ReOnboarding";
import NewYearCountdownBar from "@/components/NewYearCountdownBar";
import MobileDock from "@/components/comms/MobileDock";

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
  const [composerActive, setComposerActive] = useState(false);
  const showDock = (!isBare && !activeConversation) || (!isBare && activeConversation && !composerActive);

  return (
    <>
      {showReOnboarding && (
        <Season3ReOnboarding
          onComplete={onReOnboardingComplete}
          onSkip={onReOnboardingSkip}
        />
      )}

      {!isBare && !!user && currentPageName?.toLowerCase() === 'comms' ? (
        <MobileCommsView isDarkMode={isDarkMode} onComposerActiveChange={setComposerActive} />
      ) : !isBare && currentPageName?.toLowerCase() === 'home' ? (
        <MobileHomeView
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ background: 'var(--bg, #faf8f5)' }}>
          {children}
        </div>
      )}

      {!isBare && <NewYearCountdownBar />}

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
    <div className="md:hidden flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
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