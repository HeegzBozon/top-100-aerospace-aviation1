import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Contact' },
  { id: 3, title: 'Reason' },
];

export default function NominationModal({ isOpen, onClose }) {
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

  useEffect(() => {
    if (isOpen) {
      loadSeasons();
      setStep(1);
    }
  }, [isOpen]);

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
      const user = await base44.auth.me();
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
      setFormData({ name: '', category: '', nominee_email: '', linkedin_url: '', reason: '', season_id: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting nomination:', error);
      toast({ variant: "destructive", title: "Submission Failed", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: `${brandColors.goldPrestige}30` }}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${brandColors.goldPrestige}20` }}
              >
                <Users className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>
                  Nominate Someone
                </DialogTitle>
                <p className="text-xs" style={{ color: brandColors.navyDeep, opacity: 0.6 }}>
                  Step {step} of 3: {STEPS[step - 1].title}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Progress bar */}
          <div className="flex gap-1.5 mt-3">
            {STEPS.map((s) => (
              <div 
                key={s.id} 
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{ background: s.id <= step ? brandColors.goldPrestige : '#e5e7eb' }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Season <span className="text-red-500">*</span></label>
                <Select value={formData.season_id} onValueChange={(value) => setFormData({...formData, season_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                  <SelectContent>
                    {seasons.map(season => (
                      <SelectItem key={season.id} value={season.id}>{season.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nominee Name <span className="text-red-500">*</span></label>
                <Input
                  placeholder="e.g., Evelyn Reed"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category <span className="text-red-500">*</span></label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="policy">Policy & Advocacy</SelectItem>
                    <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">LinkedIn URL <span className="text-red-500">*</span></label>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Required for verification</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nominee Email <span className="text-gray-400">(optional)</span></label>
                <Input
                  type="email"
                  placeholder="e.g., evelyn@company.com"
                  value={formData.nominee_email}
                  onChange={(e) => setFormData({...formData, nominee_email: e.target.value})}
                />
              </div>
            </>
          )}

          {/* Step 3: Reason */}
          {step === 3 && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Reason for Nomination <span className="text-red-500">*</span></label>
              <Textarea
                placeholder="Tell us why this person deserves to be in the TOP 100..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={6}
                className="resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t flex gap-3" style={{ borderColor: `${brandColors.goldPrestige}30` }}>
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={handleBack} 
              className="flex-1"
              style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button 
              onClick={handleNext} 
              className="flex-1 text-white"
              style={{ background: brandColors.goldPrestige }}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1 text-white"
              style={{ background: brandColors.goldPrestige }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Submitting...
                </div>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" /> Submit
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}