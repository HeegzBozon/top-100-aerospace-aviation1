import { useState } from "react";
import { useConversation } from "@/components/contexts/ConversationContext";
import MobileHomeView from "@/components/comms/MobileHomeView";
import MobileCommsView from "@/components/comms/MobileCommsView";
import Season3ReOnboarding from "@/components/onboarding/Season3ReOnboarding";
import NewYearCountdownBar from "@/components/NewYearCountdownBar";
import HandheldDeck from "@/components/handheld/HandheldDeck";

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
        <div
          data-handheld-screen="true"
          className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col"
          style={{ background: 'var(--bg, #faf8f5)' }}
        >
          <div className="flex-1">{children}</div>
        </div>
      )}

      {!isBare && <NewYearCountdownBar />}

      {showDock && <HandheldDeck />}
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
    <div className="hh-stage md:hidden flex flex-col overflow-hidden">
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