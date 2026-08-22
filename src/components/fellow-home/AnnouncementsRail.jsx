import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RailBlock from '@/components/fellow-home/RailBlock';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The institution's voice — platform-scoped bulletins, admin-authored.
export default function AnnouncementsRail({ accent, bare }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await base44.entities.Bulletin.filter({ scope: 'platform' }, '-created_date', 6);
      setItems(res || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsub = base44.entities.Bulletin.subscribe((e) => {
      if (e.data?.scope === 'platform') load();
    });
    return unsub;
  }, []);

  const inner = loading ? (
    <div className="flex justify-center py-2"><Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: B.muted }} /></div>
  ) : items.length === 0 ? (
    <p className="text-[11px] leading-snug" style={{ color: B.muted }}>No newsletter issues right now.</p>
  ) : (
    <div className="space-y-2.5">
      {items.map((b) => {
        const content = (
          <div className="flex items-start gap-2.5">
            <Megaphone className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
            <div className="min-w-0">
              {b.title && <p className="text-[12px] font-semibold leading-snug" style={{ color: B.navy }}>{b.title}</p>}
              {b.body && <p className="text-[11px] leading-snug" style={{ color: B.muted }}>{b.body}</p>}
            </div>
            {b.link && <ArrowRight className="w-3 h-3 mt-1 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: B.muted }} />}
          </div>
        );
        return b.link ? (
          <Link key={b.id} to={b.link} className="block group">{content}</Link>
        ) : (
          <div key={b.id} className="group">{content}</div>
        );
      })}
    </div>
  );

  if (bare) return inner;
  return <RailBlock title="TOP 100 Newsletter" accent={accent}>{inner}</RailBlock>;
}