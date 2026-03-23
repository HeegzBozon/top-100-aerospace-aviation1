import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FeatureCard({ icon: Icon, title, description, ctaText, ctaLink, accentClass }) {
  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`relative overflow-hidden h-full flex flex-col bg-gradient-to-br from-[var(--card)]/90 to-[var(--card)]/70 backdrop-blur-sm border border-[var(--border)] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 group`}
    >
      <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-[var(--accent)]/10 to-transparent blur-3xl -z-10"></div>
      <div className={`mb-5 w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${accentClass}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-[var(--text)] mb-3">{title}</h3>
      <p className="text-[var(--muted)] flex-grow mb-6">{description}</p>
      <Link to={ctaLink} className="mt-auto">
        <Button variant="outline" className="w-full bg-white/5 border-[var(--border)] hover:bg-white/10 hover:border-[var(--accent)]/50 transition-colors">
          {ctaText}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </motion.div>
  );
}