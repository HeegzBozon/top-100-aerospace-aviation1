import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nominee } from '@/entities/Nominee';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

import { LinkedInPdfUpload } from '@/components/epics/01-index-engine/profiles';
import { BioEditor } from '@/components/epics/01-index-engine/profiles';
import { SixWordStoryEditor } from '@/components/epics/01-index-engine/profiles';
import { MediaEditor } from '@/components/epics/01-index-engine/profiles';
import { SocialsEditor } from '@/components/epics/01-index-engine/profiles';
import { ProfilePreviewStep } from '@/components/epics/01-index-engine/profiles';

const steps = [
  { id: 'enrich', title: 'Enrich Profile', component: LinkedInPdfUpload },
  { id: 'bio', title: 'Professional Bio', component: BioEditor },
  { id: 'story', title: 'Six-Word Story', component: SixWordStoryEditor },
  { id: 'media', title: 'Profile Photo', component: MediaEditor },
  { id: 'socials', title: 'Social Links', component: SocialsEditor },
  { id: 'preview', title: 'Preview', component: ProfilePreviewStep },
];

export default function ProfileEditor({ user }) {
  const [nominee, setNominee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const claimedProfiles = await Nominee.filter({ claimed_by_user_email: user.email });
        if (claimedProfiles.length > 0) {
          setNominee(claimedProfiles[0]);
        } else {
          setNominee(null);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleSave = async (field, value) => {
    if (!nominee) return;
    try {
      const updatedNominee = { ...nominee, [field]: value };
      setNominee(updatedNominee);
      await Nominee.update(nominee.id, { [field]: value });
      toast({ title: "Saved!", description: "Your profile has been updated." });
      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      setNominee(nominee);
      toast({ variant: "destructive", title: "Save Failed" });
      return false;
    }
  };

  const handleEnrichmentComplete = (enrichedNominee) => {
    setNominee(enrichedNominee);
    nextStep();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const finishFlow = () => {
    toast({ title: "Profile Setup Complete!" });
    // Typically redirect, but here we might just stay or show success
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (!nominee) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center bg-[var(--card)] p-8 rounded-2xl shadow-lg border border-[var(--border)]">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">No Claimed Profile Found</h2>
          <p className="text-[var(--muted)] mb-6">You must claim a nominee profile before you can edit it.</p>
          <Link to={createPageUrl('ClaimProfile')}>
            <Button>Check for Nominations</Button>
          </Link>
        </div>
      </div>
    );
  }

  const ActiveComponent = steps[currentStep].component;
  const isFinalStep = currentStep === steps.length - 1;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <UserCircle className="w-16 h-16 mx-auto text-[var(--muted)] mb-2" />
        <h1 className="text-3xl font-bold text-[var(--text)]">Edit Your Nominee Profile</h1>
        <p className="text-[var(--muted)]">Craft your story for the TOP 100 community.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="text-center flex-1 min-w-[80px]">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all mx-auto cursor-pointer
                ${index === currentStep ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : ''}
                ${index < currentStep ? 'bg-green-500 text-white border-green-500' : ''}
                ${index > currentStep ? 'bg-transparent border-[var(--border)] text-[var(--muted)]' : ''}
              `}
              onClick={() => setCurrentStep(index)}
            >
              {index < currentStep ? <CheckCircle className="w-5 h-5"/> : index + 1}
            </div>
            <p className={`text-xs mt-2 transition-colors truncate ${index === currentStep ? 'text-[var(--text)] font-semibold' : 'text-[var(--muted)]'}`}>
              {step.title}
            </p>
          </div>
        ))}
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ActiveComponent 
          nominee={nominee}
          onSave={handleSave}
          onEnrichmentComplete={handleEnrichmentComplete}
          onComplete={isFinalStep ? null : nextStep}
          onFinish={isFinalStep ? finishFlow : null}
        />
      </motion.div>
    </div>
  );
}