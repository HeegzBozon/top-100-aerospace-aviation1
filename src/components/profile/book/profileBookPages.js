import { resolveSlideOrder } from '@/components/profile-deck/slideDeckConfig';
import {
  enabledModes,
  MODES,
  hasIntent,
  DISCIPLINE_LABELS,
  CAPABILITY_LABELS,
  OFFERING_LABELS,
  availabilityOption,
} from '@/components/profile/intent/intentConfig';
import { STORY_PROMPTS } from '@/components/profile/documentary/documentaryChapters';
import { coverUrl } from '@/components/fellow-home/fellowHomeConfig';
import { stageLabel, stageNote } from '@/components/episode/episodeStages';
import { normalizeChapters } from '@/components/episode/episodeChapters';

// One record, cut into pages.
//
// Every page of the book is composed here, once, from what the record actually
// holds — and a page with nothing true to say is dropped rather than padded. The
// flipbook and the accessible reader both render this same array, so the two
// presentations can never disagree about what the record says.
//
// Order is structural: the identity cover holds position one and the credential
// position two. Everything after that follows the Fellow's own configured order,
// exactly as it does on the record itself.

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
  const kept = items.filter(Boolean);
  if (kept.length <= 1) return kept[0] || '';
  return `${kept.slice(0, -1).join(', ')} and ${kept[kept.length - 1]}`;
};

const year = (v) => (clean(v) ? clean(v).slice(0, 4) : '');

const VERIFICATION = {
  unverified: 'Unverified',
  self_verified: 'Self verified',
  partially_verified: 'Partially verified',
  fully_verified: 'Fully verified',
};

const CHECKS = [
  ['LinkedIn', 'linkedin_verified'],
  ['Employer', 'employer_verified'],
  ['Fellow review', 'sme_reviewed'],
  ['Metrics', 'metrics_validated'],
];

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

const tierOf = (nominee) => {
  const rank = nominee?.aura_rank_name || '';
  return TIERS.find((name) => rank.toLowerCase().includes(name.toLowerCase())) || 'Unbanded';
};

// ── The cover: who this is ────────────────────────────────────────────────────
function coverPage({ user, nominee, settings, accent }) {
  const name = clean(user?.full_name) || clean(nominee?.name);
  if (!name) return null;

  const role = clean(user?.headline) || clean(nominee?.professional_role) || clean(nominee?.title);
  const org = clean(nominee?.company) || clean(nominee?.organization);
  const place = clean(nominee?.location) || clean(nominee?.country) || clean(user?.location);
  const discipline = DISCIPLINE_LABELS[nominee?.discipline] || clean(nominee?.industry);
  const six = clean(settings?.six_word_story) || clean(user?.six_word_story) || clean(nominee?.six_word_story);

  return {
    key: 'identity',
    kind: 'cover',
    label: 'The record',
    title: name,
    standfirst: six ? `“${six}”` : '',
    facts: [
      { label: 'Standing', value: [role, org].filter(Boolean).join(', ') },
      { label: 'Based', value: place },
      { label: 'Field', value: discipline },
    ].filter((f) => f.value),
    portrait: clean(user?.avatar_url) || clean(nominee?.avatar_url) || clean(nominee?.photo_url),
    cover: coverUrl(settings?.cover_asset_id || user?.cover_key),
    accent: accent || null,
    lines: lines(nominee?.description).slice(0, 2),
  };
}

// ── Position two: the credential ──────────────────────────────────────────────
function credentialPage({ nominee }) {
  if (!nominee) return null;

  const status = nominee.verified_status || 'unverified';
  const checks = nominee.verification_status || {};
  const confirmed = CHECKS.filter(([, key]) => checks[key]).length;

  const text = [];
  if (nominee.claim_status === 'approved') {
    text.push('This record is claimed and maintained by its Fellow.');
  } else {
    text.push('This record has not been claimed by its subject yet.');
  }

  return {
    key: 'verification',
    kind: 'credential',
    label: 'Credential',
    title: VERIFICATION[status] || VERIFICATION.unverified,
    standfirst: `${confirmed} of ${CHECKS.length} checks confirmed`,
    facts: CHECKS.map(([label, key]) => ({ label, value: checks[key] ? 'Confirmed' : 'Open' })),
    tier: tierOf(nominee),
    lines: text,
    note: 'The institution measures. Individuals rank. Verification is never reordered, obscured, or sold.',
  };
}

