// Configuration for the multi-stage nomination form

export const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

export const CONNECTION_OPTIONS = [
  'I work in aerospace / aviation / space',
  "I'm a TOP 100 Fellow or Alumni",
  "I'm a community member or Booster",
  'I support the aerospace community (business, service provider, educator, etc.)',
  'Other',
];

export const LOCAL_LEGEND_TYPES = [
  'Boutique Fitness & Wellness',
  'Med Spa',
  'Hair Salon',
  'Barber Shop',
  'Meal Prep & Nutrition',
  'Childcare & Family Services',
  'Mental Health & Coaching',
  'Other',
];

export const STAGES = {
  WELCOME: 'welcome',
  ABOUT_YOU: 'about_you',
  WOMEN: 'women',
  MEN: 'men',
  ANGELS: 'angels',
  LOCAL_LEGENDS: 'local_legends',
  REVIEW: 'review',
  CONFIRMATION: 'confirmation',
};

export const STAGE_ORDER = [
  STAGES.WELCOME,
  STAGES.ABOUT_YOU,
  STAGES.WOMEN,
  STAGES.MEN,
  STAGES.ANGELS,
  STAGES.LOCAL_LEGENDS,
  STAGES.REVIEW,
  STAGES.CONFIRMATION,
];

// Empty record templates
export const GUIDED_PROMPTS = [
  { key: 'reason_contribution', label: "What is their primary contribution to the industry?" },
  { key: 'reason_impact', label: "How have they impacted others in the field?" },
  { key: 'reason_leadership', label: "What makes their approach or leadership unique?" },
];

// Combine the three guided prompt answers into a single reason string for storage.
export function combineGuidedReason(n) {
  const parts = [
    n.reason_contribution?.trim() && `Primary contribution: ${n.reason_contribution.trim()}`,
    n.reason_impact?.trim() && `Impact on others: ${n.reason_impact.trim()}`,
    n.reason_leadership?.trim() && `Leadership approach: ${n.reason_leadership.trim()}`,
  ].filter(Boolean);
  return parts.join('\n\n') || n.reason?.trim() || '';
}

export const emptyPersonNomination = () => ({
  name: '',
  role_org: '',
  link: '',
  email: '',
  location: '',
  reason_contribution: '',
  reason_impact: '',
  reason_leadership: '',
  reason: '',
  share_name: '',
});

export const emptyAngelNomination = () => ({
  name: '',
  firm: '',
  link: '',
  location: '',
  investing_in: '',
  reason: '',
  share_name: '',
});

export const emptyLocalLegend = () => ({
  business_name: '',
  business_type: '',
  city: '',
  owner_name: '',
  link: '',
  reason: '',
  share_name: '',
});