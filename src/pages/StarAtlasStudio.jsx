import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudioTrailCard from '@/components/star-atlas/StudioTrailCard';
import { DISCIPLINE_TITLES } from '@/components/star-atlas/starAtlas';

// Editorial desk for the Star Atlas: constellations are drafted from the record, then approved
// by an editor before anyone on campus sees them. Never reads scores, payments or availability.
export default function StarAtlasStudio() {
  const [me, setMe] = useState(undefined);
  const [trails, setTrails] = useState(null);
  const [drafting, setDrafting] = useState(false);

  const load = useCallback(() => base44.entities.Constellation.list({ sort: 'order', limit: 100 }).then(p => setTrails(p.items || p)), []);
  useEffect(() => {
    base44.auth.me().then(u => { setMe(u); if (u.role === 'admin') load(); }).catch(() => base44.auth.redirectToLogin(window.location.href));
  }, [load]);

  const draft = async () => {
    setDrafting(true);
    const have = new Set(trails.map(t => t.theme_key));
    const rows = [];
    for (const [d, title] of Object.entries(DISCIPLINE_TITLES)) {
      if (have.has(`discipline:${d}`)) continue;
      const page = await base44.entities.Nominee.filter(
        { discipline: d, status: { $in: ['winner', 'finalist', 'active', 'approved'] }, description: { $exists: true } },
        { sort: 'name', limit: 10, fields: ['id'] });
      const ids = (page.items || page).map(n => n.id);
      if (ids.length >= 3) rows.push({ title, theme_key: `discipline:${d}`, nominee_ids: ids, status: 'draft', order: trails.length + rows.length, story: `${ids.length} honorees whose work defines ${title.split(' of ')[1] || 'the field'}. Read each story to light their star.` });
    }
    if (rows.length) await base44.entities.Constellation.bulkCreate(rows);
    await load();
    setDrafting(false);
  };

  const save = async (id, patch) => { await base44.entities.Constellation.update(id, patch); load(); };

  if (me === undefined || (me?.role === 'admin' && !trails)) return <div className="flex min-h-screen items-center justify-center bg-editorial-cream"><Loader2 className="h-6 w-6 animate-spin text-editorial-copper" /></div>;
  if (me.role !== 'admin') return <div className="flex min-h-screen items-center justify-center bg-editorial-cream p-6 text-center text-editorial-navy">The Star Atlas studio is for editors.</div>;

  return (
    <div className="min-h-screen bg-editorial-cream px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <header>
          <p className="pd-label">Editorial desk</p>
          <h1 className="font-heading text-3xl text-editorial-navy">Star Atlas Studio</h1>
          <p className="text-sm text-editorial-navy/70">Draft constellations from the record, edit them, then approve. Only approved trails appear on campus.</p>
        </header>
        <Button onClick={draft} disabled={drafting} className="bg-editorial-copper hover:bg-editorial-copper/90">
          {drafting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}Draft from the record
        </Button>
        {trails.length === 0 ? (
          <div className="border border-dashed border-editorial-copper/50 bg-white p-8 text-center">
            <p className="font-heading text-lg text-editorial-navy">No constellations yet</p>
            <p className="text-sm text-editorial-navy/60">Draft from the record to group honorees by discipline, then shape each trail.</p>
          </div>
        ) : trails.map(t => <StudioTrailCard key={t.id} trail={t} onSave={(p) => save(t.id, p)} />)}
      </div>
    </div>
  );
}