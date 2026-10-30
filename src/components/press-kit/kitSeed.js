import { base44 } from '@/api/base44Client';
import { preferredNominee, mergedIntoId } from '@/lib/nomineeMerge';
import { DISCIPLINES } from '@/components/conference-room/conferenceRoomConfig';

// The kit is seeded from the Fellow's own record and never from anywhere else: the
// name, the standing line, the summary and the portrait come from the Nominee record
// and the Fellow's settings row, and every one of them is left for the Fellow to
// confirm or rewrite before the kit is published.

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

export function disciplineLabel(key) {
  return DISCIPLINES.find((discipline) => discipline.key === key)?.label || '';
}

function yearsFor(role) {
  const from = (role?.start_date || '').slice(0, 4);
  const to = (role?.end_date || '').slice(0, 4);
  if (from && to) return `${from}–${to}`;
  return from || (to ? `to ${to}` : '');
}

function evidenceFrom(nominee) {
  const items = [];
  const career = (nominee?.career_history || []).filter((role) => role?.role_title || role?.company_name);
  const latest = career[0];
  if (latest) {
    items.push({
      label: [latest.role_title, latest.company_name].filter(Boolean).join(', '),
      detail: [clean(latest.description), yearsFor(latest)].filter(Boolean).join(' · '),
    });
  }
  if (clean(nominee?.achievements)) {
    items.push({ label: 'Selected achievements', detail: nominee.achievements.trim() });
  }
  const education = (nominee?.education || [])[0];
  if (education) {
    items.push({
      label: [education.degree, education.institution_name].filter(Boolean).join(', '),
      detail: clean(education.field_of_study),
    });
  }
  const skills = (nominee?.skills || []).filter(Boolean).slice(0, 10);
  if (skills.length) items.push({ label: 'Areas of practice', detail: skills.join(' · ') });
  return items.slice(0, 4);
}

function linksFrom(nominee) {
  return [
    { label: 'LinkedIn', url: clean(nominee?.linkedin_profile_url) },
    { label: 'Website', url: clean(nominee?.website_url) },
    { label: 'YouTube', url: clean(nominee?.youtube_url) },
  ].filter((link) => link.url);
}

export function seedFrom(user, nominee, settings) {
  return {
    nominee_id: nominee?.id || '',
    full_name: clean(nominee?.name) || clean(user?.full_name) || '',
    headline: [nominee?.title || nominee?.professional_role, nominee?.company || nominee?.organization]
      .filter(Boolean)
      .join(' · '),
    summary: clean(settings?.about_me) || clean(nominee?.description) || clean(nominee?.bio) || '',
    location: clean(nominee?.country),
    discipline: nominee?.discipline || settings?.domain_accent || '',
    photo_url: clean(nominee?.avatar_url) || clean(nominee?.photo_url),
    contact_email: clean(user?.email),
    evidence: evidenceFrom(nominee),
    links: linksFrom(nominee),
  };
}

export async function loadKitSeed(user) {
  const rows = await base44.entities.Nominee.filter({ nominee_email: user.email }).catch(() => []);
  let nominee = preferredNominee(rows);
  const masterId = mergedIntoId(nominee || {});
  if (masterId) nominee = (await base44.entities.Nominee.get(masterId).catch(() => nominee)) || nominee;

  const settingsRows = await base44.entities.FellowProfileSettings.filter({ fellow_email: user.email }).catch(() => []);
  return seedFrom(user, nominee, settingsRows?.[0] || null);
}

// The saved row, as the composer holds it.
export function rowToDraft(row) {
  return {
    nominee_id: row.nominee_id || '',
    full_name: row.full_name || '',
    headline: row.headline || '',
    summary: row.summary || '',
    location: row.location || '',
    discipline: row.discipline || '',
    photo_url: row.photo_url || '',
    contact_email: row.contact_email || '',
    evidence: Array.isArray(row.evidence) ? row.evidence : [],
    links: Array.isArray(row.links) ? row.links : [],
  };
}