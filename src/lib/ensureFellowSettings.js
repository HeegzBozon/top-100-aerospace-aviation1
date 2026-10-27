import { base44 } from '@/api/base44Client';
import { accentForDiscipline } from '@/components/fellow-home/fellowHomeConfig';
import { preferredNominee, mergedIntoId } from '@/lib/nomineeMerge';

// The Fellow's home is assembled from one settings row: the accent, the cover, the
// order of the modules, the status, the board layout. A Fellow who has never written
// into one of those fields has no row at all, so they arrive at a Studio made entirely
// of empty states. This writes that row once, on first arrival, and never touches one
// that already exists — the defaults are the curated house reading, not a blank page.
export async function ensureFellowSettings(user, nominee) {
  if (!user?.email) return null;

  const existing = await base44.entities.FellowProfileSettings.filter({
    fellow_email: user.email,
  }).catch(() => []);
  if (existing?.[0]) return existing[0];

  let person = nominee || null;
  if (!person) {
    const rows = await base44.entities.Nominee.filter({ nominee_email: user.email }).catch(() => []);
    person = preferredNominee(rows);
    const masterId = mergedIntoId(person || {});
    if (masterId) {
      person = (await base44.entities.Nominee.get(masterId).catch(() => person)) || person;
    }
  }

  return await base44.entities.FellowProfileSettings.create({
    fellow_email: user.email,
    fellow_id: person?.id,
    domain_accent: accentForDiscipline(person?.discipline),
    cover_asset_id: 'none',
    six_word_story: user.six_word_story || '',
    module_order: [],
    slide_order: [],
    slide_hidden: [],
    autoplay_mode: 'manual',
    dwell_seconds: 6,
    bulletin_tools: [],
    cluster_module_order: [],
    cluster_hidden_modules: [],
    cluster_tile_sizes: {},
    eight_public: true,
  });
}