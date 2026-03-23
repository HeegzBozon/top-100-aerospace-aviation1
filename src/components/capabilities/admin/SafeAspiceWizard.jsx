import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Award,
  Zap,
  Target,
  Settings,
  X,
  ChevronRight,
  Building
} from 'lucide-react';
import { Release } from '@/entities/Release';
import { ASPICEAssessment } from '@/entities/ASPICEAssessment';
import { ProcessAreaScore } from '@/entities/ProcessAreaScore';
import { useToast } from '@/components/ui/use-toast';

// SAFe Readiness Criteria
const SAFE_CRITERIA = [
  {
    id: 'features_defined',
    name: 'Features Defined',
    description: 'All features for the release are clearly defined and prioritized',
    weight: 20,
    category: 'planning'
  },
  {
    id: 'acceptance_criteria',
    name: 'Acceptance Criteria Complete',
    description: 'All user stories have clear, testable acceptance criteria',
    weight: 15,
    category: 'planning'
  },
  {
    id: 'capacity_allocation',
    name: 'Team Capacity Allocated',
    description: 'Development capacity is planned and allocated across teams',
    weight: 10,
    category: 'planning'
  },
  {
    id: 'dependencies_mapped',
    name: 'Dependencies Identified',
    description: 'All inter-team and external dependencies are mapped',
    weight: 15,
    category: 'coordination'
  },
  {
    id: 'integration_points',
    name: 'Integration Points Defined',
    description: 'System integration points and contracts are established',
    weight: 10,
    category: 'architecture'
  },
  {
    id: 'test_strategy',
    name: 'Test Strategy Complete',
    description: 'Comprehensive testing approach including automation',
    weight: 15,
    category: 'quality'
  },
  {
    id: 'deployment_ready',
    name: 'Deployment Pipeline Ready',
    description: 'CI/CD pipeline is configured and tested',
    weight: 10,
    category: 'delivery'
  },
  {
    id: 'documentation_current',
    name: 'Documentation Current',
    description: 'All technical and user documentation is up-to-date',
    weight: 5,
    category: 'documentation'
  }
];

// ASPICE Process Areas (Level 2 focus)
const ASPICE_PROCESS_AREAS = [
  {
    id: 'SYS.1',
    name: 'System Requirements Analysis',
    description: 'Transform stakeholder requirements into system requirements',
    is_critical: true,
    level_2_practices: [
      'Specify system requirements',
      'Analyze system requirements',
      'Verify system requirements',
      'Manage system requirements changes'
    ]
  },
  {
    id: 'SYS.2',
    name: 'System Architectural Design',
    description: 'Establish architectural design for the system',
    is_critical: true,
    level_2_practices: [
      'Develop system architecture',
      'Allocate system requirements',
      'Define interfaces',
      'Verify architectural design'
    ]
  },
  {
    id: 'SWE.1',
    name: 'Software Requirements Analysis',
    description: 'Transform system requirements into software requirements',
    is_critical: true,
    level_2_practices: [
      'Specify software requirements',
      'Analyze software requirements',
      'Verify software requirements',
      'Manage software requirements traceability'
    ]
  },
  {
    id: 'SWE.2',
    name: 'Software Architectural Design',
    description: 'Transform software requirements into architecture',
    is_critical: true,
    level_2_practices: [
      'Develop software architecture',
      'Design software interfaces',
      'Verify software architecture',
      'Establish traceability'
    ]
  },
  {
    id: 'SWE.3',
    name: 'Software Detailed Design',
    description: 'Design software components that can be coded and tested',
    is_critical: false,
    level_2_practices: [
      'Develop detailed design',
      'Define interfaces',
      'Verify detailed design',
      'Establish traceability to requirements'
    ]
  },
  {
    id: 'SWE.4',
    name: 'Software Unit Construction',
    description: 'Produce executable software units',
    is_critical: false,
    level_2_practices: [
      'Implement software units',
      'Develop unit verification procedures',
      'Verify software units',
      'Establish traceability'
    ]
  },
  {
    id: 'SWE.5',
    name: 'Software Integration and Integration Test',
    description: 'Combine software units and verify integrated software',
    is_critical: true,
    level_2_practices: [
      'Develop integration strategy',
      'Perform software integration',
      'Develop integration tests',
      'Verify integrated software'
    ]
  },
  {
    id: 'SWE.6',
    name: 'Software Qualification Test',
    description: 'Verify that integrated software meets its requirements',
    is_critical: true,
    level_2_practices: [
      'Develop test strategy',
      'Develop test specifications',
      'Perform tests',
      'Summarize and communicate results'
    ]
  }
];

