// The concierge's memory of one visitor, kept on their own device: how often they've come by,
// what they've already asked, and the last few lines of conversation.
const KEY = 'colony-concierge-memory';

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

export function greetingFor(m, firstName) {
  const name = firstName ? `, ${firstName}` : '';
  if (m.visits <= 1) {
    return `Aloha${name}, I'm Matthew Higa, founder of TOP 100 Aerospace & Aviation and your concierge. This desk is a private line, just you and me. Pick a topic, or type a question.`;
  }
  const last = m.asked[m.asked.length - 1];
  const days = m.lastVisit ? Math.round((Date.now() - new Date(m.lastVisit).getTime()) / 86400000) : 0;
  const since = days >= 2 ? `It's been ${days} days. ` : '';
  return `Welcome back${name}. ${since}${last ? `Last time we talked about "${last}". Want to pick up there, or try something new?` : 'What can I help you find today?'}`;
}