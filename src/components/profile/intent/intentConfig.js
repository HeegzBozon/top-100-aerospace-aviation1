import { B } from '@/components/fellow-home/fellowHomeConfig';

// The intent layer's approved vocabulary. Every value a Fellow can choose is drawn
// from these sets — the server validates against the same keys — so the profile
// stays an institutional artifact with governed expression in it, never a free-form
// page. None of it is ever read by discovery ordering, measurement, or scoring.

export const CAPABILITY_LABELS = {
  systems_engineering: 'Systems engineering',
  flight_test: 'Flight test',
  propulsion: 'Propulsion',
  avionics_software: 'Avionics & software',
  structures_materials: 'Structures & materials',
  mission_operations: 'Mission operations',
  safety_certification: 'Safety & certification',
  program_management: 'Program management',
  supply_chain: 'Supply chain',
  regulatory_policy: 'Regulatory & policy',
  business_development: 'Business development',
  team_leadership: 'Team leadership',
  autonomy_ai: 'Autonomy & AI',
  human_spaceflight: 'Human spaceflight',
};

export const OFFERING_LABELS = {
  advisory: 'Advisory',
  board_service: 'Board service',
  technical_due_diligence: 'Technical due diligence',
  speaking: 'Speaking',
  design_partner: 'Design partner',
  pilot_program: 'Pilot program',
  supply_partner: 'Supplier qualification',
  executive_search: 'Executive search',
  research_collaboration: 'Research collaboration',
  investment_thesis: 'Investment thesis',
};

export const REGION_LABELS = {
  north_america: 'North America',
  latin_america: 'Latin America',
  europe: 'Europe',
  uk_ireland: 'UK & Ireland',
  middle_east: 'Middle East',
  africa: 'Africa',
  asia_pacific: 'Asia Pacific',
  global_remote: 'Anywhere / remote',
};

export const DISCIPLINE_LABELS = {
  space_rd: 'Space R&D',
  commercial_aviation: 'Commercial aviation',
  defense: 'Defense',
  manufacturing: 'Manufacturing',
  operations: 'Operations',
  engineering: 'Engineering',
  policy: 'Policy',
  entrepreneurship: 'Entrepreneurship',
};

export const AVAILABILITY_OPTIONS = [
  { key: 'open_now', label: 'Open now', note: 'Ready for the right conversation' },
  { key: 'open_selective', label: 'Selective', note: 'Open to something exceptional' },
  { key: 'not_looking', label: 'Not looking', note: 'On the record, listening quietly' },
];

export const WORK_PREFERENCES = [
  { key: 'onsite', label: 'On site' },
  { key: 'hybrid', label: 'Hybrid' },
  { key: 'remote', label: 'Remote' },
  { key: 'flexible', label: 'Flexible' },
];

export const ENGAGEMENT_OPTIONS = [
  { key: 'open_now', label: 'Open now', note: 'Taking work this quarter' },
  { key: 'open_selective', label: 'Selective', note: 'One or two engagements' },
  { key: 'closed', label: 'Closed', note: 'Not taking new work' },
];

export const INQUIRY_ROUTE_OPTIONS = [
  { key: 'form', label: 'Private inquiry form', note: 'Visitors write; your address is never shown' },
  { key: 'form_linkedin', label: 'Form + LinkedIn', note: 'The form, and a LinkedIn key when you have a profile' },
];

export const REGION_KEYS = Object.keys(REGION_LABELS);

export const REQUEST_TYPES = {
  hire: [
    { key: 'role_conversation', label: 'A role conversation', hint: 'You have a seat to fill' },
    { key: 'dossier', label: 'Their dossier', hint: 'The one-page record' },
  ],
  commercial: [
    { key: 'introduction', label: 'An introduction', hint: 'Open a conversation' },
    { key: 'proposal_rfq', label: 'A proposal or RFQ', hint: 'You have a brief' },
    { key: 'asset_sheet', label: 'An asset sheet', hint: 'What they bring in detail' },
    { key: 'dossier', label: 'Their dossier', hint: 'The one-page record' },
  ],
};

export const TIMELINES = [
  { key: 'immediate', label: 'Now' },
  { key: 'this_quarter', label: 'This quarter' },
  { key: 'exploratory', label: 'Exploratory' },
];

export const MODES = {
  hire: {
    key: 'hire',
    flag: 'intent_hire_enabled',
    label: 'Job & Career',
    kicker: 'Open to work',
    pitchField: 'hire_pitch',
    availabilityField: 'hire_availability',
    optionsField: 'hire_capabilities',
    optionsLabel: 'Capabilities',
    cta: 'Start a conversation',
  },
  commercial: {
    key: 'commercial',
    flag: 'intent_commercial_enabled',
    label: 'Deal & BD',
    kicker: 'Open to engagement',
    pitchField: 'commercial_pitch',
    availabilityField: 'commercial_engagements',
    optionsField: 'commercial_offerings',
    optionsLabel: 'What you offer',
    cta: 'Open a conversation',
  },
};

export const MODE_ORDER = ['hire', 'commercial'];

export const enabledModes = (settings) => MODE_ORDER.filter((key) => settings?.[MODES[key].flag] === true);

export const hasIntent = (settings) => enabledModes(settings).length > 0;

export const labelOf = (map, key) => map[key] || key;

export const availabilityOption = (mode, key) => {
  const set = mode === 'hire' ? AVAILABILITY_OPTIONS : ENGAGEMENT_OPTIONS;
  return set.find((option) => option.key === key) || null;
};

export const requestLabel = (mode, key) => {
  const found = (REQUEST_TYPES[mode] || []).find((type) => type.key === key);
  return found?.label || key;
};

export const INK = {
  navy: B.navy,
  deep: B.navyDeep,
  copper: B.copper,
  gold: B.gold,
  cream: B.cream,
  muted: B.muted,
  border: B.border,
};