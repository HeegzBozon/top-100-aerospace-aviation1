import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, Target, Ban, Lock, HelpCircle, Rocket,
  Megaphone, PartyPopper, Shield, Heart
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const RULES = [
  { icon: Users, emoji: '🤝', title: 'Respect the People Here', description: 'This community is built on trust, curiosity, and mutual respect. Engage thoughtfully, assume good intent, and honor the time, work, and perspectives of others.' },
  { icon: Target, emoji: '🎯', title: 'Keep Conversations Purposeful', description: 'Each channel has a clear purpose. Posting in the right place helps everyone move faster and find what they need. Casual or off-topic conversations belong in designated social channels.' },
  { icon: Ban, emoji: '🚫', title: 'No Harassment. No Hate. No Intimidation.', description: 'We have zero tolerance for bullying, discrimination, or hostile behavior. Violations may result in immediate removal from the community.' },
  { icon: Lock, emoji: '🔒', title: 'Be Thoughtful in DMs', description: 'If you receive unsolicited, inappropriate, or suspicious direct messages, please notify an admin. Your safety and comfort matter.' },
  { icon: HelpCircle, emoji: '🧭', title: 'When in Doubt, Ask', description: 'Not sure where something belongs or how to engage? Reach out to an admin. We\'re here to help you navigate and get value from the community.' },
  { icon: Rocket, emoji: '🚀', title: 'Share Value, Don\'t Spam', description: 'We encourage sharing work, opportunities, and insights, especially in designated channels. Excessive self-promotion, unsolicited links, or spam will be moderated.' },
  { icon: Megaphone, emoji: '📣', title: 'Stay in the Loop', description: 'Announcements contain important updates, timelines, and opportunities. Keeping an eye on them ensures you don\'t miss what matters.' },
  { icon: PartyPopper, emoji: '🎉', title: 'Celebrate Wins', description: 'New role, launch, milestone, or recognition? Share it. This community exists to support and amplify one another.' },
  { icon: Shield, emoji: '🛡️', title: 'Admins Maintain the Space', description: 'Admins reserve the right to moderate and make final decisions to protect the integrity, safety, and quality of the community.' },
];

export default function WelcomeRulesLanding() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0d2137 100%)`,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${brandColors.goldPrestige} 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="relative px-6 py-12 md:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <span className="text-4xl mb-4 block">🏛️</span>
            <h1
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Welcome to the TOP 100 Community
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              A shared space for builders, leaders, and people shaping the future of aerospace & aviation.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Intro */}
      <div className="px-6 py-8 text-center border-b" style={{ borderColor: `${brandColors.navyDeep}10` }}>
        <p className="text-base max-w-2xl mx-auto" style={{ color: brandColors.navyDeep }}>
          Please take a moment to read through our community guidelines. They're simple, intentional, and designed to keep this space valuable for everyone.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="px-6 py-10 max-w-4xl mx-auto">
        <div className="grid gap-4 md:gap-6">
          {RULES.map((rule, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-4 p-5 rounded-xl bg-white shadow-sm border"
              style={{ borderColor: `${brandColors.navyDeep}08` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                style={{ background: `${brandColors.skyBlue}10` }}
              >
                {rule.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-base mb-1"
                  style={{ color: brandColors.navyDeep }}
                >
                  {rule.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: `${brandColors.navyDeep}80` }}>
                  {rule.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-6 py-8 text-center border-t"
        style={{ borderColor: `${brandColors.navyDeep}10`, background: 'white' }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
          <span className="font-medium" style={{ color: brandColors.navyDeep }}>
            Welcome aboard
          </span>
        </div>
        <p className="text-sm" style={{ color: `${brandColors.navyDeep}60` }}>
          We're glad you're here. Let's build something extraordinary together.
        </p>
      </div>
    </div>
  );
}