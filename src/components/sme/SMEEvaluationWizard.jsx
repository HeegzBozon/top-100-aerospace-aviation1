import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Award, Briefcase, Lightbulb, Users, CheckCircle, Loader2,
  ChevronRight, ChevronLeft, Sparkles, Star, Zap, Target, Rocket, ExternalLink,
  Link2, Upload, X, Plus, FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

const CRITERIA = [
  { 
    key: 'impact_score', 
    label: 'Impact', 
    icon: Target, 
    description: 'Patents, missions, research output, programs led', 
    xpReward: 20,
    guidance: 'Evaluate the tangible outcomes and measurable contributions this person has made to the aerospace & aviation industry.',
    scaleGuide: {
      low: '1-3: Limited or early-stage contributions with minimal industry reach',
      mid: '4-6: Solid contributions with regional or organizational impact',
      high: '7-9: Significant industry-wide impact with recognized achievements',
      elite: '10: Transformational impact that has fundamentally shaped the industry'
    },
    exampleOf10: 'Led a major space mission (e.g., Mars rover), holds 20+ patents, published groundbreaking research cited 1000+ times, or directed programs worth $1B+'
  },
  { 
    key: 'leadership_score', 
    label: 'Leadership', 
    icon: Briefcase, 
    description: 'Team size, budget, roles, awards', 
    xpReward: 20,
    guidance: 'Assess their ability to lead teams, manage large-scale initiatives, and inspire others in the industry.',
    scaleGuide: {
      low: '1-3: Individual contributor or small team lead (<10 people)',
      mid: '4-6: Mid-level manager or department head (10-50 people)',
      high: '7-9: Director/VP level leading large organizations (50-500 people)',
      elite: '10: C-suite executive or equivalent leading 500+ people or $100M+ budgets'
    },
    exampleOf10: 'CEO of major aerospace company, Chief Engineer on flagship programs, General/Admiral rank, or leader who built organizations from scratch to industry prominence'
  },
  { 
    key: 'innovation_score', 
    label: 'Innovation', 
    icon: Lightbulb, 
    description: 'Patents, startups, tech commercialized', 
    xpReward: 20,
    guidance: 'Rate their originality, creativity, and ability to bring new ideas, technologies, or approaches to market.',
    scaleGuide: {
      low: '1-3: Incremental improvements to existing systems',
      mid: '4-6: Notable innovations adopted within their organization',
      high: '7-9: Industry-recognized innovations or successful tech transfer',
      elite: '10: Disruptive innovation that created new markets or capabilities'
    },
    exampleOf10: 'Founded a successful aerospace startup (e.g., SpaceX-tier), invented technology now standard across industry, or pioneered entirely new category of aerospace capability'
  },
  { 
    key: 'community_score', 
    label: 'Community', 
    icon: Users, 
    description: 'Mentorship, speaking, volunteer work', 
    xpReward: 20,
    guidance: 'Evaluate their commitment to developing others, sharing knowledge, and strengthening the aerospace community.',
    scaleGuide: {
      low: '1-3: Occasional mentorship or local community involvement',
      mid: '4-6: Active mentor with regional speaking engagements',
      high: '7-9: Recognized thought leader with significant mentorship impact',
      elite: '10: Built programs/organizations that have developed hundreds of careers'
    },
    exampleOf10: 'Founded major STEM education initiative, serves on multiple industry boards, keynote speaker at top conferences, or personally mentored 50+ successful professionals'
  },
  { 
    key: 'trajectory_score', 
    label: 'Trajectory', 
    icon: Rocket, 
    description: 'Growth velocity, momentum, potential', 
    xpReward: 20,
    guidance: 'Consider their career momentum, rate of advancement, and future potential to impact the industry.',
    scaleGuide: {
      low: '1-3: Steady but conventional career progression',
      mid: '4-6: Above-average growth with clear upward trajectory',
      high: '7-9: Rapid advancement with strong future leadership potential',
      elite: '10: Meteoric rise with trajectory toward industry-defining influence'
    },
    exampleOf10: 'Promoted 3+ levels in 5 years, founded company now valued at $100M+, or transitioned from early career to executive leadership in record time with clear path to C-suite'
  }
];

