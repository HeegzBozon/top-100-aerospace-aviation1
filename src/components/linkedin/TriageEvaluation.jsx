import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, RotateCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TriageEvaluation({ contact, onEvaluated }) {
  const [loading, setLoading] = useState(false);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'S-Tier': return 'from-purple-600 to-pink-600';
      case 'A-Tier': return 'from-blue-600 to-cyan-600';
      case 'B-Tier': return 'from-green-600 to-emerald-600';
      case 'C-Tier': return 'from-slate-600 to-slate-700';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getTierBorder = (tier) => {
    switch (tier) {
      case 'S-Tier': return 'border-purple-300';
      case 'A-Tier': return 'border-blue-300';
      case 'B-Tier': return 'border-green-300';
      case 'C-Tier': return 'border-slate-300';
      default: return 'border-slate-200';
    }
  };

  const evaluate = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('evaluateLinkedInMessage', {
        contactId: contact.id,
        headline: contact.headline,
        message: contact.last_received_message || 'No message provided',
        company: contact.current_company,
        position: contact.current_position
      });

      // Handle both wrapped and unwrapped responses
      const updatedContact = result.contact || result.data?.contact;
      if (updatedContact) {
        onEvaluated(updatedContact);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show unevaluated state - button to evaluate
  if (contact.triage_status !== 'evaluated') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md border border-slate-200 p-6"
      >
        <h3 className="text-lg font-bold text-[#1e3a5a] mb-4">TIER-S Institutional Alignment</h3>
        <p className="text-slate-600 text-sm mb-6">
          Evaluate this message against our aerospace-grade rubric to filter for high-signal institutional value.
        </p>
        <Button
          onClick={evaluate}
          disabled={loading}
          className="w-full bg-[#D4A574] text-white hover:bg-[#C19A6B] font-semibold"
        >
          {loading ? 'Evaluating...' : 'Evaluate with TIER-S Rubric'}
        </Button>
      </motion.div>
    );
  }

  // Show evaluated state - display results
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${getTierColor(contact.tier_classification)} rounded-2xl shadow-lg border ${getTierBorder(contact.tier_classification)} p-8 text-white`}
    >
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Classification</p>
          <p className="text-3xl font-bold mt-1">{contact.tier_classification}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Total Score</p>
          <p className="text-3xl font-bold mt-1">{contact.tier_score}/20</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs opacity-80">Talent Graph</p>
          <p className="text-2xl font-bold">{contact.talent_graph_score}</p>
          <p className="text-xs opacity-60">/5</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs opacity-80">Institutional</p>
          <p className="text-2xl font-bold">{contact.institutional_revenue_score}</p>
          <p className="text-xs opacity-60">/5</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs opacity-80">Ecosystem</p>
          <p className="text-2xl font-bold">{contact.ecosystem_gravity_score}</p>
          <p className="text-xs opacity-60">/5</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs opacity-80">Rigor</p>
          <p className="text-2xl font-bold">{contact.rigor_scalability_score}</p>
          <p className="text-xs opacity-60">/5</p>
        </div>
      </div>

      {contact.triage_reasoning && (
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
          <p className="text-sm opacity-90 leading-relaxed">{contact.triage_reasoning}</p>
        </div>
      )}

      {/* Action Mandate */}
      <div className="mt-6 pt-6 border-t border-white/20">
        {contact.tier_classification === 'S-Tier' && (
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Immediate Founder Intervention</p>
              <p className="text-sm opacity-90">Move to high-energy Venus/Mercury reveal sequence.</p>
            </div>
          </div>
        )}
        {contact.tier_classification === 'A-Tier' && (
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Delegate to Systems</p>
              <p className="text-sm opacity-90">Trigger Nomination → Profile automation workflow.</p>
            </div>
          </div>
        )}
        {contact.tier_classification === 'B-Tier' && (
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Standard Response</p>
              <p className="text-sm opacity-90">Direct to Flightography claiming or Wefunder campaign.</p>
            </div>
          </div>
        )}
        {contact.tier_classification === 'C-Tier' && (
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Archive</p>
              <p className="text-sm opacity-90">Protect prestige. Do not dilute founder bandwidth.</p>
            </div>
          </div>
        )}
      </div>

      {/* Re-analyze Button */}
      <div className="mt-6">
        <Button
          onClick={evaluate}
          disabled={loading}
          variant="outline"
          className="w-full bg-white/10 text-white hover:bg-white/20 border-white/30"
        >
          <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Re-analyzing...' : 'Re-analyze'}
        </Button>
      </div>
    </motion.div>
  );
}