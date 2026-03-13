import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plane, Target, Trophy, Star, Volume2, VolumeX, Zap, Rocket, Radio, Globe, Layout, Briefcase, Sparkles, Box, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameProvider, useGame } from '@/components/epics/03-mission-rooms/games/GameContext';
import { RunwayToOrbit } from '@/components/epics/03-mission-rooms/games';
import FounderDashboard from './FounderDashboard';
import InvestorDashboard from './InvestorDashboard';
import EmployerDashboard from './EmployerDashboard';
import ProviderDashboard from './ProviderDashboard';

import { Season3ReOnboarding } from '@/components/capabilities/onboarding';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

import { useProfileResolution } from '@/hooks/useProfileResolution';

function MissionControlContent() {
  const { user, player, artifacts, badges, loading } = useGame();
  const { data: profiles } = useProfileResolution(user?.id, user?.email);
  const [showRunway, setShowRunway] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showReOnboarding, setShowReOnboarding] = useState(false);
  const [activeModule, setActiveModule] = useState(() => new URLSearchParams(window.location.search).get('module') || 'launchpad');

  // Generate pixel art style particles
  useEffect(() => {
    const icons = ['🚀', '🛸', '🌍', '🌙', '⭐', '💫', '🛰️', '☄️', '🪐'];
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      icon: icons[Math.floor(Math.random() * icons.length)],
      size: Math.random() * 20 + 20,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);



  const [lockedGameId, setLockedGameId] = useState(null);

  const games = [
    {
      id: 'season3',
      title: 'TOP 100 WOMEN SEASON 3',
      subtitle: 'COMMUNITY',
      description: 'VOTE • NOMINATE • CELEBRATE',
      icon: Star,
      page: user ? 'Home' : 'Landing',
      color: brandColors.goldPrestige,
      locked: false,
    },
    {
      id: 'talentexchange',
      title: 'TALENT EXCHANGE',
      subtitle: 'CAREERS',
      description: 'JOBS • TALENT • OPPORTUNITIES',
      icon: Briefcase,
      page: 'TalentExchangeLanding',
      color: brandColors.skyBlue,
      locked: true,
    },
    {
      id: 'hangar',
      title: 'RESEARCH MISSIONS',
      subtitle: '1 PLAYER',
      description: 'EXPLORE • COLLECT • PRESTIGE',
      icon: Box,
      page: 'TheHangar',
      color: brandColors.goldPrestige,
      locked: true,
    },
    {
      id: 'raisingjupiter',
      title: 'RAISING JUPITER',
      subtitle: 'STARTUP ACCELERATOR',
      description: 'FOUNDERS • INVESTORS • DEMO DAY',
      icon: Rocket,
      page: 'RaisingJupiter',
      color: brandColors.goldPrestige,
      locked: true,
    },
    {
      id: 'radar',
      title: 'RADAR INTELLIGENCE',
      subtitle: 'INNOVATION SIGNALS',
      description: 'PATENTS • RESEARCH • INSIGHTS',
      icon: Radio,
      page: 'RadarIntelligence',
      color: brandColors.skyBlue,
      locked: false,
    },
    {
      id: 'signalfeed',
      title: 'SIGNAL FEED',
      subtitle: 'COMMUNITY',
      description: 'NOMINATIONS • RESEARCH • NEWS',
      icon: Globe,
      page: 'SignalFeed',
      color: brandColors.goldPrestige,
      locked: false,
    },
  ];

  if (loading || showRunway) {
    return <RunwayToOrbit onComplete={() => setShowRunway(false)} />;
  }

  const handleReOnboardingComplete = () => {
    setShowReOnboarding(false);
  };

  const handleReOnboardingSkip = () => {
    setShowReOnboarding(false);
  };

  // Dynamic sky based on local time
  const hour = new Date().getHours();
  const isDawn = hour >= 5 && hour < 8;
  const isDay = hour >= 8 && hour < 17;
  const isDusk = hour >= 17 && hour < 20;
  const isNight = hour >= 20 || hour < 5;

  const skyGradient = isDawn
    ? `linear-gradient(135deg, #4a2a4a 0%, #7a4a5a 100%)`
    : isDay
      ? `linear-gradient(135deg, ${brandColors.skyBlue} 0%, ${brandColors.navyDeep} 100%)`
      : isDusk
        ? `linear-gradient(135deg, #5a2a4a 0%, #aa5a3a 100%)`
        : `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0a1525 100%)`;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{
      background: skyGradient
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Inter:wght@300;400;500;600;700&display=swap');
        .mission-control-title {
          font-family: 'Fira Code', monospace;
          text-shadow: 0 0 20px rgba(255,255,255,0.3);
        }
        .technical-text {
          font-family: 'Fira Code', monospace;
        }
        .sf-pro {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* Subtle mesh gradient overlay - REDUCED GLARE */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${brandColors.skyBlue}10, transparent 60%),
                       radial-gradient(circle at 80% 70%, ${brandColors.goldPrestige}10, transparent 60%)`,
        }}
      />

      {/* Dynamic Atmospheric Lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sunbeams / Light rays */}
        {(isDawn || isDusk) && (
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${20 + i * 15}%`,
                  width: '2px',
                  background: `linear-gradient(180deg, ${isDawn ? 'rgba(255,170,136,0.3)' : 'rgba(255,119,68,0.3)'} 0%, transparent 60%)`,
                  transformOrigin: 'top',
                  transform: `rotate(${-15 + i * 8}deg)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </div>
        )}

        {/* Ambient glow orbs */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            top: isDay ? '10%' : isDusk ? '20%' : '5%',
            left: isDay ? '60%' : isDusk ? '80%' : '20%',
            width: '400px',
            height: '400px',
            background: isDay
              ? 'radial-gradient(circle, rgba(255,230,100,0.15) 0%, transparent 70%)'
              : isDusk
                ? 'radial-gradient(circle, rgba(255,120,68,0.2) 0%, transparent 70%)'
                : isDawn
                  ? 'radial-gradient(circle, rgba(255,160,122,0.15) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(100,130,180,0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Stars at night */}
        {isNight && (
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${Math.random() * 60}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Atmospheric haze */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{
            background: isDawn
              ? 'linear-gradient(0deg, rgba(255,170,136,0.1) 0%, transparent 100%)'
              : isDay
                ? 'linear-gradient(0deg, rgba(135,206,235,0.05) 0%, transparent 100%)'
                : isDusk
                  ? 'linear-gradient(0deg, rgba(255,127,80,0.15) 0%, transparent 100%)'
                  : 'linear-gradient(0deg, rgba(30,58,90,0.2) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Seven-Layer Parallax Cityscape + Iconic Landmarks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Layer 1: Distant Mountains */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-48 opacity-20"
          style={{
            background: `linear-gradient(to top, ${brandColors.navyDeep}40, transparent)`,
            clipPath: 'polygon(0 100%, 15% 30%, 25% 45%, 40% 20%, 60% 40%, 75% 25%, 90% 50%, 100% 35%, 100% 100%)',
          }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Layer 2: Mid Mountains */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-40 opacity-25"
          style={{
            background: `linear-gradient(to top, ${brandColors.skyBlue}30, transparent)`,
            clipPath: 'polygon(0 100%, 10% 40%, 30% 20%, 50% 35%, 70% 15%, 85% 45%, 100% 30%, 100% 100%)',
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Layer 3: Distant Buildings */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-32 opacity-30"
          style={{
            background: `linear-gradient(to top, ${brandColors.goldPrestige}20, transparent)`,
          }}
          animate={{ x: ['0%', '-2%', '0%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${i * 5}%`,
                width: `${2 + Math.random() * 3}%`,
                height: `${40 + Math.random() * 60}%`,
                background: brandColors.navyDeep,
                opacity: 0.3,
              }}
            />
          ))}
        </motion.div>

        {/* Layer 4: Golden Gate Bridge - Left Side */}
        <motion.div
          className="absolute left-0 bottom-0 opacity-35"
          style={{ transformOrigin: 'center bottom' }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="300" height="180" viewBox="0 0 300 180" fill="none">
            <rect x="50" y="40" width="15" height="140" fill="url(#tower-gradient)" />
            <rect x="235" y="40" width="15" height="140" fill="url(#tower-gradient)" />
            <path d="M 50 60 Q 150 100 250 60" stroke={brandColors.goldPrestige} strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 50 70 Q 150 110 250 70" stroke={brandColors.goldPrestige} strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 50 80 Q 150 120 250 80" stroke={brandColors.goldPrestige} strokeWidth="2" fill="none" opacity="0.6" />
            <rect x="0" y="140" width="300" height="8" fill={brandColors.goldPrestige} opacity="0.5" />
            <defs>
              <linearGradient id="tower-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={brandColors.goldPrestige} stopOpacity="0.8" />
                <stop offset="100%" stopColor={brandColors.goldPrestige} stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Layer 5: Mid-Ground Buildings */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-40 opacity-40"
          animate={{ x: ['0%', '-5%', '0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${i * 7}%`,
                width: `${3 + Math.random() * 4}%`,
                height: `${50 + Math.random() * 50}%`,
                background: brandColors.navyDeep,
                opacity: 0.5,
              }}
            >
              {/* Windows */}
              {[...Array(Math.floor(Math.random() * 5))].map((_, j) => (
                <div
                  key={j}
                  className="absolute"
                  style={{
                    left: '20%',
                    top: `${20 + j * 15}%`,
                    width: '60%',
                    height: '8%',
                    background: isNight ? brandColors.goldPrestige : 'transparent',
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          ))}
        </motion.div>

        {/* Layer 6a: Eiffel Tower - Center */}
        <motion.div
          className="absolute bottom-0 opacity-40"
          style={{
            left: '40%',
            transformOrigin: 'center bottom'
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="120" height="320" viewBox="0 0 120 320" fill="none">
            {/* Base platform */}
            <rect x="0" y="280" width="120" height="8" fill={brandColors.goldPrestige} opacity="0.5" />
            {/* Tower legs forming triangle */}
            <path d="M 20 280 L 45 100 L 50 60 L 55 100 L 80 280" stroke={brandColors.goldPrestige} strokeWidth="4" fill="none" opacity="0.6" />
            <path d="M 40 280 L 50 100 L 55 60 L 60 100 L 100 280" stroke={brandColors.goldPrestige} strokeWidth="4" fill="none" opacity="0.6" />
            {/* Cross beams */}
            <line x1="25" y1="220" x2="95" y2="220" stroke={brandColors.goldPrestige} strokeWidth="2" opacity="0.5" />
            <line x1="30" y1="180" x2="90" y2="180" stroke={brandColors.goldPrestige} strokeWidth="2" opacity="0.5" />
            <line x1="35" y1="140" x2="85" y2="140" stroke={brandColors.goldPrestige} strokeWidth="2" opacity="0.5" />
            <line x1="42" y1="100" x2="78" y2="100" stroke={brandColors.goldPrestige} strokeWidth="2" opacity="0.5" />
            {/* Top section */}
            <path d="M 48 80 L 52 50 L 56 50 L 60 80" stroke={brandColors.goldPrestige} strokeWidth="3" fill="none" opacity="0.7" />
            <rect x="50" y="30" width="8" height="20" fill={brandColors.goldPrestige} opacity="0.6" />
            {/* Antenna */}
            <line x1="54" y1="30" x2="54" y2="10" stroke={brandColors.goldPrestige} strokeWidth="2" opacity="0.8" />
            <circle cx="54" cy="10" r="3" fill={brandColors.goldPrestige} opacity="0.9" />
          </svg>
        </motion.div>

        {/* Layer 6b: Empire State Building - Left Center */}
        <motion.div
          className="absolute bottom-0 opacity-42"
          style={{
            left: '25%',
            transformOrigin: 'center bottom'
          }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="100" height="300" viewBox="0 0 100 300" fill="none">
            {/* Base */}
            <rect x="15" y="250" width="70" height="50" fill={brandColors.navyDeep} opacity="0.7" />
            {/* Mid section */}
            <rect x="20" y="200" width="60" height="50" fill={brandColors.navyDeep} opacity="0.75" />
            {/* Upper section */}
            <rect x="25" y="150" width="50" height="50" fill={brandColors.navyDeep} opacity="0.8" />
            {/* Art Deco tiers */}
            <rect x="30" y="130" width="40" height="20" fill={brandColors.navyDeep} opacity="0.85" />
            <rect x="35" y="110" width="30" height="20" fill={brandColors.navyDeep} opacity="0.9" />
            <rect x="40" y="90" width="20" height="20" fill={brandColors.navyDeep} opacity="0.95" />
            {/* Spire */}
            <rect x="45" y="50" width="10" height="40" fill={brandColors.goldPrestige} opacity="0.7" />
            <path d="M 45 50 L 50 20 L 55 50" fill={brandColors.goldPrestige} opacity="0.8" />
            {/* Top antenna */}
            <line x1="50" y1="20" x2="50" y2="10" stroke={brandColors.goldPrestige} strokeWidth="2" opacity="0.9" />
            {/* Windows - scattered pattern */}
            {[...Array(8)].map((_, i) => (
              <rect
                key={`win-${i}`}
                x={25 + (i % 3) * 15}
                y={160 + Math.floor(i / 3) * 25}
                width="8"
                height="6"
                fill={isNight ? brandColors.goldPrestige : 'rgba(0,0,0,0.2)'}
                opacity="0.6"
              />
            ))}
          </svg>
        </motion.div>

        {/* Layer 6c: Space Needle - Right Side */}
        <motion.div
          className="absolute right-0 bottom-0 opacity-45"
          style={{ transformOrigin: 'center bottom' }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="150" height="280" viewBox="0 0 150 280" fill="none">
            <rect x="60" y="240" width="30" height="40" fill={brandColors.skyBlue} opacity="0.5" />
            <line x1="70" y1="240" x2="65" y2="120" stroke={brandColors.skyBlue} strokeWidth="3" opacity="0.6" />
            <line x1="80" y1="240" x2="75" y2="120" stroke={brandColors.skyBlue} strokeWidth="3" opacity="0.6" />
            <ellipse cx="75" cy="100" rx="45" ry="15" fill={brandColors.skyBlue} opacity="0.7" />
            <rect x="30" y="90" width="90" height="20" fill={brandColors.skyBlue} opacity="0.6" />
            <ellipse cx="75" cy="90" rx="45" ry="15" fill={brandColors.skyBlue} opacity="0.8" />
            <line x1="70" y1="90" x2="73" y2="40" stroke={brandColors.skyBlue} strokeWidth="2" opacity="0.7" />
            <line x1="80" y1="90" x2="77" y2="40" stroke={brandColors.skyBlue} strokeWidth="2" opacity="0.7" />
            <ellipse cx="75" cy="40" rx="20" ry="8" fill={brandColors.goldPrestige} opacity="0.7" />
            <line x1="75" y1="40" x2="75" y2="10" stroke={brandColors.goldPrestige} strokeWidth="2" opacity="0.8" />
            <circle cx="75" cy="10" r="3" fill={brandColors.goldPrestige} opacity="0.9" />
          </svg>
        </motion.div>

        {/* Layer 6d: Statue of Liberty - Right Center */}
        <motion.div
          className="absolute bottom-0 opacity-43"
          style={{
            right: '25%',
            transformOrigin: 'center bottom'
          }}
          animate={{ y: [0, -11, 0] }}
          transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="140" height="320" viewBox="0 0 140 320" fill="none">
            {/* Pedestal base */}
            <rect x="30" y="260" width="80" height="60" fill={brandColors.navyDeep} opacity="0.5" />
            <rect x="35" y="240" width="70" height="20" fill={brandColors.navyDeep} opacity="0.55" />

            {/* Statue body - robe */}
            <path d="M 50 240 L 55 180 L 60 200 L 65 180 L 70 240 Z" fill={brandColors.goldPrestige} opacity="0.6" />
            <path d="M 55 180 L 60 140 L 65 180" fill={brandColors.goldPrestige} opacity="0.65" />

            {/* Torch arm raised */}
            <path d="M 60 160 L 50 120 L 52 118" stroke={brandColors.goldPrestige} strokeWidth="3" fill="none" opacity="0.7" />
            {/* Torch flame */}
            <path d="M 48 118 L 50 105 L 52 118 Z" fill={brandColors.goldPrestige} opacity="0.85" />
            <circle cx="50" cy="105" r="5" fill={brandColors.goldPrestige} opacity="0.9" />

            {/* Tablet arm */}
            <path d="M 60 180 L 72 190 L 72 200 L 68 200 L 68 190" fill={brandColors.skyBlue} opacity="0.6" />

            {/* Head and crown */}
            <circle cx="60" cy="130" r="10" fill={brandColors.goldPrestige} opacity="0.7" />
            {/* Crown spikes */}
            <path d="M 50 125 L 52 110 L 54 125 M 56 123 L 58 108 L 60 123 M 60 123 L 62 108 L 64 123 M 64 125 L 66 110 L 68 125 M 68 127 L 70 112 L 72 127"
              stroke={brandColors.goldPrestige} strokeWidth="2" fill="none" opacity="0.8" />
          </svg>
        </motion.div>

        {/* Layer 7: Foreground Buildings */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-48 opacity-50"
          animate={{ x: ['0%', '-8%', '0%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        >
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${i * 10}%`,
                width: `${4 + Math.random() * 6}%`,
                height: `${60 + Math.random() * 40}%`,
                background: brandColors.navyDeep,
                opacity: 0.7,
              }}
            >
              {/* Windows */}
              {[...Array(Math.floor(Math.random() * 8))].map((_, j) => (
                <div
                  key={j}
                  className="absolute"
                  style={{
                    left: '25%',
                    top: `${10 + j * 10}%`,
                    width: '50%',
                    height: '6%',
                    background: isNight ? brandColors.goldPrestige : 'rgba(0,0,0,0.3)',
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none">

        {/* Module Switcher Tabs - only show if user has additional profiles */}
        {profiles && (profiles.startup || profiles.investor || profiles.employer || profiles.provider) && (
          <div className="flex-shrink-0 flex justify-center gap-3 pt-28 pb-4 px-4 sticky top-0 z-30 pointer-events-auto">
            <button
              onClick={() => setActiveModule("launchpad")}
              className={`px-5 py-2 rounded-full text-xs font-bold technical-text uppercase tracking-widest backdrop-blur-xl transition-all duration-300 ${activeModule === "launchpad"
                  ? "bg-white/20 text-white border border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-105"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                }`}
            >
              Launchpad
            </button>
            {profiles?.startup && (
              <button
                onClick={() => setActiveModule("founder")}
                className={`px-5 py-2 rounded-full text-xs font-bold technical-text uppercase tracking-widest backdrop-blur-xl transition-all duration-300 ${activeModule === "founder"
                    ? "bg-white/20 text-white border border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-105"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                  }`}
              >
                Founder
              </button>
            )}
            {profiles?.investor && (
              <button
                onClick={() => setActiveModule("investor")}
                className={`px-5 py-2 rounded-full text-xs font-bold technical-text uppercase tracking-widest backdrop-blur-xl transition-all duration-300 ${activeModule === "investor"
                    ? "bg-white/20 text-white border border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-105"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                  }`}
              >
                Investor
              </button>
            )}
            {profiles?.employer && (
              <button
                onClick={() => setActiveModule("employer")}
                className={`px-5 py-2 rounded-full text-xs font-bold technical-text uppercase tracking-widest backdrop-blur-xl transition-all duration-300 ${activeModule === "employer"
                    ? "bg-white/20 text-white border border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-105"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                  }`}
              >
                Recruitment
              </button>
            )}
            {profiles?.provider && (
              <button
                onClick={() => setActiveModule("provider")}
                className={`px-5 py-2 rounded-full text-xs font-bold technical-text uppercase tracking-widest backdrop-blur-xl transition-all duration-300 ${activeModule === "provider"
                    ? "bg-white/20 text-white border border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-105"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                  }`}
              >
                Provider
              </button>
            )}
          </div>
        )}

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto relative z-10 w-full h-full pointer-events-auto">
          {activeModule === "launchpad" && (
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-12 md:p-8">
              {/* Logo + Title */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-6 md:mb-8"
              >
                <div className="mb-4 flex justify-center">
                  <div className="relative" style={{ width: 'min(40vw, 16rem)', height: 'min(40vw, 16rem)', maxWidth: '16rem', maxHeight: '16rem' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/825e4ae2c_TOP100AerospaceAviationlogo.png"
                      alt="TOP 100 Aerospace & Aviation"
                      className="relative w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h1 className="font-bold text-white mb-2 mission-control-title uppercase tracking-tighter" style={{
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                }}>
                  Mission Control
                </h1>
              </motion.div>

              {/* Game Cards - 2x2 Grid */}
              <div className="grid grid-cols-2 w-full px-4" style={{ gap: 'clamp(0.75rem, 2vw, 1rem)', maxWidth: 'min(90vw, 48rem)' }}>
                {games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {game.locked ? (
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setLockedGameId(game.id)}
                        className="relative rounded-[2rem] backdrop-blur-3xl border border-white/10 overflow-hidden cursor-pointer group"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                          touchAction: 'manipulation',
                        }}
                      >
                        {/* Hover Gradient Glow */}
                        <div
                          className="absolute inset-x-0 bottom-0 h-1/2 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl pointer-events-none"
                          style={{ background: `radial-gradient(circle at center, ${game.color}, transparent 70%)` }}
                        />

                        {/* Subtle pattern overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                        {/* Lock Badge */}
                        <div
                          className="absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-xl border border-white/20 bg-white/5 text-white/40"
                        >
                          <Shield className="w-3 h-3" />
                        </div>

                        <div className="relative flex flex-col items-center justify-center p-8 h-full min-h-[220px] text-center" style={{ gap: '1rem' }}>
                          {/* SVG Icon */}
                          <div className="relative group-hover:scale-110 transition-transform duration-500">
                            <div className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: game.color }} />
                            <game.icon className="w-12 h-12 text-white/20 transition-colors" strokeWidth={1.5} />
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-bold text-white/40 text-xs tracking-[0.2em] technical-text uppercase">
                              {game.title}
                            </h3>
                            <p className="text-white/20 text-[10px] technical-text uppercase tracking-widest leading-relaxed">
                              {game.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <Link to={createPageUrl(game.page)} className="block">
                        <motion.div
                          whileHover={{ scale: 1.02, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative rounded-[2rem] backdrop-blur-3xl border border-white/20 overflow-hidden cursor-pointer group"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                            touchAction: 'manipulation',
                          }}
                        >
                          {/* Hover Gradient Glow */}
                          <div
                            className="absolute inset-x-0 bottom-0 h-1/2 opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-2xl pointer-events-none"
                            style={{ background: `radial-gradient(circle at center, ${game.color}, transparent 70%)` }}
                          />

                          {/* Animated Shimmer */}
                          <motion.div
                            className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                            animate={{ x: ['-100%', '300%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          />

                          <div className="relative flex flex-col items-center justify-center p-8 h-full min-h-[220px] text-center" style={{ gap: '1rem' }}>
                            {/* SVG Icon */}
                            <div className="relative group-hover:scale-110 transition-transform duration-500">
                              <div className="absolute inset-0 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity" style={{ background: game.color }} />
                              <game.icon className="w-12 h-12 text-white relative z-10" strokeWidth={1.5} />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-2">
                                <h3 className="font-bold text-white text-xs tracking-[0.2em] technical-text uppercase">
                                  {game.title}
                                </h3>
                                <ChevronRight className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition-transform" />
                              </div>
                              <p className="text-white/60 text-[10px] technical-text uppercase tracking-widest leading-relaxed">
                                {game.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Audio Toggle - Apple Style */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setIsMuted(!isMuted)}
                className="fixed z-20 rounded-full backdrop-blur-2xl border border-white/20 flex items-center justify-center"
                style={{
                  bottom: 'clamp(1rem, 3vh, 1.5rem)',
                  right: 'clamp(1rem, 3vw, 1.5rem)',
                  width: 'clamp(2.5rem, 8vw, 3rem)',
                  height: 'clamp(2.5rem, 8vw, 3rem)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  touchAction: 'manipulation',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? (
                  <VolumeX style={{ width: 'clamp(1rem, 3vw, 1.25rem)', height: 'clamp(1rem, 3vw, 1.25rem)' }} className="text-white/70" />
                ) : (
                  <Volume2 style={{ width: 'clamp(1rem, 3vw, 1.25rem)', height: 'clamp(1rem, 3vw, 1.25rem)' }} className="text-white/70" />
                )}
              </motion.button>

              {/* Coming Soon Badge & Welcome Back Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="px-4 flex flex-col items-center gap-3"
                style={{ marginTop: 'clamp(1rem, 3vh, 1.5rem)', marginBottom: 'clamp(4rem, 10vh, 6rem)' }}
              >
                <div
                  className="rounded-full backdrop-blur-2xl border border-white/20 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                  }}
                >
                  <p className="text-white/60" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                    <span className="text-white/80">✨</span> More missions coming soon
                  </p>
                </div>

                <button
                  onClick={() => setShowReOnboarding(true)}
                  className="rounded-full backdrop-blur-2xl border border-white/20 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  }}
                >
                  Welcome Back 👋
                </button>
              </motion.div>

              {/* Re-Onboarding Modal */}
              <AnimatePresence>
                {showReOnboarding && (
                  <Season3ReOnboarding
                    onComplete={handleReOnboardingComplete}
                    onSkip={handleReOnboardingSkip}
                  />
                )}
              </AnimatePresence>

              {/* Coming Soon Modal */}
              <AnimatePresence>
                {lockedGameId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0, 0, 0, 0.8)' }}
                    onClick={() => setLockedGameId(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-3xl backdrop-blur-2xl border border-white/20 p-8 text-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        maxWidth: 'min(90vw, 24rem)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-2xl font-bold text-white mb-3" style={{
                        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                      }}>
                        Coming Soon
                      </h3>
                      <p className="text-white/70 mb-6" style={{
                        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif"
                      }}>
                        {games.find(g => g.id === lockedGameId)?.title} is launching soon. Stay tuned!
                      </p>
                      <button
                        onClick={() => setLockedGameId(null)}
                        className="px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
                        style={{
                          background: brandColors.goldPrestige,
                          color: 'white',
                          fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif"
                        }}
                      >
                        Got it
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeModule === "founder" && <div className="min-h-full bg-white dark:bg-[#0c1929]"><FounderDashboard /></div>}
          {activeModule === "investor" && <div className="min-h-full bg-white dark:bg-[#0c1929]"><InvestorDashboard /></div>}
          {activeModule === "employer" && <div className="min-h-full bg-white dark:bg-[#0c1929]"><EmployerDashboard /></div>}
          {activeModule === "provider" && <div className="min-h-full bg-white dark:bg-[#0c1929]"><ProviderDashboard /></div>}

        </div>
      </div>
    </div>
  );
}

export default function MissionControl() {
  return (
    <GameProvider>
      <MissionControlContent />
    </GameProvider>
  );
}