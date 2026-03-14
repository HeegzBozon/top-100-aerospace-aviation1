import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Award, Target, Users, BookOpen, Scale, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import CommunityNotesPanel from '@/components/profile/CommunityNotesPanel';
import EndorsementButton from '@/components/profile/EndorsementButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function EnhancedNomineeProfile({ nominee, onClose }) {
  const [showLayerInfo, setShowLayerInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAdmin(currentUser?.role === 'admin');
    } catch (error) {
      setUser(null);
      setIsAdmin(false);
    }
  };

  const layers = [
    {
      name: 'Perception Layer',
      score: nominee.perception_layer_score || 0,
      weight: 30,
      icon: Users,
      color: brandColors.skyBlue,
      description: 'Community voting through pairwise comparisons, ranked choice ballots, and spotlight recognition.',
      components: [
        { name: 'ELO Rating', value: nominee.elo_rating, weight: 40 },
        { name: 'Borda Score', value: nominee.borda_score, weight: 40 },
        { name: 'Spotlights', value: nominee.total_spotlights, weight: 15 },
        { name: 'Profile Completeness', value: '-', weight: 5 }
      ]
    },
    {
      name: 'Objective Layer',
      score: nominee.objective_layer_score || 0,
      weight: 30,
      icon: Target,
      color: brandColors.goldPrestige,
      description: 'Quantitative metrics including patents, leadership roles, innovation output, and community contributions.',
      components: [
        { name: 'Impact Metrics', value: '-', weight: 20 },
        { name: 'Leadership Metrics', value: '-', weight: 20 },
        { name: 'Innovation Metrics', value: '-', weight: 20 },
        { name: 'Community Metrics', value: '-', weight: 20 },
        { name: 'Trajectory Metrics', value: '-', weight: 20 }
      ]
    },
    {
      name: 'SME Evaluation',
      score: nominee.sme_layer_score || 0,
      weight: 20,
      icon: Award,
      color: brandColors.navyDeep,
      description: 'Expert peer review from industry subject matter experts assessing technical excellence and domain impact.',
      components: [
        { name: 'Expert Evaluations', value: '-', weight: 100 }
      ]
    },
    {
      name: 'Narrative Layer',
      score: nominee.narrative_layer_score || 0,
      weight: 10,
      icon: BookOpen,
      color: brandColors.skyBlue,
      description: 'AI-analyzed story arc, clarity, persuasion strength, and domain mastery from professional biography.',
      components: [
        { name: 'Arc Strength', value: nominee.narrative_analysis?.arc_strength, weight: 30 },
        { name: 'Clarity Score', value: nominee.narrative_analysis?.clarity_score, weight: 30 },
        { name: 'Persuasion', value: nominee.narrative_analysis?.persuasion_strength, weight: 25 },
        { name: 'Domain Mastery', value: nominee.narrative_analysis?.domain_mastery, weight: 15 }
      ]
    },
    {
      name: 'Normalization',
      score: nominee.normalization_layer_score || 0,
      weight: 10,
      icon: Scale,
      color: brandColors.goldPrestige,
      description: 'Adjustments for discipline differences, career stage, regional representation, and field-specific factors.',
      components: [
        { name: 'Discipline Factor', value: nominee.discipline, weight: 40 },
        { name: 'Career Stage', value: nominee.trajectory_metrics?.career_stage, weight: 30 },
        { name: 'Regional Balance', value: nominee.country, weight: 30 }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
              {nominee.name}
            </h2>
            <p className="text-sm text-gray-600">{nominee.title} • {nominee.company}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Holistic Score Overview */}
          <div className="text-center p-8 rounded-2xl" style={{ background: brandColors.goldPrestige + '10' }}>
            <p className="text-sm text-gray-600 mb-2">Holistic Score v3.0</p>
            <p className="text-6xl font-bold mb-2" style={{ color: brandColors.goldPrestige }}>
              {nominee.holistic_score?.toFixed(1) || '-'}
            </p>
            <p className="text-xs text-gray-600">
              Multi-layer evaluation combining perception, objective metrics, expert review, narrative analysis, and normalization
            </p>
          </div>

          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="mt-6">

          {/* Layer Breakdown */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
              Score Breakdown
            </h3>
            <div className="space-y-4">
              {layers.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <div key={index} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: layer.color + '20' }}>
                          <Icon className="w-5 h-5" style={{ color: layer.color }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: brandColors.navyDeep }}>
                            {layer.name}
                          </p>
                          <p className="text-xs text-gray-600">Weight: {layer.weight}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: layer.color }}>
                          {layer.score.toFixed(1)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowLayerInfo(showLayerInfo === index ? null : index)}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${layer.score}%`,
                          background: layer.color
                        }}
                      />
                    </div>

                    {showLayerInfo === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <p className="text-sm text-gray-700 mb-3">{layer.description}</p>
                        <div className="space-y-2">
                          {layer.components.map((comp, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{comp.name} ({comp.weight}%)</span>
                              <span className="font-medium">{comp.value || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            </TabsContent>

            <TabsContent value="verification" className="mt-6">
          {/* Verification Status */}
          {nominee.verification_status ? (
            <div className="border rounded-xl p-4">
              <h3 className="text-lg font-bold mb-3" style={{ color: brandColors.navyDeep }}>
                Verification Status
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${nominee.verification_status.linkedin_verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">LinkedIn Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${nominee.verification_status.employer_verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Employer Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${nominee.verification_status.metrics_validated ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Metrics Validated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${nominee.verification_status.sme_reviewed ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">SME Reviewed</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No verification status available</p>
          )}
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <CommunityNotesPanel nominee={nominee} user={user} isAdmin={isAdmin} />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
}