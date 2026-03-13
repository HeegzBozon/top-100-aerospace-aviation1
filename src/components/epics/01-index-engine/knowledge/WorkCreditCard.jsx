import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const contributionTypeConfig = {
  author: { label: 'Author', color: 'bg-blue-100 text-blue-800' },
  inventor: { label: 'Inventor', color: 'bg-purple-100 text-purple-800' },
  contributor: { label: 'Contributor', color: 'bg-slate-100 text-slate-800' },
  editor: { label: 'Editor', color: 'bg-green-100 text-green-800' },
  investigator: { label: 'Investigator', color: 'bg-orange-100 text-orange-800' },
  project_lead: { label: 'Project Lead', color: 'bg-red-100 text-red-800' },
  engineer: { label: 'Engineer', color: 'bg-cyan-100 text-cyan-800' },
  researcher: { label: 'Researcher', color: 'bg-indigo-100 text-indigo-800' },
  designer: { label: 'Designer', color: 'bg-pink-100 text-pink-800' }
};

const verificationIcons = {
  unverified: <HelpCircle className="w-4 h-4 text-slate-400" />,
  self_reported: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  organization_verified: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  council_verified: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
  ai_inferred: <AlertCircle className="w-4 h-4 text-amber-500" />
};

export default function WorkCreditCard({ credit, nomineeName, onClick }) {
  const contribConfig = contributionTypeConfig[credit.contribution_type] || contributionTypeConfig.contributor;
  const confidencePercent = Math.round((credit.confidence_score || 0) * 100);

  return (
    <Card
      className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-2">
        {/* Name and role */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-slate-900 truncate">
              {nomineeName}
            </h4>
            <p className="text-xs text-slate-600 truncate">
              {credit.role || 'Contributor'}
            </p>
          </div>
          <div className="flex-shrink-0">
            {verificationIcons[credit.verification_status] || verificationIcons.unverified}
          </div>
        </div>

        {/* Contribution summary */}
        {credit.contribution_summary && (
          <p className="text-xs text-slate-600 line-clamp-2">
            {credit.contribution_summary}
          </p>
        )}

        {/* Contribution type badge */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <Badge className={`text-xs ${contribConfig.color}`}>
            {contribConfig.label}
          </Badge>
          {credit.confidence_score && (
            <span className="text-xs font-medium text-slate-600">
              {confidencePercent}% confidence
            </span>
          )}
        </div>

        {/* Dates if available */}
        {(credit.start_date || credit.end_date) && (
          <div className="text-xs text-slate-500 space-y-1 pt-1">
            {credit.start_date && (
              <p>Started: {new Date(credit.start_date).toLocaleDateString()}</p>
            )}
            {credit.end_date && (
              <p>Ended: {new Date(credit.end_date).toLocaleDateString()}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}