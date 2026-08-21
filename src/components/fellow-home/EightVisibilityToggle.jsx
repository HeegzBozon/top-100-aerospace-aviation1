import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { B } from './fellowHomeConfig';

// Governs whether the Fellow's ranked positions render publicly. Never affects measurement.
export default function EightVisibilityToggle({ isPublic, saving, onChange, accent }) {
  return (
    <button
      onClick={() => onChange(!isPublic)}
      disabled={saving}
      className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] px-3 py-1.5 rounded-full transition-opacity hover:opacity-75 disabled:opacity-50"
      style={{ color: isPublic ? B.navy : B.muted, border: `1px solid ${B.border}`, background: '#fff' }}
    >
      {saving ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isPublic ? (
        <Eye className="w-3 h-3" style={{ color: accent }} />
      ) : (
        <EyeOff className="w-3 h-3" />
      )}
      {isPublic ? 'Shown publicly' : 'Hidden publicly'}
    </button>
  );
}