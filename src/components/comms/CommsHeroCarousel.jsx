import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Dot } from "lucide-react";
import ConstellationBackground from "./ConstellationBackground";
import { useCommsTheme } from "@/components/contexts/CommsThemeContext";

const SLIDES = [
  {
    badge: "Layer 0",
    icon: "🎯",
    color: "#e07b54",
    title: "Mission Rooms",
    subtitle: "Time-Bound Activation",
    desc: "Temporary, structured spaces for rapid response around specific events.",
    examples: ["SpaceX launches", "Senate debates", "Airshows"],
  },
  {
    badge: "Layer 1",
    icon: "🌐",
    color: "#4a90b8",
    title: "Domain Networks",
    subtitle: "Expertise-Based Peer Groups",
    desc: "Persistent peer groups across 8 disciplines with dedicated domain champions.",
    examples: ["Space", "Aviation", "Policy", "Academia"],
  },
  {
    badge: "Layer 2",
    icon: "💬",
    color: "#c9a87c",
    title: "Direct Messaging",
    subtitle: "1:1 with Persistent Memory",
    desc: "Conversations preserved and searchable with persistent relationship timelines.",
    examples: ["Persistent threads", "Relationship timeline", "Quick actions"],
  },
  {
    badge: "Layer 3",
    icon: "📻",
    color: "#8b5cf6",
    title: "Community Feed",
    subtitle: "Reputation-Weighted Signals",
    desc: "Institutional moments ranked by reputation and engagement, not algorithms.",
    examples: ["Institutional moments", "Domain spotlights", "CTAs"],
  },
];

export default function CommsHeroCarousel() {
  const { theme } = useCommsTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoplay]);

  const slide = SLIDES[activeIndex];

  const goToPrevious = () => {
    setAutoplay(false);
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToNext = () => {
    setAutoplay(false);
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const goToSlide = (index) => {
    setAutoplay(false);
    setActiveIndex(index);
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: theme.bg }}>
      {theme.constellations && <ConstellationBackground />}

      {/* Slides Container */}
      <div className="relative w-full h-full">
        {SLIDES.map((item, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
              }}
            />

            {/* Content - Mobile First */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-12 sm:px-8 md:px-12">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                {/* Icon */}
                <div className="text-6xl sm:text-7xl md:text-8xl">{item.icon}</div>

                {/* Badge */}
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
                  style={{ background: `${item.color}25`, color: item.color }}
                >
                  {item.badge}
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                    {item.title}
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold" style={{ color: item.color }}>
                    {item.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
                  {item.desc}
                </p>

                {/* Examples */}
                <div className="flex flex-wrap gap-2 justify-center pt-4">
                  {item.examples.map((ex) => (
                    <span
                      key={ex}
                      className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border"
                      style={{ borderColor: `${item.color}40`, background: `${item.color}12`, color: item.color }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation - Bottom centered */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 sm:gap-6">
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setTimeout(() => setAutoplay(true), 100)}
          className="p-2 sm:p-3 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Dot Indicators */}
        <div className="flex gap-2 sm:gap-3">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              onMouseEnter={() => setAutoplay(false)}
              onMouseLeave={() => setTimeout(() => setAutoplay(true), 100)}
              className={`transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-full ${
                idx === activeIndex
                  ? "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white"
                  : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === activeIndex ? "true" : "false"}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setTimeout(() => setAutoplay(true), 100)}
          className="p-2 sm:p-3 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Slide Counter - Top right */}
      <div className="absolute top-6 sm:top-8 md:top-10 right-6 sm:right-8 md:right-10 z-20 text-xs sm:text-sm font-semibold text-white/60">
        {activeIndex + 1} / {SLIDES.length}
      </div>
    </div>
  );
}