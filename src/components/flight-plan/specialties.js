// The specialties a Fellow may file once they are an Analyst.
//
// The office is taken up with the first measured set (see shared/votingProgress.ts), and
// what follows is a chart of one's own: the field an Analyst reads the industry from. It
// is a curated set, never a typed field, so the choice is one the house can answer to and
// the platform can read as a lens.
//
// It steers experience only — what is put in front of a Fellow, and which desks open on
// arrival. It is never read by discovery ordering, measurement, influence tier or
// scoring, and it never touches how a profile is shown to anyone else.
export const SPECIALTIES = [
  {
    key: 'launch_operations',
    label: 'Launch & Range Operations',
    line: 'Countdowns, range safety and the console that carries a mission uphill.',
  },
  {
    key: 'space_systems',
    label: 'Space Systems & Satellites',
    line: 'Spacecraft, payloads, constellations, and the ground that flies them.',
  },
  {
    key: 'airline_operations',
    label: 'Airline & Flight Operations',
    line: 'Crews, networks, dispatch and the daily flying programme.',
  },
  {
    key: 'airframe_propulsion',
    label: 'Airframe & Propulsion',
    line: 'Structures, engines, systems and the certification behind them.',
  },
  {
    key: 'manufacturing_supply',
    label: 'Manufacturing & Supply Chain',
    line: 'Production lines, suppliers, quality and throughput.',
  },
  {
    key: 'defence_security',
    label: 'Defence & National Security',
    line: 'Programmes, capability and the industrial base underneath.',
  },
  {
    key: 'policy_regulation',
    label: 'Policy, Regulation & Diplomacy',
    line: 'Rule-making, safety oversight and the international frameworks.',
  },
  {
    key: 'research_academia',
    label: 'Research & Academia',
    line: 'The science, the papers and the people who train the field.',
  },
  {
    key: 'investment_ventures',
    label: 'Investment & Ventures',
    line: 'Capital, founders and the companies being built now.',
  },
  {
    key: 'talent_media',
    label: 'Talent, Media & Communications',
    line: 'Careers, storytelling and the public record of the field.',
  },
];

export const specialtyFor = (key) => SPECIALTIES.find((entry) => entry.key === key) || null;

export const specialtyLabel = (key) => specialtyFor(key)?.label || '';