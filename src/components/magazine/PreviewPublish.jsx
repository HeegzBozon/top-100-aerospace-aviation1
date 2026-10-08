import React, { useMemo } from 'react';
import { Check, AlertCircle, Eye, Send, ArrowUpRight, RotateCcw } from 'lucide-react';
import { MAGAZINE_PALETTE as P, ARTICLE_STATUSES, articleStatusLabel, articleStatusColor } from '@/components/magazine/magazineConfig';

export default function PreviewPublish({ issue, articles, pages, onPublish, onUnpublish }) {
  const isPublished = issue.status === 'published';

  // Readiness checklist
  const readiness = useMemo(() => {
    const unresolvedArticles = articles.filter((a) => !['ready', 'laid_out', 'published'].includes(a.status));
    const reservedPlaceholders = articles.filter((a) => a.article_type === 'results_reserved' && !a.body);
    const noPages = pages.length === 0 && issue.assembly_mode === 'native';
    const noPdf = issue.assembly_mode === 'pdf' && !issue.cover_pdf_uri;
    const noCover = !issue.cover_image_url && issue.assembly_mode === 'native';

    return {
      unresolvedArticles,
      reservedPlaceholders,
      noPages,
      noPdf,
      noCover,
      canPublish: !isPublished && unresolvedArticles.length === 0 && !noPages && !noPdf,
    };
  }, [articles, pages, issue, isPublished]);

  const checklist = [
    { label: 'All articles drafted or laid out', ok: readiness.unresolvedArticles.length === 0, detail: `${readiness.unresolvedArticles.length} article(s) need attention` },
    { label: 'Pages composed', ok: !readiness.noPages, detail: readiness.noPages ? 'No pages in native mode' : `${pages.length} page(s)` },
    { label: 'PDF uploaded', ok: !readiness.noPdf, detail: readiness.noPdf ? 'No PDF uploaded' : 'PDF ready', show: issue.assembly_mode === 'pdf' },
    { label: 'Cover image set', ok: !readiness.noCover, detail: readiness.noCover ? 'No cover image' : 'Cover set', show: issue.assembly_mode === 'native' },
    { label: 'Reserved placeholders acknowledged', ok: true, detail: `${readiness.reservedPlaceholders.length} reserved article(s)` },
  ].filter((c) => c.show !== false);

  const readerUrl = `/magazine/${issue.id}`;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Status */}
      <div className="rounded-2xl p-6 text-center" style={{ background: isPublished ? P.navy : '#fff', border: `1px solid ${isPublished ? P.navy : 'rgba(30,58,90,0.1)'}` }}>
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: isPublished ? P.gold : 'rgba(30,58,90,0.4)' }}>
          {isPublished ? 'Live' : 'Not Published'}
        </p>
        <h2 className="text-xl font-serif mb-1" style={{ color: isPublished ? P.cream : P.navy }}>{issue.title}</h2>
        <p className="text-xs" style={{ color: isPublished ? 'rgba(250,248,245,0.6)' : 'rgba(30,58,90,0.5)' }}>
          {isPublished ? `Published ${new Date(issue.published_date).toLocaleDateString()}` : 'This issue is in draft'}
        </p>
      </div>

      {/* Readiness Checklist */}
      {!isPublished && (
        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
          <h3 className="text-sm font-serif mb-4" style={{ color: P.navy }}>Readiness Checklist</h3>
          <div className="space-y-2.5">
            {checklist.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: c.ok ? P.navy : 'rgba(30,58,90,0.1)' }}>
                  {c.ok ? <Check className="w-3 h-3" style={{ color: P.cream }} /> : <AlertCircle className="w-3 h-3" style={{ color: 'rgba(30,58,90,0.5)' }} />}
                </div>
                <span className="text-sm flex-1" style={{ color: P.navy }}>{c.label}</span>
                <span className="text-xs" style={{ color: c.ok ? 'rgba(30,58,90,0.4)' : P.copper }}>{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unresolved Articles */}
      {!isPublished && readiness.unresolvedArticles.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(184,115,51,0.05)', border: `1px solid ${P.copper}30` }}>
          <h3 className="text-sm font-serif mb-3" style={{ color: P.copper }}>Articles Needing Attention</h3>
          <div className="space-y-1.5">
            {readiness.unresolvedArticles.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: articleStatusColor(ARTICLE_STATUSES, a.status) }} />
                <span className="flex-1 truncate" style={{ color: P.navy }}>{a.title}</span>
                <span style={{ color: 'rgba(30,58,90,0.5)' }}>{articleStatusLabel(a.status)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={readerUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
          style={{ background: 'transparent', color: P.navy, border: `1px solid ${P.navy}30` }}
        >
          <Eye className="w-4 h-4" /> Preview Reader
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
        {isPublished ? (
          <button
            onClick={onUnpublish}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'transparent', color: P.copper, border: `1px solid ${P.copper}40` }}
          >
            <RotateCcw className="w-4 h-4" /> Unpublish
          </button>
        ) : (
          <button
            onClick={onPublish}
            disabled={!readiness.canPublish}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: P.navy, color: P.cream, border: 0 }}
          >
            <Send className="w-4 h-4" /> Publish Issue
          </button>
        )}
      </div>

      {!isPublished && !readiness.canPublish && (
        <p className="text-xs text-center" style={{ color: 'rgba(30,58,90,0.5)' }}>
          Resolve the items above before publishing.
        </p>
      )}
    </div>
  );
}