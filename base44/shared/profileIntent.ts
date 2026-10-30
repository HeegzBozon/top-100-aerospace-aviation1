// The intent layer's approved sets. A Fellow expresses themselves inside these —
// the switches, the capability keys, the availability states — and nothing here is
// ever read by discovery ordering, measurement, influence tier, or scoring. It is a
// conversion surface bolted onto the record, never a ranking input.

export const INTENT_DOMAINS = [
  'space_rd',
  'commercial_aviation',
  'defense',
  'manufacturing',
  'operations',
  'engineering',
  'policy',
  'entrepreneurship',
];

export const HIRE_CAPABILITIES = [
  'systems_engineering',
  'flight_test',
  'propulsion',
  'avionics_software',
  'structures_materials',
  'mission_operations',
  'safety_certification',
  'program_management',
  'supply_chain',
  'regulatory_policy',
  'business_development',
  'team_leadership',
  'autonomy_ai',
  'human_spaceflight',
];

export const COMMERCIAL_OFFERINGS = [
  'advisory',
  'board_service',
  'technical_due_diligence',
  'speaking',
  'design_partner',
  'pilot_program',
  'supply_partner',
  'executive_search',
  'research_collaboration',
  'investment_thesis',
];

export const INTENT_REGIONS = [
  'north_america',
  'latin_america',
  'europe',
  'uk_ireland',
  'middle_east',
  'africa',
  'asia_pacific',
  'global_remote',
];

export const HIRE_AVAILABILITY = ['open_now', 'open_selective', 'not_looking'];
export const WORK_PREFERENCES = ['onsite', 'hybrid', 'remote', 'flexible'];
export const COMMERCIAL_ENGAGEMENTS = ['open_now', 'open_selective', 'closed'];
export const INQUIRY_ROUTES = ['form', 'form_linkedin'];

export const INQUIRY_MODES = ['hire', 'commercial'];
export const INQUIRY_TYPES = [
  'role_conversation',
  'dossier',
  'introduction',
  'proposal_rfq',
  'asset_sheet',
];
export const INQUIRY_TIMELINES = ['immediate', 'this_quarter', 'exploratory'];

export const PITCH_MAX = 280;

// A submitted list is only ever a subset of its approved set, deduplicated, capped.
export function pickAllowed(value: unknown, allow: string[], cap = 12): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const raw of value) {
    const key = String(raw);
    if (allow.includes(key) && !out.includes(key)) out.push(key);
    if (out.length >= cap) break;
  }
  return out;
}

export function oneOf(value: unknown, allow: string[], fallback?: string): string | undefined {
  const key = String(value ?? '');
  if (allow.includes(key)) return key;
  return fallback;
}