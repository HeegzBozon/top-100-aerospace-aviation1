import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  AlertTriangle, 
  Shield, 
  Database, 
  TrendingDown,
  CheckCircle,
  X,
  RefreshCw,
  Archive,
  Users,
  Award
} from 'lucide-react';
import { scoringService } from '@/functions/scoringService';
import { useToast } from '@/components/ui/use-toast';

const RESET_TYPES = [
  {
    id: 'soft',
    name: 'Soft Reset',
    description: 'Apply decay to all scores while preserving top performers',
    icon: TrendingDown,
    color: 'bg-yellow-500',
    impact: 'Medium',
    preserves: ['User accounts', 'Top performer advantage', 'Historical patterns']
  },
  {
    id: 'hard',
    name: 'Hard Reset',
    description: 'Complete reset of all voting data and nominee scores',
    icon: RefreshCw,
    color: 'bg-red-500',
    impact: 'High',
    preserves: ['User accounts', 'Basic nominee profiles']
  }
];

export default function SeasonalResetWizard({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [resetConfig, setResetConfig] = useState({
    reset_type: 'soft',
    preserve_top_n: 100,
    decay_factor: 0.7,
    archive_data: true,
    confirm_reset: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [resetResults, setResetResults] = useState(null);
  const { toast } = useToast();

  const steps = [
    { title: 'Select Reset Type', icon: RotateCcw },
    { title: 'Configure Parameters', icon: Database },
    { title: 'Confirm & Execute', icon: Shield },
    { title: 'Results', icon: CheckCircle }
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExecuteReset = async () => {
    if (!resetConfig.confirm_reset) {
      toast({
        variant: "destructive",
        title: "Confirmation Required",
        description: "Please confirm that you understand this action cannot be undone."
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data } = await scoringService({
        action: 'seasonal_reset',
        user_id: 'system',
        ...resetConfig
      });

      setResetResults(data);
      setCurrentStep(3); // Move to results step
      
      toast({
        title: "Seasonal Reset Completed",
        description: `${resetConfig.reset_type === 'hard' ? 'Hard' : 'Soft'} reset executed successfully.`
      });

      onSuccess?.(data);

    } catch (error) {
      console.error('Seasonal reset failed:', error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: `Failed to execute seasonal reset: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                Choose Reset Type
              </h3>
              <p className="text-[var(--muted)]">
                Select the type of seasonal reset to perform
              </p>
            </div>

            <div className="grid gap-4">
              {RESET_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = resetConfig.reset_type === type.id;
                
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-[var(--accent)]' : ''
                    }`}
                    onClick={() => setResetConfig(prev => ({ ...prev, reset_type: type.id }))}
                  >
                    <Card className={isSelected ? 'border-[var(--accent)]' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-[var(--text)]">{type.name}</h4>
                              <Badge variant={type.impact === 'High' ? 'destructive' : 'secondary'}>
                                {type.impact} Impact
                              </Badge>
                            </div>
                            
                            <p className="text-[var(--muted)] mb-3">{type.description}</p>
                            
                            <div className="text-sm">
                              <p className="font-medium text-[var(--text)] mb-1">Preserves:</p>
                              <ul className="text-[var(--muted)] space-y-1">
                                {type.preserves.map((item, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                Configure Parameters
              </h3>
              <p className="text-[var(--muted)]">
                Fine-tune the reset settings
              </p>
            </div>

            <div className="space-y-4">
              {resetConfig.reset_type === 'soft' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Top Performers Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-2">
                        Preserve Top N Nominees
                      </label>
                      <Input
                        type="number"
                        value={resetConfig.preserve_top_n}
                        onChange={(e) => setResetConfig(prev => ({
                          ...prev,
                          preserve_top_n: parseInt(e.target.value) || 100
                        }))}
                        placeholder="100"
                        className="max-w-xs"
                      />
                      <p className="text-xs text-[var(--muted)] mt-1">
                        Top performers get reduced decay (10% vs 30%)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="archive"
                      checked={resetConfig.archive_data}
                      onCheckedChange={(checked) => setResetConfig(prev => ({
                        ...prev,
                        archive_data: checked
                      }))}
                    />
                    <label htmlFor="archive" className="text-sm font-medium text-[var(--text)]">
                      Archive current season data
                    </label>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Create historical snapshot before reset
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                Confirm Seasonal Reset
              </h3>
              <p className="text-[var(--muted)]">
                This action cannot be undone. Please review your settings.
              </p>
            </div>

            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-6">
                <h4 className="font-bold text-red-800 mb-4">Reset Configuration Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reset Type:</span>
                    <Badge variant={resetConfig.reset_type === 'hard' ? 'destructive' : 'secondary'}>
                      {resetConfig.reset_type === 'hard' ? 'Hard Reset' : 'Soft Reset'}
                    </Badge>
                  </div>
                  
                  {resetConfig.reset_type === 'soft' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Top Nominees Protected:</span>
                      <span className="font-medium">{resetConfig.preserve_top_n}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Archive Data:</span>
                    <span className="font-medium">
                      {resetConfig.archive_data ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm"
                  checked={resetConfig.confirm_reset}
                  onCheckedChange={(checked) => setResetConfig(prev => ({
                    ...prev,
                    confirm_reset: checked
                  }))}
                />
                <label htmlFor="confirm" className="text-sm font-medium text-[var(--text)]">
                  I understand this action cannot be undone
                </label>
              </div>

              <Button
                onClick={handleExecuteReset}
                disabled={!resetConfig.confirm_reset || isProcessing}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Executing Reset...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Execute Seasonal Reset
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Seasonal Reset Complete!
              </h3>
              <p className="text-[var(--muted)]">
                The seasonal reset has been executed successfully.
              </p>
            </motion.div>

            {resetResults && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-bold text-[var(--text)] mb-4">Reset Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[var(--accent)]">
                        {resetResults.nominees_affected || resetResults.nominees_reset || 0}
                      </div>
                      <div className="text-[var(--muted)]">Nominees Affected</div>
                    </div>
                    
                    {resetResults.reset_type === 'soft' && resetResults.top_performers_preserved && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {resetResults.top_performers_preserved}
                        </div>
                        <div className="text-[var(--muted)]">Top Performers Protected</div>
                      </div>
                    )}
                    
                    {resetResults.archived_data && (
                      <div className="text-center col-span-2">
                        <Archive className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-[var(--muted)]">Season data archived successfully</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={onClose} size="lg" className="mt-6">
              Close
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Seasonal Reset Wizard</h2>
                <p className="text-white/80">Reset platform rankings for a new season</p>
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

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isActive 
                      ? 'border-red-500 bg-red-500 text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 font-medium ${
                    isActive ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {currentStep < 3 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button
                onClick={currentStep === 2 ? handleExecuteReset : handleNext}
                disabled={currentStep === 2 && (!resetConfig.confirm_reset || isProcessing)}
                className={currentStep === 2 ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {currentStep === 2 ? 'Execute Reset' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}