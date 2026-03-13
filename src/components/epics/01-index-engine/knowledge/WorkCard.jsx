import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, FileText, Briefcase, Newspaper, Database, Zap } from 'lucide-react';

const workTypeConfig = {
  paper: { icon: FileText, label: 'Research Paper', color: 'bg-blue-100 text-blue-800' },
  patent: { icon: Award, label: 'Patent', color: 'bg-purple-100 text-purple-800' },
  project: { icon: Briefcase, label: 'Project', color: 'bg-green-100 text-green-800' },
  mission: { icon: Zap, label: 'Mission', color: 'bg-orange-100 text-orange-800' },
  media: { icon: Newspaper, label: 'Media', color: 'bg-pink-100 text-pink-800' },
  dataset: { icon: Database, label: 'Dataset', color: 'bg-teal-100 text-teal-800' }
};

const verificationConfig = {
  unverified: { label: 'Unverified', color: 'bg-gray-100 text-gray-700' },
  ai_inferred: { label: 'AI Inferred', color: 'bg-yellow-100 text-yellow-800' },
  organization_verified: { label: 'Verified', color: 'bg-green-100 text-green-800' },
  council_verified: { label: 'Council Verified', color: 'bg-blue-100 text-blue-800' }
};

export default function WorkCard({ work, onClick }) {
  const typeConfig = workTypeConfig[work.work_type] || workTypeConfig.paper;
  const verifyConfig = verificationConfig[work.verification_status] || verificationConfig.unverified;
  const TypeIcon = typeConfig.icon;

  return (
    <Card
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header with type icon and badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <TypeIcon className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 line-clamp-2 break-words">
              {work.title}
            </h3>
          </div>
        </div>

        {/* Publisher and date */}
        <div className="text-xs sm:text-sm text-slate-500 space-y-0.5">
          {work.publisher && <p className="truncate">{work.publisher}</p>}
          {work.publication_date && (
            <p>{new Date(work.publication_date).toLocaleDateString()}</p>
          )}
        </div>

        {/* Metrics row */}
        <div className="flex flex-wrap gap-1 text-xs text-slate-600">
          {work.citation_count > 0 && <span>📊 {work.citation_count} citations</span>}
          {work.media_mention_count > 0 && <span>📰 {work.media_mention_count} mentions</span>}
          {work.influence_score > 0 && <span>⭐ Score: {work.influence_score}</span>}
        </div>

        {/* Tags */}
        {work.topics && work.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {work.topics.slice(0, 2).map((topic, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
            {work.topics.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{work.topics.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Verification status badge */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Badge className={`text-xs ${typeConfig.color}`}>
            {typeConfig.label}
          </Badge>
          <Badge className={`text-xs ${verifyConfig.color}`}>
            {verifyConfig.label}
          </Badge>
        </div>
      </div>
    </Card>
  );
}