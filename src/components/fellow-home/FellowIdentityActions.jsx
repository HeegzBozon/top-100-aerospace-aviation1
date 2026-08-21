import { Link } from 'react-router-dom';
import { Pencil, ExternalLink } from 'lucide-react';
import { B } from './fellowHomeConfig';

const ESSENTIALS = ['avatar_url', 'industry_role', 'one_word', 'six_word_story'];

// Identity-area controls: edit the record, view it publicly, and see what is still missing.
export default function FellowIdentityActions({ user, publicPath, accent, onEdit }) {
  const filled = ESSENTIALS.filter((f) => {
    const v = user?.[f];
    return typeof v === 'boolean' ? v === true : v && String(v).trim();
  }).length;
  const complete = filled === ESSENTIALS.length;

  return (
    <div className="ml-auto mb-2 flex items-center gap-3 flex-wrap justify-end">
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
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-opacity hover:opacity-80"
        style={{ color: B.navy, border: `1px solid ${B.border}`, background: '#fff' }}
      >
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
    </div>
  );
}