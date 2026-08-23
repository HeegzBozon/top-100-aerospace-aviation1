// Step definitions for the guided profile update.
// Each step is one question, asked in the voice of the craftsperson running
// that sitting. `sitting` assigns the step to The Photographer or The Biographer.

export const WIZARD_SECTIONS = [
  { id: 'photographer', label: 'The Photographer' },
  { id: 'biographer', label: 'The Biographer' },
];

const countWords = (v) => String(v || '').trim().split(/\s+/).filter(Boolean).length;

export const profileWizardSteps = [
  // ── SITTING I · THE PHOTOGRAPHER ────────────────────────────
  {
    key: 'avatar_url',
    sitting: 'photographer',
    section: 'photographer',
    type: 'headshot',
    question: 'Look at the lens.',
    subtitle: 'This frame leads your profile, your card, and any editorial feature you appear in.',
    help: 'Front-facing, well lit, shoulders up. No group shots, no heavy filters. A phone photo against a plain wall beats a cropped conference badge photo every time.',
  },
  {
    key: 'one_word',
    sitting: 'photographer',
    section: 'photographer',
    type: 'oneword',
    question: 'Now sign it. One word.',
    subtitle: 'A portrait needs a signature. Choose the word you would defend.',
    placeholder: 'RELENTLESS',
    required: true,
    help: 'Pick the word a colleague would use about your work, not a word from a job description. One word only, no spaces.',
    validate: (form) => {
      const v = String(form.one_word || '').trim();
      if (!v) return 'One word. Any word, so long as it is yours.';
      if (/\s/.test(v)) return 'One word only, no spaces.';
      if (v.length > 24) return 'Keep it under 24 characters.';
      return null;
    },
  },

  // ── SITTING II · THE BIOGRAPHER ─────────────────────────────
  {
    key: 'industry_role',
    sitting: 'biographer',
    section: 'biographer',
    type: 'text',
    question: 'What do they call you at work?',
    subtitle: 'The title you would want printed next to your name.',
    placeholder: 'e.g. Propulsion Engineer, Test Pilot',
    required: true,
  },
  {
    key: 'headline',
    sitting: 'biographer',
    section: 'biographer',
    type: 'text',
    question: 'Give me the line under your name.',
    subtitle: 'One sentence that positions you. It sits at the top of your public profile.',
    placeholder: 'e.g. Building the next generation of lunar landers',
  },
  {
    key: 'location',
    sitting: 'biographer',
    section: 'biographer',
    type: 'text',
    question: 'And where do I find you?',
    subtitle: 'City and country. This places you on the map of the index.',
    placeholder: 'e.g. Houston, United States',
  },
  {
    key: 'six_word_story',
    sitting: 'biographer',
    section: 'biographer',
    type: 'sixword',
    question: 'Your career. Six words.',
    subtitle: 'Exactly six. I will not take seven.',
    placeholder: 'Grounded dreamer. Built wings. Never landed.',
    required: true,
    help: 'Six words forces a real choice. Aim for a turn: where you started, what changed, where you are now. Punctuation is free, words are not.',
    validate: (form) => {
      const n = countWords(form.six_word_story);
      if (n === 0) return 'Six words, exactly.';
      if (n !== 6) return `That is ${n} word${n === 1 ? '' : 's'}. I asked for six.`;
      return null;
    },
  },
  {
    key: 'bio',
    sitting: 'biographer',
    section: 'biographer',
    type: 'textarea',
    question: 'Now take your time.',
    subtitle: 'A few sentences in your own voice. This becomes the body of your profile.',
    placeholder: 'What you work on, what you have shipped, and what you are chasing next.',
    help: 'Write it as you would say it out loud. Specifics beat adjectives: name the program, the aircraft, the mission, the number.',
  },
  {
    key: 'expertise_tags',
    sitting: 'biographer',
    section: 'biographer',
    type: 'tags',
    question: 'What are you expert in?',
    subtitle: 'Up to six disciplines. These connect you to others working your problem.',
    placeholder: 'e.g. Propulsion, Avionics, UAV',
    max: 6,
  },
  {
    key: 'linkedin_url',
    sitting: 'biographer',
    section: 'biographer',
    type: 'text',
    question: 'Anything I can verify you against?',
    subtitle: 'Your LinkedIn strengthens verification and fills in your record automatically.',
    placeholder: 'linkedin.com/in/yourname',
  },
  {
    key: 'documents',
    sitting: 'biographer',
    section: 'biographer',
    type: 'documents',
    question: 'Bring your documents.',
    subtitle: 'Resume, cover letter, portfolio, or LinkedIn. Bring what you have, skip what you don\u2019t. We keep it on file so you never re-upload it again.',
  },
  {
    key: 'website_url',
    sitting: 'biographer',
    section: 'biographer',
    type: 'text',
    question: 'Anywhere else worth reading?',
    subtitle: 'A personal site, portfolio, lab page, or company profile. Optional.',
    placeholder: 'yoursite.com',
  },
  {
    key: 'publish_consent',
    sitting: 'biographer',
    section: 'biographer',
    type: 'consent',
    question: 'Do I have your permission to run it?',
    subtitle: 'Your name, role, portrait, and answers become part of the public index and editorial features. Your call, and you can change it any time.',
    affirmative: 'Yes, publish my profile',
    negative: 'Keep my profile private for now',
    required: true,
  },
];

export const countWordsIn = countWords;