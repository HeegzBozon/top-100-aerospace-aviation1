import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, MessageSquare, Loader2 } from 'lucide-react';

export default function TestimonialModeration() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Testimonial.list('-created_date', 100);
        setTestimonials(data);
      } catch (err) {
        console.error('Error loading testimonials:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (id) => {
    await base44.entities.Testimonial.update(id, { status: 'approved' });
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
  };

  const handleReject = async (id) => {
    await base44.entities.Testimonial.update(id, { status: 'rejected' });
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const pending = testimonials.filter(t => !t.status || t.status === 'pending');
  const approved = testimonials.filter(t => t.status === 'approved');
  const rejected = testimonials.filter(t => t.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Testimonial Moderation</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve community testimonials. {pending.length} pending review.
        </p>
      </div>

      <div className="flex gap-3">
        <Badge variant="outline">{pending.length} Pending</Badge>
        <Badge className="bg-green-100 text-green-800 border-green-200">{approved.length} Approved</Badge>
        <Badge className="bg-red-100 text-red-800 border-red-200">{rejected.length} Rejected</Badge>
      </div>

      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No testimonials to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {testimonials.map(t => (
            <Card key={t.id} className="border-l-4" style={{
              borderLeftColor: t.status === 'approved' ? '#10b981' : t.status === 'rejected' ? '#ef4444' : '#f59e0b'
            }}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{t.author_name || t.created_by || 'Anonymous'}</span>
                      <Badge variant="outline" className="text-xs capitalize">{t.status || 'pending'}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{t.content || t.text || t.message || '(No content)'}</p>
                    {t.created_date && (
                      <p className="text-xs text-gray-400 mt-2">{new Date(t.created_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  {(!t.status || t.status === 'pending') && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleApprove(t.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleReject(t.id)}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}