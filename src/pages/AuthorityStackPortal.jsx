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
          <div className="relative bg-gradient-to-r from-[#1e3a5a] to-[#0f2438] text-white py-16 px-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <ConstellationBackground />
            </div>
            <div className="max-w-4xl mx-auto relative z-10">
              <motion.div 
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.h1 
                  className="text-4xl sm:text-5xl font-bold mb-4 leading-tight font-serif text-[#D4A574]"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Your Enterprise Transformation Begins
                </motion.h1>
                <motion.p 
                  className="text-slate-200 text-lg max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  A live, interactive brief to establish the unfair advantage of working with us.
                </motion.p>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
            {/* Executive Summary */}
            <section>
              <motion.h2 
                className="text-3xl font-bold text-[#1e3a5a] mb-6 font-serif"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Executive Summary
              </motion.h2>
              <motion.p 
                className="text-slate-700 leading-relaxed text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                This partnership is an investment in unparalleled growth and strategic market positioning. We are not merely
                offering services; we are co-creating an enterprise transformation that will redefine your industry presence
                and unlock exponential value.
              </motion.p>
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