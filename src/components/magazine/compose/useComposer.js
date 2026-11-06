import { useCallback, useState } from 'react';
import { COMPOSE_STEPS, REVIEW_INDEX, isStepDone, stepPatch } from './composeConfig';
import { askForLines, askForPlan } from './composeAI';

// The composer's own state: where the writer stands, what has been written, what the
// editor has offered, and whether the last thing said reached the record. Every step
// is filed through the studio's own save path, so a lap can be left at any point and
// the issue holds exactly what was written.

// An issue is created under a working name. That name is a placeholder, not a title, so
// the composer treats it as unwritten and the naming step still stands open.
const WORKING_TITLE = 'New Issue';

const seed = (issue) => ({
  direction: issue.opening_config?.tone || '',
  title: issue.title === WORKING_TITLE ? '' : issue.title || '',
  subtitle: issue.subtitle || '',
  cover_kicker: issue.cover_kicker || '',
  sections: issue.sections || [],
  preface: issue.preface || '',
  colophon: issue.colophon || '',
});

// Where a lap is picked up: the first decision not yet written. Everything before it is
// already filed on the issue, so a writer who leaves at any point — for the classic
// editor, for another surface, for the day — comes back to the step they were standing
// on rather than to the top of the lap.
const resumeIndex = (issue) => {
  const values = seed(issue);
  const next = COMPOSE_STEPS.findIndex((step) => step.kind !== 'review' && !isStepDone(values, step));
  return next < 0 ? REVIEW_INDEX : next;
};

export default function useComposer({ issue, standard, onSave }) {
  const [resumedFrom] = useState(() => resumeIndex(issue));
  const [index, setIndex] = useState(resumedFrom);
  const [values, setValues] = useState(() => seed(issue));
  const [savedAt, setSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [offer, setOffer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState('');

  const step = COMPOSE_STEPS[index];

  const setValue = useCallback(
    (value) => {
      setValues((prev) => ({ ...prev, [step.key]: value }));
      setSaveError('');
    },
    [step.key],
  );

  const setPlan = useCallback((sections) => {
    setValues((prev) => ({ ...prev, sections }));
    setSaveError('');
  }, []);

  const advance = () => setIndex((i) => Math.min(i + 1, COMPOSE_STEPS.length - 1));
  const back = () => setIndex((i) => Math.max(i - 1, 0));
  const jump = (key) => {
    const next = COMPOSE_STEPS.findIndex((s) => s.key === key);
    if (next >= 0) setIndex(next);
    setOffer(null);
    setAskError('');
  };

  const dismissOffer = () => setOffer(null);

  const takeLine = (text) => {
    setValues((prev) => ({ ...prev, [step.key]: text }));
    setOffer(null);
  };

  const takePlan = (sections) => {
    setValues((prev) => ({ ...prev, sections }));
    setOffer(null);
  };

  const commit = async () => {
    if (step.kind === 'review') return;
    const body = stepPatch(issue, step, values);
    if (!body) {
      advance();
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await onSave(body);
      setSavedAt(Date.now());
      advance();
    } catch (e) {
      setSaveError('That did not reach the record. The line is still here, try again.');
    } finally {
      setSaving(false);
    }
  };

  const skip = () => {
    setOffer(null);
    setAskError('');
    advance();
  };

  const ask = async () => {
    if (asking || step.kind === 'review') return;
    setAsking(true);
    setAskError('');
    try {
      if (step.kind === 'plan') {
        const plan = await askForPlan({ values, standard });
        setOffer({ kind: 'plan', ...plan });
      } else {
        const options = await askForLines({ step, values, standard });
        setOffer({ kind: 'lines', options });
      }
    } catch (e) {
      setAskError('The editor could not be reached just now. Ask again, or write the line yourself.');
    } finally {
      setAsking(false);
    }
  };

  return {
    index,
    step,
    values,
    offer,
    asking,
    askError,
    saving,
    saveError,
    savedAt,
    resumedFrom,
    isReview: index === REVIEW_INDEX,
    setValue,
    setPlan,
    commit,
    back,
    jump,
    skip,
    ask,
    dismissOffer,
    takeLine,
    takePlan,
  };
}