import React, { useState } from "react";
import {
  Rocket, Globe2, MessageSquare, Radio,
  Layers, Zap, Users, Star, ChevronRight, Clock, Download, AlertCircle
} from "lucide-react";
import ConstellationBackground from "./ConstellationBackground";
import { useCommsTheme } from "@/components/contexts/CommsThemeContext";

const LAYERS = [
  {
    badge: "Layer 0",
    icon: Clock,
    color: "#e07b54",
    title: "Mission Rooms",
    subtitle: "Time-Bound Activation",
    desc: "Temporary, structured spaces organized around a specific event or moment. Teams go Forming → Performing in 48 hours.",
    examples: ["SpaceX launch analysis", "Senate ITAR debate", "Farnborough Airshow"],
  },
  {
    badge: "Layer 1",
    icon: Globe2,
    color: "#4a90b8",
    title: "Domain Networks",
    subtitle: "Expertise-Based Peer Groups",
    desc: "Persistent peer groups across 8 disciplines — Space, Aviation, Engineering, Policy, and more. Each domain has a champion.",
    examples: ["Space", "Aviation", "Policy", "Academia"],
  },
  {
    badge: "Layer 2",
    icon: MessageSquare,
    color: "#c9a87c",
    title: "Direct Messaging",
    subtitle: "1:1 with Persistent Memory",
    desc: "Relationships don't evaporate. Every conversation is preserved and searchable. Relationship timelines. Mutual connections surfaced.",
    examples: ["Persistent threads", "Relationship timeline", "Quick actions"],
  },
  {
    badge: "Layer 3",
    icon: Radio,
    color: "#8b5cf6",
    title: "Community Feed",
    subtitle: "Reputation-Weighted Signals",
    desc: "Institutional moments, performance narratives, authority pieces. Ranked by reputation tier and engagement — not algorithms.",
    examples: ["Institutional moments", "Domain spotlights", "Calls to action"],
  },
];

const FRAMEWORKS = [
  {
    icon: Layers,
    color: "#4a90b8",
    title: "Dunbar's Number",
    tagline: "Nested Trust Layers",
    blurb: "Trust scales through concentric layers. Each layer certifies the one below it.",
  },
  {
    icon: Zap,
    color: "#e07b54",
    title: "Rapid Response",
    tagline: "Triggered Activation",
    blurb: "Pre-positioned response cells activate on trigger events. Peer analysis surfaces within hours.",
  },
  {
    icon: Star,
    color: "#c9a87c",
    title: "Super Communicators",
    tagline: "Peer-Driven Leadership",
    blurb: "Domain champions and peer mentors operate at institutional quality as the platform scales.",
  },
  {
    icon: Users,
    color: "#10b981",
    title: "Tuckman's Lifecycle",
    tagline: "Bounded Team Maturity",
    blurb: "Every Mission Room applies Tuckman deliberately. Communities are self-moderating.",
  },
];

export default function NoConversationPlaceholder() {
  const { theme } = useCommsTheme();
  const [activeLayer, setActiveLayer] = useState(0);
  const layer = LAYERS[activeLayer];

  return (
    <div
      className="relative flex-1 flex flex-col h-full overflow-y-auto"
      style={{ background: theme.bg }}
    >
      {theme.constellations && <ConstellationBackground />}

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(201,168,124,0.07) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-10">

        {/* ── Hero ── */}
        <div className="flex flex-col items-center text-center gap-4">
          {/* Logos */}
          <div className="flex items-center justify-center gap-6 mb-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/a2c16e1a2_Gemini_Generated_Image_chl0uochl0uochl0-removebg-preview.png"
              alt="TOP 100 Rapid Response Network & Framework"
              className="h-20 object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Comms is Our Rapid Response Network
          </h1>
          <p className="text-sm text-white/50 max-w-sm leading-relaxed">
            A relationship infrastructure for the aerospace community — where the best ideas surface faster,
            the best people find each other, and the best collaborations emerge naturally.
          </p>

          {/* Roadmap badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/25 bg-amber-400/12 mt-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300/80">Under Construction · Work in Progress · Prototype</span>
          </div>
        </div>

        {/* ── Communication Layers ── */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Communication Layers</p>

          {/* Layer tab strip */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {LAYERS.map((l, i) => (
              <button
                key={l.badge}
                onClick={() => setActiveLayer(i)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                style={{
                  background: activeLayer === i ? `${l.color}22` : "rgba(255,255,255,0.04)",
                  borderColor: activeLayer === i ? `${l.color}60` : "rgba(255,255,255,0.08)",
                  color: activeLayer === i ? l.color : "rgba(255,255,255,0.45)",
                }}
                aria-pressed={activeLayer === i}
              >
                {l.badge}
              </button>
            ))}
          </div>

          {/* Active layer card */}
          <div
            className="rounded-2xl p-5 border transition-all duration-300"
            style={{ background: `${layer.color}10`, borderColor: `${layer.color}30` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${layer.color}20`, border: `1px solid ${layer.color}40` }}>
                <layer.icon className="w-5 h-5" style={{ color: layer.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-base font-bold text-white">{layer.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${layer.color}20`, color: layer.color }}>
                    {layer.subtitle}
                  </span>
                </div>
                <p className="text-sm text-white/55 leading-relaxed mb-3">{layer.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {layer.examples.map(ex => (
                    <span key={ex} className="text-[11px] px-2 py-0.5 rounded border text-white/40"
                      style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Four Frameworks ── */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Four Unified Frameworks</p>
          <div className="grid grid-cols-2 gap-3">
            {FRAMEWORKS.map(({ icon: Icon, color, title, tagline, blurb }) => (
              <div
                key={title}
                className="rounded-xl p-4 border flex flex-col gap-2.5"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}20` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{title}</p>
                    <p className="text-[10px] font-medium" style={{ color }}>{tagline}</p>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{blurb}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Get Started CTA ── */}
        <section
          className="rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: "rgba(201,168,124,0.06)", borderColor: "rgba(201,168,124,0.2)" }}
        >
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-200 mb-0.5">Select a channel to get started</p>
            <p className="text-xs text-white/40 leading-relaxed">
              Pick a Domain Network, open a DM, or join a Mission Room from the sidebar to begin.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300 shrink-0">
            <ChevronRight className="w-4 h-4" />
            <ChevronRight className="w-4 h-4 -ml-2.5 opacity-50" />
          </div>
        </section>

        {/* ── Download Whitepaper ── */}
        <section
          className="rounded-2xl p-5 border flex flex-col gap-2"
          style={{ background: "rgba(74,144,184,0.06)", borderColor: "rgba(74,144,184,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300/70">Learn More</span>
          </div>
          <a
            href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/23d4ee06e_TOP100_Messaging_Platform_Whitepaper_20260314docx.pdf"
            download
            className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <span className="text-sm font-semibold">Download Whitepaper</span>
            <Download className="w-4 h-4" />
          </a>
          <p className="text-[11px] text-white/30">
            Full architecture, frameworks, and implementation roadmap (v1.0 · March 2026)
          </p>
        </section>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/20 pb-2">
          TOP 100 OS · Messaging & Networking Platform Architecture · v1.0 · March 2026
        </p>

      </div>
    </div>
  );
}