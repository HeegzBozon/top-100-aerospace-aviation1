import { base44 } from '@/api/base44Client';

// The places the concierge can take a visitor. Only these paths are ever navigated to.
export const DESTINATIONS = {
  start: { path: '/', label: 'Start screen' },
  profile: { path: '/record', label: 'My record' },
  inbox: { path: '/inbox', label: 'Inbox' },
  nominate: { path: '/selection-committee', label: 'Selection Committee' },
  events: { path: '/events', label: 'Events' },
  conferences: { path: '/conferences', label: 'Conferences' },
  chamber: { path: '/chamber', label: 'Chamber of Commerce' },
  app_store: { path: '/app-store', label: 'App Store' },
  newsstand: { path: '/newsstand', label: 'Newsstand' },
  classifieds: { path: '/classifieds', label: 'Classifieds' },
  aerosync: { path: '/aerosync', label: 'AeroSync' },
  badge: { path: '/badge', label: 'My badge' },
  career_copilot: { path: '/career-copilot', label: 'Career Copilot' },
  women_2025: { path: '/women-2025', label: 'TOP 100 Women 2025' },
};

export const ACTION_SCHEMA = {
  type: 'object',
  description: 'Optional action to perform for the visitor. Use kind "none" when no action helps.',
  properties: {
    kind: { type: 'string', enum: ['none', 'navigate', 'find_person'] },
    destination: { type: 'string', enum: Object.keys(DESTINATIONS) },
    person_name: { type: 'string', description: 'Name to look up in the honoree directory' },
  },
};

export const ACTION_GUIDE = `You can act for the visitor: set action.kind "navigate" with a destination key (${Object.entries(DESTINATIONS).map(([k, d]) => `${k}=${d.label}`).join(', ')}) when they want to go somewhere or do something there, or "find_person" with person_name when they look for someone. Otherwise "none".`;

export async function findPeople(name) {
  const safe = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
  if (!safe) return [];
  const page = await base44.entities.Nominee.filter(
    { name: { $regex: safe, $options: 'i' }, status: { $ne: 'rejected' } }, { limit: 5 });
  return (page.items || page).map(n => ({ id: n.id, name: n.name, line: [n.title, n.company].filter(Boolean).join(', ') }));
}