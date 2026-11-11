import { ANALYST, ANALYST_STANDING, CROSSCHECK, MANIFEST } from '@/components/voting/ballotNaming';

// The letter a visitor is handed at /vote, and the two sections under it, kept in one
// place so the page and any file taken away from it are written from the same words. A
// printable invitation can then never say something the page does not.
export const invitation = {
  label: 'TOP 100 Aerospace & Aviation · Selection Committee',
  greeting: 'Dear colleague,',
  headline: `You have been invited to serve as an ${ANALYST}.`,
  paragraphs: [
    'Recognition in our industry has too often gone to whoever is most visible. This committee exists to change that. When professionals who know the work set the field in order, the record that results is one the industry can trust, and every name in it is earned.',
    `Your judgement becomes part of that record. ${ANALYST_STANDING}`,
  ],
  signoff: 'With gratitude,',
  signature: 'The Selection Committee',
};

export const howItWorks = {
  label: 'How it works',
  heading: 'A Community Nominated Ranked Choice Ballot',
  intro: 'Analysts set the field. The community nominates, and the community analyzes: it puts the names forward, and it selects among them by ranked choice. There is no hidden formula deciding who stands. The community is the algorithm. It is cast two ways.',
  ballots: [
    {
      name: MANIFEST,
      kind: 'Ranked choice',
      steps: ['Nominate the professionals you back.', 'Put them in order, strongest first.', 'Save it. It stays editable while the window is open.'],
    },
    {
      name: CROSSCHECK,
      kind: 'Mini ranked choice',
      steps: ['Four professionals are shuffled for you.', 'Tap your Commander, then Pilot, then Engineer.', 'The fourth takes the last seat. The evaluation is recorded.'],
    },
  ],
};

export const faq = {
  label: 'Questions',
  heading: 'Before you begin',
  questions: [
    {
      q: 'Why do I need an account?',
      a: 'So that every ballot belongs to one Fellow and is counted once. Sign in, or open an account, and you return to this ballot directly.',
      note: 'Sign-in is handled by the platform',
    },
    {
      q: 'How are the two ballots different?',
      a: 'The Manifest is your own list: you choose the professionals and set their order. The Crosscheck shuffles four professionals for you, and you put that evaluation in order.',
      note: 'Both are ranked choice',
    },
    {
      q: 'Can I change my order later?',
      a: 'Your Manifest stays editable while the window is open. A Crosscheck evaluation is final once recorded, so skip it or save it for later if you are unsure.',
      note: 'Edits close with the cycle',
    },
    {
      q: 'How long does it take?',
      a: 'A Crosscheck evaluation takes about a minute. Complete as many as you like, and return whenever you have a moment.',
      note: 'Every evaluation is a complete ballot',
    },
    {
      q: 'Can placement be bought?',
      a: 'Never. Placement is measured from the orders Fellows leave. Sponsorship and availability carry no weight in selection.',
      note: 'Governance, not commerce',
    },
  ],
};