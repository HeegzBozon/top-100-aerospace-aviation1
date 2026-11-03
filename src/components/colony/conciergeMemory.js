// The concierge's memory of one visitor, kept on their own device: how often they've come by,
// what they've already asked, and the last few lines of conversation.
const KEY = 'colony-concierge-memory';
// The guest's own session id, so the desk has something to answer to and to limit by,
// without asking a visitor to sign in for a question.
const SESSION_KEY = 'colony-concierge-session';

export function guestSession() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

export function loadMemory() {
  try {
    return { visits: 0, asked: [], history: [], lastVisit: null, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { visits: 0, asked: [], history: [], lastVisit: null };
  }
}

export function saveMemory(m) {
  localStorage.setItem(KEY, JSON.stringify({ ...m, asked: m.asked.slice(-30), history: m.history.slice(-12) }));
}

// The desk introduces itself as what it is: an AI assistant of the platform. It never
// borrows a person's name and never promises a private line.
export function greetingFor(m, firstName) {
  const name = firstName ? `, ${firstName}` : '';
  if (m.visits <= 1) {
    return `Hello${name}. I'm the AI concierge for TOP 100 Aerospace & Aviation — an assistant, not a person. Ask me about the platform and the campus, or pick a topic below.`;
  }
  const last = m.asked[m.asked.length - 1];
  const days = m.lastVisit ? Math.round((Date.now() - new Date(m.lastVisit).getTime()) / 86400000) : 0;
  const since = days >= 2 ? `It's been ${days} days. ` : '';
  return `${since}Welcome back${name}. ${last ? `Last time you asked about "${last}". Pick up there, or ask something new.` : 'What can I help you find today?'}`;
}