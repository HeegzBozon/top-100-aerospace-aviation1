import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, AlertCircle } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function ArticleEditor({ article, onClose, onSuccess }) {
  const [editSummary, setEditSummary] = useState('');
  const [changeType, setChangeType] = useState('minor_edit');
  const [proposedContent, setProposedContent] = useState(article?.content || '');
  const [proposedTitle, setProposedTitle] = useState(article?.title || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!editSummary.trim()) {
      toast.error('Please provide an edit summary');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.ArticleEditRequest.create({
        article_id: article.id,
        editor_email: user.email,
        editor_name: user.full_name,
        proposed_content: proposedContent,
        proposed_title: proposedTitle !== article.title ? proposedTitle : undefined,
        edit_summary: editSummary,
        change_type: changeType,
        status: 'pending'
      });

      toast.success('Edit submitted for review!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to submit edit: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-5xl my-8" style={{ background: brandColors.cream }}>
        <CardHeader className="border-b" style={{ borderColor: `${brandColors.navyDeep}20` }}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
              <Edit className="w-6 h-6" />
              Edit Article
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Alert Box */}
          <div className="flex gap-3 p-4 rounded-lg" style={{ background: `${brandColors.skyBlue}10`, border: `1px solid ${brandColors.skyBlue}40` }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: brandColors.skyBlue }} />
            <div>
              <p className="font-semibold mb-1" style={{ color: brandColors.navyDeep }}>
                Community Review Process
              </p>
              <p className="text-sm" style={{ color: `${brandColors.navyDeep}80` }}>
                Your edits will be reviewed by moderators before publication. Please provide clear edit summaries and cite sources when possible.
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: brandColors.navyDeep }}>
              Article Title
            </label>
            <Input
              value={proposedTitle}
              onChange={(e) => setProposedTitle(e.target.value)}
              placeholder="Article title..."
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: brandColors.navyDeep }}>
              Content
            </label>
            <div style={{ background: 'white', borderRadius: '8px' }}>
              <ReactQuill
                value={proposedContent}
                onChange={setProposedContent}
                modules={{
                  toolbar: [
                    [{ header: [2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'blockquote', 'code-block'],
                    ['clean']
                  ]
                }}
                style={{ minHeight: '300px' }}
              />
            </div>
          </div>

          {/* Edit Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: brandColors.navyDeep }}>
                Change Type
              </label>
              <Select value={changeType} onValueChange={setChangeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor_edit">Minor Edit (typos, formatting)</SelectItem>
                  <SelectItem value="major_edit">Major Edit (content changes)</SelectItem>
                  <SelectItem value="new_section">New Section</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Edit Summary */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: brandColors.navyDeep }}>
              Edit Summary <Badge style={{ background: brandColors.goldPrestige }}>Required</Badge>
            </label>
            <Input
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              placeholder="Briefly describe your changes (e.g., 'Fixed typos in voting section', 'Updated V3.0 information')..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: `${brandColors.navyDeep}20` }}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !editSummary.trim()}
              style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}