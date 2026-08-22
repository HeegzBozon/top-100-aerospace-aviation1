import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import StatusPicker from './StatusPicker';
import { B } from './fellowHomeConfig';

// Compose surface: set your status or write a blog post.
// Spans the full height of the instrument cluster at 30% width.
export default function StatusCompose({ statusKey, accent, saving, onStatusChange }) {
  return (
    <div
      className="h-full rounded-2xl p-3 flex flex-col justify-between gap-3"
      style={{ background: B.cream, border: `1px solid ${B.border}` }}
    >
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] px-1" style={{ color: B.muted }}>
          Compose
        </span>
        <StatusPicker statusKey={statusKey} accent={accent} saving={saving} onChange={onStatusChange} compact />
      </div>
      <a
        href="#bulletin-board"
        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-black/[0.04]"
        style={{ color: B.navy, border: `1px solid ${B.navy}14` }}
      >
        <PenLine className="w-4 h-4" style={{ color: accent }} /> Write a bulletin
      </a>
    </div>
  );
}