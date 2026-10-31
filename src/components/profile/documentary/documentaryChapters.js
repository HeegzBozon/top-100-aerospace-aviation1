import { ACCENTS } from '@/components/fellow-home/fellowHomeConfig';

// The story prompts. Four questions, each cut into a chapter of the film, so a
// Fellow's own words always land where they belong in the arc. Answers are stored
// on FellowProfileSettings.documentary_prompts and render as interview excerpts.
export const STORY_PROMPTS = [
  {
    key: 'first_light',
    chapter: 'opening',
    label: 'First light',
    question: 'What first pulled you into aerospace, and where were you standing when it happened?',
  },
  {
    key: 'turning_point',
    chapter: 'route',
    label: 'The turning point',
    question: 'Which decision changed the direction of your career?',
  },
  {
    key: 'hardest_problem',
    chapter: 'work',
    label: 'The hardest problem',
    question: 'What problem did you take on that no one else would?',
  },
  {
    key: 'what_next',
    chapter: 'next',
    label: 'What comes next',
    question: 'What are you building, or looking for, next?',
  },
];

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

const lines = (v) =>
  clean(v)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => p.split(/(?<=[.!?])\s+/))
    .map((s) => s.trim())
    .filter(Boolean);

const list = (items) => {
  const clean_ = items.filter(Boolean);
  if (clean_.length <= 1) return clean_[0] || '';
  return `${clean_.slice(0, -1).join(', ')} and ${clean_[clean_.length - 1]}`;
};

const year = (v) => (clean(v) ? clean(v).slice(0, 4) : '');

const disciplineLabel = (key) => (ACCENTS.find((a) => a.key === key) || {}).label || '';

const VERIFICATION = {
  unverified: 'The record is not yet verified.',
  self_verified: 'The record is self-verified by the Fellow.',
  partially_verified: 'The record is partially verified.',
  fully_verified: 'The record is fully verified.',
};

// Every chapter is composed only from fields that actually hold something. A
// chapter with nothing true to say is dropped, never padded — which is what makes
// a thin profile read as a short film rather than a broken page.
function opening({ user, nominee, quotes }) {
  const name = clean(nominee?.name) || clean(user?.full_name);
  if (!name) return null;

  const role = clean(nominee?.professional_role) || clean(nominee?.title);
  const org = clean(nominee?.company) || clean(nominee?.organization);
  const where = clean(nominee?.country);
  const discipline = disciplineLabel(nominee?.discipline);

  const text = [];
  const standfirst = lines(nominee?.description).slice(0, 2).join(' ');
  if (standfirst) text.push(standfirst);

  const lead = [role, org].filter(Boolean).join(', ');
  if (lead && where) text.push(`${lead}. Based in ${where}.`);
  else if (lead) text.push(`${lead}.`);
  else if (where) text.push(`Based in ${where}.`);

  if (!text.length && !quotes.length) {
    text.push('A record held in the TOP 100 Aerospace & Aviation.');
  }

  return {
    key: 'opening',
    label: 'Opening',
    title: name,
    slate: [role || discipline, where].filter(Boolean).join('  ·  '),
    lines: text,
    quotes,
    still: clean(nominee?.avatar_url) || clean(nominee?.photo_url) || null,
  };
}

function credential({ nominee, quotes }) {
  if (!nominee) return null;

  const checks = nominee.verification_status || {};
  const confirmed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  const text = [];
  const verified = VERIFICATION[nominee.verified_status];
  if (verified) text.push(verified);
  if (total && confirmed) text.push(`${confirmed} of ${total} verification checkpoints confirmed.`);

  const affiliations = (nominee.affiliations || []).filter(Boolean);
  if (affiliations.length) text.push(`On the record with ${list(affiliations.slice(0, 5))}.`);

  const education = (nominee.education || []).filter(
    (e) => clean(e.institution_name) || clean(e.degree)
  );
  if (education.length) {
    text.push(
      education
        .slice(0, 2)
        .map((e) => [clean(e.degree), clean(e.field_of_study), clean(e.institution_name)].filter(Boolean).join(', '))
        .filter(Boolean)
        .join('. ')
    );
  }

  if (!text.length && !quotes.length) return null;

  return {
    key: 'credential',
    label: 'Credential',
    title: 'The record, as held',
    slate: disciplineLabel(nominee.discipline),
    lines: text.filter(Boolean),
    quotes,
  };
}

function work({ nominee, quotes }) {
  const summary = clean(nominee?.impact_summary);
  const bio = clean(nominee?.bio_extended) || clean(nominee?.bio);
  const body = [summary, bio].filter(Boolean).find((v) => v !== clean(nominee?.description));

  const text = body ? lines(body).slice(0, 3) : [];
  const skills = (nominee?.skills || []).filter(Boolean).slice(0, 6);
  if (skills.length) text.push(`The practice sits across ${list(skills)}.`);

  if (!text.length && !quotes.length) return null;

  return {
    key: 'work',
    label: 'The work',
    title: clean(nominee?.professional_role) || 'The work itself',
    slate: [clean(nominee?.company), clean(nominee?.industry)].filter(Boolean).join('  ·  '),
    lines: text,
    quotes,
  };
}

