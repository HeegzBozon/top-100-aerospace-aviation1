import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Feather, ChevronRight, FileText, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

const TOTAL_PROMPTS = 15; // 5 categories x 3 prompts each

export default function BiographerWidget({ user }) {
  // Fetch user's story fragments
  const { data: fragments = [] } = useQuery({
    queryKey: ['story-fragments', user?.email],
    queryFn: () => base44.entities.StoryFragment.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  // Fetch user's generated narratives
  const { data: narratives = [] } = useQuery({
    queryKey: ['generated-narratives', user?.email],
    queryFn: () => base44.entities.GeneratedNarrative.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const progress = Math.round((fragments.length / TOTAL_PROMPTS) * 100);
  const hasStarted = fragments.length > 0;
  const hasNarratives = narratives.length > 0;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-semibold" style={{ color: brandColors.navyDeep }}>
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            Biographer
          </div>
          {hasStarted && (
            <span className="text-xs font-normal text-gray-500">
              {fragments.length}/{TOTAL_PROMPTS} prompts
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasStarted && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1.5" />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Story Progress</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-600">
          {hasStarted 
            ? 'Continue building your aerospace story through guided prompts.'
            : 'Discover, structure, and publish your professional narrative through guided prompts.'}
        </p>

        {/* Quick Stats */}
        {hasStarted && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-center">
              <div className="text-lg font-bold text-blue-700">{fragments.length}</div>
              <div className="text-[10px] text-blue-600">Fragments</div>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 text-center">
              <div className="text-lg font-bold text-purple-700">{narratives.length}</div>
              <div className="text-[10px] text-purple-600">Narratives</div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Link to={createPageUrl('Biographer')}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 rounded-xl border-2 transition-all hover:shadow-md flex items-center justify-between"
            style={{ 
              borderColor: brandColors.goldPrestige + '60', 
              background: `linear-gradient(135deg, ${brandColors.goldPrestige}10, ${brandColors.skyBlue}10)` 
            }}
          >
            <div className="flex items-center gap-3">
              {hasStarted ? (
                <Clock className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
              ) : (
                <Sparkles className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              )}
              <span className="font-medium text-sm" style={{ color: brandColors.navyDeep }}>
                {hasStarted ? 'Continue Your Story' : 'Start Your Story'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </motion.button>
        </Link>

        {/* Output formats hint */}
        {hasStarted && !hasNarratives && fragments.length >= 3 && (
          <p className="text-[10px] text-center" style={{ color: brandColors.skyBlue }}>
            💡 You have enough fragments to generate narratives!
          </p>
        )}
      </CardContent>
    </Card>
  );
}