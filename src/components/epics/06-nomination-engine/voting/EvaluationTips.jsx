import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function EvaluationTips({ className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-blue-100 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Quick Evaluation Tips</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-blue-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-600" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Career Growth:</strong> Look for rapid progression and leadership roles</p>
            <p><strong>Innovation:</strong> Check for patents, awards, or novel solutions</p>
            <p><strong>Impact:</strong> Seek measurable outcomes and industry recognition</p>
            <p><strong>Potential:</strong> Consider future trajectory and cross-functional skills</p>
          </div>
          <div className="pt-2 border-t border-blue-200">
            <p className="text-xs text-blue-700 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Review their LinkedIn profile for detailed background
            </p>
          </div>
        </div>
      )}
    </div>
  );
}