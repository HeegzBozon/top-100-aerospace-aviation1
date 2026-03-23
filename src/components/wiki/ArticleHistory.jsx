import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, User, Calendar, FileText, RotateCcw, Eye } from 'lucide-react';
import { format } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function ArticleHistory({ articleId, onClose }) {
  const { data: revisions = [], isLoading } = useQuery({
    queryKey: ['article-revisions', articleId],
    queryFn: () => base44.entities.ArticleRevision.filter({ article_id: articleId }, '-created_date'),
  });

  const changeTypeColors = {
    minor_edit: brandColors.skyBlue,
    major_edit: brandColors.goldPrestige,
    revert: '#ef4444',
    new_section: '#10b981'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8" style={{ background: brandColors.cream }}>
        <CardHeader className="border-b" style={{ borderColor: `${brandColors.navyDeep}20` }}>
          <CardTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <History className="w-6 h-6" />
            Revision History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto" 
                style={{ borderColor: `${brandColors.goldPrestige}40`, borderTopColor: brandColors.goldPrestige }} />
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: `${brandColors.navyDeep}40` }} />
              <p style={{ color: brandColors.navyDeep }}>No revision history yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {revisions.map((rev, idx) => (
                <div key={rev.id} className="flex gap-4 p-4 rounded-lg border" 
                  style={{ 
                    background: rev.is_current ? `${brandColors.goldPrestige}10` : 'white',
                    borderColor: rev.is_current ? brandColors.goldPrestige : `${brandColors.navyDeep}20`
                  }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                      style={{ background: `${brandColors.navyDeep}10` }}>
                      <User className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold" style={{ color: brandColors.navyDeep }}>
                        {rev.editor_name}
                      </span>
                      <Badge style={{ background: changeTypeColors[rev.change_type], color: 'white', fontSize: '10px' }}>
                        {rev.change_type.replace('_', ' ')}
                      </Badge>
                      {rev.is_current && (
                        <Badge style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}>
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mb-2" style={{ color: `${brandColors.navyDeep}90` }}>
                      {rev.edit_summary || 'No summary provided'}
                    </p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(rev.created_date), 'MMM d, yyyy HH:mm')}
                      </span>
                      <span>Rev #{rev.revision_number || (revisions.length - idx)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {!rev.is_current && (
                      <Button size="sm" variant="outline">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Revert
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}