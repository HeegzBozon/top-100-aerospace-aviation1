import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import PressKitSheet from '@/components/press-kit/PressKitSheet';
import { downloadKitPdf } from '@/components/press-kit/kitPdf';

// The shared kit: the page a Fellow forwards. Read-only, no chrome of the platform's
// own, and identical to the sheet its owner approved in the composer.
export default function PressKitPublic() {
  const { shareCode } = useParams();
  const [state, setState] = useState({ loading: true, kit: null, failed: false });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, kit: null, failed: false });
    base44.entities.PressKit
      .filter({ share_code: shareCode, status: 'published' })
      .then((rows) => {
        if (!alive) return;
        setState({ loading: false, kit: rows?.[0] || null, failed: false });
      })
      .catch(() => {
        if (alive) setState({ loading: false, kit: null, failed: true });
      });
    return () => {
      alive = false;
    };
  }, [shareCode]);

  // A code that resolves to nothing is a missing page, not a slow one: the status is only
  // printed once the read has finished.
  useEffect(() => {
    if (state.loading || state.failed || state.kit) return undefined;
    const tag = document.createElement('meta');
    tag.name = 'prerender-status-code';
    tag.content = '404';
    document.head.appendChild(tag);
    return () => {
      document.head.removeChild(tag);
    };
  }, [state]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: B.cream }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: B.copper }} />
      </div>
    );
  }

  if (!state.kit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ background: B.cream }}>
        <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
          Press Kit
        </p>
        <h1 className="mt-3 max-w-sm font-heading text-2xl leading-tight" style={{ color: B.navy }}>
          {state.failed ? 'This kit could not be opened.' : 'This kit is not published.'}
        </h1>
        <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
          {state.failed
            ? 'The record did not answer. Nothing has been changed.'
            : 'The address may be incomplete, or the Fellow has taken the kit down.'}
        </p>
        <Link
          to="/app-store"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ background: B.navy, color: B.cream }}
        >
          The App Store
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  const kit = state.kit;

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-12">
        <PressKitSheet kit={kit} shareUrl={shareUrl} className="shadow-sm" />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => downloadKitPdf(kit, shareUrl)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.18em]"
            style={{ background: B.navy, color: B.cream }}
          >
            <Download className="h-3 w-3" />
            Download PDF
          </button>
          <Link
            to="/press-kit"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.18em]"
            style={{ background: 'rgba(30,58,90,0.06)', color: B.navy, border: `1px solid ${B.border}` }}
          >
            Build your own
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="h-16" />
      </div>
    </div>
  );
}