import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Feather, MessageSquare, Clock, FileText, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import BiographerPromptEngine from '@/components/epics/01-index-engine/profiles/BiographerPromptEngine';
import BiographerTimeline from '@/components/epics/01-index-engine/profiles/BiographerTimeline';
import BiographerAssembly from '@/components/epics/01-index-engine/profiles/BiographerAssembly';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

export default function Biographer() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('interview');

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch story fragments
  const { data: fragments = [], isLoading: loadingFragments } = useQuery({
    queryKey: ['story-fragments', user?.email],
    queryFn: () => base44.entities.StoryFragment.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  // Fetch generated narratives
  const { data: narratives = [], isLoading: loadingNarratives } = useQuery({
    queryKey: ['generated-narratives', user?.email],
    queryFn: () => base44.entities.GeneratedNarrative.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  // Save fragment mutation
  const saveFragmentMutation = useMutation({
    mutationFn: async (fragmentData) => {
      // Check if fragment for this prompt already exists
      const existing = fragments.find(f => f.prompt_id === fragmentData.prompt_id);
      if (existing) {
        return base44.entities.StoryFragment.update(existing.id, fragmentData);
      }
      return base44.entities.StoryFragment.create({
        ...fragmentData,
        user_email: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-fragments'] });
      toast.success('Fragment saved!');
    },
  });

  // Update fragment mutation
  const updateFragmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StoryFragment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-fragments'] });
    },
  });

  // Delete fragment mutation
  const deleteFragmentMutation = useMutation({
    mutationFn: (id) => base44.entities.StoryFragment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-fragments'] });
      toast.success('Fragment deleted');
    },
  });

  // Save narrative mutation
  const saveNarrativeMutation = useMutation({
    mutationFn: async (narrativeData) => {
      const existing = narratives.find(n => n.format === narrativeData.format);
      if (existing) {
        return base44.entities.GeneratedNarrative.update(existing.id, {
          ...narrativeData,
          version: (existing.version || 1) + 1,
        });
      }
      return base44.entities.GeneratedNarrative.create({
        ...narrativeData,
        user_email: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-narratives'] });
    },
  });

  // Update narrative mutation
  const updateNarrativeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GeneratedNarrative.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-narratives'] });
    },
  });

  const handlePromptComplete = () => {
    toast.success('Great progress! Check the Timeline to organize your story.');
    setActiveTab('timeline');
  };

  if (loadingFragments || loadingNarratives) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Feather className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: brandColors.cream }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Passport')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.skyBlue})` }}>
              <Feather className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                Biographer
              </h1>
              <p className="text-sm text-gray-600">
                Your guided story engine for legacy-grade narratives
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="interview" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Interview</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="assembly" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Outputs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interview" className="mt-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <BiographerPromptEngine
                existingFragments={fragments}
                onSaveFragment={(data) => saveFragmentMutation.mutateAsync(data)}
                onComplete={handlePromptComplete}
              />
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {fragments.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-semibold mb-2" style={{ color: brandColors.navyDeep }}>
                    No story fragments yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Complete some interview prompts to build your timeline
                  </p>
                  <Button onClick={() => setActiveTab('interview')} style={{ background: brandColors.goldPrestige }}>
                    Start Interview
                  </Button>
                </div>
              ) : (
                <BiographerTimeline
                  fragments={fragments}
                  onUpdateFragment={(id, data) => updateFragmentMutation.mutate({ id, data })}
                  onDeleteFragment={(id) => deleteFragmentMutation.mutate(id)}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="assembly" className="mt-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <BiographerAssembly
                fragments={fragments}
                narratives={narratives}
                userName={user?.full_name}
                onSaveNarrative={(data) => saveNarrativeMutation.mutateAsync(data)}
                onUpdateNarrative={(id, data) => updateNarrativeMutation.mutateAsync({ id, data })}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats Footer */}
        <div className="mt-8 p-4 rounded-xl bg-white/60 border border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="font-bold" style={{ color: brandColors.navyDeep }}>{fragments.length}</span>
                <span className="text-gray-500 ml-1">fragments</span>
              </div>
              <div>
                <span className="font-bold" style={{ color: brandColors.navyDeep }}>{narratives.length}</span>
                <span className="text-gray-500 ml-1">narratives</span>
              </div>
            </div>
            {fragments.length >= 3 && narratives.length === 0 && (
              <Button 
                size="sm" 
                onClick={() => setActiveTab('assembly')}
                style={{ background: brandColors.skyBlue }}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Generate Narratives
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}