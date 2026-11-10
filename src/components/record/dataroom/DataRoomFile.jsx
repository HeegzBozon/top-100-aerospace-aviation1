import { useState } from 'react';
import { FileText, Link2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { kindLabel } from './dataRoomConfig';

// One line of the room's index. A document is opened from here and nowhere else: an
// uploaded file is read through a short-lived signed address, an outside address is
// followed as it stands. Nothing is downloaded behind the Fellow's back.
export default function DataRoomFile({ item, onRemove }) {
  const [busy, setBusy] = useState(false);

  const open = async () => {
    if (item.url) {
      window.location.assign(item.url);
      return;
    }
    if (!item.file_uri) return;
    setBusy(true);
    try {
      const res = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: item.file_uri,
        expires_in: 600,
      });
      if (res?.signed_url) window.location.assign(res.signed_url);
    } finally {
      setBusy(false);
    }
  };

  const readable = !!item.url || !!item.file_uri;
  const Icon = item.url ? Link2 : FileText;

  return (
    <li className="flex items-start gap-3 border-b border-editorial-navy/10 py-3 last:border-b-0">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-editorial-copper" strokeWidth={1.8} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <p className="font-body text-[12.5px] font-medium text-editorial-navy">{item.title}</p>
        <p className="mt-0.5 font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-label">
          {kindLabel(item.kind)}
          {item.file_name ? ` · ${item.file_name}` : ''}
        </p>
        {item.note && (
          <p className="mt-1 font-body text-[11px] leading-relaxed text-editorial-navy/55">{item.note}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {readable && (
          <button
            type="button"
            onClick={open}
            disabled={busy}
            className="desk-key disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Open'}
          </button>
        )}
        <button type="button" onClick={() => onRemove(item.id)} className="desk-key desk-key-quiet">
          Remove
        </button>
      </div>
    </li>
  );
}