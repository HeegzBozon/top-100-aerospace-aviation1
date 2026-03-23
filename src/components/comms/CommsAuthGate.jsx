import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { useCommsTheme } from "@/components/contexts/CommsThemeContext";
import ConstellationBackground from "./ConstellationBackground";

export default function CommsAuthGate({ onSignIn, onSignUp }) {
  const { theme } = useCommsTheme();

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden relative"
      style={{ background: theme.bg }}
    >
      {theme.constellations && <ConstellationBackground />}

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(201,168,124,0.07) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "rgba(201,168,124,0.12)", border: "1px solid rgba(201,168,124,0.25)" }}
        >
          <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
          Join the Rapid Response Network
        </h1>

        {/* Subheading */}
        <p className="text-sm md:text-base text-white/50 text-center mb-8 max-w-sm leading-relaxed">
          Connect with aerospace leaders, domain experts, and peer communities in real-time. Access curated channels, direct messaging, and rapid response mission rooms.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:justify-center mb-8">
          <Button
            onClick={onSignIn}
            variant="outline"
            className="flex items-center justify-center gap-2 min-h-[44px] px-6 border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
          <Button
            onClick={onSignUp}
            className="flex items-center justify-center gap-2 min-h-[44px] px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </Button>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm text-xs text-white/40">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">✓</span>
            <span>Domain Networks & Channels</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">✓</span>
            <span>Direct Messaging</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">✓</span>
            <span>Mission Rooms</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">✓</span>
            <span>Real-Time Collaboration</span>
          </div>
        </div>
      </div>
    </div>
  );
}