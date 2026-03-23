import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EditSuggestionModal from './EditSuggestionModal';
import TagManager from './TagManager';
import { Edit3, AlertCircle, Clock } from 'lucide-react';

export default function CommunityNotesPanel({ nominee, user, isAdmin }) {
  const [pendingEdits, setPendingEdits] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadPendingEdits();
  }, [nominee?.id]);

  const loadPendingEdits = async () => {
    if (!nominee?.id) return;
    try {
      const edits = await base44.entities.ProfileEditRequest.filter({
        nominee_id: nominee.id,
        status: 'pending'
      }, '-created_date', 5);
      setPendingEdits(edits);
    } catch (error) {
      console.error('Error loading pending edits:', error);
    }
  };

  if (!nominee) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Community Contributions
            </span>
            {user && (
              <Button size="sm" onClick={() => setShowEditModal(true)}>
                Suggest Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending Edits Alert */}
          {pendingEdits.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">
                  {pendingEdits.length} edit suggestion{pendingEdits.length > 1 ? 's' : ''} pending review
                </span>
              </div>
              {isAdmin && (
                <p className="text-xs text-yellow-700 mt-1">
                  Go to Admin → Community Notes to review
                </p>
              )}
            </div>
          )}

          {/* Tags Section */}
          <TagManager nomineeId={nominee.id} user={user} isAdmin={isAdmin} />

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Wikipedia-style collaboration</p>
                <p>
                  Help improve this profile with accurate, verifiable information. 
                  All contributions are reviewed and earn you Stardust.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showEditModal && (
        <EditSuggestionModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          nominee={nominee}
          user={user}
        />
      )}
    </div>
  );
}