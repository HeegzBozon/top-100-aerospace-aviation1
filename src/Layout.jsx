import React, { useState, useEffect } from "react";
import { createPageUrl } from "@/utils";
import { User } from '@/entities/User';
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

import { getAutoTheme, getCSSVariables, themes } from "@/components/core/brandTheme";
import { ThemeProvider } from "@/components/core/ThemeContext";
import { PUBLIC_PAGES } from "@/components/core/appConfig";
import CommsLayoutMobile from "@/components/layout/CommsLayoutMobile";
import CommsLayoutDesktop from "@/components/layout/CommsLayoutDesktop";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConversationProvider } from "@/components/contexts/ConversationContext";
import { UnreadProvider } from "@/components/contexts/UnreadContext";
import { SidebarProvider } from "@/components/contexts/SidebarContext";
import { CommsThemeProvider } from "@/components/contexts/CommsThemeContext";
const Admin = React.lazy(() => import("@/pages/Admin"));

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('checking');
  const [showReOnboarding, setShowReOnboarding] = useState(false);
  const [initialThemeMode, setInitialThemeMode] = useState('auto');
  const isMobile = useIsMobile();

  // --- Auth ---
  useEffect(() => {
    const handleAuth = async () => {
      try {
        const currentUser = await User.me();
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

  // --- Vibrate on load ---
  useEffect(() => {
    if ('vibrate' in navigator) navigator.vibrate(100);
  }, []);

  // --- Re-onboarding handler ---
  const handleReOnboardingDone = async () => {
    setShowReOnboarding(false);
    if (user) {
      try { await User.updateMyUserData({ season3_reonboarding_seen: true }); } catch { }
    }
  };

  // --- Loading state (before ThemeProvider is ready) ---
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
  const isPublicIndexPage = currentPageName === 'Top100Women2025';
  const isUnauthHome = currentPageName === 'Home' && !user;

  // Use Comms layout for all "App" pages, including the public index
  const useCommsLayout = (!!user || isPublicIndexPage) && !isNotFoundPage && !isLandingPage;

  const isBare = isLandingPage || isNotFoundPage;

  return (
    <ThemeProvider initialMode={initialThemeMode}>
      <ConversationProvider>
        <UnreadProvider>
          <CommsThemeProvider>
          <SidebarProvider>
            <Toaster />
            {isMobile ? (
              <CommsLayoutMobile
                currentPageName={currentPageName}
                user={user}
                showReOnboarding={showReOnboarding}
                onReOnboardingComplete={handleReOnboardingDone}
                onReOnboardingSkip={handleReOnboardingDone}
                isBare={isBare}
              >
                {children}
              </CommsLayoutMobile>
            ) : (
              <CommsLayoutDesktop
                currentPageName={currentPageName}
                user={user}
                showReOnboarding={showReOnboarding}
                onReOnboardingComplete={handleReOnboardingDone}
                onReOnboardingSkip={handleReOnboardingDone}
                isBare={isBare}
              >
                {children}
              </CommsLayoutDesktop>
            )}
          </SidebarProvider>
          </CommsThemeProvider>
        </UnreadProvider>
      </ConversationProvider>
    </ThemeProvider>
  );
}