const SCORE_LABELS = ['', 'Poor', 'Low', 'Below Avg', 'Fair', 'Average', 'Good', 'Strong', 'Excellent', 'Outstanding', 'Elite'];

export default function SMEEvaluationWizard({ nominee, onComplete, totalPending = 0, completedCount = 0 }) {
  const [step, setStep] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [formData, setFormData] = useState({
    impact_score: 5,
    leadership_score: 5,
    innovation_score: 5,
    community_score: 5,
    trajectory_score: 5,
    risk_effort_analysis: '',
    significance_notes: '',
    verification_notes: '',
    overall_recommendation: 'neutral',
    confidence_level: 0.7,
    // Evidence per criterion
    impact_evidence: { links: [], files: [] },
    leadership_evidence: { links: [], files: [] },
    innovation_evidence: { links: [], files: [] },
    community_evidence: { links: [], files: [] },
    trajectory_evidence: { links: [], files: [] },
  });

  // Steps: 5 criteria + notes + final review
  const totalSteps = CRITERIA.length + 2;

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.SMEEvaluation.create({
        ...data,
        nominee_id: nominee.id,
        evaluator_email: user.email,
        status: 'submitted'
      });
    },
    onSuccess: () => {
      // Final XP boost
      setEarnedXP(prev => prev + 50);
      setShowXPAnimation(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
    }
  });

  const handleNext = () => {
    if (step < CRITERIA.length) {
      // Award XP for each criterion rated
      setEarnedXP(prev => prev + CRITERIA[step].xpReward);
      setShowXPAnimation(true);
      setTimeout(() => setShowXPAnimation(false), 1000);
    }
    setStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* XP Animation */}
      <AnimatePresence>
        {showXPAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` }}>
              <Zap className="w-6 h-6 text-yellow-300" />
              <span className="text-2xl font-bold text-white">+{step < CRITERIA.length ? CRITERIA[step]?.xpReward || 50 : 50} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Header Row */}
      <div className="flex items-center gap-3 mb-4">
        {/* Nominee Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {nominee.avatar_url || nominee.photo_url ? (
            <img src={nominee.avatar_url || nominee.photo_url} alt={nominee.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: brandColors.navyDeep }}>
              {nominee.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-bold truncate" style={{ color: brandColors.navyDeep }}>{nominee.name}</h2>
            <p className="text-xs text-gray-600 truncate">{nominee.title} {nominee.company && `at ${nominee.company}`}</p>
          </div>
        </div>
        
        {/* LinkedIn Link */}
        {nominee.linkedin_profile_url && (
          <a 
            href={nominee.linkedin_profile_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white flex-shrink-0 hover:opacity-90 transition-opacity"
            style={{ background: '#0077B5' }}
          >
            <ExternalLink className="w-3 h-3" />
            LinkedIn
          </a>
        )}
        
        {/* XP Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: brandColors.navyDeep }}>
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold text-white">{earnedXP}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: brandColors.cream }}>
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${brandColors.skyBlue}, ${brandColors.goldPrestige})` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Step {step + 1}/{totalSteps}</span>
          <span>{completedCount + 1} of {totalPending + completedCount} nominees</span>
        </div>
      </div>

      {/* Wizard Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {step < CRITERIA.length ? (
            <CriterionStep
              criterion={CRITERIA[step]}
              value={formData[CRITERIA[step].key]}
              onChange={(val) => setFormData({ ...formData, [CRITERIA[step].key]: val })}
              evidence={formData[CRITERIA[step].key.replace('_score', '_evidence')]}
              onEvidenceChange={(evidence) => setFormData({ 
                ...formData, 
                [CRITERIA[step].key.replace('_score', '_evidence')]: evidence 
              })}
            />
          ) : step === CRITERIA.length ? (
            <NotesStep formData={formData} setFormData={setFormData} />
          ) : (
            <FinalReviewStep
              formData={formData}
              setFormData={setFormData}
              nominee={nominee}
              earnedXP={earnedXP}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {step < totalSteps - 1 ? (
          <Button
            onClick={handleNext}
            className="gap-2 px-8"
            style={{ background: brandColors.goldPrestige }}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="gap-2 px-8"
            style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` }}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Complete Evaluation (+50 XP)
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function CriterionStep({ criterion, value, onChange, evidence, onEvidenceChange }) {
  const Icon = criterion.icon;
  const [showEvidence, setShowEvidence] = useState(false);
  const [newLink, setNewLink] = useState('');
  const [uploading, setUploading] = useState(false);

  const addLink = () => {
    if (newLink && evidence.links.length < 5) {
      onEvidenceChange({ ...evidence, links: [...evidence.links, newLink] });
      setNewLink('');
    }
  };

  const removeLink = (idx) => {
    onEvidenceChange({ ...evidence, links: evidence.links.filter((_, i) => i !== idx) });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || evidence.files.length >= 5) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onEvidenceChange({ ...evidence, files: [...evidence.files, { name: file.name, url: file_url }] });
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
  };

  const removeFile = (idx) => {
    onEvidenceChange({ ...evidence, files: evidence.files.filter((_, i) => i !== idx) });
  };

  const totalEvidence = evidence.links.length + evidence.files.length;

  return (
    <Card className="p-4">
      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: brandColors.skyBlue + '20' }}>
          <Icon className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>{criterion.label}</h3>
          <p className="text-xs text-gray-500">{criterion.description}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>{value}</span>
          <p className="text-xs" style={{ color: brandColors.navyDeep }}>{SCORE_LABELS[value]}</p>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-3">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ 
            background: `linear-gradient(90deg, ${brandColors.skyBlue} ${(value - 1) * 11.1}%, ${brandColors.cream} ${(value - 1) * 11.1}%)`,
            accentColor: brandColors.goldPrestige 
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <span key={n} className={`w-5 text-center ${value === n ? 'font-bold' : ''}`} style={{ color: value === n ? brandColors.goldPrestige : undefined }}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Compact Guidance */}
      <div className="p-3 rounded-lg text-xs" style={{ background: brandColors.cream }}>
        <p className="font-medium mb-2" style={{ color: brandColors.navyDeep }}>{criterion.guidance}</p>
        
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
          <div><span className="font-semibold text-red-600">1-3:</span> <span className="text-gray-600">{criterion.scaleGuide.low.replace('1-3: ', '')}</span></div>
          <div><span className="font-semibold text-yellow-600">4-6:</span> <span className="text-gray-600">{criterion.scaleGuide.mid.replace('4-6: ', '')}</span></div>
          <div><span className="font-semibold text-blue-600">7-9:</span> <span className="text-gray-600">{criterion.scaleGuide.high.replace('7-9: ', '')}</span></div>
          <div><span className="font-semibold" style={{ color: brandColors.goldPrestige }}>10:</span> <span className="text-gray-600">{criterion.scaleGuide.elite.replace('10: ', '')}</span></div>
        </div>

        <div className="pt-2 border-t" style={{ borderColor: brandColors.navyDeep + '10' }}>
          <span className="font-semibold" style={{ color: brandColors.goldPrestige }}>✨ 10 Example:</span>{' '}
          <span className="text-gray-600">{criterion.exampleOf10}</span>
        </div>
      </div>

      {/* Evidence Section */}
      <div className="mt-3">
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="flex items-center gap-2 text-xs font-medium w-full justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          style={{ color: brandColors.navyDeep }}
        >
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Supporting Evidence {totalEvidence > 0 && `(${totalEvidence})`}
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showEvidence ? 'rotate-90' : ''}`} />
        </button>

        {showEvidence && (
          <div className="mt-2 p-3 rounded-lg border" style={{ borderColor: brandColors.navyDeep + '15' }}>
            {/* Links */}
            <div className="mb-3">
              <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: brandColors.navyDeep }}>
                <Link2 className="w-3 h-3" /> Links ({evidence.links.length}/5)
              </p>
              {evidence.links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1">
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate flex-1 hover:underline">
                    {link}
                  </a>
                  <button onClick={() => removeLink(idx)} className="text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {evidence.links.length < 5 && (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://..."
                    className="h-7 text-xs flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && addLink()}
                  />
                  <button onClick={addLink} className="px-2 py-1 rounded text-xs text-white" style={{ background: brandColors.skyBlue }}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Files */}
            <div>
              <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: brandColors.navyDeep }}>
                <Upload className="w-3 h-3" /> Files ({evidence.files.length}/5)
              </p>
              {evidence.files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate flex-1 hover:underline">
                    {file.name}
                  </a>
                  <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {evidence.files.length < 5 && (
                <label className="flex items-center gap-2 px-3 py-1.5 rounded border border-dashed cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: brandColors.navyDeep + '30' }}>
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  <span className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Upload file'}</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 text-xs mt-2" style={{ color: brandColors.goldPrestige }}>
        <Zap className="w-3 h-3" />
        <span>+{criterion.xpReward} XP</span>
      </div>
    </Card>
  );
}

function NotesStep({ formData, setFormData }) {
  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: brandColors.goldPrestige + '20' }}>
          <Award className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
        </div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
          Expert Notes
        </h3>
        <p className="text-gray-600">Share your expert insights (optional)</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
            Risk/Effort Analysis
          </label>
          <textarea
            value={formData.risk_effort_analysis}
            onChange={(e) => setFormData({ ...formData, risk_effort_analysis: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg resize-none"
            placeholder="Assess difficulty and risk of achievements..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
            Significance Notes
          </label>
          <textarea
            value={formData.significance_notes}
            onChange={(e) => setFormData({ ...formData, significance_notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg resize-none"
            placeholder="Context on importance of contributions..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
            Verification Notes
          </label>
          <textarea
            value={formData.verification_notes}
            onChange={(e) => setFormData({ ...formData, verification_notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg resize-none"
            placeholder="Notes on verification of claims..."
          />
        </div>
      </div>
    </Card>
  );
}

function FinalReviewStep({ formData, setFormData, nominee, earnedXP }) {
  const avgScore = Math.round((formData.impact_score + formData.leadership_score + formData.innovation_score + formData.community_score + formData.trajectory_score) / 5 * 10) / 10;

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` }}>
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
          Final Review
        </h3>
        <p className="text-gray-600">Review your evaluation for {nominee.name}</p>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {CRITERIA.map(c => (
          <div key={c.key} className="text-center p-2 rounded-lg" style={{ background: brandColors.cream }}>
            <c.icon className="w-5 h-5 mx-auto mb-1" style={{ color: brandColors.skyBlue }} />
            <p className="text-2xl font-bold" style={{ color: brandColors.goldPrestige }}>{formData[c.key]}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="text-center mb-6 p-4 rounded-xl" style={{ background: brandColors.navyDeep }}>
        <p className="text-sm text-white/70">Average Score</p>
        <p className="text-4xl font-bold text-white">{avgScore}</p>
      </div>

      {/* Recommendation */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
          Final Recommendation
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'strongly_recommend', label: '🌟 Strongly Recommend', color: '#22c55e' },
            { value: 'recommend', label: '👍 Recommend', color: '#3b82f6' },
            { value: 'neutral', label: '➖ Neutral', color: '#6b7280' },
            { value: 'not_recommend', label: '👎 Not Recommend', color: '#ef4444' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFormData({ ...formData, overall_recommendation: opt.value })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${formData.overall_recommendation === opt.value ? 'border-current' : 'border-gray-200'}`}
              style={{ 
                borderColor: formData.overall_recommendation === opt.value ? opt.color : undefined,
                background: formData.overall_recommendation === opt.value ? opt.color + '10' : undefined 
              }}
            >
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Confidence */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
          Confidence Level: {Math.round(formData.confidence_level * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={formData.confidence_level}
          onChange={(e) => setFormData({ ...formData, confidence_level: parseFloat(e.target.value) })}
          className="w-full"
          style={{ accentColor: brandColors.skyBlue }}
        />
      </div>

      <div className="mt-6 p-4 rounded-xl text-center" style={{ background: brandColors.goldPrestige + '20' }}>
        <p className="text-sm" style={{ color: brandColors.navyDeep }}>Completing this evaluation earns you</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-2xl font-bold" style={{ color: brandColors.goldPrestige }}>{earnedXP + 50} XP Total</span>
        </div>
      </div>
    </Card>
  );
}