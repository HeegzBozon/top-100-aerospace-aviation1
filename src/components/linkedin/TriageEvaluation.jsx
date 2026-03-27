import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, RotateCw, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TriageEvaluation({ contact, onEvaluated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTierColor = (tier) => {
    const colors = {
      'S-Tier': 'from-purple-600 to-pink-600',
      'A-Tier': 'from-blue-600 to-cyan-600',
      'B-Tier': 'from-green-600 to-emerald-600',
      'C-Tier': 'from-slate-600 to-slate-700',
    };
    return colors[tier] || 'from-slate-400 to-slate-500';
  };

  const getTierBorder = (tier) => {
    const borders = {
      'S-Tier': 'border-purple-300',
      'A-Tier': 'border-blue-300',
      'B-Tier': 'border-green-300',
      'C-Tier': 'border-slate-300',
    };
    return borders[tier] || 'border-slate-200';
  };

  const evaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.functions.invoke('evaluateLinkedInMessage', {
        contactId: contact.id,
        headline: contact.headline || '',
        theirMessage: contact.last_received_message || 'No message provided',
        yourMessage: contact.generated_response || contact.last_sent_message || 'No response yet',
        company: contact.current_company || '',
        position: contact.current_position || '',
      });

      // Handle both wrapped and direct responses
      const updatedContact = result.data?.contact || result.contact;
      if (updatedContact) {
        onEvaluated(updatedContact);
      } else {
        setError('No data returned from evaluation');
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Unevaluated state - button to start evaluation
  if (contact.triage_status !== 'evaluated') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md border border-slate-200 p-6"
      >
        <h3 className="text-lg font-bold text-[#1e3a5a] mb-4">TIER-S Institutional Alignment</h3>
        <p className="text-slate-600 text-sm mb-6">
          Evaluate this interaction against our aerospace-grade rubric to filter for high-signal institutional value.
        </p>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Evaluation Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <Button
          onClick={evaluate}
          disabled={loading}
          className="w-full bg-[#D4A574] text-white hover:bg-[#C19A6B] font-semibold disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Evaluating...
            </>
          ) : (
            'Evaluate with TIER-S Rubric'
          )}
        </Button>
      </motion.div>
    );
  }

  // Evaluated state - display results
  if (!contact.tier_classification) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${getTierColor(contact.tier_classification)} rounded-2xl shadow-lg border ${getTierBorder(contact.tier_classification)} p-8 text-white`}
    >
      {/* Tier and Score */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Classification</p>
          <p className="text-4xl font-bold mt-2">{contact.tier_classification}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Total Score</p>
          <p className="text-4xl font-bold mt-2">{contact.tier_score || 0}/20</p>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs opacity-80 font-semibold">Talent Graph</p>
          <p className="text-3xl font-bold mt-1">{contact.talent_graph_score || 0}</p>
          <p className="text-xs opacity-60">/5</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs opacity-80 font-semibold">Institutional</p>
          <p className="text-3xl font-bold mt-1">{contact.institutional_revenue_score || 0}</p>
          <p className="text-xs opacity-60">/5</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs opacity-80 font-semibold">Ecosystem</p>
          <p className="text-3xl font-bold mt-1">{contact.ecosystem_gravity_score || 0}</p>
          <p className="text-xs opacity-60">/5</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs opacity-80 font-semibold">Rigor</p>
          <p className="text-3xl font-bold mt-1">{contact.rigor_scalability_score || 0}</p>
          <p className="text-xs opacity-60">/5</p>
        </div>
      </div>

      {/* Reasoning */}
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
              <p className="text-sm opacity-90">Move to high-energy reveal sequence.</p>
            </div>
          </div>
        )}
        {contact.tier_classification === 'A-Tier' && (
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Delegate to Systems</p>
              <p className="text-sm opacity-90">Trigger nomination automation workflow.</p>
            </div>
          </div>
        )}
        {contact.tier_classification === 'B-Tier' && (
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Standard Response</p>
              <p className="text-sm opacity-90">Direct to profile claiming or pitch campaign.</p>
            </div>
          </div>
        )}
        {contact.tier_classification === 'C-Tier' && (
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Archive</p>
              <p className="text-sm opacity-90">Protect prestige. Do not spend founder bandwidth.</p>
            </div>
          </div>
        )}
      </div>

      {/* Re-evaluate Button */}
      <div className="mt-6">
        <Button
          onClick={evaluate}
          disabled={loading}
          variant="outline"
          className="w-full bg-white/10 text-white hover:bg-white/20 border-white/30 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Re-analyzing...
            </>
          ) : (
            <>
              <RotateCw className="w-4 h-4 mr-2" />
              Re-analyze
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}