import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Check, X, Star, Video, Mic, FileText, Loader2 } from 'lucide-react';

export default function TestimonialModeration() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Testimonial.list('-created_date', 500);
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      toast({
        variant: 'destructive',
        title: 'Loading Failed',
        description: 'Could not load testimonials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setProcessing(id);
      await base44.entities.Testimonial.update(id, { status });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      toast({
        title: 'Status Updated',
        description: `Testimonial ${status}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update testimonial status.',
      });
    } finally {
      setProcessing(null);
    }
  };

  const toggleFeatured = async (id, currentFeatured) => {
    try {
      setProcessing(id);
      await base44.entities.Testimonial.update(id, { featured: !currentFeatured });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, featured: !currentFeatured } : t));
      toast({
        title: currentFeatured ? 'Removed from Featured' : 'Featured!',
        description: currentFeatured ? 'Testimonial is no longer featured.' : 'Testimonial is now featured.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update featured status.',
      });
    } finally {
      setProcessing(null);
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'approved') return t.status === 'approved';
    if (filter === 'featured') return t.featured;
    return true;
  });

  const statusCounts = {
    all: testimonials.length,
    pending: testimonials.filter(t => t.status === 'pending').length,
    approved: testimonials.filter(t => t.status === 'approved').length,
    featured: testimonials.filter(t => t.featured).length,
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Testimonial Moderation</h2>
        <p className="text-[var(--muted)]">Review and manage user testimonials</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'Pending Review' },
          { id: 'approved', label: 'Approved' },
          { id: 'featured', label: 'Featured' },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={filter === tab.id ? 'default' : 'outline'}
            onClick={() => setFilter(tab.id)}
            className="gap-2"
          >
            {tab.label}
            <Badge variant="secondary" className="ml-1">
              {statusCounts[tab.id]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTestimonials.length > 0 ? (
          filteredTestimonials.map(testimonial => (
            <Card key={testimonial.id} className="bg-white border border-[var(--border)]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getContentIcon(testimonial.content_type)}
                      <CardTitle className="text-lg">{testimonial.user_name || 'Anonymous'}</CardTitle>
                      {testimonial.featured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-[var(--muted)]">{testimonial.user_email}</div>
                    <Badge
                      variant={
                        testimonial.status === 'approved' ? 'default' :
                        testimonial.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className="mt-2"
                    >
                      {testimonial.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Preview */}
                {testimonial.content_type === 'text' && testimonial.text_content && (
                  <div className="p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{testimonial.text_content}</p>
                  </div>
                )}

                {testimonial.content_type === 'audio' && testimonial.media_url && (
                  <audio controls className="w-full">
                    <source src={testimonial.media_url} type="audio/webm" />
                    <source src={testimonial.media_url} type="audio/mp4" />
                    Your browser does not support the audio element.
                  </audio>
                )}

                {testimonial.content_type === 'video' && testimonial.media_url && (
                  <video controls className="w-full rounded-lg" style={{ maxHeight: '300px' }}>
                    <source src={testimonial.media_url} type="video/webm" />
                    <source src={testimonial.media_url} type="video/mp4" />
                    Your browser does not support the video element.
                  </video>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {testimonial.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateStatus(testimonial.id, 'approved')}
                        disabled={processing === testimonial.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateStatus(testimonial.id, 'rejected')}
                        disabled={processing === testimonial.id}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}

                  {testimonial.status === 'approved' && (
                    <Button
                      variant={testimonial.featured ? 'outline' : 'default'}
                      onClick={() => toggleFeatured(testimonial.id, testimonial.featured)}
                      disabled={processing === testimonial.id}
                      className="w-full"
                    >
                      {processing === testimonial.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Star className={`w-4 h-4 mr-2 ${testimonial.featured ? 'fill-current' : ''}`} />
                          {testimonial.featured ? 'Unfeature' : 'Feature'}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
                  Submitted: {new Date(testimonial.created_date).toLocaleDateString()} at {new Date(testimonial.created_date).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <FileText className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
            <p className="text-[var(--muted)]">No testimonials found</p>
          </div>
        )}
      </div>
    </div>
  );
}