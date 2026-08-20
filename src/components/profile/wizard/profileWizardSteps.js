// Step definitions for the guided profile builder.
// Each step is one question. Sections drive the chapter label in the wizard chrome.

export const WIZARD_SECTIONS = [
  { id: 'identity', label: 'Identity' },
  { id: 'voice', label: 'Your Voice' },
  { id: 'record', label: 'The Record' },
];

const countWords = (v) => String(v || '').trim().split(/\s+/).filter(Boolean).length;

export const profileWizardSteps = [
  // ── IDENTITY ────────────────────────────────────────────────
  {
    key: 'avatar_url',
    section: 'identity',
    type: 'headshot',
    question: 'Start with your face.',
    subtitle: 'Your headshot leads your profile, your trading card, and any editorial feature you appear in.',
    help: 'Front-facing, well lit, shoulders up. Avoid group photos and heavy filters. A phone photo against a plain wall works better than an old cropped conference shot.',
  },
  {
    key: 'industry_role',
    section: 'identity',
    type: 'text',
    question: 'What is your role?',
    subtitle: 'The title you would want printed next to your name.',
    placeholder: 'e.g. Propulsion Engineer, Test Pilot',
    required: true,
  },
  {
    key: 'headline',
    section: 'identity',
    type: 'text',
    question: 'What is your headline?',
    subtitle: 'One line that positions you. This sits at the top of your public profile.',
    placeholder: 'e.g. Building the next generation of lunar landers',
  },
  {
    key: 'location',
    section: 'identity',
    type: 'text',
    question: 'Where are you based?',
    subtitle: 'City and country. This places you on the map of the index.',
    placeholder: 'e.g. Houston, United States',
  },

  // ── YOUR VOICE ──────────────────────────────────────────────
  {
    key: 'one_word',
    section: 'voice',
    type: 'oneword',
    question: 'Your work in one word.',
    subtitle: 'A single word. Choose the one you would defend.',
    placeholder: 'RELENTLESS',
    required: true,
    help: 'Pick the word a colleague would use about your work, not a word from a job description. One word only, no spaces.',
    validate: (form) => {
      const v = String(form.one_word || '').trim();
      if (!v) return 'Enter one word.';
      if (/\s/.test(v)) return 'One word only, no spaces.';
      if (v.length > 24) return 'Keep it under 24 characters.';
      return null;
    },
  },
  {
    key: 'six_word_story',
    section: 'voice',
    type: 'sixword',
    question: 'Your career in six words.',
    subtitle: 'Exactly six. The constraint is the point.',
    placeholder: 'Grounded dreamer. Built wings. Never landed.',
    required: true,
    help: 'Six words forces a real choice. Aim for a turn: where you started, what changed, where you are now. Punctuation is free, words are not.',
    validate: (form) => {
      const n = countWords(form.six_word_story);
      if (n === 0) return 'Six words, exactly.';
      if (n !== 6) return `That is ${n} word${n === 1 ? '' : 's'}. Six is the constraint.`;
      return null;
    },
  },
  {
    key: 'bio',
    section: 'voice',
    type: 'textarea',
    question: 'Now the longer version.',
    subtitle: 'A few sentences in your own voice. This is the body of your profile.',
    placeholder: 'What you work on, what you have shipped, and what you are chasing next.',
    help: 'Write it as you would say it out loud. Specifics beat adjectives: name the program, the aircraft, the mission, the number.',
  },

  // ── THE RECORD ──────────────────────────────────────────────
  {
    key: 'expertise_tags',
    section: 'record',
    type: 'tags',
    question: 'What are your disciplines?',
    subtitle: 'Up to six. These connect you to others working in your field.',
    placeholder: 'e.g. Propulsion, Avionics, UAV',
    max: 6,
  },
  {
    key: 'linkedin_url',
    section: 'record',
    type: 'text',
    question: 'Your LinkedIn?',
    subtitle: 'Strengthens your verification and fills in your record automatically.',
    placeholder: 'linkedin.com/in/yourname',
  },
  {
    key: 'website_url',
    section: 'record',
    type: 'text',
    question: 'Anywhere else worth seeing?',
    subtitle: 'A personal site, portfolio, lab page, or company profile. Optional.',
    placeholder: 'yoursite.com',
  },
  {
    key: 'publish_consent',
    section: 'record',
    type: 'consent',
    question: 'Ready to go public?',
    subtitle: 'Your name, role, photo, and answers become part of the public index and editorial features. Your call, and you can change it any time.',
    affirmative: 'Yes, publish my profile',
    negative: 'Keep my profile private for now',
    required: true,
  },
];

export const countWordsIn = countWords;