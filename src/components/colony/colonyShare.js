// Handing a room, or a door inside it, to somebody.
//
// The Colony is an addressable place: /colony?room=<key> is read on arrival, and
// ?zone=<zone key> opens the hotspot the host was standing at, exactly as pressing it
// would. So a link dropped into a message lands the recipient standing in that room, or
// through that door, with nothing else to press. The share sheet is offered first where
// the device has one — a message, a mail, a note — and the clipboard is the fallback for
// a desk.

import { copyText } from '@/lib/clipboard';

export function colonyUrl({ room, zone }) {
  const params = new URLSearchParams();
  if (room) params.set('room', room);
  if (zone) params.set('zone', zone);
  const query = params.toString();
  return `${window.location.origin}/colony${query ? `?${query}` : ''}`;
}

// 'shared' (sheet taken), 'copied', 'cancelled' (the holder closed the sheet) or 'failed'.
async function shareLink(url, label) {
  if (window.isSecureContext && navigator.share) {
    try {
      await navigator.share({ title: `${label} · TOP 100 Aerospace & Aviation`, url });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
      // Anything else falls through to the clipboard rather than leaving the key dead.
    }
  }
  return (await copyText(url)) ? 'copied' : 'failed';
}

export function shareRoom(room, label) {
  return shareLink(colonyUrl({ room }), label || 'The Colony');
}

export function shareZone(room, zone, label) {
  return shareLink(colonyUrl({ room, zone }), label || 'The Colony');
}