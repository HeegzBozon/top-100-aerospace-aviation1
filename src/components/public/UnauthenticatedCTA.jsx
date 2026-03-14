import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

/**
 * UnauthenticatedCTA
 * Shows a sticky sign-in banner for unauthenticated visitors.
 * Renders nothing if the user is already logged in.
 */
export default function UnauthenticatedCTA({ user }) {
  if (user) return null;

  const handleSignIn = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 py-3 md:px-8 bg-[#1e3a5a] border-t border-[#c9a87c]/20 shadow-2xl">
      <p className="text-sm text-white/80 hidden sm:block">
        Join to vote, nominate, and connect with TOP 100 Aerospace &amp; Aviation leaders.
      </p>
      <p className="text-sm text-white/80 sm:hidden">
        Sign in to join the community.
      </p>
      <Button
        onClick={handleSignIn}
        className="shrink-0 bg-[#c9a87c] hover:bg-[#b8976b] text-[#1e3a5a] font-semibold text-sm rounded-full px-5 h-9 gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    </div>
  );
}