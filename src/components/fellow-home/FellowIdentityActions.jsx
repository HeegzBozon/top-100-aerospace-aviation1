import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink } from 'lucide-react';
import { B } from './fellowHomeConfig';
import StatusPicker from './StatusPicker';

const ESSENTIALS = ['avatar_url', 'industry_role', 'one_word', 'six_word_story'];

// Identity-area controls: edit the record, view it publicly, and see what is still missing.
export default function FellowIdentityActions({ user, publicPath, accent, onEdit, statusKey, savingStatus, onStatusChange }) {
  const filled = ESSENTIALS.filter((f) => {
    const v = user?.[f];
    return typeof v === 'boolean' ? v === true : v && String(v).trim();
  }).length;
  const complete = filled === ESSENTIALS.length;

  return (
    <div className="flex items-center gap-3 flex-wrap justify-end">
      <StatusPicker statusKey={statusKey} accent={accent} saving={savingStatus} onChange={onStatusChange} compact />
      {!complete && (
        <div className="flex items-center gap-2">
          <div className="h-1 rounded-full w-20" style={{ background: B.border }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(filled / ESSENTIALS.length) * 100}%`, background: accent }}
            />
          </div>
          <span className="text-[11px] font-medium" style={{ color: B.muted }}>
            {filled} of {ESSENTIALS.length} essentials
          </span>
        </div>
      )}

      {publicPath && (
        <Link
          to={publicPath}
          className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: B.navy }}
        >
          <ExternalLink className="w-3.5 h-3.5" /> View public profile
        </Link>
      )}

      <button
        onClick={onEdit}
        className="group flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm transition-all hover:shadow-md"
        style={{ background: B.navy, color: '#fff' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = B.gold; e.currentTarget.style.color = B.navy; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = B.navy; e.currentTarget.style.color = '#fff'; }}
      >
        <Sparkles className="w-4 h-4" /> Update
      </button>
    </div>
  );
}