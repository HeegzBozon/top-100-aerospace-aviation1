import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';

export default function HeroSection() {
  const handleGetStarted = async () => {
    try {
      const passportUrl = `${window.location.origin}${createPageUrl('Passport')}`;
      await User.loginWithRedirect(passportUrl);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/30 to-[var(--accent-2)]/30 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
          Celebrate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]">Innovators</span>.
          <br />
          Shape the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-2)] to-[var(--accent)]">Future</span>.
        </h1>
      </div>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-[var(--muted)]">
        The official platform for the TOP 100 Women in Aerospace & Aviation. Nominate, vote, and connect with the leaders defining the industry.
      </p>
      <div className="mt-10 flex justify-center">
        <Button
          size="lg"
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}