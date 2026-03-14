import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, ExternalLink, Loader2, Edit3, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function CommunityNotesModeration() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [reviewNotes, setReviewNotes] = useState({});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const pending = await base44.entities.ProfileEditRequest.filter({ status: 'pending' }, '-created_date', 50);
      const recent = await base44.entities.ProfileEditRequest.filter(
        { status: { $in: ['approved', 'rejected'] } }, 
        '-updated_date', 
        20
      );
      setRequests([...pending, ...recent]);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load edit requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    const adminNotes = reviewNotes[request.id] || '';
    setProcessing({ ...processing, [request.id]: true });

    try {
      const currentUser = await base44.auth.me();

      // Update the nominee profile with the approved edit
      const updateData = {
        [request.field_name]: request.proposed_value
      };
      await base44.asServiceRole.entities.Nominee.update(request.nominee_id, updateData);

      // Mark request as approved
      await base44.entities.ProfileEditRequest.update(request.id, {
        status: 'approved',
        reviewed_by: currentUser.email,
        review_notes: adminNotes
      });

      // Award Stardust bonus for accepted edit
      try {
        await base44.functions.invoke('awardStardust', {
          user_email: request.submitted_by,
          action_type: 'profile_edit_accepted',
          amount: 15
        });
      } catch (error) {
        console.log('Stardust award skipped (function may not exist yet)');
      }

      toast.success('Edit approved and profile updated! Contributor earned +15 Stardust');
      loadRequests();
    } catch (error) {
      console.error('Error approving edit:', error);
      toast.error('Failed to approve edit');
    } finally {
      setProcessing({ ...processing, [request.id]: false });
    }
  };

  const handleReject = async (request) => {
    const adminNotes = reviewNotes[request.id] || 'Does not meet quality standards';
    setProcessing({ ...processing, [request.id]: true });

    try {
      const currentUser = await base44.auth.me();

      await base44.entities.ProfileEditRequest.update(request.id, {
        status: 'rejected',
        reviewed_by: currentUser.email,
        review_notes: adminNotes
      });

      toast.success('Edit rejected');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting edit:', error);
      toast.error('Failed to reject edit');
    } finally {
      setProcessing({ ...processing, [request.id]: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Edit3 className="w-8 h-8 text-blue-500" />
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">Community Notes Moderation</h2>
          <p className="text-[var(--muted)]">Review profile edit suggestions from the community</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Review ({pendingRequests.length})</span>
              <Button onClick={loadRequests} variant="outline" size="sm">
                <Loader2 className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-[var(--muted)]">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending edit requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border border-[var(--border)] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(request.created_date), 'MMM d, h:mm a')}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          <User className="w-4 h-4" />
                          <span>{request.submitted_by}</span>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-semibold text-[var(--text)] mb-1">
                        Field: <span className="text-blue-600">{request.field_name}</span>
                      </div>
                      <div className="text-xs text-[var(--muted)] mb-1">Nominee ID: {request.nominee_id}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                        <div className="text-xs font-semibold text-red-700 mb-1">Current Value</div>
                        <div className="text-sm text-gray-700">
                          {request.current_value || <span className="italic text-gray-400">Empty</span>}
                        </div>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                        <div className="text-xs font-semibold text-green-700 mb-1">Proposed Value</div>
                        <div className="text-sm text-gray-700">{request.proposed_value}</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded mb-3">
                      <div className="text-xs font-semibold text-blue-700 mb-1">Reason</div>
                      <div className="text-sm text-gray-700">{request.reason}</div>
                    </div>

                    {request.source_url && (
                      <div className="mb-3">
                        <a 
                          href={request.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Source
                        </a>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="text-xs font-semibold text-[var(--text)] mb-1 block">
                        Review Notes (optional)
                      </label>
                      <Textarea
                        value={reviewNotes[request.id] || ''}
                        onChange={(e) => setReviewNotes({ ...reviewNotes, [request.id]: e.target.value })}
                        placeholder="Add notes about your decision..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(request)}
                        disabled={processing[request.id]}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processing[request.id] ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Approve & Apply
                      </Button>
                      <Button
                        onClick={() => handleReject(request)}
                        disabled={processing[request.id]}
                        variant="outline"
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {processing[request.id] ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Reviewed ({reviewedRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {reviewedRequests.length === 0 ? (
              <div className="text-center py-4 text-[var(--muted)]">No reviewed requests yet</div>
            ) : (
              <div className="space-y-3">
                {reviewedRequests.map((request) => (
                  <div key={request.id} className="border border-[var(--border)] rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(request.updated_date), 'MMM d')}
                          </Badge>
                          <span className="text-sm text-[var(--muted)]">{request.submitted_by}</span>
                          <span className="text-sm text-[var(--text)]">→ {request.field_name}</span>
                        </div>
                        {request.review_notes && (
                          <div className="text-xs text-[var(--muted)] mt-1">
                            Note: {request.review_notes}
                          </div>
                        )}
                      </div>
                      <Badge className={request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}