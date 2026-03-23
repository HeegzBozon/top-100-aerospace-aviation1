import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Edit3, CheckCircle2 } from 'lucide-react';

const editableFields = [
  { value: 'bio', label: 'Biography', type: 'textarea' },
  { value: 'achievements', label: 'Achievements', type: 'textarea' },
  { value: 'title', label: 'Job Title', type: 'text' },
  { value: 'company', label: 'Company', type: 'text' },
  { value: 'linkedin_profile_url', label: 'LinkedIn URL', type: 'url' },
  { value: 'website_url', label: 'Website', type: 'url' },
  { value: 'instagram_url', label: 'Instagram', type: 'url' },
];

export default function EditSuggestionModal({ open, onClose, nominee, user }) {
  const [fieldName, setFieldName] = useState('');
  const [proposedValue, setProposedValue] = useState('');
  const [reason, setReason] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedField = editableFields.find(f => f.value === fieldName);
  const currentValue = nominee?.[fieldName] || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fieldName || !proposedValue || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.ProfileEditRequest.create({
        nominee_id: nominee.id,
        field_name: fieldName,
        current_value: currentValue,
        proposed_value: proposedValue,
        reason,
        source_url: sourceUrl,
        submitted_by: user.email,
        status: 'pending'
      });

      // Award Stardust for contribution
      await base44.functions.invoke('awardStardust', {
        user_email: user.email,
        action_type: 'profile_edit_suggestion'
      });

      setSubmitted(true);
      toast.success('Edit suggestion submitted! +5 Stardust earned');
      
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFieldName('');
        setProposedValue('');
        setReason('');
        setSourceUrl('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting edit:', error);
      toast.error('Failed to submit suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Suggestion Submitted!</h3>
            <p className="text-sm text-[var(--muted)]">
              Your edit will be reviewed by admins and the nominee.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Suggest Profile Edit
          </DialogTitle>
          <DialogDescription>
            Help improve {nominee?.name}'s profile with accurate, verifiable information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label>Field to Edit</Label>
            <Select value={fieldName} onValueChange={setFieldName}>
              <SelectTrigger>
                <SelectValue placeholder="Select a field..." />
              </SelectTrigger>
              <SelectContent>
                {editableFields.map(field => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {fieldName && (
            <>
              <div>
                <Label>Current Value</Label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border">
                  {currentValue || <span className="italic">Empty</span>}
                </div>
              </div>

              <div>
                <Label>Proposed Value *</Label>
                {selectedField?.type === 'textarea' ? (
                  <Textarea
                    value={proposedValue}
                    onChange={(e) => setProposedValue(e.target.value)}
                    placeholder="Enter the corrected or updated information..."
                    rows={4}
                    required
                  />
                ) : (
                  <Input
                    type={selectedField?.type || 'text'}
                    value={proposedValue}
                    onChange={(e) => setProposedValue(e.target.value)}
                    placeholder="Enter the corrected or updated information..."
                    required
                  />
                )}
              </div>

              <div>
                <Label>Reason for Edit *</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this edit is needed (e.g., outdated info, typo, missing achievement)..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label>Source / Evidence (Optional)</Label>
                <Input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://... (LinkedIn, company website, press release, etc.)"
                />
                <p className="text-xs text-[var(--muted)] mt-1">
                  Providing a source increases approval likelihood
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !fieldName}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Suggestion
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}