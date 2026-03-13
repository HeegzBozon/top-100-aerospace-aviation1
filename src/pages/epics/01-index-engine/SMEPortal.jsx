import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, CheckCircle, Clock, Loader2, Trophy, Star, Zap, ChevronRight, Sparkles, Shield, ScrollText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { SMEEvaluationWizard } from '@/components/epics/01-index-engine/talent';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function SMEPortal() {
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [user, setUser] = useState(null);
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [pledgeChecks, setPledgeChecks] = useState({
    integrity: false,
    confidentiality: false,
    fairness: false,
    diligence: false
  });
  const queryClient = useQueryClient();

  // Check if user has already accepted pledge
  useEffect(() => {
    const checkPledge = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser.nrc_pledge_accepted) {
          setShowPledgeModal(true);
        } else {
          setPledgeAccepted(true);
        }
      } catch (e) {
        console.error('Error checking pledge status:', e);
      }
    };
    checkPledge();
  }, []);

  const handleAcceptPledge = async () => {
    try {
      await base44.auth.updateMe({ nrc_pledge_accepted: true, nrc_pledge_date: new Date().toISOString() });
      setPledgeAccepted(true);
      setShowPledgeModal(false);
    } catch (e) {
      console.error('Error saving pledge:', e);
    }
  };

  const allPledgesChecked = Object.values(pledgeChecks).every(Boolean);

  // Fetch Season 4 seasons (nominations_open status)
  const { data: season4Seasons = [] } = useQuery({
    queryKey: ['season4-seasons'],
    queryFn: async () => {
      const seasons = await base44.entities.Season.list('-start_date');
      return seasons.filter(s => s.status === 'nominations_open');
    },
  });

  const season4Ids = season4Seasons.map(s => s.id);

  const { data: nominees, isLoading: nomineesLoading } = useQuery({
    queryKey: ['nominees-season4', season4Ids],
    queryFn: async () => {
      if (season4Ids.length === 0) return [];
      const allNominees = await base44.entities.Nominee.list('-created_date', 500);
      return allNominees.filter(n => 
        season4Ids.includes(n.season_id) && 
        (n.status === 'approved' || n.status === 'active' || n.status === 'pending')
      );
    },
    enabled: season4Ids.length > 0,
    initialData: []
  });

  const { data: myEvaluations, isLoading: evaluationsLoading } = useQuery({
    queryKey: ['my-sme-evaluations'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      return base44.entities.SMEEvaluation.filter({ evaluator_email: currentUser.email });
    },
    initialData: []
  });

  const evaluatedNomineeIds = new Set(myEvaluations.map(e => e.nominee_id));
  const pendingNominees = nominees.filter(n => !evaluatedNomineeIds.has(n.id));

  if (nomineesLoading || evaluationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  if (selectedNominee) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="outline"
          onClick={() => setSelectedNominee(null)}
          className="mb-6"
        >
          ← Back to Portal
        </Button>
        <SMEEvaluationWizard
          nominee={selectedNominee}
          totalPending={pendingNominees.length}
          completedCount={myEvaluations.length}
          onComplete={() => {
            setSelectedNominee(null);
            queryClient.invalidateQueries({ queryKey: ['my-sme-evaluations'] });
            queryClient.invalidateQueries({ queryKey: ['nominees-season4'] });
          }}
        />
      </div>
    );
  }

  const totalXPEarned = myEvaluations.length * 150; // 100 XP per criteria + 50 bonus

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Honor Pledge Modal */}
      <Dialog open={showPledgeModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl" style={{ color: brandColors.navyDeep }}>
              Nomination Review Council Honor Pledge
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              As a member of the Nomination Review Council, you are entrusted with evaluating nominees fairly and professionally.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 rounded-lg my-4" style={{ background: brandColors.goldPrestige + '15', border: `1px solid ${brandColors.goldPrestige}40` }}>
            <div className="flex items-start gap-3 mb-3">
              <ScrollText className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: brandColors.goldPrestige }} />
              <p className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
                I solemnly pledge to uphold the following principles:
              </p>
            </div>
            
            <div className="space-y-3 ml-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox 
                  checked={pledgeChecks.integrity}
                  onCheckedChange={(checked) => setPledgeChecks(prev => ({ ...prev, integrity: checked }))}
                  className="mt-0.5"
                />
                <span className="text-sm"><strong>Integrity:</strong> I will provide honest, unbiased evaluations based solely on merit and evidence.</span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox 
                  checked={pledgeChecks.confidentiality}
                  onCheckedChange={(checked) => setPledgeChecks(prev => ({ ...prev, confidentiality: checked }))}
                  className="mt-0.5"
                />
                <span className="text-sm"><strong>Confidentiality:</strong> I will keep all nominee information and my evaluations confidential.</span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox 
                  checked={pledgeChecks.fairness}
                  onCheckedChange={(checked) => setPledgeChecks(prev => ({ ...prev, fairness: checked }))}
                  className="mt-0.5"
                />
                <span className="text-sm"><strong>Fairness:</strong> I will recuse myself from evaluating anyone with whom I have a conflict of interest.</span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox 
                  checked={pledgeChecks.diligence}
                  onCheckedChange={(checked) => setPledgeChecks(prev => ({ ...prev, diligence: checked }))}
                  className="mt-0.5"
                />
                <span className="text-sm"><strong>Diligence:</strong> I will thoroughly research each nominee before providing my assessment.</span>
              </label>
            </div>
          </div>
          
          <Button
            onClick={handleAcceptPledge}
            disabled={!allPledgesChecked}
            className="w-full py-6 text-lg"
            style={{ background: allPledgesChecked ? `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` : undefined }}
          >
            <Shield className="w-5 h-5 mr-2" />
            Accept Pledge & Enter Council
          </Button>
        </DialogContent>
      </Dialog>

      {/* Hero Header */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` }}
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
          Nomination Review Council
        </h1>
        <p className="text-gray-600 mb-4">Expert review and validation for TOP 100 nominees</p>
        
        {/* XP Badge */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full"
          style={{ background: brandColors.navyDeep }}
        >
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-xl font-bold text-white">{totalXPEarned} XP Earned</span>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 border-2 hover:shadow-lg transition-all" style={{ borderColor: brandColors.skyBlue + '40' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: brandColors.skyBlue + '20' }}>
                <Clock className="w-6 h-6" style={{ color: brandColors.skyBlue }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {pendingNominees.length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="p-4 border-2 hover:shadow-lg transition-all" style={{ borderColor: '#22c55e40' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {myEvaluations.length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="p-4 border-2 hover:shadow-lg transition-all" style={{ borderColor: brandColors.goldPrestige + '40' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: brandColors.goldPrestige + '20' }}>
                <Zap className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">XP Per Evaluation</p>
                <p className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  150
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Progress Bar */}
      {nominees.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium" style={{ color: brandColors.navyDeep }}>
              {myEvaluations.length} / {nominees.length} ({Math.round((myEvaluations.length / nominees.length) * 100)}%)
            </span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: brandColors.goldPrestige + '20' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${brandColors.skyBlue}, ${brandColors.goldPrestige})` }}
              initial={{ width: 0 }}
              animate={{ width: `${(myEvaluations.length / nominees.length) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Quick Start Card */}
      {pendingNominees.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6 border-2 overflow-hidden relative" style={{ borderColor: brandColors.goldPrestige, background: `linear-gradient(135deg, ${brandColors.goldPrestige}10, ${brandColors.skyBlue}10)` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(pendingNominees[0]?.avatar_url || pendingNominees[0]?.photo_url) ? (
                  <img src={pendingNominees[0].avatar_url || pendingNominees[0].photo_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: brandColors.navyDeep }}>
                    {pendingNominees[0]?.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium" style={{ color: brandColors.goldPrestige }}>
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Up Next
                  </p>
                  <h3 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>{pendingNominees[0]?.name}</h3>
                  <p className="text-sm text-gray-600">{pendingNominees[0]?.title}</p>
                </div>
              </div>
              <Button
                onClick={() => setSelectedNominee(pendingNominees[0])}
                className="gap-2 px-6 py-6 text-lg"
                style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` }}
              >
                Start Evaluation
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
          <Clock className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
          Review Queue ({pendingNominees.length})
        </h2>
        <div className="grid gap-3">
          {pendingNominees.map((nominee, idx) => (
            <motion.div
              key={nominee.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * Math.min(idx, 5) }}
            >
              <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-[var(--goldPrestige)]" style={{ '--goldPrestige': brandColors.goldPrestige }} onClick={() => setSelectedNominee(nominee)}>
                <div className="flex items-center gap-4">
                  {(nominee.avatar_url || nominee.photo_url) ? (
                    <img src={nominee.avatar_url || nominee.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: brandColors.navyDeep }}>
                      {nominee.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate" style={{ color: brandColors.navyDeep }}>
                      {nominee.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{nominee.title} {nominee.company && `at ${nominee.company}`}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: brandColors.goldPrestige }}>
                    <Zap className="w-4 h-4" />
                    <span>+150 XP</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--goldPrestige)] transition-colors" style={{ '--goldPrestige': brandColors.goldPrestige }} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Completed Evaluations */}
      {myEvaluations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completed Evaluations ({myEvaluations.length})
          </h2>
          <div className="grid gap-3">
            {myEvaluations.map((evaluation, idx) => {
              const nominee = nominees.find(n => n.id === evaluation.nominee_id);
              if (!nominee) return null;
              const avgScore = Math.round((evaluation.impact_score + evaluation.leadership_score + evaluation.innovation_score + evaluation.community_score + evaluation.trajectory_score) / 5 * 10) / 10;
              return (
                <motion.div
                  key={evaluation.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * Math.min(idx, 10) }}
                >
                  <Card className="p-4 bg-green-50/50 border border-green-200">
                    <div className="flex items-center gap-4">
                      {(nominee.avatar_url || nominee.photo_url) ? (
                        <img src={nominee.avatar_url || nominee.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: brandColors.navyDeep }}>
                          {nominee.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate" style={{ color: brandColors.navyDeep }}>
                          {nominee.name}
                        </h3>
                        <div className="flex gap-3 text-xs text-gray-600 mt-1">
                          <span>Avg: <strong>{avgScore}</strong></span>
                          <span>•</span>
                          <span>{evaluation.overall_recommendation?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-center px-3 py-1 rounded-full bg-green-100">
                          <span className="text-sm font-bold text-green-700">+150 XP</span>
                        </div>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}