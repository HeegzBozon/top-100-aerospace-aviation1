import { FileText, Film, Image, Link2, Music } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const iconFor = (a) => a.url ? Link2 : a.mime?.startsWith('image') ? Image : a.mime?.startsWith('video') ? Film : a.mime?.startsWith('audio') ? Music : FileText;

// One piece of evidence: a private file opened through a short-lived link, or a pasted URL.
export default function AttachmentChip({ a }) {
  const Icon = iconFor(a);
  const open = async () => {
    if (a.url) return window.open(a.url, '_blank', 'noopener');
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: a.file_uri });
    window.open(signed_url, '_blank', 'noopener');
  };
  return (
    <button type="button" onClick={open} className="flex max-w-[220px] items-center gap-1 rounded-full border border-editorial-copper/50 bg-white px-2 py-0.5 font-body text-[11px] text-editorial-navy hover:bg-editorial-cream">
      <Icon className="h-3 w-3 flex-none" /><span className="truncate">{a.name}</span>
    </button>
  );
}