export default function SafeAspiceWizard({ isOpen, onClose, releaseId }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [release, setRelease] = useState(null);
  const [safeAssessment, setSafeAssessment] = useState({});
  const [aspiceAssessment, setAspiceAssessment] = useState(null);
  const [processScores, setProcessScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const steps = [
    { title: 'Release Overview', icon: Target },
    { title: 'SAFe Readiness', icon: Zap },
    { title: 'ASPICE Assessment', icon: Shield },
    { title: 'Results & Actions', icon: Award }
  ];

  useEffect(() => {
    if (isOpen && releaseId) {
      loadReleaseData();
    }
  }, [isOpen, releaseId]);

  const loadReleaseData = async () => {
    setLoading(true);
    try {
      const releaseData = await Release.get(releaseId);
      setRelease(releaseData);

      // Load existing ASPICE assessment if available
      const assessments = await ASPICEAssessment.filter({ release_id: releaseId });
      if (assessments.length > 0) {
        const assessment = assessments[0];
        setAspiceAssessment(assessment);

        // Load process scores
        const scores = await ProcessAreaScore.filter({ assessment_id: assessment.id });
        const scoresMap = {};
        scores.forEach(score => {
          scoresMap[score.process_area_id] = score;
        });
        setProcessScores(scoresMap);
      }

    } catch (error) {
      console.error('Failed to load release data:', error);
      toast({
        variant: "destructive",
        title: "Loading Failed",
        description: "Could not load release data."
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSafeReadiness = () => {
    let totalWeight = 0;
    let achievedWeight = 0;

    SAFE_CRITERIA.forEach(criterion => {
      totalWeight += criterion.weight;
      if (safeAssessment[criterion.id]) {
        achievedWeight += criterion.weight;
      }
    });

    return totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;
  };

  const calculateAspiceLevel = () => {
    const criticalProcesses = ASPICE_PROCESS_AREAS.filter(pa => pa.is_critical);
    const criticalScores = criticalProcesses.map(pa => 
      processScores[pa.id]?.capability_level || 0
    );

    if (criticalScores.length === 0) return 0;

    // For Level 2, all critical processes must be at least Level 1
    const allLevel1 = criticalScores.every(score => score >= 1);
    if (!allLevel1) return 0;

    // Calculate average for Level 2
    const avgScore = criticalScores.reduce((sum, score) => sum + score, 0) / criticalScores.length;
    return Math.min(Math.floor(avgScore), 2);
  };

  const handleSafeAssessmentChange = (criterionId, checked) => {
    setSafeAssessment(prev => ({
      ...prev,
      [criterionId]: checked
    }));
  };

  const handleProcessScoreChange = (processId, field, value) => {
    setProcessScores(prev => ({
      ...prev,
      [processId]: {
        ...prev[processId],
        [field]: value
      }
    }));
  };

  const handleSaveAssessment = async () => {
    setSaving(true);
    try {
      const safeReadiness = calculateSafeReadiness();
      const aspiceLevel = calculateAspiceLevel();
      const overallReadiness = Math.round((safeReadiness * 0.6) + (aspiceLevel * 20)); // Weight SAFe 60%, ASPICE 40%

      // Update release readiness scores
      await Release.update(releaseId, {
        safe_readiness_score: safeReadiness,
        aspice_readiness_score: aspiceLevel * 50, // Convert to 0-100 scale
        overall_readiness_score: overallReadiness
      });

      // Create or update ASPICE assessment
      let assessmentId;
      if (aspiceAssessment) {
        await ASPICEAssessment.update(aspiceAssessment.id, {
          overall_capability_level: aspiceLevel,
          status: aspiceLevel >= 2 ? 'compliant' : aspiceLevel >= 1 ? 'non_compliant_caution' : 'non_compliant_blocked'
        });
        assessmentId = aspiceAssessment.id;
      } else {
        const newAssessment = await ASPICEAssessment.create({
          release_id: releaseId,
          overall_capability_level: aspiceLevel,
          status: aspiceLevel >= 2 ? 'compliant' : aspiceLevel >= 1 ? 'non_compliant_caution' : 'non_compliant_blocked'
        });
        assessmentId = newAssessment.id;
        setAspiceAssessment(newAssessment);
      }

      // Update process area scores
      for (const [processId, scoreData] of Object.entries(processScores)) {
        const processArea = ASPICE_PROCESS_AREAS.find(pa => pa.id === processId);
        if (processArea && scoreData) {
          const existingScores = await ProcessAreaScore.filter({ 
            assessment_id: assessmentId, 
            process_area_id: processId 
          });

          const scorePayload = {
            assessment_id: assessmentId,
            process_area_id: processId,
            process_area_name: processArea.name,
            capability_level: scoreData.capability_level || 0,
            is_critical: processArea.is_critical,
            remediation_notes: scoreData.remediation_notes || ''
          };

          if (existingScores.length > 0) {
            await ProcessAreaScore.update(existingScores[0].id, scorePayload);
          } else {
            await ProcessAreaScore.create(scorePayload);
          }
        }
      }

      setCurrentStep(3); // Move to results step

      toast({
        title: "Assessment Saved",
        description: `Release readiness: ${overallReadiness}% (SAFe: ${safeReadiness}%, ASPICE: Level ${aspiceLevel})`
      });

    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the assessment data."
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const safeReadiness = calculateSafeReadiness();
  const aspiceLevel = calculateAspiceLevel();
  const overallReadiness = Math.round((safeReadiness * 0.6) + (aspiceLevel * 20));

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                Release Overview
              </h3>
              <p className="text-[var(--muted)]">
                Review release information and readiness status
              </p>
            </div>

            {release && (
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-[var(--text)] mb-4">{release.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--muted)]">Target Release Date:</span>
                          <span className="font-medium">
                            {new Date(release.target_release_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted)]">Status:</span>
                          <Badge variant={release.status === 'ready_for_release' ? 'default' : 'secondary'}>
                            {release.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted)]">Current Readiness:</span>
                          <span className="font-bold text-[var(--accent)]">
                            {release.overall_readiness_score || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-[var(--text)] mb-4">Assessment Goals</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span>SAFe Release Readiness Assessment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>ASPICE Level 2 Compliance Check</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-500" />
                          <span>Overall Release Go/No-Go Decision</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                SAFe Readiness Assessment
              </h3>
              <p className="text-[var(--muted)]">
                Evaluate release readiness against SAFe criteria
              </p>
              <div className="mt-4">
                <div className="text-3xl font-bold text-[var(--accent)]">{safeReadiness}%</div>
                <Progress value={safeReadiness} className="mt-2 max-w-sm mx-auto" />
              </div>
            </div>

            <div className="grid gap-4">
              {SAFE_CRITERIA.map((criterion) => (
                <Card key={criterion.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={criterion.id}
                        checked={safeAssessment[criterion.id] || false}
                        onCheckedChange={(checked) => handleSafeAssessmentChange(criterion.id, checked)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label 
                            htmlFor={criterion.id}
                            className="font-medium text-[var(--text)] cursor-pointer"
                          >
                            {criterion.name}
                          </label>
                          <Badge variant="outline" className="ml-2">
                            {criterion.weight}%
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-[var(--muted)] mb-2">
                          {criterion.description}
                        </p>
                        
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {criterion.category}
                        </Badge>
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                ASPICE Assessment
              </h3>
              <p className="text-[var(--muted)]">
                Evaluate process capability against ASPICE Level 2
              </p>
              <div className="mt-4">
                <div className="text-3xl font-bold text-[var(--accent)]">Level {aspiceLevel}</div>
                <p className="text-sm text-[var(--muted)] mt-1">Current ASPICE Capability Level</p>
              </div>
            </div>

            <div className="grid gap-4">
              {ASPICE_PROCESS_AREAS.map((processArea) => {
                const score = processScores[processArea.id] || {};
                
                return (
                  <Card key={processArea.id} className={`transition-all ${processArea.is_critical ? 'border-orange-200' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{processArea.id}</CardTitle>
                          {processArea.is_critical && (
                            <Badge variant="destructive" className="text-xs">Critical</Badge>
                          )}
                        </div>
                        <Select
                          value={score.capability_level?.toString() || '0'}
                          onValueChange={(value) => handleProcessScoreChange(
                            processArea.id, 
                            'capability_level', 
                            parseInt(value)
                          )}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Level 0</SelectItem>
                            <SelectItem value="1">Level 1</SelectItem>
                            <SelectItem value="2">Level 2</SelectItem>
                            <SelectItem value="3">Level 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-[var(--text)] mb-2">{processArea.name}</h4>
                        <p className="text-sm text-[var(--muted)] mb-3">{processArea.description}</p>
                        
                        <div className="text-xs text-[var(--muted)] mb-3">
                          <strong>Level 2 Practices:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {processArea.level_2_practices.map((practice, index) => (
                              <li key={index}>{practice}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <Textarea
                        placeholder="Remediation notes (if capability level < 2)"
                        value={score.remediation_notes || ''}
                        onChange={(e) => handleProcessScoreChange(
                          processArea.id, 
                          'remediation_notes', 
                          e.target.value
                        )}
                        rows={2}
                        className="text-sm"
                      />
                    </CardContent>
                  </Card>
                );
              })}
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
              <Award className="w-16 h-16 text-[var(--accent)] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">
                Assessment Complete
              </h3>
              <p className="text-[var(--muted)] mb-6">
                Release readiness evaluation has been completed
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{safeReadiness}%</div>
                  <div className="text-sm text-[var(--muted)]">SAFe Readiness</div>
                  <Progress value={safeReadiness} className="mt-3" />
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">Level {aspiceLevel}</div>
                  <div className="text-sm text-[var(--muted)]">ASPICE Capability</div>
                  <Progress value={aspiceLevel * 33.33} className="mt-3" />
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-[var(--accent)] mb-2">{overallReadiness}%</div>
                  <div className="text-sm text-[var(--muted)]">Overall Readiness</div>
                  <Progress value={overallReadiness} className="mt-3" />
                </CardContent>
              </Card>
            </div>

            {/* Go/No-Go Decision */}
            <Card className={`${overallReadiness >= 80 ? 'bg-green-50 border-green-200' : overallReadiness >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {overallReadiness >= 80 ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <h4 className="text-xl font-bold text-green-800">GO FOR RELEASE</h4>
                    </>
                  ) : overallReadiness >= 60 ? (
                    <>
                      <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      <h4 className="text-xl font-bold text-yellow-800">CONDITIONAL GO</h4>
                    </>
                  ) : (
                    <>
                      <X className="w-8 h-8 text-red-600" />
                      <h4 className="text-xl font-bold text-red-800">NO-GO</h4>
                    </>
                  )}
                </div>
                
                <p className="text-sm text-center">
                  {overallReadiness >= 80 
                    ? 'Release meets all readiness criteria and is approved for deployment.' 
                    : overallReadiness >= 60
                      ? 'Release has minor gaps that should be addressed before deployment.'
                      : 'Release has significant gaps that must be resolved before deployment.'}
                </p>
              </CardContent>
            </Card>
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">SAFe/ASPICE Compliance Wizard</h2>
                <p className="text-white/80">Enterprise release readiness assessment</p>
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
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 mx-4 text-gray-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
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
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={currentStep === 2 ? handleSaveAssessment : () => setCurrentStep(currentStep + 1)}
                disabled={saving}
                className={currentStep === 2 ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {currentStep === 2 ? (
                  saving ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Saving Assessment...
                    </>
                  ) : (
                    'Complete Assessment'
                  )
                ) : (
                  'Next'
                )}
              </Button>
            ) : (
              <Button onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}