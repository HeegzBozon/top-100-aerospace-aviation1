import { ACCENTS } from '@/components/fellow-home/fellowHomeConfig';

// Three starter Domain Networks — launched where Fellow density is already
// deepest. Three run well beats twelve that go quiet.
export const STARTER_NETWORKS = [
  { name: 'Orbital & Space Systems', domain_focus: 'space_rd', charter: 'Distilling mission, payload, and policy practice across launch, satellite, and exploration programs.' },
  { name: 'Commercial Aviation Network', domain_focus: 'commercial_aviation', charter: 'Convening flight operations, MRO, and manufacturing practice across the commercial fleet.' },
  { name: 'Aerospace Manufacturing Practice', domain_focus: 'manufacturing', charter: 'A practice body for aerospace manufacturing — production systems, supply chain, and quality.' },
];

export const accentForDomain = (domain) =>
  (ACCENTS.find((a) => a.key === domain) || ACCENTS[0]).value;

export const labelForDomain = (domain) =>
  (ACCENTS.find((a) => a.key === domain) || {}).label || domain;