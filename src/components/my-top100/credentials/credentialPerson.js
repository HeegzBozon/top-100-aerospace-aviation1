import { resolveBadgeTemplate } from '@/components/badge/badgeTemplates';
import { specialtyLabel } from '@/components/flight-plan/specialties';
import {
  readStoredDestination,
  readStoredProgram,
  resolveDestination,
  shareUrl,
} from '@/lib/shareDestinations';

// ── One record, printed three ways ──
//
// The badge, the pass and the card are one reading of the record, so the reading is made
// once, here, and every surface that hands a credential over takes it from this module —
// the Pre-Flight deck and the Credentials tool on the Fellow's own record print the same
// person, the same lines and the same code because they are assembled from the same place.
const DISCIPLINE_WORDS = {
  space_rd: 'Space R&D',
  commercial_aviation: 'Commercial aviation',
  defense: 'Defence',
  manufacturing: 'Manufacturing',
  operations: 'Operations',
  engineering: 'Engineering',
  policy: 'Policy',
  entrepreneurship: 'Entrepreneurship',
};

const clean = (value) => String(value ?? '').trim();

export default function buildCredentialPerson({ user, card, nominee, settings } = {}) {
  const safeCard = card || {};
  const safeNominee = nominee || {};

  const name = safeCard.card_name || safeNominee.name || user?.full_name || '';
  const roleLine = safeCard.role_line || safeNominee.title || '';
  const organisation = safeCard.organisation || safeNominee.company || '';
  const portrait = safeNominee.avatar_url || '';
  const location = safeCard.location || safeNominee.location || safeNominee.country || '';
  const personId = safeNominee.id || '';

  // The pass reads what the record holds: the base they work from, the field the record
  // names, the specialty filed on their Flight Plan, the line they are glad to be reached
  // about. The card prints the contact lines they chose to show, and nothing they hid.
  const rows = [
    { label: 'Base', value: location },
    { label: 'Field', value: DISCIPLINE_WORDS[safeNominee.discipline] || safeNominee.discipline },
    { label: 'Specialty', value: specialtyLabel(settings?.specialty_key) },
    { label: 'Reachable about', value: safeCard.tagline },
  ].filter((row) => clean(row.value));

  const person = {
    name,
    role: roleLine,
    org: organisation,
    portrait,
    avatarUrl: portrait,
    location,
    place: location,
    email:
      safeCard.show_contact_email === false
        ? ''
        : clean(safeCard.contact_email) || safeNominee.nominee_email || user?.email || '',
    phone: safeCard.show_phone ? clean(safeCard.phone) : '',
    website: clean(safeCard.website_url) || clean(safeNominee.website_url),
    tagline: clean(safeCard.tagline),
    seat: 'Fellow',
  };

  // The code is the badge's code, resolved the way the badge and the title screen resolve it:
  // a program handed over from the menu first, then the destination last chosen.
  const holder = { name, role: roleLine, org: organisation, cardId: personId };
  const program = readStoredProgram();
  const chosen = resolveDestination(
    readStoredDestination() || (holder.cardId ? 'card' : 'platform'),
    holder,
  );
  const code = {
    link: program?.url || shareUrl(chosen.key, holder),
    title: !program && chosen.key === 'card' ? 'Scan to connect' : 'Scan to open',
    note: program
      ? program.label || 'The program you are handing on'
      : chosen.key === 'card'
        ? 'The card saves as a contact'
        : chosen.note,
  };

  return { person, rows, template: resolveBadgeTemplate(safeCard.badge_template), code };
}