import React from 'react';
import { BookOpen, Plus, Trash2, Calendar } from 'lucide-react';
import { MAGAZINE_PALETTE as P, ISSUE_STATUSES, statusLabel, statusColor } from '@/components/magazine/magazineConfig';

export default function IssueList({ issues, onSelect, onCreate, onDelete }) {
  if (!issues.length) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: 'rgba(30,58,90,0.06)' }}>
          <BookOpen className="w-8 h-8" style={{ color: P.navy }} />
        </div>
        <h2 className="text-2xl font-serif mb-2" style={{ color: P.navy }}>No issues yet</h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(30,58,90,0.55)' }}>
          Create your first digital magazine issue to begin planning, drafting, and assembling content.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
          style={{ background: P.navy, color: P.cream }}
        >
          <Plus className="w-4 h-4" /> Create Issue
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif" style={{ color: P.navy }}>Issues</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(30,58,90,0.5)' }}>{issues.length} issue{issues.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
          style={{ background: P.navy, color: P.cream }}
        >
          <Plus className="w-4 h-4" /> New Issue
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            onClick={() => onSelect(issue)}
            className="group cursor-pointer rounded-2xl overflow-hidden transition-all hover:shadow-lg"
            style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}
          >
            {/* Cover area */}
            <div className="aspect-[3/4] relative overflow-hidden" style={{ background: issue.cover_image_url ? 'transparent' : P.navy }}>
              {issue.cover_image_url ? (
                <img src={issue.cover_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: P.gold }}>
                    {issue.cover_kicker || 'TOP 100'}
                  </span>
                  <span className="font-serif text-lg leading-tight" style={{ color: P.cream }}>
                    {issue.title}
                  </span>
                  {issue.subtitle && (
                    <span className="text-xs mt-2" style={{ color: 'rgba(250,248,245,0.6)' }}>{issue.subtitle}</span>
                  )}
                </div>
              )}
              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.92)', color: statusColor(ISSUE_STATUSES, issue.status) }}
                >
                  {statusLabel(ISSUE_STATUSES, issue.status)}
                </span>
              </div>
            </div>
            {/* Footer */}
            <div className="p-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: P.navy }}>{issue.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(30,58,90,0.5)' }}>
                  {issue.assembly_mode === 'pdf' ? 'PDF Upload' : 'Native Composition'}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(issue.id); }}
                className="p-1.5 rounded-full transition-colors hover:bg-red-50"
                aria-label="Delete issue"
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: 'rgba(30,58,90,0.4)' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}