// ── Availability: the doors the Fellow opened ─────────────────────────────────
function availabilityPage({ settings, nominee }) {
  const modes = enabledModes(settings);
  if (!modes.length) return null;

  const firstName = (clean(nominee?.name) || 'this Fellow').split(' ')[0];

  const facts = modes.map((mode) => {
    const pitch = clean(settings?.[MODES[mode].pitchField]);
    const chips = (settings?.[MODES[mode].optionsField] || []).filter(Boolean);
    const map = mode === 'hire' ? CAPABILITY_LABELS : OFFERING_LABELS;
    const named = chips.map((k) => map[k]).filter(Boolean).slice(0, 3);
    const open = availabilityOption(mode, settings?.[MODES[mode].availabilityField]);
    return {
      label: MODES[mode].label,
      value: pitch || (open?.label ? `Open — ${open.label}` : 'Open to conversation'),
      body: named.length ? named.join(' · ') : '',
    };
  });

  return {
    key: 'opportunity',
    kind: 'availability',
    label: 'Availability',
    title: `Work with ${firstName}.`,
    standfirst:
      modes.length > 1
        ? 'Two doors are open: a career conversation and a commercial engagement.'
        : 'One door is open. Every enquiry arrives privately; no address is published.',
    facts,
    action: { kind: 'enquire', label: 'Write through the enquiry desk' },
  };
}

// ── The editorial page: the Fellow's own words, and the interview ─────────────
function wordsPage({ settings, nominee }) {
  const answers = settings?.documentary_prompts || {};

  const quotes = STORY_PROMPTS.filter((p) => clean(answers[p.key])).map((p) => ({
    label: p.label,
    text: clean(answers[p.key]),
  }));

  const text = [];
  const about = clean(settings?.about_me);
  if (about) text.push(about);
  const meet = clean(settings?.who_id_like_to_meet);
  if (meet) text.push(`Would like to meet. ${meet}`);
  if (!text.length) text.push(...lines(nominee?.bio_extended).slice(0, 2));

  if (!text.length && !quotes.length) return null;

  return {
    key: 'blurb',
    kind: 'words',
    label: 'Editorial',
    title: 'In their own words',
    standfirst: quotes.length ? `${quotes.length} interview ${quotes.length === 1 ? 'excerpt' : 'excerpts'} cut in` : '',
    lines: text.slice(0, 3),
    quotes: quotes.slice(0, 2),
    note: quotes.length ? 'The documentary record, in the Fellow\u2019s own telling.' : '',
  };
}

// ── Materials on file ────────────────────────────────────────────────────────
const DOCUMENTS = [
  { field: 'resume_url', label: 'Résumé' },
  { field: 'cover_letter_url', label: 'Cover letter' },
  { field: 'portfolio_url', label: 'Portfolio' },
  { field: 'linkedin_pdf_url', label: 'LinkedIn profile' },
];

function materialsPage({ user }) {
  const docs = DOCUMENTS.map((d) => ({ ...d, url: clean(user?.[d.field]) })).filter((d) => d.url);
  const linkedin = clean(user?.linkedin_profile_url);
  if (!docs.length && !linkedin) return null;

  return {
    key: 'documents',
    kind: 'materials',
    label: 'Materials',
    title: 'What they have on file',
    standfirst: 'Placed by the Fellow themselves, and reused across every enquiry.',
    files: [
      ...docs.map((d) => ({ label: d.label, url: d.url })),
      ...(linkedin ? [{ label: 'LinkedIn', url: linkedin }] : []),
    ].slice(0, 5),
  };
}

// ── The Eight: eight ordinal slots, always all eight ──────────────────────────
function eightPage({ settings, rankings }) {
  if (settings && settings.eight_public === false) return null;
  const entries = (rankings || []).filter(Boolean);
  if (!entries.length) return null;

  const slots = Array.from({ length: 8 }, (_, i) => entries[i] || null);

  return {
    key: 'eight',
    kind: 'eight',
    label: 'Affiliation',
    title: 'The Eight',
    standfirst: `${entries.length} of eight positions named · position one reads as position one`,
    slots,
    note: 'Eight is the whole allowance. An entry carries no weight in how the institution measures anyone.',
  };
}

// ── Flightography: career, education, contribution ───────────────────────────
function flightographyPage({ nominee }) {
  if (!nominee) return null;

  const roles = (nominee.career_history || []).filter(
    (r) => clean(r.company_name) || clean(r.role_title)
  );
  const ordered = [...roles].sort((a, b) => clean(a.start_date).localeCompare(clean(b.start_date)));

  const entries = ordered.slice(-4).reverse().map((r) => ({
    head: [clean(r.role_title), clean(r.company_name)].filter(Boolean).join(', '),
    meta: [year(r.start_date), year(r.end_date) || 'Present'].filter(Boolean).join('–'),
  }));

  const education = (nominee.education || [])
    .filter((e) => clean(e.institution_name) || clean(e.degree))
    .slice(0, 2)
    .map((e) => ({
      head: [clean(e.degree), clean(e.field_of_study)].filter(Boolean).join(', '),
      meta: clean(e.institution_name),
    }));

  const achievements = lines(nominee.achievements).slice(0, 2);
  const summary = clean(nominee.impact_summary);
  const text = summary ? [summary, ...achievements].slice(0, 2) : achievements;

  const stats = [];
  const patents = nominee.impact_metrics?.patents_count;
  if (typeof patents === 'number' && patents > 0) stats.push({ label: 'Patents', value: `${patents}` });
  const mentored = nominee.ecosystem_metrics?.women_mentored;
  if (typeof mentored === 'number' && mentored > 0) stats.push({ label: 'Mentored', value: `${mentored}` });
  const awards = (nominee.leadership_metrics?.awards || []).filter(Boolean);
  if (awards.length) stats.push({ label: 'Awards', value: `${awards.length}` });
  const skills = (nominee.skills || []).filter(Boolean).slice(0, 4);
  if (skills.length) stats.push({ label: 'Practice', value: list(skills) });

  if (!entries.length && !education.length && !text.length && !stats.length) return null;

  return {
    key: 'flightography',
    kind: 'flightography',
    label: 'Flightography',
    title: 'The record',
    standfirst: [clean(nominee.professional_role), clean(nominee.company)].filter(Boolean).join(' · '),
    lines: text,
    entries: entries.slice(0, 3),
    education,
    stats,
  };
}

