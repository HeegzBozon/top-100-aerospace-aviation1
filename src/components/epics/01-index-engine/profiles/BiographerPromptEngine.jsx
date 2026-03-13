import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

const PROMPT_CATEGORIES = {
  foundations: {
    label: 'Foundations',
    icon: '🌱',
    era: 'early_career',
    prompts: [
      { id: 'f1', text: 'Where did your journey into aerospace/aviation begin?' },
      { id: 'f2', text: 'What problem or curiosity first pulled you into this field?' },
      { id: 'f3', text: 'Who or what inspired you to pursue this path?' },
    ]
  },
  inflection_points: {
    label: 'Inflection Points',
    icon: '⚡',
    era: 'transition',
    prompts: [
      { id: 'i1', text: 'Describe a moment that changed your trajectory.' },
      { id: 'i2', text: 'Tell us about a failure, setback, or hard decision you faced.' },
      { id: 'i3', text: 'What risk did you take that mattered most?' },
    ]
  },
  impact: {
    label: 'Impact',
    icon: '🚀',
    era: 'breakthrough',
    prompts: [
      { id: 'p1', text: 'What have you actually built, changed, or influenced?' },
      { id: 'p2', text: 'Who benefited from your work and how?' },
      { id: 'p3', text: 'What\'s your proudest professional achievement?' },
    ]
  },
  leadership: {
    label: 'Leadership & Community',
    icon: '🤝',
    era: 'leadership',
    prompts: [
      { id: 'l1', text: 'How do you support or elevate others in your field?' },
      { id: 'l2', text: 'What responsibility do you feel toward the aerospace community?' },
      { id: 'l3', text: 'How do you approach mentorship or team building?' },
    ]
  },
  future_arc: {
    label: 'Future Arc',
    icon: '🔮',
    era: 'future',
    prompts: [
      { id: 'a1', text: 'What are you building toward next?' },
      { id: 'a2', text: 'What does "impact" mean to you now?' },
      { id: 'a3', text: 'What legacy do you want to leave?' },
    ]
  }
};

const PROMPT_CATEGORIES_DATA = PROMPT_CATEGORIES;

export default function BiographerPromptEngine({ onSaveFragment, existingFragments = [], onComplete }) {
  const [currentCategory, setCurrentCategory] = useState('foundations');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [currentResponse, setCurrentResponse] = useState('');

  const categories = Object.keys(PROMPT_CATEGORIES);
  const categoryIndex = categories.indexOf(currentCategory);
  const category = PROMPT_CATEGORIES[currentCategory];
  const currentPrompt = category.prompts[currentPromptIndex];
  
  // Check if this prompt already has a saved fragment
  const existingFragment = existingFragments.find(f => f.prompt_id === currentPrompt.id);
  
  // Calculate total progress
  const totalPrompts = categories.reduce((sum, cat) => sum + PROMPT_CATEGORIES[cat].prompts.length, 0);
  const answeredPrompts = Object.keys(responses).length + existingFragments.length;
  const progressPercent = (answeredPrompts / totalPrompts) * 100;

  const handleSave = async () => {
    if (!currentResponse.trim()) return;
    
    const fragment = {
      prompt_id: currentPrompt.id,
      prompt_category: currentCategory,
      prompt_text: currentPrompt.text,
      content: currentResponse,
      timeline_era: category.era,
      timeline_order: categoryIndex * 10 + currentPromptIndex,
    };
    
    await onSaveFragment(fragment);
    setResponses(prev => ({ ...prev, [currentPrompt.id]: currentResponse }));
    setCurrentResponse('');
    
    // Move to next prompt
    if (currentPromptIndex < category.prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else if (categoryIndex < categories.length - 1) {
      setCurrentCategory(categories[categoryIndex + 1]);
      setCurrentPromptIndex(0);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    if (currentPromptIndex < category.prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else if (categoryIndex < categories.length - 1) {
      setCurrentCategory(categories[categoryIndex + 1]);
      setCurrentPromptIndex(0);
    }
    setCurrentResponse('');
  };

  const handleBack = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    } else if (categoryIndex > 0) {
      const prevCategory = categories[categoryIndex - 1];
      setCurrentCategory(prevCategory);
      setCurrentPromptIndex(PROMPT_CATEGORIES[prevCategory].prompts.length - 1);
    }
    setCurrentResponse('');
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Story Progress</span>
          <span>{answeredPrompts} of {totalPrompts} prompts</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat, idx) => {
          const catData = PROMPT_CATEGORIES[cat];
          const isActive = cat === currentCategory;
          const isComplete = existingFragments.filter(f => f.prompt_category === cat).length === catData.prompts.length;
          
          return (
            <button
              key={cat}
              onClick={() => { setCurrentCategory(cat); setCurrentPromptIndex(0); setCurrentResponse(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-[#1e3a5a] text-white' 
                  : isComplete 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{catData.icon}</span>
              <span>{catData.label}</span>
              {isComplete && <Check className="w-3 h-3" />}
            </button>
          );
        })}
      </div>

      {/* Current Prompt Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPrompt.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6 rounded-2xl border-2"
          style={{ borderColor: brandColors.goldPrestige + '40', background: brandColors.goldPrestige + '08' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: brandColors.skyBlue }}>
                {category.label} · Prompt {currentPromptIndex + 1} of {category.prompts.length}
              </p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-4" style={{ color: brandColors.navyDeep }}>
            {currentPrompt.text}
          </h3>

          {existingFragment ? (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Already answered</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">{existingFragment.content}</p>
            </div>
          ) : (
            <Textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Take your time. There's no wrong answer—just your story..."
              className="min-h-[150px] resize-none text-base"
            />
          )}

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={categoryIndex === 0 && currentPromptIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <div className="flex gap-2">
              {!existingFragment && (
                <Button variant="outline" size="sm" onClick={handleSkip}>
                  Skip for now
                </Button>
              )}
              
              {existingFragment ? (
                <Button size="sm" onClick={handleSkip} style={{ background: brandColors.navyDeep }}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!currentResponse.trim()}
                  style={{ background: brandColors.goldPrestige }}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Save & Continue
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export { PROMPT_CATEGORIES_DATA as PROMPT_CATEGORIES };