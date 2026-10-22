import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Eye, Download, Search } from 'lucide-react';
import { composeBadge } from '@/components/og-card/badgeComposer';
import { loadImage, WREATH_URL } from '@/components/og-card/ogCardComposer';
import { getCountryLabel } from '@/components/profile/countryFlags';

// Test surface for the 1200×1200 badge format. Renders one record locally and
// searches the whole roster (not just the active pool), so a record can be
// checked before it qualifies. Nothing is uploaded and no record is changed.
export default function BadgePreview() {
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('idle');
  const [note, setNote] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    base44.entities.Nominee.list('-created_date', 500)
      .then((rows) => setRecords(Array.isArray(rows) ? rows : []))
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false));
  }, []);

  const q = query.trim().toLowerCase();
  const matches = q
    ? records.filter((r) =>
        [r.name, r.linkedin_profile_url, r.nominee_email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    : [];

  const nominee = records.find((n) => n.id === selectedId);
  const countryLabel = nominee ? getCountryLabel(nominee.country) : null;

  const handlePreview = async () => {
    if (!nominee) return;
    setStatus('loading');
    setNote('');
    try {
      const photoSrc = nominee.avatar_url || nominee.photo_url;
      const [photoImg, wreathImg] = await Promise.all([
        photoSrc ? loadImage(photoSrc).catch(() => null) : Promise.resolve(null),
        loadImage(WREATH_URL).catch(() => null),
      ]);
      composeBadge(canvasRef.current, {
        photoImg,
        wreathImg,
        name: nominee.name,
        countryLabel,
      });
      setPreviewUrl(canvasRef.current.toDataURL('image/png'));
      setNote(
        countryLabel
          ? `Country line: ${countryLabel}`
          : nominee.country
            ? `Country line omitted — “${nominee.country}” is not a country.`
            : 'Country line omitted — no country on the record.',
      );
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `Badge-${(nominee?.name || 'honoree').replace(/\s+/g, '-')}-1200.png`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-5">
      <h2 className="text-lg font-semibold mb-1">Preview the 1200 × 1200 badge</h2>
      <p className="text-xs text-slate-400 mb-4">
        The square avatar format, composed to a safe circle so a circular crop loses nothing. Country is text only and
        omitted when the record does not hold a country. Nothing is uploaded and no record is changed.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedId(''); setStatus('idle'); setPreviewUrl(null); }}
            placeholder="Search name or LinkedIn handle…"
            className="bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white w-72"
          />
        </div>
        {matches.length > 0 && (
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setStatus('idle'); setPreviewUrl(null); }}
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white max-w-xs"
          >
            <option value="">Select a record…</option>
            {matches.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}{n.status ? ` · ${n.status}` : ''}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handlePreview}
          disabled={!nominee || status === 'loading'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c9a87c] text-[#0f1f35] font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          {status === 'loading' ? 'Composing…' : 'Preview badge'}
        </button>
        {status === 'ready' && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-sm text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="w-4 h-4" /> Download PNG
          </button>
        )}
      </div>

      {loadingRecords && <p className="text-sm text-slate-500">Loading the roster…</p>}
      {!loadingRecords && status === 'idle' && (
        <p className="text-sm text-slate-500">
          {q && !matches.length
            ? 'No honoree matches that search.'
            : 'Search for an honoree, pick a record, then press Preview badge.'}
        </p>
      )}
      {status === 'error' && <p className="text-sm text-red-400">Could not compose this badge. Try again.</p>}
      {status === 'ready' && previewUrl && (
        <>
          <p className="text-xs text-slate-400 mb-3">{note}</p>
          <div className="flex flex-wrap items-start gap-6">
            <img src={previewUrl} alt={`Badge preview for ${nominee?.name}`} className="w-64 rounded-lg shadow-xl" />
            <div className="text-xs text-slate-400 max-w-xs space-y-2">
              <p className="uppercase tracking-[0.14em] text-[10px] text-slate-500">Circular crop check</p>
              <img
                src={previewUrl}
                alt={`Circular crop of the badge for ${nominee?.name}`}
                className="w-24 h-24 rounded-full shadow-lg"
              />
              <img
                src={previewUrl}
                alt={`Small circular crop of the badge for ${nominee?.name}`}
                className="w-10 h-10 rounded-full shadow"
              />
              <p>Shown at profile size and at comment size, both circular.</p>
            </div>
          </div>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}