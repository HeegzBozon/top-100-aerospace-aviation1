import { useEffect, useRef, useState } from 'react';
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
import { fileNomination } from '@/components/nominate/fileNomination';
import { trackNomination } from '@/components/nominate/nominationEvents';
import NominateShell from '@/components/nominate/NominateShell';
import StageWelcome from '@/components/nominate/StageWelcome';
import StageAboutYou from '@/components/nominate/StageAboutYou';
import StagePersonNominations from '@/components/nominate/StagePersonNominations';
import StageAngels from '@/components/nominate/StageAngels';
import StageLocalLegends from '@/components/nominate/StageLocalLegends';
import StageReview from '@/components/nominate/StageReview';
import StageConfirmation from '@/components/nominate/StageConfirmation';
import NominationSplash from '@/components/nominate/NominationSplash';
import NominateBallotGate from '@/components/nominate/NominateBallotGate';
import NominateChallenge from '@/components/nominate/NominateChallenge';
import { isViewingAsVisitor } from '@/lib/viewerPreview';
import ConsoleLoading from '@/components/core/ConsoleLoading';
import MyTop100 from '@/pages/MyTop100';
import MissionBriefing from '@/components/mission/MissionBriefing';
import useMissionBriefing from '@/components/mission/useMissionBriefing';

const DRAFT_KEY = 'top100_nomination_draft_v1';

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveDraft(data) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

