import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, Zap, BookOpen } from 'lucide-react';

const ROADMAP_PHASES = [
  { phase: 1, name: 'Discovery', status: 'complete' },
  { phase: 2, name: 'Design', status: 'complete' },
  { phase: 3, name: 'Development', status: 'in-progress' },
  { phase: 4, name: 'Testing', status: 'pending' },
  { phase: 5, name: 'Launch Prep', status: 'pending' },
  { phase: 6, name: 'Go Live', status: 'pending' },
  { phase: 7, name: 'Optimization', status: 'pending' },
];

export default function Phase03MissionControl() {
  const [feed, setFeed] = useState([
    { id: 1, author: 'Your Team', message: 'Welcome to Mission Control! Your project is now live.', time: '2 min ago' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      setFeed([
        { id: feed.length + 1, author: 'You', message: newMessage, time: 'now' },
        ...feed,
      ]);
      setNewMessage('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h1 
            className="text-4xl font-bold mb-2 font-serif text-brand-gold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Phase 03: Mission Control
          </motion.h1>
          <p className="text-slate-300">Your live build environment and ecosystem growth hub.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {/* 7-Phase Product Roadmap */}
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-brand-navy-08">
          <h2 className="text-2xl font-bold text-brand-navy mb-6 font-serif">7-Phase Product Roadmap</h2>
          <div className="space-y-4">
            {ROADMAP_PHASES.map((item, idx) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-brand-gold text-brand-navy font-bold flex items-center justify-center text-lg">
                  {item.phase}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{item.name}</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(item.status)}`}>
                  {item.status === 'in-progress' ? '🔄 In Progress' : item.status === 'complete' ? '✓ Complete' : 'Pending'}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Collaborative Feed */}
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-brand-navy-08">
          <h2 className="text-2xl font-bold text-brand-navy mb-6 font-serif">Collaborative Feed</h2>
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
            {feed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l-4 border-brand-gold pl-4 py-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800">{item.author}</span>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
                <p className="text-slate-700">{item.message}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Share an update..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <Button onClick={handleAddMessage} className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Authority Dashboard */}
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-brand-navy-08">
          <h2 className="text-2xl font-bold text-brand-navy mb-6 font-serif">Authority Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-brand-gold/20 to-slate-50 rounded-xl p-6 border border-brand-gold/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-brand-gold" />
                <h3 className="font-semibold text-brand-navy">Canonical Program Page</h3>
              </div>
              <p className="text-slate-700 text-sm mb-4">
                Your institutional archive is being built. Track its evolution from blank canvas to full authority platform.
              </p>
              <div className="w-full bg-slate-300 rounded-full h-2">
                <div className="bg-brand-gold h-full rounded-full" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">65% Complete</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-brand-navy/10 to-slate-50 rounded-xl p-6 border border-brand-navy/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-brand-navy" />
                <h3 className="font-semibold text-brand-navy">Ecosystem Growth</h3>
              </div>
              <p className="text-slate-700 text-sm mb-4">
                Collaborate with your team, contributors, and partners to build authentic authority.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 text-center py-2 rounded bg-slate-100">
                  <p className="text-lg font-bold text-brand-navy">3</p>
                  <p className="text-xs text-slate-600">Team Members</p>
                </div>
                <div className="flex-1 text-center py-2 rounded bg-slate-100">
                  <p className="text-lg font-bold text-brand-navy">12</p>
                  <p className="text-xs text-slate-600">Contributors</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-10">
          <p className="text-slate-600 mb-6">Your mission is now live. Start building.</p>
          <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 text-lg px-8 py-4 h-auto">
            View Your Canonical Page →
          </Button>
        </section>
      </div>
    </div>
  );
}