import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Check, Star, Trophy, Target, GripVertical } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const difficultyStyles = {
  common: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: <Star className="w-4 h-4" />
  },
  skillful: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: <Trophy className="w-4 h-4" />
  },
  epic: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: <Sparkles className="w-4 h-4" />
  },
};

export default function QuestCard({ quest, userQuest, onAccept, isDragging = false }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const style = difficultyStyles[quest.difficulty] || difficultyStyles.common;
  const isCompleted = userQuest && userQuest.status === 'completed';
  const isInProgress = userQuest && ['accepted', 'in_progress'].includes(userQuest.status);

  const handleAccept = async (e) => {
    e.stopPropagation(); // Prevent drag when clicking button
    if (loading) return;
    setLoading(true);
    try {
      await onAccept(quest.id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Accept Quest",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getProgress = () => {
    if (!isInProgress || !userQuest?.progress || userQuest.progress.length === 0) return 0;
    const totalRequirements = quest.requirements?.length || 0;
    if (totalRequirements === 0) return 0;
    const completedRequirements = userQuest.progress.filter(p => p.completed).length;
    return Math.round((completedRequirements / totalRequirements) * 100);
  };

  const progress = getProgress();

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${
      isDragging 
        ? 'shadow-2xl border-[var(--accent)] bg-[var(--card)] rotate-3 scale-105' 
        : `${style.border} ${style.bg} hover:shadow-lg hover:-translate-y-1`
    } p-6 flex flex-col justify-between gap-4`}>
      
      {/* Drag Handle */}
      <div className="absolute top-2 right-2 opacity-30 hover:opacity-60">
        <GripVertical className="w-4 h-4 text-[var(--muted)]" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pr-6">
          <Badge variant="outline" className={`capitalize ${style.text} ${style.border} bg-transparent`}>
            {style.icon}
            <span className="ml-2">{quest.difficulty} {quest.type}</span>
          </Badge>
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="text-yellow-400 flex items-center gap-1">
              <Star className="w-3 h-3" /> {quest.stardust_reward}
            </span>
            <span className="text-cyan-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> {quest.clout_reward}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-[var(--text)] pr-6">{quest.title}</h3>
        <p className="text-sm text-[var(--muted)] line-clamp-2">{quest.description}</p>
        
        {quest.requirements && quest.requirements.length > 0 && (
          <ul className="text-xs text-[var(--muted)] space-y-1 mt-2">
            {quest.requirements.map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                <Target className="w-3 h-3 text-[var(--accent)] flex-shrink-0" />
                <span>{req.target} {req.action?.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        {isCompleted ? (
          <div className="w-full p-3 rounded-lg bg-green-500/20 text-green-400 text-center font-medium flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Completed!
          </div>
        ) : isInProgress ? (
          <div>
            <div className="flex justify-between items-center text-sm text-[var(--muted)] mb-2">
              <span>In Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleAccept} 
            disabled={loading} 
            className="w-full"
            size="sm"
          >
            {loading ? 'Accepting...' : 'Accept Quest'}
          </Button>
        )}
      </div>
    </div>
  );
}