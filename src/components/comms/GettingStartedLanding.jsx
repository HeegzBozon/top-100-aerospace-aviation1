import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Rocket, BookOpen, Trophy, Users, ArrowRight, Cpu, Sparkles, Vote, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConversation } from "@/components/contexts/ConversationContext";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

const QUICK_START_STEPS = [
  { icon: Users, label: "Complete your profile", link: "Profile" },
  { icon: Trophy, label: "Nominate someone", link: "Nominations" },
  { icon: Vote, label: "Cast your votes", link: "VotingHub" },
  { icon: Award, label: "View standings", link: "Top100Women2025" },
];

const RESOURCES = [
  {
    icon: Cpu,
    title: "TOP 100 OS",
    description: "Learn how our scoring and ranking system works",
    link: "Top100OS",
    highlight: true
  },
  {
    icon: BookOpen,
    title: "How We Pick",
    description: "Understand our selection methodology",
    link: "HowWePick"
  },
  {
    icon: Sparkles,
    title: "Mission & Values",
    description: "Our purpose and guiding principles",
    link: "MissionVisionValues"
  },
];

export default function GettingStartedLanding() {
  const navigate = useNavigate();
  const { selectConversation } = useConversation();

  const handleNavigate = (page) => {
    // Clear active conversation so Layout renders the page instead of channel content
    selectConversation(null);
    navigate(createPageUrl(page));
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <div
        className="relative px-6 py-12 text-center"
        style={{
          background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})`,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <Rocket className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-white mb-3"
        >
          Welcome to TOP 100 Aerospace & Aviation
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 max-w-lg mx-auto"
        >
          Recognizing and celebrating the most influential women in aerospace and aviation
        </motion.p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Start Steps */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Quick Start
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_START_STEPS.map((step, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigate(step.link)}
                className="p-4 rounded-xl border bg-white hover:shadow-md transition-all text-center group cursor-pointer"
                style={{ borderColor: `${brandColors.navyDeep}10` }}
              >
                <div
                  className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: `${brandColors.goldPrestige}20` }}
                >
                  <step.icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                </div>
                <p className="text-xs font-medium" style={{ color: brandColors.navyDeep }}>
                  {step.label}
                </p>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Resources - TOP 100 OS Highlighted */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Learn How It Works
          </h2>
          <div className="space-y-3">
            {RESOURCES.map((resource, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigate(resource.link)}
                className={`w-full p-4 rounded-xl border bg-white hover:shadow-md transition-all flex items-center gap-4 group cursor-pointer text-left ${resource.highlight ? 'ring-2' : ''
                  }`}
                style={{
                  borderColor: resource.highlight ? brandColors.goldPrestige : `${brandColors.navyDeep}10`,
                  ringColor: resource.highlight ? `${brandColors.goldPrestige}40` : 'transparent'
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{
                    background: resource.highlight
                      ? `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`
                      : `${brandColors.skyBlue}15`
                  }}
                >
                  <resource.icon
                    className="w-6 h-6"
                    style={{ color: resource.highlight ? 'white' : brandColors.skyBlue }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>
                    {resource.title}
                    {resource.highlight && (
                      <span
                        className="ml-2 px-2 py-0.5 rounded text-xs"
                        style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
                      >
                        Recommended
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{resource.description}</p>
                </div>
                <ArrowRight
                  className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform"
                  style={{ color: brandColors.navyDeep + '60' }}
                />
              </button>
            ))}
          </div>
        </motion.section>

        {/* CTA to TOP 100 OS */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="p-6 rounded-2xl text-center"
            style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})` }}
          >
            <Cpu className="w-10 h-10 mx-auto mb-3 text-white/80" />
            <h3 className="text-lg font-bold text-white mb-2">
              Explore the TOP 100 Operating System
            </h3>
            <p className="text-white/70 text-sm mb-4 max-w-md mx-auto">
              Deep dive into our multi-layer scoring framework, voting mechanisms, and how we identify the most impactful leaders
            </p>
            <Button
              size="lg"
              onClick={() => handleNavigate('Top100OS')}
              style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
            >
              <Cpu className="w-4 h-4 mr-2" />
              View TOP 100 OS
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}