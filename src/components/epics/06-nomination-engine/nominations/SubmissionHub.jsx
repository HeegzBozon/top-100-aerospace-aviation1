import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Lightbulb, 
  Bug, 
  MessageSquare, 
  ArrowLeft, 
  Star,
  Sparkles,
  AlertTriangle,
  PlusSquare
} from 'lucide-react';
import NominationForm from '@/components/epics/06-nomination-engine/voting/NominationForm';
import FeedbackForm from '@/components/epics/06-nomination-engine/nominations/FeedbackForm';

const submissionTypes = [
  {
    id: 'nomination',
    title: 'Nominate Someone',
    description: 'Nominate an outstanding woman in aerospace for recognition',
    icon: Users,
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    reward: '15 Stardust'
  },
  {
    id: 'feature',
    title: 'Feature Request',
    description: 'Suggest new features or improvements to the platform',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    reward: '8 Stardust'
  },
  {
    id: 'bug',
    title: 'Report Bug',
    description: 'Help us improve by reporting issues or problems',
    icon: Bug,
    color: 'from-red-500 to-pink-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    reward: '5 Stardust'
  },
  {
    id: 'feedback',
    title: 'General Feedback',
    description: 'Share your thoughts, ideas, or general comments',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    reward: '3 Stardust'
  }
];

export default function SubmissionHub() {
  const [selectedType, setSelectedType] = useState(null);

  const handleBack = () => {
    setSelectedType(null);
  };

  const renderForm = () => {
    switch (selectedType?.id) {
      case 'nomination':
        return <NominationForm onBack={handleBack} />;
      case 'feature':
        return <FeedbackForm type="idea" onBack={handleBack} />;
      case 'bug':
        return <FeedbackForm type="bug_report" onBack={handleBack} />;
      case 'feedback':
        return <FeedbackForm type="feedback" onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedType ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
                Submission Hub
              </h2>
              <p className="text-[var(--muted)] text-lg">
                Contribute to the community and earn Stardust for your submissions
              </p>
            </div>

            {/* Submission Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 hover:border-opacity-60 ${type.bgColor} border-transparent hover:border-current`}
                      onClick={() => setSelectedType(type)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className={`text-xl ${type.textColor}`}>
                              {type.title}
                            </CardTitle>
                            <div className="flex items-center gap-1 mt-1">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span className="text-sm font-medium text-amber-600">
                                {type.reward}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className={`text-sm ${type.textColor} opacity-80 mb-4`}>
                          {type.description}
                        </p>
                        <Button 
                          className={`w-full bg-gradient-to-r ${type.color} text-white hover:shadow-md transition-all`}
                        >
                          <PlusSquare className="w-4 h-4 mr-2" />
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Community Impact Stats */}
            <Card className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent-2)]/10 border-[var(--accent)]/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    Community Impact
                  </h3>
                </div>
                <p className="text-[var(--muted)] text-sm">
                  Your submissions help shape the platform and recognize outstanding women in aerospace. 
                  Every contribution matters and earns you Stardust rewards!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="mb-6 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Submission Hub
            </Button>

            {/* Form Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedType.color} flex items-center justify-center shadow-lg`}>
                  <selectedType.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text)]">
                    {selectedType.title}
                  </h2>
                  <p className="text-[var(--muted)]">
                    {selectedType.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Form */}
            {renderForm()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}