import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const PROMPT = 'Turn the person in this headshot into a single full-body pixel art character sprite, 16-bit SNES style, front-facing standing pose, keep their hair, skin tone and overall likeness, dressed in smart professional aerospace attire in navy and rose gold, flat solid pure white background, no shadow, no text, centered, crisp pixels.';

// Draws a campus sprite for each honoree on an approved trail, from the headshot already on their record.
export default function SpriteForge({ trails }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const run = async () => {
    setBusy(true); setNote('');
    try {
      const ids = [...new Set(trails.filter(t => t.status === 'approved').flatMap(t => t.nominee_ids || []))];
      const have = new Set((await base44.entities.HonoreeSprite.filter({ nominee_id: { $in: ids } })).map(s => s.nominee_id));
      const todo = ids.filter(id => !have.has(id));
      const people = todo.length ? await base44.entities.Nominee.filter({ id: { $in: todo } }, { limit: todo.length, fields: ['id', 'avatar_url', 'photo_url'] }) : [];
      const list = (people.items || people).filter(n => n.avatar_url || n.photo_url);
      let made = 0;
      for (const n of list) {
        const photo = n.avatar_url || n.photo_url;
        setNote(`Drawing sprite ${made + 1} of ${list.length}…`);
        const { url } = await base44.integrations.Core.GenerateImage({ prompt: PROMPT, existing_image_urls: [photo] });
        await base44.entities.HonoreeSprite.create({ nominee_id: n.id, sprite_url: url, source_photo_url: photo });
        made++;
      }
      setNote(made ? `Drew ${made} sprite${made > 1 ? 's' : ''}. They now stand on campus.` : 'Every honoree on an approved trail with a headshot already has a sprite.');
    } catch (e) {
      setNote(`Sprite drawing failed: ${e.message || 'unknown error'}`);
    }
    setBusy(false);
  };
  return (
    <div className="space-y-2">
      <Button onClick={run} disabled={busy} variant="outline" className="border-editorial-copper text-editorial-navy">
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Draw campus sprites from headshots
      </Button>
      {note && <p className="border-l-2 border-editorial-gold bg-white px-3 py-2 text-sm text-editorial-navy">{note}</p>}
    </div>
  );
}