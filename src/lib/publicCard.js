// A card handed over in person.
//
// The code on the title screen points at the card page, and that page can be answered
// before its reader has an account: a contact can be saved with no sign-up at all.
// Nothing private is published in the file — no address, no number — only the line the
// public record already prints, plus the record's own address and the links it carries.

export const cardUrl = (id) => `${window.location.origin}/card/${id}`;

export const frontDoorUrl = () => `${window.location.origin}/`;

// The QR itself is drawn by the same image service the publication cards already use,
// so the code is a plain <img> the machine can cache rather than a runtime dependency.
export const qrSrc = (text, size = 240) =>
  `https://quickchart.io/qr?text=${encodeURIComponent(text)}&size=${size}&margin=1&dark=1e3a5a&light=ffffff`;

const esc = (value) =>
  String(value || '')
    .replace(/([\\;,])/g, '\\$1')
    .replace(/\r?\n/g, '\\n');

export function buildVCard(person) {
  const name = person?.name || 'A Fellow';
  const parts = name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  const first = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(last)};${esc(first)};;;`,
    `FN:${esc(name)}`,
    person?.role ? `TITLE:${esc(person.role)}` : '',
    person?.org ? `ORG:${esc(person.org)}` : '',
    person?.cardUrl ? `URL:${esc(person.cardUrl)}` : '',
    person?.linkedin ? `URL:${esc(person.linkedin)}` : '',
    person?.website ? `URL:${esc(person.website)}` : '',
    person?.tagline ? `NOTE:${esc(person.tagline)}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export function saveContact(person) {
  const blob = new Blob([buildVCard(person)], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(person?.name || 'contact').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.vcf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}