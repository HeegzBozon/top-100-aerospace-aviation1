// Progressive discovery: what the campus may learn about a player, and only with their say.
// Every answer lands as a pending item in the passport's Record tab. Nothing reaches the
// Fellow record until the player approves it, and nothing here is ever read by
// measurement, scoring, directory placement or recognition.

export const PATHWAYS = [
  { key: 'career', label: 'Advance my career', guide: 'scout', room: 'career-center', place: 'Career Center' },
  { key: 'connect', label: 'Meet extraordinary people', guide: 'skye', room: 'networking-lounge', place: 'Networking Lounge' },
  { key: 'recognize', label: 'Recognize someone', guide: 'vera', room: 'main-hall', place: 'Main Hall' },
  { key: 'innovate', label: 'Explore innovation', guide: 'nova', room: 'innovation-expo', place: 'Innovation Expo' },
  { key: 'story', label: 'Tell my story', guide: 'echo', room: 'media-hub', place: 'Media Hub' },
  { key: 'lead', label: 'Lead or mentor', guide: 'athena', room: 'leadership-summit', place: 'Leadership Summit' },
];

// Which First Flight answers are discovery, and what they say about the player.
export const QUEST_DISCOVERY = {
  q01: { key: 'pathway', label: 'What brings me here' },
  q04: { key: 'tech_interest', label: 'Innovation that interests me' },
  q06: { key: 'leadership_principle', label: 'My leadership principle' },
  q08: { key: 'career_pathway', label: 'Career pathway I bookmarked' },
  q09: { key: 'community_guideline', label: 'How I connect' },
};

// The Origin Story with Echo: four interview answers, one per documentary prompt.
export const ORIGIN = [
  { id: 'o01', prompt_key: 'first_light', title: 'First Light', line: 'Every story starts somewhere. Before the titles and the missions, what first pulled you toward flight?', prompt: 'Tell me about your first light.' },
  { id: 'o02', prompt_key: 'turning_point', title: 'The Turning Point', line: 'Careers bend. Tell me about the moment yours changed direction.', prompt: 'What was your turning point?' },
  { id: 'o03', prompt_key: 'hardest_problem', title: 'The Hardest Problem', line: 'The work worth remembering is usually the hardest. What problem tested you most?', prompt: 'Describe the hardest problem you solved.' },
  { id: 'o04', prompt_key: 'what_next', title: 'What Comes Next', line: 'Every good feature ends looking forward. What are you building toward now?', prompt: 'What comes next for you?' },
].map(q => ({ ...q, act: 5, npc: 'echo', place: 'Media Hub', input: true, discovery: { key: `doc_${q.prompt_key}`, label: q.title, prompt_key: q.prompt_key } }));

export const pathwayLabel = (k) => PATHWAYS.find(p => p.key === k)?.label || k;

// Atlas reads the player's pathway and recommends a first stop.
export function lineFor(quest, p) {
  if (quest.id !== 'q02') return quest.line;
  const first = PATHWAYS.find(x => (p?.pathways || []).includes(x.key));
  return first ? `${quest.line} You came to ${first.label.toLowerCase()}: I recommend the ${first.place}.` : quest.line;
}

// The discovery a completed quest produces, or null.
export function discoveryFor(quest, answer) {
  const d = quest.discovery || QUEST_DISCOVERY[quest.id];
  if (!d || !answer || answer === 'Just exploring') return null;
  return { ...d, value: answer, source: 'self_reported', status: 'pending', at: new Date().toISOString() };
}