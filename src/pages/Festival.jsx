
import React from 'react';
import { motion } from 'framer-motion';
import EmceeCard from '@/components/epics/03-mission-rooms/events/EmceeCard';
import EventCard from '@/components/epics/03-mission-rooms/events/EventCard';
import QuestLink from '@/components/epics/03-mission-rooms/events/QuestLink';
import { 
  Trophy, 
  Users, 
  Star,
  ChevronRight,
  TrendingUp,
  Heart
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

export default function FestivalPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <motion.div 
        className="max-w-4xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text)] tracking-tight">
            Aerospace Festival Season
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto">
            A celebration of the trailblazers and innovators shaping the future of aerospace.
          </p>
        </motion.div>

        {/* Emcee Agent Card */}
        <motion.div variants={itemVariants}>
          <EmceeCard />
        </motion.div>

        {/* Main Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <motion.div variants={itemVariants}>
            <EventCard 
              title="TOP 100: The Spotlight"
              description="See the honorees and relive the ceremony."
              ctaText="Browse Nominees & Highlights"
              ctaLink={createPageUrl('Arena')}
              Icon={Trophy}
              accentColor="from-amber-400 to-orange-500"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <EventCard 
              title="Leading Ladies Summit: The After Party"
              description="Join the celebration and continue the momentum."
              ctaText="Learn, Register & RSVP"
              ctaLink={createPageUrl('Afterparty')}
              Icon={Users}
              accentColor="from-purple-400 to-indigo-500"
            />
          </motion.div>
        </div>

        {/* Linked Quests */}
        <motion.div variants={itemVariants}>
          <div className="bg-[var(--card)]/60 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-[var(--accent)]"/>
              <h2 className="text-xl font-bold text-[var(--text)]">Festival Quests</h2>
            </div>
            <p className="text-[var(--muted)] mb-5">
              Amplify your HypeSquad status! Engage with festival content to complete quests and earn exclusive rewards.
            </p>
            <div className="space-y-3">
              <QuestLink 
                title="Share a Nominee Profile"
                description="Share your favorite nominee's profile to earn Stardust."
                Icon={TrendingUp}
                href={createPageUrl('Quests')}
              />
              <QuestLink 
                title="Join the After Party"
                description="RSVP and participate in the Leading Ladies Summit After Party."
                Icon={Heart}
                href={createPageUrl('Quests')}
              />
               <Link to={createPageUrl('Quests')}>
                  <div className="group flex items-center justify-center mt-4 text-sm font-semibold text-[var(--accent)] hover:text-[var(--text)] transition-colors">
                      <span>View All Quests</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
               </Link>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
