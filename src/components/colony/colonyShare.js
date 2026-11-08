// Handing a room to somebody.
//
// A room is an address, not a place you have to be walked to: /colony?room=<key> is read
// on arrival, so a link dropped into a message lands the recipient standing in that room
// with nothing else to press. The share sheet is offered first where the device has one —
// a message, a mail, a note — and the clipboard is the fallback for a desk.

import { copyText } from '@/lib/clipboard';

export function roomUrl(key) {
  return `${window.location.origin}/colony?room=${encodeURIComponent(key)}`;
}

// 'shared' (sheet taken), 'copied', 'cancelled' (the holder closed the sheet) or 'failed'.
export async function shareRoom(key, label) {
  const url = roomUrl(key);
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