function route({ nominee, quotes }) {
  const roles = (nominee?.career_history || []).filter(
    (r) => clean(r.company_name) || clean(r.role_title)
  );
  if (!roles.length && !quotes.length) return null;

  const ordered = [...roles].sort((a, b) =>
    clean(a.start_date).localeCompare(clean(b.start_date))
  );
  const text = ordered.slice(0, 5).map((r) => {
    const span = [year(r.start_date), year(r.end_date) || 'Present'].filter(Boolean).join('–');
    const head = [clean(r.role_title), clean(r.company_name)].filter(Boolean).join(', ');
    return span ? `${head} · ${span}` : head;
  });

  const first = ordered[0];
  const detail = first ? lines(first.description).slice(0, 1).join(' ') : '';
  if (detail) text.push(detail);

  return {
    key: 'route',
    label: 'The route',
    title: 'How the work travelled',
    slate: year(ordered[0]?.start_date) ? `Since ${year(ordered[0].start_date)}` : '',
    lines: text.filter(Boolean),
    quotes,
  };
}

function contributions({ nominee, quotes }) {
  const text = lines(nominee?.achievements).slice(0, 3);

  const awards = (nominee?.leadership_metrics?.awards || []).filter(Boolean);
  if (awards.length) text.push(`Recognised with ${list(awards.slice(0, 4))}.`);

  const patents = nominee?.impact_metrics?.patents_count;
  if (typeof patents === 'number' && patents > 0) {
    text.push(`${patents} ${patents === 1 ? 'patent' : 'patents'} on the record.`);
  }

  const mentored = nominee?.ecosystem_metrics?.women_mentored;
  if (typeof mentored === 'number' && mentored > 0) {
    text.push(`${mentored} people mentored into the field.`);
  }

  if (!text.length && !quotes.length) return null;

  return {
    key: 'contributions',
    label: 'Contribution',
    title: 'What it changed',
    slate: '',
    lines: text,
    quotes,
  };
}

function words({ settings, quotes }) {
  const own = [
    { label: 'In their own words', text: clean(settings?.about_me) },
    { label: 'Who they would like to meet', text: clean(settings?.who_id_like_to_meet) },
    { label: 'Six words', text: clean(settings?.six_word_story) },
  ].filter((q) => q.text);

  const all = [...quotes, ...own];
  if (!all.length) return null;

  return {
    key: 'words',
    label: 'In their words',
    title: 'The interview',
    slate: '',
    lines: [],
    quotes: all,
  };
}

function eight({ settings, rankings, quotes }) {
  if (!settings || settings.eight_public === false) return null;

  const entries = (rankings || []).filter(Boolean);
  if (!entries.length) return null;

  const names = entries.map((r) => clean(r.nominee_name) || clean(r.name)).filter(Boolean);
  const text = [`${entries.length} of eight positions named.`];
  if (names.length) text.push(`In order, the list opens with ${list(names.slice(0, 3))}.`);

  return {
    key: 'eight',
    label: 'Affiliation',
    title: 'The Eight',
    slate: 'Personal list · ordinal',
    lines: text,
    quotes,
  };
}

function next({ settings, quotes }) {
  const text = [];
  const hire = clean(settings?.hire_pitch);
  const commercial = clean(settings?.commercial_pitch);
  if (hire) text.push(hire);
  if (commercial) text.push(commercial);

  if (!text.length && !quotes.length) return null;

  return {
    key: 'next',
    label: 'Next',
    title: 'The next chapter',
    slate: settings?.intent_hire_enabled || settings?.intent_commercial_enabled ? 'Open to conversation' : '',
    lines: text,
    quotes,
  };
}

function cutIn(media, key) {
  const contribution = (media || []).find((m) => m && m.chapter === key && clean(m.url));
  return contribution || null;
}

export function buildDocumentary({ user, nominee, settings, rankings = [] }) {
  const answers = settings?.documentary_prompts || {};
  const quotesFor = (chapterKey) =>
    STORY_PROMPTS.filter((p) => p.chapter === chapterKey && clean(answers[p.key])).map((p) => ({
      label: p.label,
      text: clean(answers[p.key]),
    }));

  const built = [
    ['opening', opening],
    ['credential', credential],
    ['work', work],
    ['route', route],
    ['contributions', contributions],
    ['words', words],
    ['eight', eight],
    ['next', next],
  ]
    .map(([key, builder]) =>
      builder({ user, nominee, settings, rankings, quotes: quotesFor(key) })
    )
    .filter(Boolean)
    .map((chapter, i) => ({
      ...chapter,
      number: String(i + 1).padStart(2, '0'),
      media: cutIn(settings?.documentary_media, chapter.key),
    }));

  const answered = STORY_PROMPTS.filter((p) => clean(answers[p.key])).length;

  return {
    chapters: built,
    answered,
    openPrompts: STORY_PROMPTS.filter((p) => !clean(answers[p.key])),
  };
}