import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  STAGES,
  STAGE_ORDER,
  emptyPersonNomination,
  emptyAngelNomination,
  emptyLocalLegend,
} from '@/components/nominate/NominateConfig';
import NominateShell from '@/components/nominate/NominateShell';
import StageWelcome from '@/components/nominate/StageWelcome';
import StageAboutYou from '@/components/nominate/StageAboutYou';
import StagePersonNominations from '@/components/nominate/StagePersonNominations';
import StageAngels from '@/components/nominate/StageAngels';
import StageLocalLegends from '@/components/nominate/StageLocalLegends';
import StageReview from '@/components/nominate/StageReview';
import StageConfirmation from '@/components/nominate/StageConfirmation';
import NominationSplash from '@/components/nominate/NominationSplash';

const SURVEY_ID = '69f45633daacf496cacd8666';

export default function NominationForm({ isPreview = false } = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stage, setStage] = useState(STAGES.WELCOME);
  const [submitting, setSubmitting] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const [aboutYou, setAboutYou] = useState({ name: '', email: '', connection: '' });
  const [nominations, setNominations] = useState({
    women: [],
    men: [],
    angels: [],
    local_legends: [],
  });

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const progress = (stageIndex / (STAGE_ORDER.length - 1)) * 100;

  const trackHubEvent = (eventName, properties = {}) => {
    base44.analytics.track({ eventName, properties });
  };

  const goTo = (s) => {
    trackHubEvent('nomination_hub_stage_viewed', { stage: s });
    setStage(s);
  };
  const next = () => {
    const i = STAGE_ORDER.indexOf(stage);
    if (i < STAGE_ORDER.length - 1) setStage(STAGE_ORDER[i + 1]);
  };

  // Generic helpers for each category
  const updateAboutYou = (field, value) => setAboutYou(p => ({ ...p, [field]: value }));

  const addNomination = (category, factory) => {
    trackHubEvent('nomination_hub_nomination_added', { category });
    setNominations(p => ({ ...p, [category]: [...p[category], factory()] }));
  };
  const updateNomination = (category, idx, field, value) => {
    setNominations(p => ({
      ...p,
      [category]: p[category].map((n, i) => (i === idx ? { ...n, [field]: value } : n)),
    }));
  };
  const removeNomination = (category, idx) => {
    setNominations(p => ({
      ...p,
      [category]: p[category].filter((_, i) => i !== idx),
    }));
  };

  // Validate a category's nominations before advancing (only if any exist)
  const validateCategory = (list, requiredFields, label) => {
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      for (const f of requiredFields) {
        if (!n[f] || (typeof n[f] === 'string' && !n[f].trim())) {
          toast({ title: `${label} #${i + 1}: please complete all required fields`, variant: 'destructive' });
          return false;
        }
      }
    }
    return true;
  };

  const handleNextWomen = () => {
    if (!validateCategory(nominations.women, ['name', 'role_org', 'reason', 'share_name'], 'Woman')) return;
    goTo(STAGES.MEN);
  };
  const handleNextMen = () => {
    if (!validateCategory(nominations.men, ['name', 'role_org', 'reason', 'share_name'], 'Man')) return;
    goTo(STAGES.ANGELS);
  };
  const handleNextAngels = () => {
    if (!validateCategory(nominations.angels, ['name', 'investing_in', 'reason', 'share_name'], 'Angel')) return;
    goTo(STAGES.LOCAL_LEGENDS);
  };
  const handleNextLocalLegends = () => {
    if (!validateCategory(nominations.local_legends, ['business_name', 'business_type', 'city', 'reason', 'share_name'], 'Local Legend')) return;
    goTo(STAGES.REVIEW);
  };

  const handleSubmit = async () => {
    trackHubEvent('nomination_hub_submit_started', {
      women_count: nominations.women.length,
      men_count: nominations.men.length,
      angels_count: nominations.angels.length,
      local_legends_count: nominations.local_legends.length,
    });
    setSubmitting(true);
    const answers = {
      your_name: aboutYou.name,
      your_email: aboutYou.email,
      your_connection: aboutYou.connection,
      women_nominations: nominations.women,
      men_nominations: nominations.men,
      angels_nominations: nominations.angels,
      local_legends_nominations: nominations.local_legends,
    };

    if (isPreview) {
      setSubmitting(false);
      setStage(STAGES.CONFIRMATION);
      return;
    }

    const submission = await base44.entities.SurveyResponse.create({
      survey_id: SURVEY_ID,
      respondent_email: aboutYou.email,
      respondent_name: aboutYou.name,
      answers,
      completed: true,
    });

    const intakeBase = {
      submission_id: submission.id,
      survey_id: SURVEY_ID,
      nominator_name: aboutYou.name,
      nominator_email: aboutYou.email,
      nominator_connection: aboutYou.connection,
      source: 'unified_nomination_hub',
      status: 'new',
    };

    const peopleIntakes = [
      ...nominations.women.filter(n => n.name?.trim()).map(n => ({
        ...intakeBase,
        nomination_type: 'women',
        nominee_name: n.name,
        role_org: n.role_org,
        link: n.link,
        location: n.location,
        reason: n.reason,
        share_name: n.share_name,
      })),
      ...nominations.men.filter(n => n.name?.trim()).map(n => ({
        ...intakeBase,
        nomination_type: 'men',
        nominee_name: n.name,
        role_org: n.role_org,
        link: n.link,
        location: n.location,
        reason: n.reason,
        share_name: n.share_name,
      })),
      ...nominations.angels.filter(n => n.name?.trim()).map(n => ({
        ...intakeBase,
        nomination_type: 'angels',
        nominee_name: n.name,
        firm: n.firm,
        link: n.link,
        location: n.location,
        investing_in: n.investing_in,
        reason: n.reason,
        share_name: n.share_name,
      })),
    ];

    const localLegendIntakes = nominations.local_legends.filter(n => n.business_name?.trim()).map(n => ({
      ...intakeBase,
      business_name: n.business_name,
      business_type: n.business_type,
      city: n.city,
      owner_name: n.owner_name,
      link: n.link,
      reason: n.reason,
      share_name: n.share_name,
    }));

    if (peopleIntakes.length) await base44.entities.NominationIntake.bulkCreate(peopleIntakes);
    if (localLegendIntakes.length) await base44.entities.LocalLegendNomination.bulkCreate(localLegendIntakes);

    const surveys = await base44.entities.Survey.filter({ id: SURVEY_ID });
    if (surveys[0]) {
      await base44.entities.Survey.update(SURVEY_ID, {
        response_count: (surveys[0].response_count || 0) + 1,
      });
    }

    trackHubEvent('nomination_hub_submit_completed', {
      women_count: nominations.women.length,
      men_count: nominations.men.length,
      angels_count: nominations.angels.length,
      local_legends_count: nominations.local_legends.length,
    });
    setSubmitting(false);
    setStage(STAGES.CONFIRMATION);
  };

  const handleExit = () => navigate('/');

  if (showSplash && !isPreview) {
    return <NominationSplash />;
  }

  return (
    <NominateShell
      stageKey={stage}
      progress={progress}
      onExit={stage !== STAGES.CONFIRMATION ? handleExit : null}
    >
      {stage === STAGES.WELCOME && (
        <StageWelcome onBegin={() => goTo(STAGES.ABOUT_YOU)} />
      )}

      {stage === STAGES.ABOUT_YOU && (
        <StageAboutYou
          data={aboutYou}
          onUpdate={updateAboutYou}
          onContinue={() => goTo(STAGES.WOMEN)}
        />
      )}

      {stage === STAGES.WOMEN && (
        <StagePersonNominations
          stageNumber={1}
          categoryLabel="TOP 100 Women"
          accentColor="#b87a8e"
          icon={Sparkles}
          title="Do you know a woman in aerospace, aviation, or space who deserves to be recognized?"
          intro="TOP 100 Women in Aerospace & Aviation spotlights accomplished women across every discipline. Engineering. Operations. Policy. Research. Entrepreneurship. Flight. Space. If she's building the future of this industry, she belongs in the conversation."
          pronoun="her"
          pronounSubject="she"
          addLabel="Nominate another woman"
          nextLabel="Next: TOP 100 Men"
          nominations={nominations.women}
          onAdd={() => addNomination('women', emptyPersonNomination)}
          onUpdate={(idx, f, v) => updateNomination('women', idx, f, v)}
          onRemove={(idx) => removeNomination('women', idx)}
          onNext={handleNextWomen}
          onSkip={() => goTo(STAGES.MEN)}
        />
      )}

      {stage === STAGES.MEN && (
        <StagePersonNominations
          stageNumber={2}
          categoryLabel="TOP 100 Men"
          accentColor="#1e3a5a"
          icon={Users}
          title="Do you know a man in aerospace, aviation, or space who deserves to be recognized?"
          intro="TOP 100 Men in Aerospace & Aviation recognizes the men who are doing the work, mentoring the next generation, championing inclusion, and building the industry forward. If he belongs in the conversation, nominate him."
          pronoun="him"
          pronounSubject="he"
          addLabel="Nominate another man"
          nextLabel="Next: TOP 100 Angels"
          nominations={nominations.men}
          onAdd={() => addNomination('men', emptyPersonNomination)}
          onUpdate={(idx, f, v) => updateNomination('men', idx, f, v)}
          onRemove={(idx) => removeNomination('men', idx)}
          onNext={handleNextMen}
          onSkip={() => goTo(STAGES.ANGELS)}
        />
      )}

      {stage === STAGES.ANGELS && (
        <StageAngels
          nominations={nominations.angels}
          onAdd={() => addNomination('angels', emptyAngelNomination)}
          onUpdate={(idx, f, v) => updateNomination('angels', idx, f, v)}
          onRemove={(idx) => removeNomination('angels', idx)}
          onNext={handleNextAngels}
          onSkip={() => goTo(STAGES.LOCAL_LEGENDS)}
        />
      )}

      {stage === STAGES.LOCAL_LEGENDS && (
        <StageLocalLegends
          nominations={nominations.local_legends}
          onAdd={() => addNomination('local_legends', emptyLocalLegend)}
          onUpdate={(idx, f, v) => updateNomination('local_legends', idx, f, v)}
          onRemove={(idx) => removeNomination('local_legends', idx)}
          onNext={handleNextLocalLegends}
          onSkip={() => goTo(STAGES.REVIEW)}
        />
      )}

      {stage === STAGES.REVIEW && (
        <StageReview
          nominations={nominations}
          onEdit={() => goTo(STAGES.WOMEN)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {stage === STAGES.CONFIRMATION && (
        <StageConfirmation />
      )}
    </NominateShell>
  );
}