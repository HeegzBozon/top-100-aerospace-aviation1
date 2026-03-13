import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function SignalEngineRoadmap() {
  const sprints = [
    {
      id: 1,
      name: 'Foundation',
      status: 'completed',
      items: [
        { feature: 'Alumni table + aliases + org history', status: 'complete' },
        { feature: 'SNAPI + RSS ingestion', status: 'complete' },
        { feature: 'Mention matching + confidence + review queue', status: 'complete' },
      ],
    },
    {
      id: 2,
      name: 'Research',
      status: 'completed',
      items: [
        { feature: 'OpenAlex works + institutions mapping', status: 'complete' },
        { feature: 'DOI normalization', status: 'complete' },
        { feature: 'Basic Research tab + counts', status: 'complete' },
      ],
    },
    {
      id: 3,
      name: 'Enrichment + Patents',
      status: 'completed',
      items: [
        { feature: 'Semantic Scholar enrichment for high-signal works', status: 'complete' },
        { feature: 'PatentsView ingestion', status: 'complete' },
        { feature: 'Lens optional bridge for paper↔patent linking', status: 'complete' },
      ],
    },
    {
      id: 4,
      name: 'Signal Admin & Discovery',
      status: 'completed',
      items: [
        { feature: 'Signal review & C-confidence approval', status: 'complete' },
        { feature: 'Search, filters, trending detection', status: 'complete' },
        { feature: 'Timeline visualization + auto-approval scoring', status: 'complete' },
      ],
    },
    {
      id: 5,
      name: 'Signal Workflows & Export',
      status: 'completed',
      items: [
        { feature: 'Signal→Nomination workflow', status: 'complete' },
        { feature: 'CSV/JSON export + webhooks', status: 'complete' },
        { feature: 'Author enrichment + AI summaries', status: 'complete' },
      ],
    },
    {
      id: 6,
      name: 'Sync & Caching',
      status: 'completed',
      items: [
        { feature: 'Google Scholar periodic sync', status: 'complete' },
        { feature: 'USPTO patent scanning', status: 'complete' },
        { feature: 'News feed integration + signal cache', status: 'complete' },
      ],
    },
    {
      id: 7,
      name: 'Profiles & Scoring',
      status: 'in_progress',
      items: [
        { feature: 'Signal profile integration', status: 'pending' },
        { feature: 'Signal reputation scoring (upvote/downvote)', status: 'pending' },
        { feature: 'Comments & discussion threads', status: 'pending' },
        { feature: 'Advanced search & saved filters', status: 'pending' },
        { feature: 'Signal deduplication', status: 'pending' },
      ],
    },
  ];

  const getStatusColor = status => {
    if (status === 'complete') return 'bg-green-100 text-green-800';
    if (status === 'in_progress') return 'bg-blue-100 text-blue-800';
    return 'bg-amber-100 text-amber-800';
  };

  const getSprintBadge = status => {
    if (status === 'completed') return { label: 'Complete', icon: CheckCircle2, color: 'bg-green-50 border-green-200' };
    if (status === 'in_progress') return { label: 'In Progress', icon: Clock, color: 'bg-blue-50 border-blue-200' };
    return { label: 'Planned', icon: AlertCircle, color: 'bg-amber-50 border-amber-200' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            TOP 100 Signal Engine
          </h1>
          <p className="text-lg text-slate-600">Golden Happy Path — Build Order & Progress</p>
        </div>

        {/* Legend */}
        <div className="mb-8 grid sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Completed</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">In Progress</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">Planned</span>
          </div>
        </div>

        {/* Sprints */}
        <div className="space-y-6">
          {sprints.map(sprint => {
            const badge = getSprintBadge(sprint.status);
            const BadgeIcon = badge.icon;

            return (
              <Card key={sprint.id} className={`border-l-4 ${badge.color}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-xl">Sprint {sprint.id}</CardTitle>
                        <Badge className="gap-1" variant="secondary">
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </Badge>
                      </div>
                      <CardDescription>{sprint.name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sprint.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div
                          className={`shrink-0 w-5 h-5 rounded-full mt-0.5 ${getStatusColor(item.status)} flex items-center justify-center`}
                        >
                          {item.status === 'complete' && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {item.feature}
                          </p>
                        </div>
                        <Badge className={`shrink-0 ${getStatusColor(item.status)}`}>
                          {item.status === 'complete' ? '✓' : '◯'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <Card className="mt-8 bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-slate-400 mb-1">Completed Sprints</p>
                <p className="text-3xl font-bold text-green-400">6</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-400">1</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Features</p>
                <p className="text-3xl font-bold text-white">31</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}