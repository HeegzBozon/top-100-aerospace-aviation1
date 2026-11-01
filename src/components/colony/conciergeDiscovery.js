import { base44 } from '@/api/base44Client';

// The profile fields the concierge may help a Fellow write, in the order it asks about them.
export const DISCOVERY_FIELDS = {
  about_me: { label: 'About me', ask: 'what they do in aerospace and what drives them' },
  who_id_like_to_meet: { label: "Who I'd like to meet", ask: 'who they hope to meet on the platform' },
  six_word_story: { label: 'Six word story', ask: 'their career in exactly six words' },
  hire_pitch: { label: 'What I want to work on next', ask: 'the work they want next' },
};

export async function loadMissingFields(email) {
  if (!email) return [];
  const rows = await base44.entities.FellowProfileSettings.filter({ fellow_email: email }).catch(() => []);
  const s = rows?.[0] || {};
  return Object.keys(DISCOVERY_FIELDS).filter(k => !String(s[k] || '').trim());
}

export function discoveryGuide(missing) {
  if (!missing.length) return 'Their profile basics are complete; do not run discovery.';
  return `Be proactive, not passive: run light discovery to help them complete their profile. Still missing: ${missing.map(k => `${k} (${DISCOVERY_FIELDS[k].ask})`).join('; ')}. End your reply with ONE warm question about the first missing item when it fits. When the visitor's message answers one of these, set profile_update with that field and a polished first-person value they can approve (six_word_story must be exactly six words; others under 400 characters).`;
}

export const PROFILE_UPDATE_SCHEMA = {
  type: 'object',
  description: 'Only when the visitor just answered a discovery question',
  properties: { field: { type: 'string', enum: Object.keys(DISCOVERY_FIELDS) }, value: { type: 'string' } },
};

export const saveProfileField = (field, value) =>
  base44.functions.invoke('saveProfileSettings', { [field]: value });