// ── The Top Viral Post spread ────────────────────────────────────────────────
function viralPage({ featuredViral }) {
  if (!featuredViral) return null;

  return {
    key: 'viral_post',
    kind: 'viral',
    label: 'Top Viral Posts Series',
    title: 'The post that travelled.',
    standfirst: clean(featuredViral.viral_post_impressions),
    lines: clean(featuredViral.viral_post_takeaway) ? [clean(featuredViral.viral_post_takeaway)] : [],
    quote: clean(featuredViral.viral_post_wisdom),
    link: clean(featuredViral.viral_post_link),
    screenshot: clean(featuredViral.viral_post_screenshot_url),
  };
}

// ── Mission Rooms ────────────────────────────────────────────────────────────
function conferencesPage({ conferences }) {
  const rows = (conferences || []).filter((c) => clean(c.conference_name));
  if (!rows.length) return null;

  return {
    key: 'conferences',
    kind: 'conferences',
    label: 'Mission Rooms',
    title: 'Where the work meets',
    standfirst: `${rows.length} ${rows.length === 1 ? 'declaration' : 'declarations'} on the record`,
    entries: rows.slice(0, 5).map((c) => ({
      head: clean(c.conference_name),
      meta: [clean(c.focus_area), clean(c.status)].filter(Boolean).join(' · '),
    })),
  };
}

// ── The episode ──────────────────────────────────────────────────────────────
function episodePage({ episode, nominee }) {
  const name = (clean(nominee?.name) || 'This Fellow').split(' ')[0];

  if (!episode) {
    return {
      key: 'episode',
      kind: 'episode',
      label: 'The episode',
      title: `${name}'s episode`,
      standfirst: 'Not yet opened',
      lines: [
        'The documentary record on this page is the foundation of an interview episode: the archive, the chapters, and the material a filmed or recorded conversation is cut from.',
        'No episode has been opened for this record yet.',
      ],
      episode: null,
      action: { kind: 'episode', label: 'Open your episode' },
    };
  }

  return {
    key: 'episode',
    kind: 'episode',
    label: 'The episode',
    title: clean(episode.headline) || `${name}'s episode`,
    standfirst: stageLabel(episode.status),
    status: episode.status,
    lines: [clean(episode.angle) || stageNote(episode.status)].filter(Boolean),
    note: stageNote(episode.status),
    episode,
    action: { kind: 'episode', label: 'Your episode' },
  };
}

// ── The episode's own arc ────────────────────────────────────────────────────
// The Fellow's chapters, printed in their own order. Position is meaning here, so
// nothing is re-sorted: the book plays them exactly as they were written.
function chapterPages({ episode }) {
  return normalizeChapters(episode?.chapters).map((chapter, i) => {
    const label = `Chapter ${String(i + 1).padStart(2, '0')}`;
    return {
      key: `episode_chapter_${i}`,
      kind: 'chapter',
      label,
      title: chapter.title || label,
      lines: lines(chapter.body).slice(0, 8),
    };
  });
}

const MODULE_BUILDERS = {
  viral_post: viralPage,
  blurb: wordsPage,
  documents: materialsPage,
  eight: eightPage,
  flightography: flightographyPage,
  conferences: conferencesPage,
};

export function buildProfileBook({
  user,
  nominee,
  settings,
  rankings = [],
  featuredViral = null,
  conferences = [],
  episode = null,
  accent = null,
}) {
  const ctx = { user, nominee, settings, rankings, featuredViral, conferences, episode, accent };

  // The record's own order, after the two locked positions, exactly as the
  // Fellow configured it. A module with nothing in it is dropped, not blanked.
  const ordered = resolveSlideOrder(settings)
    .filter((key) => key !== 'identity' && key !== 'verification')
    .map((key) => MODULE_BUILDERS[key]?.(ctx))
    .filter(Boolean);

  const pages = [
    coverPage(ctx),
    credentialPage(ctx),
    hasIntent(settings) ? availabilityPage(ctx) : null,
    ...ordered,
    episodePage(ctx),
    ...chapterPages(ctx),
  ].filter(Boolean);

  const answered = STORY_PROMPTS.filter((p) =>
    clean((settings?.documentary_prompts || {})[p.key])
  ).length;

  return {
    pages: pages.map((page, i) => ({ ...page, number: String(i + 1).padStart(2, '0') })),
    answered,
  };
}