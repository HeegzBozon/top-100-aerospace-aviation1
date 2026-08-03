import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';

const MotionLink = motion(Link);

export default function RsvpFloatingButton() {
  return (
    <MotionLink
      to="/rsvp"
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 220, damping: 18 }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#07111f] shadow-[0_8px_30px_rgba(201,168,124,0.45)]"
      style={{ background: 'linear-gradient(135deg, #c9a87c, #e0c79a)' }}
      aria-label="RSVP"
    >
      <CalendarCheck className="h-4 w-4" />
      RSVP
    </MotionLink>
  );
}