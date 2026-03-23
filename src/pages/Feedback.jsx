import { useState, useEffect } from 'react';
import { Feedback as FeedbackEntity } from '@/entities/Feedback';
import { Sprint } from '@/entities/Sprint';
import { TestSession } from '@/entities/TestSession';
import { UploadFile } from '@/integrations/Core';
import { MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/entities/User';
import { Skeleton } from '@/components/ui/skeleton';

export default function Feedback() {
  const [type, setType] = useState('feedback');
  const [priority, setPriority] = useState('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [loomLink, setLoomLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState('');
  const [sourceTestSessionId, setSourceTestSessionId] = useState(null);
  const [wsjf, setWsjf] = useState({
    businessValue: 5,
    timeCriticality: 5,
    riskReduction: 5,
    jobSize: 5,
  });

  const { toast } = useToast();

  const calculatedWsjf = wsjf.jobSize === 0 ? 0 : (wsjf.businessValue + wsjf.timeCriticality + wsjf.riskReduction) / wsjf.jobSize;

  useEffect(() => {
    const fetchUserAndSprints = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        const sprintData = await Sprint.list('-start_date');
        setSprints(sprintData);

        const urlParams = new URLSearchParams(window.location.search);
        const sourceTestSessionId = urlParams.get('source_test_session_id');
        if (sourceTestSessionId) {
          const session = await TestSession.get(sourceTestSessionId);
          if (session && session.feedback_id) {
            const bugReport = await FeedbackEntity.get(session.feedback_id);
            setSubject(`Bug Found from Test Session: ${bugReport.subject}`);
            setDescription(`While testing '${bugReport.subject}', the following issue occurred:\n\n[Please describe the new bug here]\n\nRelated Test Session: ${sourceTestSessionId}\nOriginal Bug Report ID: ${session.feedback_id}`);
            setType('bug_report');
            setSourceTestSessionId(sourceTestSessionId);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndSprints();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        setScreenshotFile(null);
        return;
      }
      setScreenshotFile(file);
      setError(null);
    }
  };

  const handleWsjfChange = (field, value) => {
    setWsjf(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!subject.trim() || !description.trim()) {
        setError("Please fill out the subject and description.");
        setIsSubmitting(false);
        return;
      }

      let screenshotUrl = null;
      if (screenshotFile) {
        try {
          const { file_url } = await UploadFile({ file: screenshotFile });
          screenshotUrl = file_url;
        } catch (err) {
          console.error('Error uploading file:', err);
          setError('Could not upload the screenshot. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const submissionData = {
        type,
        subject,
        description,
        priority,
        screenshot_url: screenshotUrl,
        loom_link: loomLink,
        sprint_id: selectedSprintId || null,
        source_test_session_id: sourceTestSessionId,
      };

      if (['idea', 'user_story', 'enabler_story'].includes(type)) {
        Object.assign(submissionData, {
          wsjf_score: parseFloat(calculatedWsjf.toFixed(2)),
          wsjf_breakdown: wsjf,
        });
      }

      await FeedbackEntity.create(submissionData);

      toast({
        title: "Submission Received!",
        description: "Thank you for your valuable input. We'll review it shortly.",
      });

      // Reset form
      setType('feedback');
      setPriority('medium');
      setSubject('');
      setDescription('');
      setScreenshotFile(null);
      setLoomLink('');
      setSelectedSprintId('');
      setWsjf({ businessValue: 5, timeCriticality: 5, riskReduction: 5, jobSize: 5 });

    } catch (err) {
      console.error('Error submitting:', err);
      setError(`There was an error submitting your ${type.replace('_', ' ')}. Please try again.`);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: `There was an error submitting your ${type.replace('_', ' ')}. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-xl mb-4">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text)]">Submission Hub</h1>
        <p className="text-[var(--muted)] mt-2">
          Have an idea, a bug report, or feedback? Share it here!
        </p>
      </div>

      <div className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-[var(--text)] mb-1">
                Submission Type
              </label>
              <Select onValueChange={(value) => setType(value)} value={type}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select submission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="bug_report">Bug Report</SelectItem>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="user_story">User Story</SelectItem>
                  <SelectItem value="enabler_story">Enabler Story</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-[var(--text)] mb-1">
                Priority
              </label>
              <Select onValueChange={(value) => setPriority(value)} value={priority}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-[var(--text)] mb-1">
              Subject
            </label>
            <Input
              id="subject"
              type="text"
              placeholder="Brief summary of your submission"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--text)] mb-1">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your submission"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full"
            />
          </div>

          {(type === 'bug_report' || type === 'feedback') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="screenshot" className="block text-sm font-medium text-[var(--text)] mb-1">
                  Screenshot (optional)
                </label>
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full"
                />
                {screenshotFile && <p className="text-xs text-[var(--muted)] mt-1">Selected: {screenshotFile.name}</p>}
              </div>
              <div>
                <label htmlFor="loom" className="block text-sm font-medium text-[var(--text)] mb-1">
                  Loom Link (optional)
                </label>
                <Input
                  id="loom"
                  type="url"
                  placeholder="https://loom.com/..."
                  value={loomLink}
                  onChange={(e) => setLoomLink(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {(type === 'idea' || type === 'user_story' || type === 'enabler_story') && (
            <div className="bg-[var(--card)] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">WSJF Scoring (Weighted Shortest Job First)</h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                Help us prioritize by rating each factor from 1 (lowest) to 10 (highest):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Business Value: {wsjf.businessValue}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wsjf.businessValue}
                    onChange={(e) => handleWsjfChange('businessValue', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">How much value does this deliver to users/business?</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Time Criticality: {wsjf.timeCriticality}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wsjf.timeCriticality}
                    onChange={(e) => handleWsjfChange('timeCriticality', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">How time-sensitive is this? Does delay hurt significantly?</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Risk Reduction: {wsjf.riskReduction}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wsjf.riskReduction}
                    onChange={(e) => handleWsjfChange('riskReduction', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">Does this reduce risk or enable future opportunities?</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Job Size (Effort): {wsjf.jobSize}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wsjf.jobSize}
                    onChange={(e) => handleWsjfChange('jobSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">How much work is required? (1 = very little, 10 = enormous)</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-[var(--accent)]/10 rounded-lg">
                <p className="text-sm text-[var(--text)] font-medium">
                  Calculated WSJF Score: <span className="text-lg font-bold text-[var(--accent)]">{calculatedWsjf.toFixed(2)}</span>
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Higher scores indicate higher priority for development
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Submitting...
                </div>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}