import { THEATRE } from '@/components/theatre/theatreConfig';

// The party's furniture. The room itself is cut from the theatre's plate, because a party
// is watched in the theatre; the invitation is printed on paper, so the board reads warm.
export const PARTY = {
  ...THEATRE,
  paper: '#fffdf9',
  sheet: '#faf8f5',
  inkOnPaper: '#1e3a5a',
  bodyOnPaper: '#4a6076',
  ruleOnPaper: 'rgba(30,58,90,0.14)',
};

export const GUEST_TONE = {
  going: { label: 'Going', ink: '#2f6b4f', plate: 'rgba(143,211,168,0.24)' },
  maybe: { label: 'Maybe', ink: '#8a6420', plate: 'rgba(201,168,124,0.26)' },
  declined: { label: 'Cannot make it', ink: '#5d7183', plate: 'rgba(30,58,90,0.08)' },
};

const pad2 = (n) => String(n).padStart(2, '0');

// A party's address on the door: the title, so a link reads as an invitation, and a short
// salt so two parties for the same mission never share a code.
export function inviteCodeFor(title) {
  const slug =
    String(title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 42) || 'launch-party';
  const salt = Math.random().toString(36).slice(2, 7);
  return `${slug}-${salt}`;
}

export function localInputValue(iso) {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function isoFromLocalInput(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

// The room opens half an hour before the pad, in the host's own local time.
export function defaultOpensAt(netIso) {
  const target = netIso ? new Date(netIso).getTime() : NaN;
  const opens = Number.isNaN(target) ? Date.now() + 60 * 60 * 1000 : target - 30 * 60 * 1000;
  return localInputValue(new Date(opens).toISOString());
}

export function inviteLink(code) {
  if (!code) return '';
  return `${window.location.origin}/launch-party/${code}`;
}

export function launchLine(party) {
  const parts = [party.provider, party.rocket].filter(Boolean);
  return parts.join(' · ');
}