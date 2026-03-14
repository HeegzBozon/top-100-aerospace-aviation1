import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import WorkCreditCard from './WorkCreditCard';

export default function WorkDetailModal({ workId, open, onOpenChange }) {
  const [work, setWork] = useState(null);
  const [credits, setCredits] = useState([]);
  const [nominees, setNominees] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !workId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch work
        const workData = await base44.entities.Work.read(workId);
        setWork(workData);

        // Fetch credits
        const creditsData = await base44.entities.WorkCredit.filter(
          { work_id: workId },
          '-created_date',
          100
        );
        setCredits(creditsData);

        // Fetch nominee names
        const nomineeMap = {};
        for (const credit of creditsData) {
          if (!nomineeMap[credit.nominee_id]) {
            const nominee = await base44.entities.Nominee.read(credit.nominee_id);
            nomineeMap[credit.nominee_id] = nominee?.name || 'Unknown';
          }
        }
        setNominees(nomineeMap);
      } catch (err) {
        console.error('Error loading work detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [workId, open]);

  if (!work) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{work.title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Metadata */}
              <div className="space-y-2 text-sm">
                {work.publisher && (
                  <p>
                    <span className="font-medium text-slate-700">Publisher:</span>{' '}
                    <span className="text-slate-600">{work.publisher}</span>
                  </p>
                )}
                {work.publication_date && (
                  <p>
                    <span className="font-medium text-slate-700">Date:</span>{' '}
                    <span className="text-slate-600">
                      {new Date(work.publication_date).toLocaleDateString()}
                    </span>
                  </p>
                )}
                {work.data_source && (
                  <p>
                    <span className="font-medium text-slate-700">Source:</span>{' '}
                    <span className="text-slate-600">{work.data_source}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              {work.description && (
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-700">Description</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {work.description}
                  </p>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    {work.influence_score || 0}
                  </p>
                  <p className="text-xs text-slate-600">Influence Score</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    {work.citation_count || 0}
                  </p>
                  <p className="text-xs text-slate-600">Citations</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    {credits.length}
                  </p>
                  <p className="text-xs text-slate-600">Contributors</p>
                </div>
              </div>

              {/* Topics */}
              {work.topics && work.topics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-700">Topics</h4>
                  <div className="flex flex-wrap gap-1">
                    {work.topics.map((topic, idx) => (
                      <Badge key={idx} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* External link */}
              {work.source_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(work.source_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Source
                </Button>
              )}

              {/* Credits */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-700">Contributors</h4>
                {credits.length === 0 ? (
                  <p className="text-sm text-slate-500">No contributors recorded</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {credits.map((credit) => (
                      <WorkCreditCard
                        key={credit.id}
                        credit={credit}
                        nomineeName={nominees[credit.nominee_id] || 'Unknown'}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}