import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function SignalReview() {
  const [mentions, setMentions] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filterConfidence, setFilterConfidence] = useState('C');
  const [approving, setApproving] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [currentUser, mentionsData, nomineesData] = await Promise.all([
          base44.auth.me(),
          base44.entities.HonoreeMention.filter(
            { confidence: 'C' },
            '-created_date',
            100
          ),
          base44.entities.Nominee.filter({ status: 'active' }, null, 1000),
        ]);
        setUser(currentUser);
        setMentions(mentionsData || []);
        setNominees(nomineesData || []);
      } catch (error) {
        console.error('Error loading:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filterConfidence]);

  const handleApprove = async (mentionId) => {
    setApproving(prev => ({ ...prev, [mentionId]: 'approving' }));
    try {
      await base44.entities.HonoreeMention.update(mentionId, { confidence: 'A' });
      setMentions(prev => prev.filter(m => m.id !== mentionId));
      setApproving(prev => ({ ...prev, [mentionId]: 'approved' }));
      setTimeout(() => {
        setApproving(prev => {
          const { [mentionId]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    } catch (error) {
      console.error('Error approving:', error);
      setApproving(prev => ({ ...prev, [mentionId]: 'error' }));
    }
  };

  const handleReject = async (mentionId) => {
    setApproving(prev => ({ ...prev, [mentionId]: 'rejecting' }));
    try {
      await base44.entities.HonoreeMention.delete(mentionId);
      setMentions(prev => prev.filter(m => m.id !== mentionId));
      setApproving(prev => ({ ...prev, [mentionId]: 'rejected' }));
      setTimeout(() => {
        setApproving(prev => {
          const { [mentionId]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    } catch (error) {
      console.error('Error rejecting:', error);
      setApproving(prev => ({ ...prev, [mentionId]: 'error' }));
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Signal Review</h1>
          <p className="text-slate-600">
            Review and approve low-confidence signal detections
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Select value={filterConfidence} onValueChange={setFilterConfidence}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="C">Soft Matches (C)</SelectItem>
              <SelectItem value="B">Strong Matches (B)</SelectItem>
            </SelectContent>
          </Select>
          <Badge className="bg-amber-100 text-amber-800">
            {mentions.length} pending
          </Badge>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : mentions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">All signals reviewed!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {mentions.map(mention => {
              const nominee = nominees.find(n => n.id === mention.nominee_id);
              const status = approving[mention.id];

              return (
                <Card key={mention.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Nominee & Source */}
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {nominee?.name || mention.nominee_name}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {mention.news_site} • {new Date(mention.published_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Article */}
                      <a
                        href={mention.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <p className="font-medium text-slate-900 text-sm line-clamp-2">
                          {mention.article_title}
                        </p>
                        {mention.article_summary && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {mention.article_summary}
                          </p>
                        )}
                      </a>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(mention.id)}
                          disabled={status && status !== 'error'}
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {status === 'approving' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : status === 'approved' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          {status === 'approved' ? 'Approved' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(mention.id)}
                          disabled={status && status !== 'error'}
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                        >
                          {status === 'rejecting' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : status === 'rejected' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {status === 'rejected' ? 'Rejected' : 'Reject'}
                        </Button>
                      </div>

                      {status === 'error' && (
                        <p className="text-xs text-red-600">Something went wrong</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}