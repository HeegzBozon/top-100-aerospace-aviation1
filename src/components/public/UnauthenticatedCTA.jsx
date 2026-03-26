import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function UnauthenticatedCTA({ user }) {
  if (user) return null;

  const handleSignIn = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <p className="text-sm text-white">Sign in to vote and nominate</p>
        <Button onClick={handleSignIn} size="sm" className="bg-blue-600 hover:bg-blue-700">
          Sign In
        </Button>
      </div>
    </motion.div>
  );
}