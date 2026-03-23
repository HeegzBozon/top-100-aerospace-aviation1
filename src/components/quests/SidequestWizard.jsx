import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Users, 
  Heart, 
  Lightbulb, 
  MessageSquare, 
  Trophy,
  Star,
  Zap,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Scroll,
  Crown,
  Shield
} from 'lucide-react';

const QUEST_GIVER_PERSONAS = [
  {
    id: 'mentor',
    name: 'The Wise Mentor',
    icon: <Crown className="w-8 h-8" />,
    description: 'A seasoned guide who helps others grow and develop their skills',
    color: 'from-amber-500 to-orange-500',
    greeting: 'Greetings, seeker! I have wisdom to share through challenges...'
  },
  {
    id: 'scout',
    name: 'The Explorer Scout',
    icon: <Shield className="w-8 h-8" />,
    description: 'An adventurous spirit who discovers new opportunities and paths',
    color: 'from-green-500 to-emerald-500',
    greeting: 'Ho there, adventurer! I\'ve spotted something that needs doing...'
  },
  {
    id: 'hero',
    name: 'The Champion Hero',
    icon: <Trophy className="w-8 h-8" />,
    description: 'A celebrated figure who inspires others to achieve greatness',
    color: 'from-purple-500 to-indigo-500',
    greeting: 'Noble soul! Join me in a quest that shall bring honor to all...'
  }
];

const QUEST_TYPES = [
  {
    id: 'community',
    name: 'Community Building',
    icon: <Users className="w-6 h-6" />,
    description: 'Bring people together and strengthen our bonds',
    color: 'bg-blue-100 text-blue-800',
    examples: ['Host a team event', 'Start a discussion thread', 'Welcome new members']
  },
  {
    id: 'mentorship',
    name: 'Mentorship & Growth',
    icon: <Heart className="w-6 h-6" />,
    description: 'Help others learn, grow, and develop their skills',
    color: 'bg-pink-100 text-pink-800',
    examples: ['Share expertise', 'Review someone\'s work', 'Teach a skill']
  },
  {
    id: 'creative',
    name: 'Creative Innovation',
    icon: <Lightbulb className="w-6 h-6" />,
    description: 'Generate new ideas and creative solutions',
    color: 'bg-yellow-100 text-yellow-800',
    examples: ['Brainstorm solutions', 'Design something new', 'Prototype an idea']
  },
  {
    id: 'feedback',
    name: 'Feedback & Improvement',
    icon: <MessageSquare className="w-6 h-6" />,
    description: 'Help improve processes, products, or experiences',
    color: 'bg-green-100 text-green-800',
    examples: ['Test a feature', 'Review documentation', 'Suggest improvements']
  }
];

const DIFFICULTY_TEMPLATES = {
  common: { stardust: [5, 15], clout: [2, 8], description: 'A simple task that can be completed quickly' },
  skillful: { stardust: [15, 35], clout: [8, 20], description: 'A moderate challenge requiring some expertise' },
  epic: { stardust: [35, 75], clout: [20, 50], description: 'A significant undertaking with major impact' }
};

