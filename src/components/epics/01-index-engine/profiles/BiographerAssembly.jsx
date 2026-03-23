import { useState } from 'react';
import { FileText, Linkedin, Newspaper, Quote, Award, User, Loader2, RefreshCw, Copy, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

const FORMAT_CONFIG = {
  short_bio: {
    label: 'Short Bio',
    description: '150-300 words for quick intros',
    icon: User,
    wordTarget: '150-300',
    prompt: 'Write a compelling short professional bio (150-300 words) that captures the essence of this person\'s aerospace/aviation journey. Focus on key achievements and current role. Make it engaging and human, not a resume.'
  },
  full_profile: {
    label: 'Full Profile Story',
    description: 'Complete narrative arc',
    icon: FileText,
    wordTarget: '500-800',
    prompt: 'Write a comprehensive profile story (500-800 words) that tells this person\'s full aerospace/aviation journey. Include their origins, key inflection points, major achievements, leadership philosophy, and future vision. Make it narrative and compelling.'
  },
  nomination: {
    label: 'Nomination Narrative',
    description: 'For TOP 100 nominations',
    icon: Award,
    wordTarget: '300-500',
    prompt: 'Write a nomination narrative (300-500 words) that makes a compelling case for why this person deserves recognition in the TOP 100 Women in Aerospace & Aviation. Focus on impact, leadership, and unique contributions.'
  },
  press_bio: {
    label: 'Press-Ready Bio',
    description: 'For media & speaking',
    icon: Newspaper,
    wordTarget: '200-350',
    prompt: 'Write a press-ready professional bio (200-350 words) suitable for media kits, conference programs, and speaking engagements. Third person, achievement-focused, with current role and notable accomplishments.'
  },
  linkedin_about: {
    label: 'LinkedIn About',
    description: 'For your LinkedIn profile',
    icon: Linkedin,
    wordTarget: '200-300',
    prompt: 'Write a LinkedIn About section (200-300 words) that\'s authentic, engaging, and professional. First person voice, conversational but credible. Include a hook, career journey highlights, and what drives them.'
  },
  quote_pulls: {
    label: 'Quote Pulls',
    description: 'Shareable quotes from your story',
    icon: Quote,
    wordTarget: '5-10 quotes',
    prompt: 'Extract 5-10 powerful, shareable quotes from this person\'s story. Each quote should be 1-2 sentences that capture wisdom, insight, or memorable moments. Format as a list.'
  },
};

export default function BiographerAssembly({ fragments, narratives, onSaveNarrative, onUpdateNarrative, userName }) {
  const [generating, setGenerating] = useState(null);
  const [editingFormat, setEditingFormat] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [copiedFormat, setCopiedFormat] = useState(null);

  const generateNarrative = async (format) => {
    if (fragments.length === 0) {
      toast.error('Add some story fragments first before generating narratives');
      return;
    }

    setGenerating(format);
    try {
      const config = FORMAT_CONFIG[format];
      const fragmentTexts = fragments
        .sort((a, b) => (a.timeline_order || 0) - (b.timeline_order || 0))
        .map(f => `[${f.prompt_category}] Q: ${f.prompt_text}\nA: ${f.content}`)
        .join('\n\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${config.prompt}\n\nPerson's Name: ${userName || 'the subject'}\n\nStory Fragments:\n${fragmentTexts}`,
        response_json_schema: {
          type: 'object',
          properties: {
            narrative: { type: 'string' },
            word_count: { type: 'number' }
          }
        }
      });

      await onSaveNarrative({
        format,
        title: config.label,
        content: response.narrative,
        word_count: response.word_count || response.narrative.split(/\s+/).length,
        fragment_ids: fragments.map(f => f.id),
      });

      toast.success(`${config.label} generated successfully!`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate narrative');
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = (content, format) => {
    navigator.clipboard.writeText(content);
    setCopiedFormat(format);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleEdit = (format, content) => {
    setEditingFormat(format);
    setEditContent(content);
  };

  const handleSaveEdit = async (narrativeId) => {
    await onUpdateNarrative(narrativeId, { 
      content: editContent,
      word_count: editContent.split(/\s+/).length 
    });
    setEditingFormat(null);
    setEditContent('');
    toast.success('Narrative updated!');
  };

  const handleLock = async (narrative) => {
    await onUpdateNarrative(narrative.id, { is_locked: !narrative.is_locked });
    toast.success(narrative.is_locked ? 'Narrative unlocked' : 'Narrative locked');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2" style={{ color: brandColors.navyDeep }}>
          Narrative Assembly
        </h2>
        <p className="text-sm text-gray-600">
          Generate polished narratives from your story fragments. One story → many formats.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(FORMAT_CONFIG).map(([format, config]) => {
          const Icon = config.icon;
          const existing = narratives.find(n => n.format === format);
          const isGenerating = generating === format;
          const isEditing = editingFormat === format;

          return (
            <Card key={format} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: brandColors.goldPrestige + '20' }}>
                      <Icon className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                    </div>
                    <div>
                      <span style={{ color: brandColors.navyDeep }}>{config.label}</span>
                      <p className="text-xs font-normal text-gray-500">{config.wordTarget} words</p>
                    </div>
                  </div>
                  {existing?.is_locked && <Lock className="w-4 h-4 text-amber-500" />}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-2">
                {!existing ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-500 mb-3">{config.description}</p>
                    <Button
                      size="sm"
                      onClick={() => generateNarrative(format)}
                      disabled={isGenerating || fragments.length === 0}
                      style={{ background: brandColors.skyBlue }}
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </div>
                ) : isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[200px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingFormat(null)} className="flex-1">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(existing.id)} className="flex-1"
                        style={{ background: brandColors.goldPrestige }}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg max-h-[150px] overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{existing.content}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {existing.word_count || existing.content.split(/\s+/).length} words
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleCopy(existing.content, format)}
                        >
                          {copiedFormat === format ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEdit(format, existing.content)}
                          disabled={existing.is_locked}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleLock(existing)}
                        >
                          {existing.is_locked ? (
                            <Lock className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => generateNarrative(format)}
                          disabled={isGenerating || existing.is_locked}
                        >
                          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}