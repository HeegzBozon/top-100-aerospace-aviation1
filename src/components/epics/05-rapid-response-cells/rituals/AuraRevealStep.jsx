
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { User } from '@/entities/User';
import { HabitLog } from '@/entities/HabitLog';
import AuraSnapshot from '@/components/home/AuraSnapshot';
import { Sparkles, ArrowRight, Droplets } from 'lucide-react';
import { startOfDay } from 'date-fns';

export default function AuraRevealStep({ onComplete }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waterCount, setWaterCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        console.log('🔍 AuraRevealStep: Fetching water logs for user:', currentUser?.id, currentUser?.email);

        // Get today's date in simple format
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        console.log('📅 Looking for logs on date:', today);

        // Get all habit logs for this user to debug
        const allUserLogs = await HabitLog.filter({
          user_id: currentUser.id
        });
        console.log('📋 All user habit logs:', allUserLogs);

        // Get today's water logs specifically
        const todayWaterLogs = allUserLogs.filter(log => 
          log.habit_type === 'WATER' && 
          log.occurred_at && 
          log.occurred_at.startsWith(today)
        );
        
        console.log('💧 Today\'s water logs:', todayWaterLogs);
        
        // Sum up the quantity from all water logs for the day
        const totalWater = todayWaterLogs.reduce((sum, log) => {
          console.log('🧮 Processing log quantity:', log.quantity);
          return sum + (log.quantity || 0);
        }, 0);
        
        console.log('🏆 Total water calculated:', totalWater);
        setWaterCount(totalWater);

      } catch (e) {
        console.error("❌ Failed to fetch user or habits", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-[var(--muted)]">Calculating your Aura...</div>;
  }

  return (
    <div className="text-center space-y-8">
      <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-bold">Aura Revealed!</h1>
      <p className="text-lg text-[var(--muted)] max-w-md mx-auto">
        Your daily rituals have paid off. Here's your updated Aura snapshot.
      </p>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        className="max-w-sm mx-auto"
      >
        <AuraSnapshot />
      </motion.div>

      {/* Water Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-[var(--glass)] p-4 rounded-xl border border-white/10 flex items-center justify-center gap-4 max-w-sm mx-auto"
      >
        <Droplets className="w-6 h-6 text-blue-400" />
        <p className="font-medium text-[var(--text)]">
          You've logged <span className="font-bold text-blue-300">{waterCount}</span> oz of water today. Stay hydrated!
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button onClick={onComplete} size="lg">
          Finish Ritual <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
