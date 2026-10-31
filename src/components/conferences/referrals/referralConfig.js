// The referral is a double opt-in: the person being referred agrees first, the
// recipient gets a heads-up, then both receive one introduction. The wording is
// built server-side (sendReferralMessage) so email, Messages and mail fallback match.
export const REASONS = {
  hire: 'a hire', investor: 'investment', customer: 'a customer conversation', partner: 'a partnership',
  supplier: 'supply', mentor: 'mentorship', press: 'a press conversation', peer: 'a peer exchange',
};

export const STEPS = [
  { key: 'consent_asked', label: 'Asked' },
  { key: 'consented', label: 'Agreed' },
  { key: 'introduced', label: 'Introduced' },
  { key: 'connected', label: 'Connected' },
];

const first = (name = '') => name.split(' ')[0] || name;

export const parties = (r) => [
  { key: 'consent', label: `Ask ${first(r.subject_name)}`, hint: 'the person referred' },
  { key: 'heads_up', label: `Tell ${first(r.recipient_name)}`, hint: 'the recipient' },
  { key: 'intro', label: 'Introduce both', hint: 'unlocks once they agree' },
];

export const mailto = (to, subject, body) =>
  `mailto:${encodeURIComponent(to.join(','))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;