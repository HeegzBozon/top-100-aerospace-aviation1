import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { BookOpen, FileText, TrendingUp, Camera, Sparkles, MessageSquare, ClipboardList, ArrowRight, Loader2 } from 'lucide-react';

// Editorial phase (workspace tab) — lightweight global surface linking out to the full Editorial section.
const QUICK_LINKS = [
  { id: 'publications', label: 'Publications', icon: BookOpen, desc: 'Official editions' },
  { id: 'content', label: 'Knowledge Base', icon: FileText, desc: 'Articles' },
  { id: 'viral-posts', label: 'Top Viral Posts', icon: TrendingUp, desc: 'Member posts' },
  { id: 'media', label: 'Media & Photos', icon: Camera, desc: 'Assets & headshots' },
  { id: 'testimonials', label: 'Testimonials', icon: Sparkles, desc: 'Moderation queue' },
  { id: 'community-notes', label: 'Community Notes', icon: MessageSquare, desc: 'Moderation queue' },
  { id: 'discovery-responses', label: 'Discovery Responses', icon: ClipboardList, desc: 'Member responses' },
];

export default function EditorialPhase({ season, onNavigate }) {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Bulletin
      .filter({}, { sort: '-created_date', limit: 5 })
      .then((page) => setRecent(page.items || []))
      .catch(() => setRecent([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6 border-editorial-navy/15 bg-white">
        <p className="text-[10px] uppercase tracking-[0.25em] text-editorial-copper font-bold">Editorial · global</p>
        <h3 className="font-heading text-2xl text-editorial-navy mt-1">Publication workspace</h3>
        <p className="text-sm text-editorial-navy/60 mt-2 max-w-2xl">
          Editorial work spans all cohorts. Jump to the full publication surfaces below, or browse recent community bulletins.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
          {QUICK_LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <button
                key={l.id}
                onClick={() => onNavigate?.(l.id)}
                className="text-left p-4 rounded-xl border border-editorial-navy/10 bg-editorial-cream/40 hover:bg-editorial-cream hover:border-editorial-copper/40 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-editorial-copper" />
                  <span className="font-medium text-editorial-navy">{l.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-editorial-navy/30" />
                </div>
                <p className="text-xs text-editorial-navy/50">{l.desc}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 border-editorial-navy/15 bg-white">
        <h4 className="font-heading text-lg text-editorial-navy mb-3">Recent community bulletins</h4>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-editorial-navy/50">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-editorial-navy/15 py-10 text-center">
            <MessageSquare className="w-8 h-8 mx-auto text-editorial-gold mb-2" />
            <p className="text-sm text-editorial-navy/60">No recent bulletins.</p>
          </div>
        ) : (
          <ul className="divide-y divide-editorial-navy/8">
            {recent.map((b) => (
              <li key={b.id} className="py-3">
                <p className="text-sm font-medium text-editorial-navy">{b.title || (b.body || '').slice(0, 80) || 'Untitled'}</p>
                <p className="text-xs text-editorial-navy/50">
                  {b.author_name || 'Platform'} · {b.post_type} · {new Date(b.created_date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}