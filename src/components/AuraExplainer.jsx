import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Info, 
  X, 
  Star, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Clock,
  Zap,
  Target
} from 'lucide-react';

export default function AuraExplainer({ 
  isOpen, 
  onClose, 
  userScores = {}, 
  scoreBreakdown = {} 
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'components', label: 'Components', icon: Target },
    { id: 'momentum', label: 'Momentum', icon: TrendingUp },
    { id: 'tips', label: 'Tips', icon: Zap }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Aura Score Explained</h2>
                <p className="text-white/80">Understanding your ranking power</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[var(--accent)] mb-2">
                      {Math.round(userScores.aura || 0)}
                    </div>
                    <p className="text-[var(--muted)]">Your Current Aura Score</p>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-[var(--text)] mb-4">What is Aura?</h3>
                      <p className="text-[var(--muted)] leading-relaxed">
                        Aura is your composite influence score that combines three key dimensions of your 
                        platform engagement. It determines your rank, voting weight, and overall standing 
                        in the community. Higher Aura means greater influence and recognition.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <div className="font-bold text-[var(--text)]">Starpower</div>
                        <div className="text-2xl font-bold text-[var(--accent)]">60%</div>
                        <div className="text-xs text-[var(--muted)]">Peer recognition</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <div className="font-bold text-[var(--text)]">Stardust</div>
                        <div className="text-2xl font-bold text-[var(--accent)]">20%</div>
                        <div className="text-xs text-[var(--muted)]">Daily activity</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <div className="font-bold text-[var(--text)]">Clout</div>
                        <div className="text-2xl font-bold text-[var(--accent)]">20%</div>
                        <div className="text-xs text-[var(--muted)]">Quest completion</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'components' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[var(--text)]">Score Components</h3>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Star className="w-6 h-6 text-yellow-500" />
                          <div>
                            <h4 className="font-bold text-[var(--text)]">Starpower (60% weight)</h4>
                            <p className="text-sm text-[var(--muted)]">Current: {Math.round(userScores.starpower || 0)}</p>
                          </div>
                        </div>
                        <p className="text-[var(--muted)] mb-3">
                          Earned through peer recognition and voting outcomes. The most heavily weighted component.
                        </p>
                        <div className="text-sm space-y-1">
                          <div>• Pairwise voting wins: 45% of Starpower</div>
                          <div>• Ranked choice preferences: 35% of Starpower</div>
                          <div>• Direct vote selections: 20% of Starpower</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles className="w-6 h-6 text-blue-500" />
                          <div>
                            <h4 className="font-bold text-[var(--text)]">Stardust (20% weight)</h4>
                            <p className="text-sm text-[var(--muted)]">Current: {userScores.stardust || 0} points</p>
                          </div>
                        </div>
                        <p className="text-[var(--muted)] mb-3">
                          Earned through daily rituals and consistent platform engagement. Subject to diminishing returns.
                        </p>
                        <div className="text-sm space-y-1">
                          <div>• Effective Score: {Math.round(userScores.stardust_eff || 0)}/100</div>
                          <div>• Efficiency curve prevents gaming</div>
                          <div>• Rewards consistency over grinding</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Award className="w-6 h-6 text-purple-500" />
                          <div>
                            <h4 className="font-bold text-[var(--text)]">Clout (20% weight)</h4>
                            <p className="text-sm text-[var(--muted)]">Current: {Math.round(userScores.clout || 0)} points</p>
                          </div>
                        </div>
                        <p className="text-[var(--muted)] mb-3">
                          Earned exclusively through quest completion and special achievements.
                        </p>
                        <div className="text-sm space-y-1">
                          <div>• Effective Score: {Math.round(userScores.clout_eff || 0)}/100</div>
                          <div>• Logarithmic scaling for fairness</div>
                          <div>• Represents expertise and dedication</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'momentum' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[var(--text)]">Momentum & Freshness</h3>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <div>
                          <h4 className="font-bold text-[var(--text)]">Momentum Factor</h4>
                          <p className="text-sm text-[var(--muted)]">
                            Current: {((scoreBreakdown.momentum_factor || 0) * 100).toFixed(1)}% boost
                          </p>
                        </div>
                      </div>
                      <p className="text-[var(--muted)] mb-4">
                        Active users get up to 10% Aura boost based on recent activity patterns.
                      </p>
                      <div className="bg-[var(--card)] p-4 rounded-lg">
                        <div className="text-sm space-y-2">
                          <div>• Requires 3+ actions in the last 7 days</div>
                          <div>• Bonus for activity across multiple days</div>
                          <div>• Recent activities: {scoreBreakdown.recent_activities || 0}</div>
                          {scoreBreakdown.momentum_adjustment && (
                            <div className="font-medium text-green-600">
                              Boost: +{Math.round(scoreBreakdown.momentum_adjustment)} Aura
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-6 h-6 text-orange-500" />
                        <div>
                          <h4 className="font-bold text-[var(--text)]">Freshness Decay</h4>
                          <p className="text-sm text-[var(--muted)]">
                            Current: {((scoreBreakdown.freshness_factor || 1) * 100).toFixed(1)}% retention
                          </p>
                        </div>
                      </div>
                      <p className="text-[var(--muted)] mb-4">
                        Scores gradually decay over time to keep rankings fresh and reward active participation.
                      </p>
                      <div className="bg-[var(--card)] p-4 rounded-lg">
                        <div className="text-sm space-y-2">
                          <div>• 30-day half-life for score decay</div>
                          <div>• Minimum 50% score retention</div>
                          <div>• Reset by any scoring activity</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'tips' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[var(--text)]">Maximizing Your Aura</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          Build Starpower
                        </h4>
                        <ul className="text-sm text-[var(--muted)] space-y-2">
                          <li>• Participate in all voting modes</li>
                          <li>• Engage consistently to be remembered</li>
                          <li>• Focus on pairwise battles (45% weight)</li>
                          <li>• Build relationships and reputation</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          Maintain Momentum
                        </h4>
                        <ul className="text-sm text-[var(--muted)] space-y-2">
                          <li>• Complete daily rituals consistently</li>
                          <li>• Stay active across multiple days</li>
                          <li>• Engage within 7-day windows</li>
                          <li>• Mix different types of activities</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-500" />
                          Earn Stardust
                        </h4>
                        <ul className="text-sm text-[var(--muted)] space-y-2">
                          <li>• Complete all daily ritual steps</li>
                          <li>• Focus on quality over quantity</li>
                          <li>• Diminishing returns prevent grinding</li>
                          <li>• Consistency beats burst activity</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-500" />
                          Gain Clout
                        </h4>
                        <ul className="text-sm text-[var(--muted)] space-y-2">
                          <li>• Complete available quests</li>
                          <li>• Focus on high-value challenges</li>
                          <li>• Demonstrate expertise and skill</li>
                          <li>• Engage in community initiatives</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent-2)]/10 border-[var(--accent)]/20">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[var(--accent)]" />
                        Pro Strategy
                      </h4>
                      <p className="text-[var(--muted)]">
                        The highest Aura scores come from balanced growth across all three components, 
                        maintained with consistent daily engagement. Focus on building real relationships 
                        and demonstrating expertise rather than gaming individual metrics.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] p-6 bg-[var(--card)]">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-[var(--accent)] text-white">
              Got it, thanks!
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}