export default function SidequestWizard({ isOpen, onClose, onQuestCreated }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [questData, setQuestData] = useState({
    persona: null,
    type: null,
    title: '',
    description: '',
    difficulty: 'skillful',
    stardust_reward: 25,
    clout_reward: 10,
    requirements: []
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePersonaSelect = (persona) => {
    setQuestData({ ...questData, persona });
    setTimeout(handleNext, 500); // Auto-advance after selection
  };

  const handleTypeSelect = (type) => {
    setQuestData({ ...questData, type });
    setTimeout(handleNext, 500); // Auto-advance after selection
  };

  const generateQuestTemplate = () => {
    const templates = {
      community: {
        titles: [
          'Forge New Connections',
          'Unite the Fellowship',
          'Gather the Tribe',
          'Bridge Builder\'s Challenge'
        ],
        descriptions: [
          'Rally your colleagues and create meaningful connections that strengthen our community bonds.',
          'Bring people together for a shared experience that builds lasting relationships.',
          'Foster collaboration and camaraderie among team members through engaging activities.'
        ]
      },
      mentorship: {
        titles: [
          'Wisdom Keeper\'s Duty',
          'Guide the Next Generation',
          'Share the Sacred Knowledge',
          'Mentor\'s Noble Calling'
        ],
        descriptions: [
          'Pass on your hard-earned wisdom to help others grow and develop their potential.',
          'Take someone under your wing and guide them through challenges with your expertise.',
          'Share your knowledge and experience to empower others on their journey.'
        ]
      },
      creative: {
        titles: [
          'Spark of Innovation',
          'Creator\'s Vision Quest',
          'Forge Something New',
          'Inventor\'s Challenge'
        ],
        descriptions: [
          'Channel your creativity to solve problems in novel and innovative ways.',
          'Design, build, or conceptualize something that hasn\'t existed before.',
          'Use your imagination to create solutions that inspire and delight others.'
        ]
      },
      feedback: {
        titles: [
          'Quality Guardian\'s Mission',
          'Path of Improvement',
          'Excellence Seeker\'s Quest',
          'Refinement Ritual'
        ],
        descriptions: [
          'Help improve our processes, products, or experiences through thoughtful feedback.',
          'Test, review, and provide insights that make everything better for everyone.',
          'Be the critical eye that ensures quality and continuous improvement.'
        ]
      }
    };

    if (questData.type && templates[questData.type.id]) {
      const typeTemplates = templates[questData.type.id];
      const randomTitle = typeTemplates.titles[Math.floor(Math.random() * typeTemplates.titles.length)];
      const randomDesc = typeTemplates.descriptions[Math.floor(Math.random() * typeTemplates.descriptions.length)];
      
      setQuestData({
        ...questData,
        title: randomTitle,
        description: randomDesc
      });
    }
  };

  const adjustRewards = (difficulty) => {
    const template = DIFFICULTY_TEMPLATES[difficulty];
    const midStardust = Math.floor((template.stardust[0] + template.stardust[1]) / 2);
    const midClout = Math.floor((template.clout[0] + template.clout[1]) / 2);
    
    setQuestData({
      ...questData,
      difficulty,
      stardust_reward: midStardust,
      clout_reward: midClout
    });
  };

  const handleCreateQuest = async () => {
    try {
      const finalQuestData = {
        title: questData.title,
        description: questData.description,
        type: 'community', // Default type for now
        category: questData.type?.id || 'community',
        difficulty: questData.difficulty,
        stardust_reward: questData.stardust_reward,
        clout_reward: questData.clout_reward,
        requirements: [
          {
            action: 'custom_action',
            target: 1,
            context: questData.type?.id
          }
        ],
        is_active: true,
        priority_score: questData.difficulty === 'epic' ? 100 : questData.difficulty === 'skillful' ? 50 : 25
      };

      await onQuestCreated(finalQuestData);
      onClose();
      
      // Reset wizard state
      setCurrentStep(1);
      setQuestData({
        persona: null,
        type: null,
        title: '',
        description: '',
        difficulty: 'skillful',
        stardust_reward: 25,
        clout_reward: 10,
        requirements: []
      });
    } catch (error) {
      console.error('Error creating quest:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="mb-8">
              <Wand2 className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Quest-Giver Persona</h2>
              <p className="text-gray-600">Who will you be in this tale? Your persona shapes how you'll guide others.</p>
            </div>
            
            <div className="grid gap-4">
              {QUEST_GIVER_PERSONAS.map((persona) => (
                <Card 
                  key={persona.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                    questData.persona?.id === persona.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                  }`}
                  onClick={() => handlePersonaSelect(persona)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${persona.color} text-white shadow-lg`}>
                        {persona.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-lg text-gray-900">{persona.name}</h3>
                        <p className="text-gray-600 mt-1">{persona.description}</p>
                        <p className="text-sm text-purple-600 italic mt-3">"{persona.greeting}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-6">
            <div className="mb-8">
              <Scroll className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Quest Type</h2>
              <p className="text-gray-600">What kind of adventure will you create for your fellow community members?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {QUEST_TYPES.map((type) => (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                    questData.type?.id === type.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
                  }`}
                  onClick={() => handleTypeSelect(type)}
                >
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className={`p-3 rounded-lg ${type.color}`}>
                          {type.icon}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{type.name}</h3>
                      <p className="text-gray-600 text-sm">{type.description}</p>
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2">Examples:</p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {type.examples.map((example, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Craft Your Quest</h2>
              <p className="text-gray-600">Define the details of your adventure. What will brave souls accomplish?</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <Button 
                onClick={generateQuestTemplate} 
                variant="outline" 
                className="w-full border-dashed border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Quest Ideas
              </Button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quest Title</label>
                <Input
                  placeholder="Enter your quest title..."
                  value={questData.title}
                  onChange={(e) => setQuestData({ ...questData, title: e.target.value })}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quest Description</label>
                <Textarea
                  placeholder="Describe what adventurers need to accomplish..."
                  value={questData.description}
                  onChange={(e) => setQuestData({ ...questData, description: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>

              {questData.persona && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${questData.persona.color} text-white`}>
                      {questData.persona.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Speaking as {questData.persona.name}</p>
                      <p className="text-sm text-purple-700 italic">"{questData.persona.greeting}"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set the Rewards</h2>
              <p className="text-gray-600">What treasures await those who complete your quest?</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Quest Difficulty</label>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(DIFFICULTY_TEMPLATES).map(([key, template]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all duration-200 border-2 ${
                        questData.difficulty === key ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200'
                      }`}
                      onClick={() => adjustRewards(key)}
                    >
                      <CardContent className="p-4 text-center">
                        <Badge className={`mb-3 ${
                          key === 'common' ? 'bg-blue-100 text-blue-800' :
                          key === 'skillful' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {key}
                        </Badge>
                        <p className="text-xs text-gray-600">{template.description}</p>
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-amber-500" />
                            {template.stardust[0]}-{template.stardust[1]}
                          </div>
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <Zap className="w-3 h-3 text-purple-500" />
                            {template.clout[0]}-{template.clout[1]}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stardust Reward</label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <Input
                      type="number"
                      min={DIFFICULTY_TEMPLATES[questData.difficulty].stardust[0]}
                      max={DIFFICULTY_TEMPLATES[questData.difficulty].stardust[1]}
                      value={questData.stardust_reward}
                      onChange={(e) => setQuestData({ ...questData, stardust_reward: parseInt(e.target.value) })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clout Reward</label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500" />
                    <Input
                      type="number"
                      min={DIFFICULTY_TEMPLATES[questData.difficulty].clout[0]}
                      max={DIFFICULTY_TEMPLATES[questData.difficulty].clout[1]}
                      value={questData.clout_reward}
                      onChange={(e) => setQuestData({ ...questData, clout_reward: parseInt(e.target.value) })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2">Reward Preview</h4>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-amber-700">{questData.stardust_reward}</span>
                    <span className="text-amber-600">Stardust</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span className="font-bold text-purple-700">{questData.clout_reward}</span>
                    <span className="text-purple-600">Clout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-rainbow animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quest Preview</h2>
              <p className="text-gray-600">Review your creation before releasing it to the world!</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${questData.type?.color.replace('bg-', 'from-').replace('text-', 'to-')}-500`}>
                        {questData.type?.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{questData.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className={questData.difficulty === 'common' ? 'bg-blue-100 text-blue-800' : questData.difficulty === 'skillful' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}>
                            {questData.difficulty}
                          </Badge>
                          <Badge variant="outline">{questData.type?.name}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-amber-600 font-medium mb-1">
                        <Star className="w-4 h-4" /> {questData.stardust_reward}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-purple-600 font-medium">
                        <Zap className="w-4 h-4" /> {questData.clout_reward}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{questData.description}</p>
                  
                  {questData.persona && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${questData.persona.color} text-white`}>
                          {questData.persona.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Created by {questData.persona.name}</p>
                          <p className="text-sm text-purple-700 italic">"{questData.persona.greeting}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6 text-center">
                <Button 
                  onClick={handleCreateQuest}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Release Quest to the World!
                </Button>
                <p className="text-sm text-gray-500 mt-2">Your quest will be immediately available for others to accept</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-600" />
            Sidequest Wizard - Step {currentStep} of {totalSteps}
          </DialogTitle>
          <Progress value={progress} className="w-full mt-2" />
        </DialogHeader>

        <div className="py-6">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !questData.persona) ||
                (currentStep === 2 && !questData.type) ||
                (currentStep === 3 && (!questData.title || !questData.description))
              }
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div /> // Empty div to maintain spacing
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}