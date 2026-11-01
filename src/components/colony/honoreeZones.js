// Where an honoree's booth stands on campus. Read from title and role only (bios mention
// "space" too often to place anyone), most specific signal first: a pilot is placed at the
// Flight Exhibit before space is considered, and a role (CEO, journalist, educator) is read
// before an industry word. Placement is editorial, never measured.
const RULES = [
  ['hall', /pilot|captain|aviator|airline|air traffic|\batc\b|\bmro\b|maintenance|cabin crew/i],
  ['media-hub', /journalist|editor|podcast|author|\bhost\b|media|communicat|content|creator|marketing|writer|speaker/i],
  ['career-center', /student|mentor|educat|professor|lecturer|teacher|instructor|\bstem\b|recruit|talent|coach|cadet|intern/i],
  ['leadership-summit', /\bceo\b|president|chair|chief|\bvp\b|vice president|director|head of|board|general|executive|managing/i],
  ['networking-lounge', /consult|advis|business development|sales|investor|angel|policy|advoca|community|partner/i],
  ['innovation-expo', /founder|engineer|research|scientist|\bcto\b|innovation|propulsion|drone|uav|evtol|technolog/i],
  ['space-pavilion', /space|astronaut|orbit|satellite|launch|lunar|mars|rocket|astro|planetary/i],
];

export function zoneFor(n) {
  const text = [n.title, n.professional_role, n.industry].filter(Boolean).join(' ');
  const hit = RULES.find(([, re]) => re.test(text));
  return hit ? hit[0] : 'space-pavilion';
}