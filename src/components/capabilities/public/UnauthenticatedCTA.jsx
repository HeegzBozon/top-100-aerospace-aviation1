import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function UnauthenticatedCTA({ user }) {
  if (user) return null;

  return (
    <>
      {/* Back Button - Top Left */}
      <button
        onClick={() => window.history.back()}
        aria-label="Go back"
        className="fixed top-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-slate-100 active:scale-95"
      >
        <ArrowLeft className="w-5 h-5 text-slate-700" />
        <span className="text-sm font-medium text-slate-700 hidden sm:inline">Back</span>
      </button>

      {/* Sticky Login Banner - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left flex-1">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
              Join the community
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Sign in to nominate, vote, and connect with aerospace leaders.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              variant="outline"
              className="flex-1 sm:flex-none h-10 rounded-lg border-slate-300"
            >
              Sign In
            </Button>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="flex-1 sm:flex-none h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-24 sm:h-28" />
    </>
  );
}