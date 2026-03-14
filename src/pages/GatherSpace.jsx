import React from "react";
import { Video, Users, Mic, Camera, MessageSquare, MapPin, ExternalLink, Sparkles, Monitor, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const FEATURES = [
  {
    icon: Users,
    title: "Virtual Networking",
    description: "Walk up to other members and start video chats naturally, just like at an in-person event.",
  },
  {
    icon: MapPin,
    title: "Custom Spaces",
    description: "Explore themed areas including lounge zones, meeting rooms, and presentation stages.",
  },
  {
    icon: MessageSquare,
    title: "Proximity Chat",
    description: "Audio fades in/out based on distance—have private conversations by moving away from groups.",
  },
  {
    icon: Camera,
    title: "Video & Audio",
    description: "Toggle your camera and mic as you navigate. Perfect for casual or professional interactions.",
  },
];

const TIPS = [
  "Use arrow keys or WASD to move your avatar around the space",
  "Press 'X' to dance and express yourself!",
  "Find quiet corners for private 1-on-1 conversations",
  "Look for the presentation stages during scheduled events",
  "Your video/audio auto-connects when you're near others",
];

export default function GatherSpace() {
  const gatherUrl = "https://app.gather.town/app/pB7J4ODzyrYsXeSN/Pineapple%20EMPIRE%20Lobby";

  return (
    <div className="h-full overflow-auto" style={{ background: brandColors.cream }}>
      {/* Beta Construction Banner */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #fbbf24 10px, #fbbf24 20px)',
        }}
      >
        <div className="bg-black/80 py-3 px-4">
          <div className="flex items-center justify-center gap-3 flex-wrap text-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm uppercase tracking-wide">Beta</span>
            </div>
            <span className="text-white text-sm">
              This feature is under active development
            </span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
              <Monitor className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-medium">Desktop recommended for best experience</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div 
        className="relative overflow-hidden py-16 px-6"
        style={{ 
          background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #2d4a6a 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white/90 text-sm font-medium">Virtual Community Space</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to the TOP 100 Gather Space
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Connect with fellow aerospace & aviation leaders in our interactive virtual environment. 
            Network, collaborate, and build relationships—all from your browser.
          </p>
          
          <Button
            size="lg"
            className="gap-2 text-lg px-8 py-6"
            style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
            onClick={() => window.open(gatherUrl, '_blank')}
          >
            <Video className="w-5 h-5" />
            Enter Gather Space
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12" style={{ color: brandColors.navyDeep }}>
          What You Can Do in Gather
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white shadow-sm border"
              style={{ borderColor: `${brandColors.navyDeep}10` }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${brandColors.skyBlue}20` }}
              >
                <feature.icon className="w-6 h-6" style={{ color: brandColors.skyBlue }} />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: brandColors.navyDeep }}>
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div 
          className="rounded-2xl p-8"
          style={{ background: `${brandColors.navyDeep}08` }}
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <Mic className="w-5 h-5" />
            Quick Tips for Gather
          </h2>
          
          <ul className="space-y-3">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: brandColors.goldPrestige, color: 'white' }}
                >
                  {i + 1}
                </span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-16 text-center">
        <p className="text-gray-600 mb-4">
          Ready to connect with the TOP 100 community?
        </p>
        <Button
          size="lg"
          className="gap-2"
          style={{ background: brandColors.navyDeep }}
          onClick={() => window.open(gatherUrl, '_blank')}
        >
          <Video className="w-5 h-5" />
          Launch Gather Space
        </Button>
      </div>
    </div>
  );
}