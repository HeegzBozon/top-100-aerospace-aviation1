import { useEffect, useState } from "react";
import { useConversation } from "@/components/contexts/ConversationContext";
import MobileHomeView from "@/components/comms/MobileHomeView";
import MobileCommsView from "@/components/comms/MobileCommsView";
import Season3ReOnboarding from "@/components/onboarding/Season3ReOnboarding";
import NewYearCountdownBar from "@/components/NewYearCountdownBar";
import HandheldDeck from "@/components/handheld/HandheldDeck";
import { useDevice, useInsideDevice } from "@/components/handheld/HandheldShell";

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
  const device = useDevice();
  const showDock = (!isBare && !activeConversation) || (!isBare && activeConversation && !composerActive);

  // The shell already owns the device on screen. This layout only tells it when
  // the composer needs the whole glass, and reclaims the room when it doesn't.
  useEffect(() => {
    device?.setPutAway(!showDock);
  }, [device, showDock]);

  // Outside the shell this layout IS the screen; inside it, content simply
  // fills the glass the shell already provides.
  const screen = device
    ? { className: "flex-1" }
    : {
        "data-handheld-screen": "true",
        className: "flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col",
        style: { background: 'var(--bg, #faf8f5)' },
      };

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
        <div {...screen}>
          <div className="flex-1">{children}</div>
        </div>
      )}

      {!isBare && <NewYearCountdownBar />}

      {showDock && !device && <HandheldDeck />}
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
  const insideDevice = useInsideDevice();

  const content = (
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
  );

  if (insideDevice) return content;

  return (
    <div className="hh-stage md:hidden flex flex-col">
      {content}
    </div>
  );
}