// The referral is a double opt-in: the person being referred agrees first, the
// recipient gets a heads-up, then both receive one clean introduction. Nothing is
// sent by the platform — every message opens in the referrer's own mail.
export const REASONS = {
  hire: 'a hire', investor: 'investment', customer: 'a customer conversation', partner: 'a partnership',
  supplier: 'supply', mentor: 'mentorship', press: 'a press conversation', peer: 'a peer exchange',
};

export const STEPS = [
  { key: 'consent_asked', label: 'Ask consent' },
  { key: 'consented', label: 'They agreed' },
  { key: 'introduced', label: 'Introduced' },
  { key: 'connected', label: 'Connected' },
];

const first = (name = '') => name.split(' ')[0] || name;

export function messages(r) {
  const why = REASONS[r.reason] || 'a conversation';
  const line = r.context ? `\n\n${r.context}` : '';
  return [
    {
      key: 'consent', to: r.subject_email, party: `To ${first(r.subject_name)} · the person referred`,
      subject: `May I introduce you to ${r.recipient_name}?`,
      body: `Hi ${first(r.subject_name)},\n\nI'd like to introduce you to ${r.recipient_name} about ${why}.${line}\n\nHappy for me to make the introduction? A simple yes is enough.`,
    },
    {
      key: 'heads_up', to: r.recipient_email, party: `To ${first(r.recipient_name)} · the recipient`,
      subject: `A referral for you: ${r.subject_name}`,
      body: `Hi ${first(r.recipient_name)},\n\nI know someone worth meeting about ${why}: ${r.subject_name}.${line}\n\nOpen to an introduction?`,
    },
    {
      key: 'intro', to: [r.subject_email, r.recipient_email].filter(Boolean).join(','), party: 'To both · the introduction',
      subject: `Introduction: ${r.subject_name} <> ${r.recipient_name}`,
      body: `${first(r.subject_name)}, ${first(r.recipient_name)} — meet each other.\n\nYou both said yes, so I'll get out of the way. The conversation is about ${why}.${line}\n\nI'll leave the next step to you two.`,
    },
  ];
}

export const mailto = (m) =>
  `mailto:${encodeURIComponent(m.to || '')}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;