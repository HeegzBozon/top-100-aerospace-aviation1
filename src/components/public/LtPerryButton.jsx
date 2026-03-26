import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function LtPerryButton() {
  const handleClick = () => {
    // Navigate to Lt. Perry chat or open modal
    if (window.location.pathname !== '/ltperry') {
      window.location.href = '/ltperry';
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center"
    >
      <MessageCircle className="w-6 h-6" />
    </motion.button>
  );
}