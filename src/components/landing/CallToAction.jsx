import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';

export default function CallToAction() {
  const handleLogin = async () => {
    try {
      const passportUrl = `${window.location.origin}${createPageUrl('Passport')}`;
      await User.loginWithRedirect(passportUrl);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8 }}
      className="my-20 text-center"
    >
      <div className="bg-gradient-to-tr from-[var(--card)]/80 to-[var(--card)]/60 backdrop-blur-sm border border-[var(--border)] rounded-3xl p-10 md:p-16 max-w-4xl mx-auto shadow-xl">
        <h2 className="text-3xl font-bold text-[var(--text)] mb-4">Ready to Join?</h2>
        <p className="text-lg text-[var(--muted)] max-w-xl mx-auto mb-8">
          Become part of the community, celebrate excellence, and make your voice heard in the aerospace industry.
        </p>
        <Button
          onClick={handleLogin}
          size="lg"
          className="bg-white text-black dark:bg-[var(--accent)] dark:text-white dark:hover:bg-[var(--accent-2)] font-bold px-8 py-6 rounded-full hover:bg-gray-200"
        >
          Sign In & Get Started
        </Button>
      </div>
    </motion.div>
  );
}