import React, { useState, useEffect } from 'react';
import { Quest } from '@/entities/Quest';
import { UserQuest } from '@/entities/UserQuest';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, ChevronRight, CheckCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuestStrip() {
  const [activeQuests, setActiveQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestData();
  }, []);

  const loadQuestData = async () => {
    try {
      const user = await User.me();
      const userQuests = await UserQuest.filter({ user_email: user.email });
      
      const active = userQuests.filter(uq => ['accepted', 'in_progress'].includes(uq.status));
      const completed = userQuests.filter(uq => uq.status === 'completed');
      
      // Load quest details for active and completed quests
      const questIds = [...active, ...completed].map(uq => uq.quest_id);
      const quests = await Promise.all(questIds.map(id => Quest.get(id)));
      
      // Merge quest data with user quest data
      const activeWithQuests = active.map(uq => ({
        ...uq,
        quest: quests.find(q => q.id === uq.quest_id)
      })).filter(item => item.quest);
      
      const completedWithQuests = completed.map(uq => ({
        ...uq,
        quest: quests.find(q => q.id === uq.quest_id)
      })).filter(item => item.quest);

      setCurrentUser(user);
      setActiveQuests(activeWithQuests);
      setCompletedQuests(completedWithQuests);
    } catch (error) {
      console.error('Error loading quest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (userQuest) => {
    if (!userQuest.progress) return 0;
    const totalRequirements = userQuest.quest.requirements.length;
    const completedRequirements = userQuest.progress.filter(p => p.completed).length;
    return Math.round((completedRequirements / totalRequirements) * 100);
  };

  if (loading || (!activeQuests.length && !completedQuests.length)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-lg mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <h3 className="font-bold">Quest Progress</h3>
        </div>
        <Link to={createPageUrl('Quests')}>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {/* Active Quests */}
        {activeQuests.slice(0, 2).map((userQuest) => (
          <div key={userQuest.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{userQuest.quest.title}</span>
                <Badge variant="outline" className="text-xs text-white border-white/30">
                  {userQuest.quest.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {userQuest.quest.stardust_reward}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {userQuest.quest.clout_reward}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={getProgress(userQuest)} className="flex-1 h-2" />
              <span className="text-xs font-medium">{getProgress(userQuest)}%</span>
            </div>
          </div>
        ))}

        {/* Completed Quests Ready to Claim */}
        {completedQuests.slice(0, 1).map((userQuest) => (
          <div key={userQuest.id} className="bg-green-500/20 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span className="font-medium text-sm">{userQuest.quest.title}</span>
                <Badge className="text-xs bg-green-500 text-white">
                  Ready to Claim
                </Badge>
              </div>
              <Link to={createPageUrl('Quests')}>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  Claim Rewards
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {activeQuests.length === 0 && completedQuests.length === 0 && (
        <div className="text-center py-4">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-60" />
          <p className="text-sm opacity-80 mb-2">No active quests</p>
          <Link to={createPageUrl('Quests')}>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              Browse Quests
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}