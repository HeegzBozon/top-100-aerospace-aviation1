import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Name, category & season' },
  { id: 2, title: 'Contact', description: 'LinkedIn & email' },
  { id: 3, title: 'Reason', description: 'Why nominate them?' },
];

const CATEGORIES = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'operations', label: 'Operations' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'policy', label: 'Policy & Advocacy' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
];

export default function InlineNominationForm({ onSuccess = undefined }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    nominee_email: '',
    linkedin_url: '',
    reason: '',
    season_id: ''
  });
  const [seasons, setSeasons] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      const allSeasons = await base44.entities.Season.list('-created_date', 50);
      const openSeasons = allSeasons.filter(s => s.status === 'nominations_open');
      setSeasons(openSeasons);
      if (openSeasons.length > 0) {
        setFormData(prev => ({ ...prev, season_id: openSeasons[0].id }));
      }
    } catch (error) {
      console.error('Failed to load seasons:', error);
    }
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.name || !formData.category || !formData.season_id) {
        toast({ variant: "destructive", title: "Missing Info", description: "Please fill in name, category, and season." });
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.linkedin_url) {
        toast({ variant: "destructive", title: "Missing LinkedIn", description: "LinkedIn URL is required." });
        return false;
      }
      if (!formData.linkedin_url.includes('linkedin.com/')) {
        toast({ variant: "destructive", title: "Invalid URL", description: "Please enter a valid LinkedIn URL." });
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.reason) {
        toast({ variant: "destructive", title: "Missing Reason", description: "Please provide a nomination reason." });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 3));
    }
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const user = await base44.auth.me().catch(() => {
        base44.auth.redirectToLogin();
        throw new Error('Not authenticated');
      });

      await base44.entities.Nominee.create({
        name: formData.name,
        description: formData.reason,
        nominee_email: formData.nominee_email || '',
        linkedin_profile_url: formData.linkedin_url,
        category: formData.category,
        nomination_reason: formData.reason,
        nominated_by: user.email,
        season_id: formData.season_id,
        status: 'pending'
      });

      toast({ title: "Nomination Submitted!", description: "Thank you! It will be reviewed shortly." });

      // Reset form
      setFormData({ name: '', category: '', nominee_email: '', linkedin_url: '', reason: '', season_id: seasons[0]?.id || '' });
      setStep(1);

      // Invalidate nominations query to refresh the feed
      queryClient.invalidateQueries({ queryKey: ['my-nominations'] });

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting nomination:', error);
      toast({ variant: "destructive", title: "Submission Failed", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = STEPS[step - 1];

  return (
    <div className="flex flex-col h-full">
      {/* Step Header */}
      <div className="p-4 border-b" style={{ borderColor: `${brandColors.navyDeep}10` }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>
              Step {step}: {currentStepData.title}
            </h3>
            <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
              {currentStepData.description}
            </p>
          </div>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
          >
            {step}/3
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: s.id <= step ? brandColors.goldPrestige : `${brandColors.navyDeep}15` }}
            />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: brandColors.navyDeep }}>
                Season <span className="text-red-500">*</span>
              </label>
              <Select value={formData.season_id} onValueChange={(value) => setFormData({ ...formData, season_id: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season.id} value={season.id}>{season.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {seasons.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No active nomination seasons available.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: brandColors.navyDeep }}>
                Nominee Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., Evelyn Reed"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: brandColors.navyDeep }}>
                Category <span className="text-red-500">*</span>
              </label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: brandColors.navyDeep }}>
                LinkedIn URL <span className="text-red-500">*</span>
              </label>
              <Input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="w-full"
              />
              <p className="text-xs mt-1" style={{ color: `${brandColors.navyDeep}50` }}>
                Required for verification
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: brandColors.navyDeep }}>
                Nominee Email <span style={{ color: `${brandColors.navyDeep}40` }}>(optional)</span>
              </label>
              <Input
                type="email"
                placeholder="nominee@example.com"
                value={formData.nominee_email}
                onChange={(e) => setFormData({ ...formData, nominee_email: e.target.value })}
                className="w-full"
              />
              <p className="text-xs mt-1" style={{ color: `${brandColors.navyDeep}50` }}>
                We'll notify them about the nomination
              </p>
            </div>
          </>
        )}

        {/* Step 3: Reason */}
        {step === 3 && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: brandColors.navyDeep }}>
              Why are you nominating this person? <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Describe their achievements, impact, and why they deserve recognition..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full min-h-[200px] resize-none"
            />
            <p className="text-xs mt-1" style={{ color: `${brandColors.navyDeep}50` }}>
              Be specific about their contributions to aerospace & aviation
            </p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div
        className="p-4 border-t flex items-center justify-between"
        style={{ borderColor: `${brandColors.navyDeep}10` }}
      >
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {step < 3 ? (
          <Button
            onClick={handleNext}
            className="gap-1"
            style={{ background: brandColors.navyDeep }}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
            style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.skyBlue})` }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Nomination
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}