export default function NominationForm({ isPreview = false } = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stage, setStage] = useState(STAGES.WELCOME);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // null until the platform answers whether a Fellow is standing here at all.
  const [signedIn, setSignedIn] = useState(null);
  // A visitor filing a nomination is briefed once on this device, the same way a Fellow is
  // briefed once on the hub: the record is shared, so nobody reads it twice.
  const briefing = useMissionBriefing('guest', isPreview || signedIn === false);
  const [draftRestored, setDraftRestored] = useState(false);
  // The one question the desk can set before a filing is written, held here so the review
  // page can carry it without the flow moving anywhere.
  const [challenge, setChallenge] = useState(null);
  // When the flow was opened on this device. A filing that arrives faster than a person
  // reads the form is the desk's to weigh, so the clock starts here.
  const openedAt = useRef(Date.now());
  // A deep link names the surface it wants — the start screen's Vote now asks for
  // the vote tab — and goes there directly, with no title card in the way.
  const deepTab = useRef(new URLSearchParams(window.location.search).get('tab')).current;
  const [showSplash, setShowSplash] = useState(!deepTab);

  // Live flow: show the splash, then reveal the unified My Top 100 hub inline.
  useEffect(() => {
    if (isPreview || deepTab) return;
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, [isPreview, deepTab]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // The operator's preview answers here too: standing in a visitor's place means this
        // surface opens for a visitor and nothing else.
        const authenticated = isViewingAsVisitor() ? false : await base44.auth.isAuthenticated();
        if (!active) return;
        setSignedIn(!!authenticated);
        // A visitor files a nomination from the guided hub and nowhere else — there is no
        // list of their own to read yet, so the record is not asked for.
        if (!authenticated) return;
        const me = await base44.auth.me();
        if (!active) return;
        setCurrentUser(me);
        setAboutYou(prev => ({
          ...prev,
          name: prev.name || me.full_name || '',
          email: prev.email || me.email || '',
        }));
      } catch {
        // No Fellow here, or the check itself failed: either way the surface opens for a
        // visitor rather than waiting on an answer that is not coming.
        if (active) setSignedIn(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleLoginRedirect = () => {
    const nextUrl = window.location.pathname + window.location.search;
    base44.auth.redirectToLogin(nextUrl);
  };

  const handleLogout = async () => {
    await base44.auth.logout(window.location.pathname);
  };

  const [aboutYou, setAboutYou] = useState(() => {
    const d = loadDraft();
    return d?.aboutYou || { name: '', email: '', connection: '' };
  });
  const [nominations, setNominations] = useState(() => {
    const d = loadDraft();
    return d?.nominations || { women: [], men: [], angels: [], local_legends: [] };
  });

  // Restore draft stage if present
  useEffect(() => {
    const d = loadDraft();
    if (d?.stage && d.stage !== STAGES.WELCOME && d.stage !== STAGES.CONFIRMATION) {
      setStage(d.stage);
      setDraftRestored(true);
      const t = setTimeout(() => setDraftRestored(false), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  // Autosave draft whenever data changes
  useEffect(() => {
    saveDraft({ stage, aboutYou, nominations });
  }, [stage, aboutYou, nominations]);

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const progress = (stageIndex / (STAGE_ORDER.length - 1)) * 100;

  const trackHubEvent = (eventName, properties = {}) => {
    base44.analytics.track({ eventName, properties });
  };

  // Where the flow currently stands, read from outside the render so the funnel can be
  // recorded when the surface is left rather than only when it is stepped through.
  const stageRef = useRef(stage);
  const startedTracked = useRef(false);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // The head of the funnel: the hub was opened. Paired with
  // nomination_hub_submit_completed below, this is what turns "14 a month" into a
  // start-to-finish rate instead of a single number.
  useEffect(() => {
    trackHubEvent('nomination_hub_opened', { preview: !!isPreview });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The same funnel, staged: opened, then — if the reader leaves with the flow unfinished —
  // the stage they left on. Only the guided hub itself is counted: a Fellow who is shown
  // their own top 100 has not entered the nomination funnel and is not recorded as having
  // abandoned it.
  const guestFlowOnScreen = isPreview || signedIn === false;
  useEffect(() => {
    if (!guestFlowOnScreen) return undefined;
    trackNomination('formViewed', { preview: !!isPreview, stage: STAGES.WELCOME });
    let left = false;
    const leave = () => {
      if (left || stageRef.current === STAGES.CONFIRMATION) return;
      left = true;
      trackNomination('stageAbandoned', { stage: stageRef.current });
    };
    window.addEventListener('pagehide', leave);
    return () => {
      window.removeEventListener('pagehide', leave);
      leave();
    };
  }, [guestFlowOnScreen, isPreview]);

  // The first character typed anywhere in the flow. Recorded once.
  const markStarted = () => {
    if (startedTracked.current) return;
    startedTracked.current = true;
    trackNomination('formStarted', { stage: stageRef.current });
  };

  const goTo = (s) => {
    trackHubEvent('nomination_hub_stage_viewed', { stage: s });
    const from = STAGE_ORDER.indexOf(stage);
    const to = STAGE_ORDER.indexOf(s);
    if (to > from) trackNomination('stageAdvanced', { from: stage, to: s });
    setStage(s);
  };
  const next = () => {
    const i = STAGE_ORDER.indexOf(stage);
    if (i < STAGE_ORDER.length - 1) setStage(STAGE_ORDER[i + 1]);
  };

  const goToCategory = (n) => {
    const map = { 1: STAGES.WOMEN, 2: STAGES.MEN, 3: STAGES.ANGELS, 4: STAGES.LOCAL_LEGENDS };
    if (map[n]) goTo(map[n]);
  };

  // Generic helpers for each category
  const updateAboutYou = (field, value) => {
    markStarted();
    setAboutYou(p => ({ ...p, [field]: value }));
  };

  const addNomination = (category, factory) => {
    markStarted();
    trackHubEvent('nomination_hub_nomination_added', { category });
    setNominations(p => ({ ...p, [category]: [...p[category], factory()] }));
  };
  const updateNomination = (category, idx, field, value) => {
    markStarted();
    setNominations(p => ({
      ...p,
      [category]: p[category].map((n, i) => (i === idx ? { ...n, [field]: value } : n)),
    }));
  };
  // The record the house already holds, taken up in place of the identity questions: the
  // name, role, profile address and where they are come off the record itself, so the only
  // thing the nominator writes is why this person deserves to be recognized.
  const takeUpNomineeRecord = (category, idx, record) => {
    markStarted();
    trackHubEvent('nomination_hub_record_used', { category });
    setNominations(p => ({
      ...p,
      [category]: p[category].map((n, i) => (i === idx ? {
        ...n,
        nominee_id: record.id,
        name: record.name || n.name,
        role_org: [record.title, record.company].filter(Boolean).join(' at ') || n.role_org,
        link: record.linkedin_profile_url || n.link,
        email: record.nominee_email || n.email,
        location: record.country || n.location,
      } : n)),
    }));
  };
  const clearNomineeRecord = (category, idx) => {
    setNominations(p => ({
      ...p,
      [category]: p[category].map((n, i) => (i === idx ? { ...n, nominee_id: null } : n)),
    }));
  };

  const removeNomination = (category, idx) => {
    setNominations(p => ({
      ...p,
      [category]: p[category].filter((_, i) => i !== idx),
    }));
  };

  // The identity questions a record already answers. Once a nomination is standing on the
  // record, those fields are not asked for and cannot be missing.
  const RECORD_FIELDS = ['name', 'role_org', 'link', 'email', 'location'];

  // Validate a category's nominations before advancing (only if any exist)
  const validateCategory = (list, requiredFields, label) => {
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      for (const f of requiredFields) {
        if (n.nominee_id && RECORD_FIELDS.includes(f)) continue;
        if (!n[f] || (typeof n[f] === 'string' && !n[f].trim())) {
          // Where the flow refuses to move on: recorded, never changed.
          trackNomination('submitRejected', { stage: stageRef.current, reason: 'validation' });
          toast({ title: `${label} #${i + 1}: please complete all required fields`, variant: 'destructive' });
          return false;
        }
      }
    }
    return true;
  };

  const handleNextWomen = () => {
    if (!validateCategory(nominations.women, ['name', 'role_org', 'reason_contribution', 'share_name'], 'Woman')) return;
    goTo(STAGES.MEN);
  };
  const handleNextMen = () => {
    if (!validateCategory(nominations.men, ['name', 'role_org', 'reason_contribution', 'share_name'], 'Man')) return;
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

  // Filing, and the two ways the desk may answer it: the record is written, or one question
  // is set before it is. Either answer comes back to this function — a visitor is never
  // handed an error for being asked to confirm they are a person.
  const handleSubmit = async (reply = null) => {
    if (submitting) return;
    const answer = typeof reply === 'string' ? reply : null;

    if (!answer) {
      trackHubEvent('nomination_hub_submit_started', {
        women_count: nominations.women.length,
        men_count: nominations.men.length,
        angels_count: nominations.angels.length,
        local_legends_count: nominations.local_legends.length,
      });
    }

    if (isPreview) {
      setStage(STAGES.CONFIRMATION);
      return;
    }

    setSubmitting(true);

    try {
      await fileNomination({
        aboutYou,
        nominations,
        challenge: answer ? { token: challenge?.token, answer } : null,
        meta: {
          elapsed_ms: Date.now() - openedAt.current,
          website: aboutYou.website || '',
        },
      });

      trackHubEvent('nomination_hub_submit_completed', {
        women_count: nominations.women.length,
        men_count: nominations.men.length,
        angels_count: nominations.angels.length,
        local_legends_count: nominations.local_legends.length,
      });
      trackNomination('submitted', {
        stage: STAGES.CONFIRMATION,
        women_count: nominations.women.length,
        men_count: nominations.men.length,
        angels_count: nominations.angels.length,
        local_legends_count: nominations.local_legends.length,
      });
      clearDraft();
      setChallenge(null);
      setStage(STAGES.CONFIRMATION);
    } catch (error) {
      if (error?.code === 'challenge_required') {
        setChallenge({ token: error.token, question: error.question });
        return;
      }
      if (error?.code === 'challenge_failed') {
        setChallenge((current) => ({
          token: error.token || current?.token,
          question: error.question || current?.question,
        }));
      }
      trackNomination('submitFailed', { stage: STAGES.REVIEW, reason: error?.code || 'request' });
      toast({ title: error?.message || 'The nomination could not be filed.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => navigate('/');

  // Putting names forward needs no account: the guided hub below is open to everyone, and
  // asks for the name and address to credit. Measuring — weighing the names against one
  // another — is a Fellow's work, so the hub that follows the splash, and the ballot
  // inside it, open for one. A visitor who asked for the ballot by name is taken to the
  // way in rather than shown a ballot they cannot cast.
  if (!isPreview) {
    if (signedIn === null) return <ConsoleLoading label="Checking your account" />;
    if (!signedIn && deepTab === 'vote') return <NominateBallotGate />;
    if (signedIn) return showSplash ? <NominationSplash /> : <MyTop100 />;
  }

  return (
    <>
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
          user={currentUser}
          onLogin={handleLoginRedirect}
          onLogout={handleLogout}
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
          prevLabel="Back"
          nominations={nominations.women}
          onAdd={() => addNomination('women', emptyPersonNomination)}
          onUpdate={(idx, f, v) => updateNomination('women', idx, f, v)}
          onRemove={(idx) => removeNomination('women', idx)}
          onUseRecord={(idx, record) => takeUpNomineeRecord('women', idx, record)}
          onClearRecord={(idx) => clearNomineeRecord('women', idx)}
          onNext={handleNextWomen}
          onSkip={() => goTo(STAGES.MEN)}
          onPrev={() => goTo(STAGES.ABOUT_YOU)}
          onNavigate={goToCategory}
          counts={{ 1: nominations.women.length, 2: nominations.men.length, 3: nominations.angels.length, 4: nominations.local_legends.length }}
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
          prevLabel="Back to Women"
          nominations={nominations.men}
          onAdd={() => addNomination('men', emptyPersonNomination)}
          onUpdate={(idx, f, v) => updateNomination('men', idx, f, v)}
          onRemove={(idx) => removeNomination('men', idx)}
          onUseRecord={(idx, record) => takeUpNomineeRecord('men', idx, record)}
          onClearRecord={(idx) => clearNomineeRecord('men', idx)}
          onNext={handleNextMen}
          onSkip={() => goTo(STAGES.ANGELS)}
          onPrev={() => goTo(STAGES.WOMEN)}
          onNavigate={goToCategory}
          counts={{ 1: nominations.women.length, 2: nominations.men.length, 3: nominations.angels.length, 4: nominations.local_legends.length }}
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
          onPrev={() => goTo(STAGES.MEN)}
          prevLabel="Back to Men"
          onNavigate={goToCategory}
          counts={{ 1: nominations.women.length, 2: nominations.men.length, 3: nominations.angels.length, 4: nominations.local_legends.length }}
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
          onPrev={() => goTo(STAGES.ANGELS)}
          prevLabel="Back to Angels"
          onNavigate={goToCategory}
          counts={{ 1: nominations.women.length, 2: nominations.men.length, 3: nominations.angels.length, 4: nominations.local_legends.length }}
        />
      )}

      {stage === STAGES.REVIEW && (
        <>
          {challenge && (
            <NominateChallenge
              question={challenge.question}
              submitting={submitting}
              onVerify={(answer) => handleSubmit(answer)}
              onCancel={() => setChallenge(null)}
            />
          )}
          <StageReview
            nominations={nominations}
            onEdit={() => goTo(STAGES.WOMEN)}
            onSubmit={() => handleSubmit()}
            submitting={submitting}
          />
        </>
      )}

      {stage === STAGES.CONFIRMATION && (
        <StageConfirmation
          womenCount={nominations.women.length}
          menCount={nominations.men.length}
          angelsCount={nominations.angels.length}
          localLegendsCount={nominations.local_legends.length}
        />
      )}
    </NominateShell>

    <MissionBriefing
      open={briefing.open}
      onOpenChange={(next) => (next ? briefing.setOpen(true) : briefing.close())}
      section="nominate"
    />
    </>
  );
}