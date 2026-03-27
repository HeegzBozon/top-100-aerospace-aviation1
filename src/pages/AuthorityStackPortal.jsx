import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Phase02DataRefinery from '@/components/authority-portal/Phase02DataRefinery';
import Phase03MissionControl from '@/components/authority-portal/Phase03MissionControl';
import ConstellationBackground from '@/components/comms/ConstellationBackground';

export default function AuthorityStackPortal() {
  const [phase, setPhase] = useState('proposal'); // 'proposal', 'refinery', 'control'

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream to-brand-gold/10">
      {/* PHASE 01: THE STRATEGIC PROPOSAL */}
      {phase === 'proposal' && (
        <>
          {/* Hero Section */}
          <div className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="relative bg-gradient-to-br from-[#1e3a5a] to-[#0f2438] text-white rounded-3xl p-12 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 opacity-30">
                  <ConstellationBackground />
                </div>
                <div className="relative z-10 text-center">
                  <motion.h1 
                    className="text-5xl sm:text-6xl font-bold mb-4 leading-tight font-serif text-[#D4A574]"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Your Enterprise Transformation Begins
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    A live, interactive brief to establish the unfair advantage of working with us.
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
            {/* Executive Summary */}
            <section className="bg-gradient-to-br from-white to-[#faf8f5] rounded-2xl shadow-md p-8 border border-slate-300">
              <motion.h2 
                className="text-3xl font-bold text-[#1e3a5a] mb-6 font-serif"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Executive Summary
              </motion.h2>
              <motion.p 
                className="text-slate-700 leading-relaxed text-lg mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                This partnership is an investment in unparalleled growth and strategic market positioning. We are not merely offering services; we are co-creating an enterprise transformation that will redefine your industry presence and unlock exponential value.
              </motion.p>
              <motion.div 
                className="flex gap-4 pt-6 border-t border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex-1">
                  <p className="text-[#D4A574] font-bold text-sm uppercase tracking-widest">Timeline</p>
                  <p className="text-slate-800 font-semibold text-lg">90 Days to Authority</p>
                </div>
                <div className="flex-1">
                  <p className="text-[#D4A574] font-bold text-sm uppercase tracking-widest">Scope</p>
                  <p className="text-slate-800 font-semibold text-lg">Full Enterprise Build</p>
                </div>
                <div className="flex-1">
                  <p className="text-[#D4A574] font-bold text-sm uppercase tracking-widest">Impact</p>
                  <p className="text-slate-800 font-semibold text-lg">Market Leadership</p>
                </div>
              </motion.div>
            </section>



            {/* CTA */}
            <section className="text-center py-10">
              <Button 
                onClick={() => setPhase('refinery')}
                className="bg-[#D4A574] text-white hover:bg-[#C19A6B] text-lg px-8 py-4 h-auto"
              >
                Authorize Mission →
              </Button>
            </section>
          </div>
        </>
      )}

      {/* PHASE 02: THE DATA REFINERY */}
      {phase === 'refinery' && (
        <>
          <Phase02DataRefinery onNext={() => setPhase('control')} />
          <div className="max-w-4xl mx-auto px-6 pb-12">
            <Button onClick={() => setPhase('proposal')} variant="outline">← Back to Phase 01</Button>
          </div>
        </>
      )}

      {/* PHASE 03: MISSION CONTROL */}
      {phase === 'control' && (
        <>
          <Phase03MissionControl />
          <div className="max-w-5xl mx-auto px-6 pb-12">
            <Button onClick={() => setPhase('refinery')} variant="outline">← Back to Phase 02</Button>
          </div>
        </>
      )}
    </div>
  );
}