import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, Film, Loader2, RotateCcw } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import useIssueVideoExport, {
  VIDEO_FORMATS,
  VIDEO_PACES,
  videoSupport,
} from '@/components/magazine/video/useIssueVideoExport';

// A run longer than this is a quarter of an hour of waiting in a browser tab, and the
// panel says so rather than starting one by accident.
const MAX_MINUTES = 15;

const slug = (value) => String(value || 'issue')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);

const Segmented = ({ options, value, onChange, disabled }) => (
  <div className="inline-flex rounded-full p-0.5" style={{ background: 'rgba(30,58,90,0.07)' }}>
    {options.map((option) => (
      <button
        key={option.key}
        type="button"
        disabled={disabled}
        onClick={() => onChange(option.key)}
        aria-pressed={value === option.key}
        className="rounded-full px-3.5 py-2 text-[11px] font-semibold transition-all disabled:opacity-50"
        style={{
          background: value === option.key ? P.navy : 'transparent',
          color: value === option.key ? P.cream : P.navy,
        }}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const Label = ({ children }) => (
  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(30,58,90,0.45)' }}>
    {children}
  </p>
);

// The issue as a film, for an editor to hand on: a vertical cut for Shorts or a wide one
// for a longer video, rendered here and downloaded when it finishes.
export default function ExportIssueVideo({ issue, pages = [], articles = [] }) {
  const supported = useMemo(() => videoSupport(), []);
  const ordered = useMemo(
    () => [...pages].sort((a, b) => (a.page_number || 0) - (b.page_number || 0)),
    [pages],
  );

  const [format, setFormat] = useState('vertical');
  const [pace, setPace] = useState('standard');
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(Math.max(0, ordered.length - 1));

  const { status, progress, shot, error, result, start, cancel, reset, clock } = useIssueVideoExport();

  // Another issue is another run: the range returns to the whole of it and the last file
  // is put away.
  useEffect(() => {
    setFrom(0);
    setTo(Math.max(0, ordered.length - 1));
    reset();
  }, [issue?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const secondsPerPage = VIDEO_PACES.find((p) => p.key === pace)?.seconds || 3.5;
  const count = Math.max(0, to - from + 1);
  const estimate = count * secondsPerPage;
  const tooLong = estimate > MAX_MINUTES * 60;
  const busy = status === 'preparing' || status === 'recording';
  const ready = count > 0 && !tooLong && !busy;

  const formatNote = VIDEO_FORMATS.find((f) => f.key === format)?.note || '';
  const extension = result?.mime?.includes('mp4') ? 'mp4' : 'webm';
  const fileName = `TOP100-${slug(issue?.title)}-${format}-${String(from + 1).padStart(2, '0')}-${String(to + 1).padStart(2, '0')}.${extension}`;

  const begin = () => start({
    issue,
    pages: ordered.slice(from, to + 1),
    articles,
    format,
    secondsPerPage,
    totalPages: ordered.length,
  });

  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
      <div className="mb-1 flex items-center gap-2">
        <Film className="h-4 w-4" style={{ color: P.copper }} />
        <h3 className="font-serif text-sm" style={{ color: P.navy }}>Export video</h3>
      </div>
      <p className="mb-4 text-xs leading-relaxed" style={{ color: 'rgba(30,58,90,0.55)' }}>
        The issue as a film: each page held for a beat, composed for a vertical Short or a wide cut.
        The video is rendered on this machine and downloaded when it finishes.
      </p>

      {!supported ? (
        <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(30,58,90,0.05)' }}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: P.copper }} />
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(30,58,90,0.7)' }}>
            This browser cannot render video. Chrome, Edge or Safari 14.1 and later can.
          </p>
        </div>
      ) : status === 'done' && result ? (
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'rgba(201,168,124,0.12)', border: '1px solid rgba(184,115,51,0.35)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#8F5C2C' }}>
              Ready to download
            </p>
            <p className="mt-1.5 font-serif text-sm" style={{ color: P.navy }}>{fileName}</p>
            <p className="mt-1 text-xs" style={{ color: 'rgba(30,58,90,0.6)' }}>
              {clock(result.seconds)} · {Math.max(1, Math.round(result.size / 1048576))} MB · {result.mime.split(';')[0]}
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href={result.url}
              download={fileName}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: P.navy, color: P.cream }}
            >
              <Download className="h-4 w-4" /> Download video
            </a>
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ border: `1px solid ${P.navy}`, color: P.navy }}
            >
              <RotateCcw className="h-4 w-4" /> Another
            </button>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.45)' }}>
            The file lives in this browser only: download it now, before this page is reloaded.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label>Cut</Label>
            <Segmented options={VIDEO_FORMATS} value={format} onChange={setFormat} disabled={busy} />
            <p className="mt-1.5 text-[11px]" style={{ color: 'rgba(30,58,90,0.45)' }}>{formatNote}</p>
          </div>

          <div>
            <Label>Hold each page</Label>
            <Segmented options={VIDEO_PACES} value={pace} onChange={setPace} disabled={busy} />
          </div>

          <div>
            <Label>Pages</Label>
            <div className="flex items-center gap-2">
              <select
                value={from}
                disabled={busy}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setFrom(next);
                  if (next > to) setTo(next);
                }}
                className="flex-1 rounded-xl px-3 py-2.5 text-xs"
                style={{ border: '1px solid rgba(30,58,90,0.18)', color: P.navy, background: '#fff' }}
                aria-label="First page"
              >
                {ordered.map((page, i) => (
                  <option key={page.id || i} value={i}>Page {page.page_number ?? i + 1}</option>
                ))}
              </select>
              <span className="text-xs" style={{ color: 'rgba(30,58,90,0.4)' }}>to</span>
              <select
                value={to}
                disabled={busy}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setTo(next);
                  if (next < from) setFrom(next);
                }}
                className="flex-1 rounded-xl px-3 py-2.5 text-xs"
                style={{ border: '1px solid rgba(30,58,90,0.18)', color: P.navy, background: '#fff' }}
                aria-label="Last page"
              >
                {ordered.map((page, i) => (
                  <option key={page.id || i} value={i}>Page {page.page_number ?? i + 1}</option>
                ))}
              </select>
            </div>
            <p className="mt-1.5 text-[11px]" style={{ color: tooLong ? '#8F5C2C' : 'rgba(30,58,90,0.45)' }}>
              {count} {count === 1 ? 'page' : 'pages'} · about {clock(estimate)} of video
              {tooLong ? ` — too long for one pass, narrow the range to under ${MAX_MINUTES} minutes.` : ', rendered in real time'}
            </p>
          </div>

          {busy ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs" style={{ color: P.navy }}>
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {status === 'preparing' ? 'Reading the pages' : `Rendering page ${shot?.page ?? '—'}`}
                </span>
                <span className="tabular-nums" style={{ color: 'rgba(30,58,90,0.55)' }}>
                  {status === 'recording' && shot
                    ? `${clock(shot.elapsed / 1000)} / ${clock(shot.seconds)}`
                    : ''}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(30,58,90,0.1)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(progress * 100)}%`, background: P.copper }} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px]" style={{ color: 'rgba(30,58,90,0.45)' }}>
                  Keep this tab open while it renders.
                </p>
                <button type="button" onClick={cancel} className="text-[11px] font-semibold" style={{ color: P.navy }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={begin}
              disabled={!ready}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: P.navy, color: P.cream }}
            >
              <Film className="h-4 w-4" /> Render video
            </button>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(184,115,51,0.1)' }}>
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: P.copper }} />
              <p className="text-xs leading-relaxed" style={{ color: '#8F5C2C' }}>{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}