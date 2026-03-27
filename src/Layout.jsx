import React, { useState, useEffect, Suspense } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

import { getAutoTheme, getCSSVariables, themes } from "@/components/core/brandTheme";
import { ThemeProvider } from "@/components/core/ThemeContext";
import { PUBLIC_PAGES } from "@/components/core/appConfig";
const CommsLayoutMobile = React.lazy(() => import("@/components/layout/CommsLayoutMobile"));
const CommsLayoutDesktop = React.lazy(() => import("@/components/layout/CommsLayoutDesktop"));
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
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser?.theme_mode) setInitialThemeMode(currentUser.theme_mode);
        if (currentPageName === 'MissionControl' && !currentUser?.season3_reonboarding_seen) {
          setShowReOnboarding(true);
        }
        setAuthStatus('ok');
      } catch (err) {
        console.error('Auth error:', err);
        setUser(null);
        setAuthStatus('ok');
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
      try { await base44.auth.updateMe({ season3_reonboarding_seen: true }); } catch { }
    }
  };

  // --- Loading state (before ThemeProvider is ready) ---
  // Render after 5 seconds even if still checking
  const [showTimeout, setShowTimeout] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setShowTimeout(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (authStatus === 'checking' && !showTimeout) {
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
            <Suspense fallback={<div />}>
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
              </Suspense>
              </SidebarProvider>
          </CommsThemeProvider>
        </UnreadProvider>
      </ConversationProvider>
    </ThemeProvider>
  );
}