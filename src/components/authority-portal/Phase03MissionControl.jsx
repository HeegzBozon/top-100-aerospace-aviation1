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
      <div className="bg-gradient-to-r from-[#1e3a5a] to-[#0f2438] text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h1 
            className="text-4xl font-bold mb-2 font-serif text-[#D4A574]"
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
        <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-[#1e3a5a] mb-6 font-serif">7-Phase Build Plan</h2>
          <div className="space-y-3">
            {ROADMAP_PHASES.map((item, idx) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200"
              >
                <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm flex-shrink-0 ${
                  item.status === 'complete' ? 'bg-green-100 text-green-700' :
                  item.status === 'in-progress' ? 'bg-[#D4A574]/20 text-[#D4A574]' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {item.phase}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1e3a5a] text-sm">{item.name}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${getStatusColor(item.status)}`}>
                  {item.status === 'in-progress' ? 'In Progress' : item.status === 'complete' ? 'Complete' : 'Pending'}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Collaborative Feed */}
        <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-[#1e3a5a] mb-6 font-serif">Team Updates</h2>
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {feed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l-2 border-[#D4A574] pl-4 py-2"
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-slate-800 text-sm">{item.author}</span>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
                <p className="text-slate-700 text-sm">{item.message}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Share an update…"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50"
            />
            <Button onClick={handleAddMessage} className="bg-[#D4A574] text-white hover:bg-[#C19A6B] transition-colors duration-200 px-3 h-auto py-2">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Authority Dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-[#D4A574]" />
              <h3 className="font-semibold text-[#1e3a5a] text-sm">Canonical Program Page</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Your institutional archive is building. Track progress from concept to full authority platform.
            </p>
            <div className="space-y-2">
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-[#D4A574] h-full rounded-full transition-all" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-slate-500 text-right">65% Complete</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-[#1e3a5a]" />
              <h3 className="font-semibold text-[#1e3a5a] text-sm">Ecosystem Growth</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Build authentic authority with team, contributors, and partners.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 text-center py-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-base font-bold text-[#1e3a5a]">3</p>
                <p className="text-xs text-slate-600">Team Members</p>
              </div>
              <div className="flex-1 text-center py-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-base font-bold text-[#1e3a5a]">12</p>
                <p className="text-xs text-slate-600">Contributors</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-10">
          <p className="text-slate-600 text-base mb-6">Your institutional platform is live. Begin building authority.</p>
          <Button className="bg-[#D4A574] text-white hover:bg-[#C19A6B] transition-colors duration-200 text-base px-8 py-3 h-auto rounded-full">
            View Your Program Page
          </Button>
        </section>
      </div>
    </div>
  );
}