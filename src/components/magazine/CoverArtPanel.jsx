import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// The two printed faces of an issue, set from the studio.
//
// The front cover is a field on the issue, because that is the plate the opening and
// every listing reads. The back cover is the closing page of the book, so it is written
// where pages live — the same page a reader turns to, not a second copy of it. Covers are
// artwork shown to every reader, so uploads go to public storage.
export default function CoverArtPanel({ issue, pages = [], onUpdate, onReload }) {
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const backPage = [...pages]
    .filter((page) => page.layout_type === 'back_cover')
    .sort((a, b) => (b.page_number || 0) - (a.page_number || 0))[0] || null;

  const upload = async (file) => {
    if (!file) return '';
    if (!file.type.startsWith('image/')) throw new Error('not an image');
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    return file_url;
  };

  const replaceFront = async (file) => {
    setBusy('front');
    setError('');
    try {
      const url = await upload(file);
      await onUpdate(issue.id, { cover_image_url: url });
    } catch (e) {
      setError('That file could not be uploaded. Use a JPG or PNG.');
    } finally {
      setBusy('');
    }
  };

  const replaceBack = async (file) => {
    setBusy('back');
    setError('');
    try {
      const url = await upload(file);
      if (backPage) {
        await base44.entities.MagazinePage.update(backPage.id, { background_image_url: url });
      } else {
        const last = Math.max(0, ...pages.map((page) => page.page_number || 0));
        await base44.entities.MagazinePage.create({
          issue_id: issue.id,
          page_number: last + 1,
          layout_type: 'back_cover',
          status: issue.status === 'published' ? 'published' : 'draft',
          content_blocks: [],
          background_image_url: url,
        });
      }
      onReload?.();
    } catch (e) {
      setError('That file could not be uploaded. Use a JPG or PNG.');
    } finally {
      setBusy('');
    }
  };

  const clearFront = async () => {
    setBusy('front');
    try {
      await onUpdate(issue.id, { cover_image_url: '' });
    } finally {
      setBusy('');
    }
  };

  const clearBack = async () => {
    if (!backPage) return;
    setBusy('back');
    try {
      await base44.entities.MagazinePage.update(backPage.id, { background_image_url: '' });
      onReload?.();
    } finally {
      setBusy('');
    }
  };

  const tiles = [
    {
      key: 'front',
      label: 'Front Cover',
      hint: 'The plate the issue opens on.',
      url: issue.cover_image_url,
      inputRef: frontRef,
      onPick: replaceFront,
      onClear: clearFront,
    },
    {
      key: 'back',
      label: 'Back Cover',
      hint: backPage ? 'The last page of the book.' : 'Uploading adds it as the closing page.',
      url: backPage?.background_image_url,
      inputRef: backRef,
      onPick: replaceBack,
      onClear: clearBack,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tiles.map((tile) => (
          <div key={tile.key} className="rounded-xl p-3" style={{ background: 'rgba(30,58,90,0.03)', border: '1px solid rgba(30,58,90,0.12)' }}>
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-medium" style={{ color: P.navy }}>{tile.label}</p>
              {tile.url ? (
                <button onClick={tile.onClear} disabled={busy === tile.key} className="p-1 rounded-full hover:bg-red-50 disabled:opacity-40" title={`Remove ${tile.label.toLowerCase()}`}>
                  <Trash2 className="w-3.5 h-3.5" style={{ color: 'rgba(30,58,90,0.45)' }} />
                </button>
              ) : null}
            </div>
            <p className="mt-0.5 text-[11px]" style={{ color: 'rgba(30,58,90,0.5)' }}>{tile.hint}</p>

            <div className="mt-2 overflow-hidden rounded-lg" style={{ aspectRatio: '3 / 4', background: P.navy, border: `1px solid ${P.copper}30` }}>
              {tile.url ? (
                <img src={tile.url} alt={`${tile.label} preview`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
                  <ImagePlus className="h-5 w-5" style={{ color: 'rgba(201,168,124,0.7)' }} />
                  <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(250,248,245,0.5)' }}>No image</span>
                </div>
              )}
            </div>

            <input
              ref={tile.inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) tile.onPick(file);
              }}
            />
            <button
              onClick={() => tile.inputRef.current?.click()}
              disabled={busy === tile.key}
              className="mag-btn-secondary mt-2 w-full justify-center py-1.5 text-xs"
            >
              {busy === tile.key ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
              {busy === tile.key ? 'Uploading' : tile.url ? 'Replace image' : 'Upload image'}
            </button>
          </div>
        ))}
      </div>
      {error ? <p className="text-xs" style={{ color: '#b4453a' }}>{error}</p> : null}
    </div>
  );
}