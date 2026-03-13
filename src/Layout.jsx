import React, { useState, useEffect } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

import { getAutoTheme, getCSSVariables, themes } from "@/components/core/brandTheme";
import { ThemeProvider } from "@/components/core/ThemeContext";
import { PUBLIC_PAGES } from "@/components/core/appConfig";
import { ConversationProvider } from "@/components/capabilities/contexts/ConversationContext";
import { UnreadProvider } from "@/components/capabilities/contexts/UnreadContext";
import { SidebarProvider } from "@/components/capabilities/contexts/SidebarContext";
import { useIsMobile } from "@/hooks/use-mobile";

import CommsIconRail from "@/components/capabilities/comms/CommsIconRail";
import Drawer from "@/components/capabilities/comms/Drawer";
import MobileDock from "@/components/capabilities/comms/MobileDock";
import MobileCommsView from "@/components/capabilities/comms/MobileCommsView";
import CommsMainView from "@/components/capabilities/comms/CommsMainView";
import NoConversationPlaceholder from "@/components/capabilities/comms/NoConversationPlaceholder";
import NewYearCountdownBar from "@/components/NewYearCountdownBar";
import Season3ReOnboarding from "@/components/capabilities/onboarding/Season3ReOnboarding";
import { useUnread } from "@/components/capabilities/contexts/UnreadContext";
import { useConversation } from "@/components/capabilities/contexts/ConversationContext";

const IS_COMMS_PAGE = (name) => name === 'Comms';

/**
 * CommsSlot — replaces {children} only on the Comms page.
 * All other pages render their children directly.
 */
function CommsSlot({ children, currentPageName, isMobile }) {
  const { activeConversation } = useConversation();

  if (!IS_COMMS_PAGE(currentPageName)) {
    return <>{children}</>;
  }

  if (isMobile) {
    return <MobileCommsView />;
  }

  if (!activeConversation) {
    return <NoConversationPlaceholder />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <CommsMainView onOpenMobileSidebar={() => {}} />
    </div>
  );
}

function AppShell({ children, currentPageName, user, showReOnboarding, onReOnboardingDone, isBare }) {
  const isMobile = useIsMobile();
  const { totalUnread } = useUnread();

  if (isBare) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (isMobile) {
    return (
      <div className="h-screen overflow-hidden flex flex-col md:hidden">
        {showReOnboarding && (
          <Season3ReOnboarding onComplete={onReOnboardingDone} onSkip={onReOnboardingDone} />
        )}
        <div className="flex-1 overflow-hidden">
          <CommsSlot currentPageName={currentPageName} isMobile={isMobile}>
            {children}
          </CommsSlot>
        </div>
        {!IS_COMMS_PAGE(currentPageName) && <NewYearCountdownBar />}
        {!IS_COMMS_PAGE(currentPageName) && <MobileDock currentPageName={currentPageName} />}
      </div>
    );
  }

  // Desktop
  return (
    <div className="hidden md:flex h-screen overflow-hidden bg-white">
      <CommsIconRail currentPageName={currentPageName} totalUnread={totalUnread} />
      <Drawer currentPageName={currentPageName} user={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {showReOnboarding && (
          <Season3ReOnboarding onComplete={onReOnboardingDone} onSkip={onReOnboardingDone} />
        )}
        <div className="flex-1 overflow-hidden">
          <CommsSlot currentPageName={currentPageName} isMobile={isMobile}>
            {children}
          </CommsSlot>
        </div>
      </main>
      <NewYearCountdownBar />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('checking');
  const [showReOnboarding, setShowReOnboarding] = useState(false);
  const [initialThemeMode, setInitialThemeMode] = useState('auto');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.theme_mode) setInitialThemeMode(currentUser.theme_mode);
        if (currentPageName === 'MissionControl' && !currentUser.season3_reonboarding_seen) {
          setShowReOnboarding(true);
        }
        setAuthStatus('ok');
      } catch {
        setUser(null);
        if (!PUBLIC_PAGES.includes(currentPageName)) {
          window.location.href = createPageUrl('Home');
        } else {
          setAuthStatus('ok');
        }
      }
    };
    handleAuth();
  }, [currentPageName]);

  useEffect(() => {
    if ('vibrate' in navigator) navigator.vibrate(100);
  }, []);

  const handleReOnboardingDone = async () => {
    setShowReOnboarding(false);
    if (user) {
      try { await base44.auth.updateMe({ season3_reonboarding_seen: true }); } catch { }
    }
  };

  if (authStatus === 'checking') {
    const themeVars = themes[getAutoTheme()] || themes.brand;
    return (
      <>
        <style>{getCSSVariables(themeVars)}</style>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
        </div>
      </>
    );
  }

  const isNotFoundPage = currentPageName === 'NotFound';
  const isLandingPage = currentPageName === 'Landing';
  const isUnauthHome = currentPageName === 'Home' && !user;
  const isBare = isLandingPage || isUnauthHome || isNotFoundPage;

  return (
    <ThemeProvider initialMode={initialThemeMode}>
      <ConversationProvider>
        <UnreadProvider>
          <SidebarProvider>
            <Toaster />
            <AppShell
              currentPageName={currentPageName}
              user={user}
              showReOnboarding={showReOnboarding}
              onReOnboardingDone={handleReOnboardingDone}
              isBare={isBare}
            >
              {children}
            </AppShell>
          </SidebarProvider>
        </UnreadProvider>
      </ConversationProvider>
    </ThemeProvider>
  );
}