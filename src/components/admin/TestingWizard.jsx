import React, { useState, useEffect } from 'react';
import { Feedback } from '@/entities/Feedback';
import { TestCase } from '@/entities/TestCase';
import { TestSession } from '@/entities/TestSession';
import { startTestSession } from '@/functions/startTestSession';
import { updateTestSession } from '@/functions/updateTestSession';
import { InvokeLLM } from '@/integrations/Core';
import { createTestCase } from '@/functions/createTestCase';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FlaskConical, Lightbulb, Bug, Check, X, ChevronsRight, Loader2, PlayCircle, ArrowLeft } from 'lucide-react';

export default function TestingWizard({ currentUser, onBugCreated }) {
  const [testType, setTestType] = useState('bug_report');
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [activeTestSession, setActiveTestSession] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (testType) {
      loadFeedbackItems();
    }
  }, [testType]);

  useEffect(() => {
    if (selectedFeedback && selectedFeedback.id) {
      loadTestCases();
    } else {
      setTestCases([]);
    }
  }, [selectedFeedback]);

  const loadFeedbackItems = async () => {
    try {
      const items = await Feedback.filter({ type: testType });
      setFeedbackItems(items);
    } catch (error) {
      console.error('Error loading feedback items:', error);
    }
  };

  const loadTestCases = async () => {
    if (!selectedFeedback || !selectedFeedback.id) return;
    try {
      const cases = await TestCase.filter({ feedback_id: selectedFeedback.id });
      setTestCases(cases);
    } catch (error) {
      console.error('Error loading test cases:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load test cases." });
    }
  };

  const handleGenerateTestCase = async (feedbackItem) => {
    setGenerating(true);
    try {
      const prompt = `Generate comprehensive test instructions for a ${feedbackItem.type === 'idea' ? 'feature request' : 'bug fix'}.

Subject: ${feedbackItem.subject}
Description: ${feedbackItem.description}

Please create a structured test case with 3-7 specific test steps. Each step should have:
1. Clear, actionable instructions for what the tester should do
2. Specific expected outcomes

Format your response as a JSON object with this structure:
{
  "title": "Test Case Title",
  "estimated_time_minutes": 15,
  "test_steps": [
    {
      "step_number": 1,
      "instruction": "Detailed step instruction",
      "expected_outcome": "What should happen"
    }
  ]
}

Focus on practical, user-facing testing scenarios. Include edge cases and error conditions where relevant.`;

      const generatedData = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
            type: "object",
            properties: {
                title: { type: "string" },
                estimated_time_minutes: { type: "number" },
                test_steps: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            step_number: { type: "number" },
                            instruction: { type: "string" },
                            expected_outcome: { type: "string" }
                        },
                        required: ["step_number", "instruction", "expected_outcome"]
                    }
                }
            },
            required: ["title", "estimated_time_minutes", "test_steps"]
        }
      });
      
      if (!generatedData || !generatedData.title) {
          throw new Error("AI failed to generate valid test case data.");
      }

      const testCasePayload = {
        feedback_id: feedbackItem.id,
        title: generatedData.title,
        test_steps: generatedData.test_steps,
        estimated_time_minutes: generatedData.estimated_time_minutes || 15,
        priority: "medium",
        environment: "staging",
        status: "active",
      };

      const response = await createTestCase({ testCaseData: testCasePayload });

      if (response.data && response.data.success) {
        toast({ title: "Test Case Generated", description: "AI-generated test case has been created successfully." });
        await loadTestCases();
      } else {
        throw new Error(response.data?.error || 'Failed to save the generated test case.');
      }
    } catch (error) {
      console.error('Error generating test case:', error);
      toast({ variant: "destructive", title: "Generation Failed", description: `Failed to generate test case: ${error.message}. Please try again.` });
    } finally {
      setGenerating(false);
    }
  };

  const handleStartTest = async (testCase) => {
    try {
      const sessionData = {
        test_case_id: testCase.id,
        feedback_id: testCase.feedback_id,
        tester_email: currentUser.email,
        start_time: new Date().toISOString(),
        status: 'in_progress',
        environment_tested: 'staging',
        browser_info: navigator.userAgent
      };

      const response = await startTestSession({ sessionData });
      
      if (response.data && response.data.success) {
        const fullTestCase = testCases.find(tc => tc.id === testCase.id);
        setActiveTestSession({...response.data.test_session, test_steps: fullTestCase.test_steps});
        setCurrentStepIndex(0);
        setStepResults([]);
        setSessionNotes('');
        toast({ title: "Test Session Started", description: "Follow the test steps and record your results." });
      }
    } catch (error) {
      console.error('Error starting test session:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to start test session." });
    }
  };

  const handleStepResult = (stepNumber, status, notes = '') => {
    const newStepResults = [...stepResults];
    const existingIndex = newStepResults.findIndex(r => r.step_number === stepNumber);
    
    const stepResult = {
      step_number: stepNumber,
      status,
      notes
    };

    if (existingIndex >= 0) {
      newStepResults[existingIndex] = stepResult;
    } else {
      newStepResults.push(stepResult);
    }
    
    setStepResults(newStepResults);
  };

  const handleNextStep = () => {
    if (activeTestSession && currentStepIndex < activeTestSession.test_steps?.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const createBugReportFromFailedTest = async (session) => {
    const failedSteps = session.step_results?.filter(r => r.status === 'failed') || [];
    if (failedSteps.length === 0) return;

    const originalTestCase = testCases.find(tc => tc.id === session.test_case_id);

    let description = `This bug was automatically generated from a failed test session.\n\n`;
    description += `**Test Case:** ${originalTestCase?.title || 'N/A'}\n`;
    description += `**Tester:** ${currentUser.email}\n`;
    description += `**Tested on:** ${new Date(session.start_time).toLocaleString()}\n`;
    description += `**Session ID:** ${session.id}\n\n`;

    if (session.overall_notes) {
      description += `--- \n**Tester's Overall Notes:**\n${session.overall_notes}\n\n---\n\n`;
    }

    description += `**Failed Steps:**\n`;
    failedSteps.forEach(fs => {
      const stepDetails = originalTestCase?.test_steps.find(ts => ts.step_number === fs.step_number);
      description += `\n**Step ${fs.step_number}:**\n`;
      description += `*   **Instruction:** ${stepDetails?.instruction || 'N/A'}\n`;
      description += `*   **Expected Outcome:** ${stepDetails?.expected_outcome || 'N/A'}\n`;
      description += `*   **Actual Outcome (Notes):** ${fs.notes || 'No notes provided.'}\n`;
    });

    const bugReportPayload = {
      type: 'bug_report',
      subject: `Failed Test: ${originalTestCase?.title || 'Untitled Test'}`,
      description: description,
      status: 'new',
      priority: 'high',
      user_email: currentUser.email,
      source_test_session_id: session.id,
      tags: ['failed-test', 'regression'],
    };

    try {
      await Feedback.create(bugReportPayload);
      toast({
        title: "Bug Report Created",
        description: "A new bug report has been automatically created from the failed test.",
      });
      if (onBugCreated) {
        onBugCreated();
      }
    } catch (error) {
      console.error("Failed to create bug report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to auto-create bug report.",
      });
    }
  };

  const handleCompleteTest = async (finalStatus) => {
    if (!activeTestSession) return;

    try {
      const updateData = {
        status: finalStatus,
        end_time: new Date().toISOString(),
        step_results: stepResults,
        overall_notes: sessionNotes
      };

      const response = await updateTestSession({
        sessionId: activeTestSession.id,
        updateData
      });

      if (response.data && response.data.success) {
        toast({
          title: "Test Completed",
          description: `Test session marked as ${finalStatus}.`
        });

        if (finalStatus === 'failed') {
          await createBugReportFromFailedTest(response.data.test_session);
        }

        setActiveTestSession(null);
        setCurrentStepIndex(0);
        setStepResults([]);
        setSessionNotes('');
        await loadTestCases();
      } else {
        throw new Error(response.data?.error || 'Failed to complete test session.');
      }
    } catch (error) {
      console.error('Error completing test:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to complete test session." });
    }
  };

  const getCurrentStep = () => {
    if (!activeTestSession || !activeTestSession.test_steps) return null;
    return activeTestSession.test_steps[currentStepIndex];
  };

  const getCurrentStepResult = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return null;
    return stepResults.find(r => r.step_number === currentStep.step_number);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Testing Wizard</h2>
      </div>

      {!activeTestSession ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50/70 p-4 rounded-lg border">
              <label className="font-semibold text-gray-700 block mb-2">1. Select Type</label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug_report"><div className="flex items-center gap-2"><Bug className="w-4 h-4 text-red-500" /> Bug Report</div></SelectItem>
                  <SelectItem value="idea"><div className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> Idea</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border">
              <label className="font-semibold text-gray-700 block mb-2">2. Select Item</label>
              <Select onValueChange={(value) => setSelectedFeedback(feedbackItems.find(f => f.id === value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item to test..." />
                </SelectTrigger>
                <SelectContent>
                  {feedbackItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedFeedback && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Test Cases for: {selectedFeedback.subject}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{selectedFeedback.description}</p>
              
              {testCases.length > 0 ? (
                <div className="space-y-4">
                  {testCases.map((testCase) => (
                    <div key={testCase.id} className="border rounded-lg p-4 hover:bg-gray-50/50 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{testCase.title}</h4>
                        <p className="text-xs text-gray-500">{testCase.test_steps.length} steps, approx. {testCase.estimated_time_minutes} min</p>
                      </div>
                      <Button onClick={() => handleStartTest(testCase)}>
                        <PlayCircle className="w-4 h-4 mr-2" /> Start Test
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">No test cases found for this item.</p>
                  <Button onClick={() => handleGenerateTestCase(selectedFeedback)} disabled={generating}>
                    {generating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : "Generate Test Case with AI"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <button onClick={() => setActiveTestSession(null)} className="flex items-center text-sm text-blue-600 hover:underline mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Wizard
              </button>
              <h3 className="text-xl font-bold text-gray-900">{activeTestSession.test_case_title}</h3>
              <p className="text-sm text-gray-500">
                Step {currentStepIndex + 1} of {activeTestSession.test_steps.length}
              </p>
            </div>
            <div className="text-right">
                <Button variant="outline" size="sm" onClick={handlePreviousStep} disabled={currentStepIndex === 0}>Previous</Button>
                <Button className="ml-2" size="sm" onClick={handleNextStep} disabled={currentStepIndex === activeTestSession.test_steps.length - 1}>Next</Button>
            </div>
          </div>
          
          <div className="bg-gray-50/70 p-4 rounded-lg border mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Instruction:</h4>
            <p className="text-gray-700">{getCurrentStep()?.instruction}</p>
            <h4 className="font-semibold text-gray-800 mt-3 mb-2">Expected Outcome:</h4>
            <p className="text-gray-700">{getCurrentStep()?.expected_outcome}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Button
              variant={getCurrentStepResult()?.status === 'passed' ? 'default' : 'outline'}
              className="bg-green-500 hover:bg-green-600 text-white data-[state=checked]:bg-green-600"
              onClick={() => handleStepResult(getCurrentStep().step_number, 'passed')}
            >
              <Check className="w-4 h-4 mr-2" /> Pass
            </Button>
            <Button
              variant={getCurrentStepResult()?.status === 'failed' ? 'default' : 'outline'}
              className="bg-red-500 hover:bg-red-600 text-white data-[state=checked]:bg-red-600"
              onClick={() => handleStepResult(getCurrentStep().step_number, 'failed')}
            >
              <X className="w-4 h-4 mr-2" /> Fail
            </Button>
            <Button
              variant={getCurrentStepResult()?.status === 'blocked' ? 'default' : 'outline'}
              className="bg-yellow-500 hover:bg-yellow-600 text-white data-[state=checked]:bg-yellow-600"
              onClick={() => handleStepResult(getCurrentStep().step_number, 'blocked')}
            >
              <ChevronsRight className="w-4 h-4 mr-2" /> Block
            </Button>
          </div>
          
          {getCurrentStepResult()?.status === 'failed' && (
            <Textarea 
              placeholder="Why did this step fail? (Required for failed steps)"
              value={getCurrentStepResult()?.notes || ''}
              onChange={(e) => handleStepResult(getCurrentStep().step_number, 'failed', e.target.value)}
              className="mb-4"
            />
          )}

          {currentStepIndex === activeTestSession.test_steps.length - 1 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-bold mb-2">Complete Test Session</h3>
              <Textarea
                placeholder="Add overall notes for the session..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-4">
                <Button onClick={() => handleCompleteTest('passed')} className="bg-green-600 hover:bg-green-700">Complete as Passed</Button>
                <Button onClick={() => handleCompleteTest('failed')} className="bg-red-600 hover:bg-red-700">Complete as Failed</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}