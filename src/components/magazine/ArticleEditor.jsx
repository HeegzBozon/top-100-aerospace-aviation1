import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Link2, Quote } from 'lucide-react';
import { MAGAZINE_PALETTE as P, ARTICLE_TYPES, ARTICLE_STATUSES, SECTION_TYPES } from '@/components/magazine/magazineConfig';

export default function ArticleEditor({ article, issue, onSave, onClose, onDelete }) {
  const [title, setTitle] = useState(article.title || '');
  const [subtitle, setSubtitle] = useState(article.subtitle || '');
  const [body, setBody] = useState(article.body || '');
  const [articleType, setArticleType] = useState(article.article_type || 'evergreen');
  const [status, setStatus] = useState(article.status || 'reserved');
  const [sectionId, setSectionId] = useState(article.section_id || '');
  const [pullQuote, setPullQuote] = useState(article.pull_quote || '');
  const [pullQuoteAttribution, setPullQuoteAttribution] = useState(article.pull_quote_attribution || '');
  const [heroImage, setHeroImage] = useState(article.hero_image_url || '');
  const [pageNumber, setPageNumber] = useState(article.page_number || '');
  const [placeholderText, setPlaceholderText] = useState(article.placeholder_text || '');
  const [nomineeId, setNomineeId] = useState(article.nominee_id || '');
  const [sources, setSources] = useState(article.sources || []);
  const [newSource, setNewSource] = useState({ attribution: '', source_type: 'quote', url: '', quote: '' });
  const [saving, setSaving] = useState(false);

  const sections = issue.sections || [];

  const addSource = () => {
    if (!newSource.attribution && !newSource.quote) return;
    setSources([...sources, { ...newSource }]);
    setNewSource({ attribution: '', source_type: 'quote', url: '', quote: '' });
  };

  const removeSource = (idx) => setSources(sources.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      await onSave({
        title, subtitle, body, article_type: articleType, status,
        section_id: sectionId, pull_quote: pullQuote, pull_quote_attribution: pullQuoteAttribution,
        hero_image_url: heroImage, page_number: pageNumber ? Number(pageNumber) : undefined,
        placeholder_text: placeholderText, nominee_id: nomineeId, sources,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(7,15,31,0.5)' }}>
      <div className="w-full max-w-2xl h-full overflow-y-auto" style={{ background: P.cream }}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b" style={{ background: P.cream, borderColor: 'rgba(30,58,90,0.1)' }}>
          <h3 className="text-sm font-serif" style={{ color: P.navy }}>Edit Article</h3>
          <div className="flex items-center gap-2">
            <button onClick={onDelete} className="p-2 rounded-full hover:bg-red-50" aria-label="Delete">
              <Trash2 className="w-4 h-4" style={{ color: 'rgba(30,58,90,0.4)' }} />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5" aria-label="Close">
              <X className="w-4 h-4" style={{ color: P.navy }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          <Field label="Headline">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mag-input" placeholder="Article headline..." />
          </Field>
          <Field label="Deck / Subtitle">
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="mag-input" placeholder="Article deck..." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={articleType} onChange={(e) => setArticleType(e.target.value)} className="mag-input">
                {ARTICLE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="mag-input">
                {ARTICLE_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Section">
              <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="mag-input">
                <option value="">Unassigned</option>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Page Number">
              <input type="number" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} className="mag-input" placeholder="—" />
            </Field>
          </div>

          {articleType === 'profile' && (
            <Field label="Nominee ID">
              <input value={nomineeId} onChange={(e) => setNomineeId(e.target.value)} className="mag-input" placeholder="Nominee record ID" />
            </Field>
          )}

          {articleType === 'results_reserved' && (
            <Field label="Placeholder Text (shown until measurements are finalized)">
              <textarea value={placeholderText} onChange={(e) => setPlaceholderText(e.target.value)} rows={2} className="mag-input" placeholder="Reserved for official measurement results." />
            </Field>
          )}

          <Field label="Hero Image URL">
            <input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} className="mag-input" placeholder="https://..." />
          </Field>

          <Field label="Body (Rich Text)">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="mag-input font-mono text-xs" placeholder="Write the article body..." />
          </Field>

          {/* Pull Quote */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(201,168,124,0.06)', border: `1px solid ${P.gold}30` }}>
            <p className="text-xs font-medium mb-3 flex items-center gap-1.5" style={{ color: P.copper }}>
              <Quote className="w-3.5 h-3.5" /> Pull Quote
            </p>
            <input value={pullQuote} onChange={(e) => setPullQuote(e.target.value)} className="mag-input mb-2" placeholder="The pull quote text..." />
            <input value={pullQuoteAttribution} onChange={(e) => setPullQuoteAttribution(e.target.value)} className="mag-input" placeholder="Attribution..." />
          </div>

          {/* Sources */}
          <div>
            <p className="text-xs font-medium mb-3" style={{ color: 'rgba(30,58,90,0.6)' }}>Source Material</p>
            <div className="space-y-2 mb-3">
              {sources.map((src, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(30,58,90,0.03)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: P.navy }}>{src.attribution || 'Unattributed'}</p>
                    {src.quote && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'rgba(30,58,90,0.5)' }}>"{src.quote}"</p>}
                    {src.url && <a href={src.url} target="_blank" rel="noreferrer" className="text-[10px] inline-flex items-center gap-1 mt-1" style={{ color: P.copper }}><Link2 className="w-3 h-3" /> Source</a>}
                  </div>
                  <button onClick={() => removeSource(idx)} className="p-1 rounded-full hover:bg-red-50">
                    <Trash2 className="w-3 h-3" style={{ color: 'rgba(30,58,90,0.4)' }} />
                  </button>
                </div>
              ))}
            </div>
            {/* New source form */}
            <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(30,58,90,0.03)' }}>
              <div className="grid grid-cols-2 gap-2">
                <input value={newSource.attribution} onChange={(e) => setNewSource({ ...newSource, attribution: e.target.value })} placeholder="Attribution" className="mag-input text-xs" />
                <select value={newSource.source_type} onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value })} className="mag-input text-xs">
                  <option value="quote">Quote</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="interview">Interview</option>
                  <option value="data">Data</option>
                </select>
              </div>
              <input value={newSource.url} onChange={(e) => setNewSource({ ...newSource, url: e.target.value })} placeholder="Source URL (optional)" className="mag-input text-xs" />
              <textarea value={newSource.quote} onChange={(e) => setNewSource({ ...newSource, quote: e.target.value })} placeholder="Quote or summary..." rows={2} className="mag-input text-xs" />
              <button onClick={addSource} className="mag-btn-secondary text-xs"><Plus className="w-3 h-3 inline mr-1" /> Add Source</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-2 px-5 py-4 border-t" style={{ background: P.cream, borderColor: 'rgba(30,58,90,0.1)' }}>
          <button onClick={onClose} className="mag-btn-secondary">Cancel</button>
          <button onClick={save} disabled={saving} className="mag-btn-primary px-6">{saving ? 'Saving...' : 'Save Article'}</button>
        </div>
      </div>

      <style>{`
        .mag-input {
          width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border-radius: 0.5rem;
          background: #fff; border: 0; outline: 1px solid rgba(30,58,90,0.15); color: ${P.navy};
        }
        .mag-input:focus { outline: 2px solid ${P.gold}; }
        .mag-btn-primary {
          display: inline-flex; align-items: center; padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 500;
          border-radius: 9999px; background: ${P.navy}; color: ${P.cream}; border: 0; cursor: pointer; transition: opacity 0.2s;
        }
        .mag-btn-primary:hover { opacity: 0.9; }
        .mag-btn-primary:disabled { opacity: 0.5; }
        .mag-btn-secondary {
          display: inline-flex; align-items: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
          border-radius: 9999px; background: transparent; color: ${P.navy}; border: 1px solid rgba(30,58,90,0.2); cursor: pointer; transition: all 0.2s;
        }
        .mag-btn-secondary:hover { background: rgba(30,58,90,0.05); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(30,58,90,0.6)' }}>{label}</label>
      {children}
    </div>
  );
}