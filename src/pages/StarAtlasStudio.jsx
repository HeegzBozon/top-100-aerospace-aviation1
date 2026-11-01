import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudioTrailCard from '@/components/star-atlas/StudioTrailCard';
import SpriteForge from '@/components/star-atlas/SpriteForge';
import { DRAFT_THEMES } from '@/components/star-atlas/starAtlas';

// Editorial desk for the Star Atlas: constellations are drafted from the record, then approved
// by an editor before anyone on campus sees them. Never reads scores, payments or availability.
export default function StarAtlasStudio() {
  const [me, setMe] = useState(undefined);
  const [trails, setTrails] = useState(null);
  const [drafting, setDrafting] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(() => base44.entities.Constellation.list({ sort: 'order', limit: 100 }).then(p => setTrails(p.items || p)), []);
  useEffect(() => {
    base44.auth.me().then(u => { setMe(u); if (u.role === 'admin') load(); }).catch(() => base44.auth.redirectToLogin(window.location.href));
  }, [load]);

  const draft = async () => {
    setDrafting(true);
    const have = new Set(trails.map(t => t.theme_key));
    const rows = [];
    const used = new Set(trails.flatMap(t => t.nominee_ids || []));
    setNote('');
    try {
      for (const { key, title, pattern } of DRAFT_THEMES) {
        if (have.has(`industry:${key}`)) continue;
        const page = await base44.entities.Nominee.filter(
          { industry: { $regex: pattern, $options: 'i' }, status: { $in: ['winner', 'finalist', 'active', 'approved'] } },
          { sort: 'name', limit: 40, fields: ['id', 'description'] });
        const ids = (page.items || page).filter(n => n.description && !used.has(n.id)).slice(0, 10).map(n => n.id);
        ids.forEach(id => used.add(id));
        if (ids.length >= 3) rows.push({ title, theme_key: `industry:${key}`, nominee_ids: ids, status: 'draft', order: trails.length + rows.length, story: `${ids.length} honorees, one sky. Read each story to light their star.` });
      }
      if (rows.length) await base44.entities.Constellation.bulkCreate(rows);
      setNote(rows.length ? `Drafted ${rows.length} constellation${rows.length > 1 ? 's' : ''}. Review and approve them below.` : 'Nothing new to draft. Every theme already has a constellation.');
      await load();
    } catch (e) {
      setNote(`Drafting failed: ${e.message || 'unknown error'}`);
    }
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
          {drafting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}{drafting ? 'Drafting…' : 'Draft from the record'}
        </Button>
        {note && <p className="border-l-2 border-editorial-copper bg-white px-3 py-2 text-sm text-editorial-navy">{note}</p>}
        <SpriteForge trails={trails} />
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