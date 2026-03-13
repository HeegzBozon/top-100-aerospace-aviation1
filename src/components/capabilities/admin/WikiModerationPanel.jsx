import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Eye, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

export default function WikiModerationPanel() {
  const [reviewNotes, setReviewNotes] = useState({});
  const [processing, setProcessing] = useState({});

  const { data: pendingEdits = [], refetch } = useQuery({
    queryKey: ['pending-edits'],
    queryFn: () => base44.entities.ArticleEditRequest.filter({ status: 'pending' }, '-created_date'),
  });

  const { data: recentEdits = [] } = useQuery({
    queryKey: ['recent-edits'],
    queryFn: () => base44.entities.ArticleEditRequest.filter({ 
      status: { $in: ['approved', 'rejected'] } 
    }, '-updated_date', 20),
  });

  const handleApprove = async (editRequest) => {
    setProcessing(prev => ({ ...prev, [editRequest.id]: true }));
    try {
      const user = await base44.auth.me();
      
      // Get current article to get revision number
      const article = await base44.entities.KBArticle.filter({ id: editRequest.article_id });
      const currentArticle = article[0];
      
      // Create revision of current state before updating
      const existingRevisions = await base44.entities.ArticleRevision.filter({ article_id: editRequest.article_id });
      const nextRevisionNumber = (existingRevisions[0]?.revision_number || 0) + 1;
      
      // Mark all previous revisions as not current
      for (const rev of existingRevisions) {
        await base44.entities.ArticleRevision.update(rev.id, { is_current: false });
      }
      
      // Create new revision
      await base44.entities.ArticleRevision.create({
        article_id: editRequest.article_id,
        revision_number: nextRevisionNumber,
        content: editRequest.proposed_content,
        title: editRequest.proposed_title || currentArticle.title,
        editor_email: editRequest.editor_email,
        editor_name: editRequest.editor_name,
        edit_summary: editRequest.edit_summary,
        change_type: editRequest.change_type,
        is_current: true
      });
      
      // Update the article
      const updateData = { content: editRequest.proposed_content };
      if (editRequest.proposed_title) {
        updateData.title = editRequest.proposed_title;
      }
      await base44.entities.KBArticle.update(editRequest.article_id, updateData);
      
      // Mark edit request as approved
      await base44.entities.ArticleEditRequest.update(editRequest.id, {
        status: 'approved',
        reviewed_by: user.email,
        review_notes: reviewNotes[editRequest.id] || ''
      });
      
      toast.success('Edit approved and published!');
      refetch();
    } catch (error) {
      toast.error('Failed to approve edit: ' + error.message);
    } finally {
      setProcessing(prev => ({ ...prev, [editRequest.id]: false }));
    }
  };

  const handleReject = async (editRequest) => {
    setProcessing(prev => ({ ...prev, [editRequest.id]: true }));
    try {
      const user = await base44.auth.me();
      
      await base44.entities.ArticleEditRequest.update(editRequest.id, {
        status: 'rejected',
        reviewed_by: user.email,
        review_notes: reviewNotes[editRequest.id] || 'No reason provided'
      });
      
      toast.success('Edit rejected');
      refetch();
    } catch (error) {
      toast.error('Failed to reject edit');
    } finally {
      setProcessing(prev => ({ ...prev, [editRequest.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle style={{ color: brandColors.navyDeep }}>
            Pending Edits ({pendingEdits.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingEdits.length === 0 ? (
            <p className="text-center py-8" style={{ color: `${brandColors.navyDeep}60` }}>
              No pending edits
            </p>
          ) : (
            pendingEdits.map(edit => (
              <Card key={edit.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                      style={{ background: `${brandColors.navyDeep}10` }}>
                      <User className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold" style={{ color: brandColors.navyDeep }}>
                          {edit.editor_name}
                        </span>
                        <Badge style={{ background: brandColors.skyBlue, color: 'white', fontSize: '10px' }}>
                          {edit.change_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
                          {formatDistanceToNow(new Date(edit.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1" style={{ color: brandColors.navyDeep }}>
                        Edit Summary: {edit.edit_summary}
                      </p>
                      {edit.proposed_title && (
                        <p className="text-sm mb-2" style={{ color: `${brandColors.navyDeep}80` }}>
                          New title: "{edit.proposed_title}"
                        </p>
                      )}
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer" style={{ color: brandColors.goldPrestige }}>
                          View proposed changes
                        </summary>
                        <div className="mt-2 p-3 rounded" style={{ background: `${brandColors.cream}` }}>
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: edit.proposed_content }}
                          />
                        </div>
                      </details>
                      
                      <div className="mt-3 space-y-2">
                        <Input
                          placeholder="Review notes (optional)..."
                          value={reviewNotes[edit.id] || ''}
                          onChange={(e) => setReviewNotes(prev => ({ ...prev, [edit.id]: e.target.value }))}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(edit)}
                            disabled={processing[edit.id]}
                            style={{ background: '#10b981', color: 'white' }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(edit)}
                            disabled={processing[edit.id]}
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Edits History */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: brandColors.navyDeep }}>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentEdits.map(edit => (
            <div key={edit.id} className="flex items-center justify-between p-3 rounded" 
              style={{ background: `${brandColors.cream}` }}>
              <div className="flex items-center gap-3">
                <Badge style={{ 
                  background: edit.status === 'approved' ? '#10b981' : '#ef4444',
                  color: 'white'
                }}>
                  {edit.status}
                </Badge>
                <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
                  {edit.edit_summary}
                </span>
                <span className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
                  by {edit.editor_name}
                </span>
              </div>
              <span className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
                {formatDistanceToNow(new Date(edit.updated_date), { addSuffix: true })}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}