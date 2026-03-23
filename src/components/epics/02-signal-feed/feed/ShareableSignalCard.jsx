import { Badge } from '@/components/ui/badge';
import { BookOpen, Award, Newspaper, Zap, ExternalLink } from 'lucide-react';

const signalTypeIcon = {
  patent: <Award className="w-4 h-4" />,
  publication: <BookOpen className="w-4 h-4" />,
  media_mention: <Newspaper className="w-4 h-4" />,
  citation: <Zap className="w-4 h-4" />,
};

const signalTypeLabel = {
  patent: 'Patent',
  publication: 'Research',
  media_mention: 'Media',
  citation: 'Citation',
};

const signalTypeBg = {
  patent: 'bg-purple-50 border-purple-200',
  publication: 'bg-blue-50 border-blue-200',
  media_mention: 'bg-orange-50 border-orange-200',
  citation: 'bg-green-50 border-green-200',
};

const signalTypeBadge = {
  patent: 'bg-purple-100 text-purple-800',
  publication: 'bg-blue-100 text-blue-800',
  media_mention: 'bg-orange-100 text-orange-800',
  citation: 'bg-green-100 text-green-800',
};

/**
 * Embeddable signal card component - can be used in profiles, LinkedIn, etc.
 * @param {Object} signal - SignalCard entity
 * @param {string} nomineeName - Name of the nominee for context
 * @param {boolean} compact - Show compact variant
 */
export default function ShareableSignalCard({ signal, nomineeName, compact = false }) {
  if (!signal) return null;

  const primaryLink = signal.evidence_links?.[0];

  if (compact) {
    return (
      <a
        href={primaryLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`block p-3 rounded-lg border ${signalTypeBg[signal.signal_type]} hover:shadow-md transition-all`}
      >
        <div className="flex items-start gap-2">
          <div className={`p-1.5 rounded ${signalTypeBadge[signal.signal_type]}`}>
            {signalTypeIcon[signal.signal_type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 line-clamp-2">
              {signal.headline}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {signal.source_name}
            </p>
          </div>
        </div>
      </a>
    );
  }

  return (
    <div
      className={`border rounded-xl p-4 ${signalTypeBg[signal.signal_type]} hover:shadow-lg transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`p-2 rounded-lg ${signalTypeBadge[signal.signal_type]}`}>
          {signalTypeIcon[signal.signal_type]}
        </div>
        <Badge className={signalTypeBadge[signal.signal_type]}>
          {signalTypeLabel[signal.signal_type]}
        </Badge>
      </div>

      {/* Headline */}
      <h3 className="font-semibold text-slate-900 mb-2 text-sm leading-snug">
        {signal.headline}
      </h3>

      {/* Nominee + Source */}
      <p className="text-xs text-slate-600 mb-3">
        <span className="font-medium">{nomineeName}</span>
        <span className="mx-1 text-slate-400">•</span>
        <span>{signal.source_name}</span>
        {signal.signal_date && (
          <>
            <span className="mx-1 text-slate-400">•</span>
            <span>{new Date(signal.signal_date).toLocaleDateString()}</span>
          </>
        )}
      </p>

      {/* Tags */}
      {signal.tags && signal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {signal.tags.slice(0, 4).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* CTA */}
      {primaryLink && (
        <a
          href={primaryLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View source <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}