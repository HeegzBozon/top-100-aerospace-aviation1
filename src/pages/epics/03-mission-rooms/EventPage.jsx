import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, MapPin, Users, Camera, Share2, MessageCircle, 
  ChevronLeft, Loader2, Award, Globe, Zap, Heart, Send,
  Image as ImageIcon, X, Check, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  green: '#2ED573',
};

function PhotoUploadModal({ open, onClose, onUpload, isUploading }) {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, caption);
      setCaption('');
      setSelectedFile(null);
      setPreview(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            Share a Photo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => { setSelectedFile(null); setPreview(null); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition-colors"
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <p className="text-sm text-slate-600">Click or tap to select a photo</p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <Input
            placeholder="Add a caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1"
              style={{ backgroundColor: brandColors.goldPrestige }}
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload Photo
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PhotoGrid({ photos, onPhotoClick }) {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No photos yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <AnimatePresence>
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => onPhotoClick(photo)}
          >
            <img
              src={photo.image_url}
              alt={photo.caption || 'Event photo'}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
              <div className="p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {photo.uploader_name || 'Anonymous'}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function PhotoLightbox({ photo, open, onClose, comments, onAddComment }) {
  const [comment, setComment] = useState('');

  if (!photo) return null;

  const handleSubmitComment = () => {
    if (comment.trim()) {
      onAddComment(comment, photo.id);
      setComment('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col md:flex-row h-full">
          <div className="flex-1 bg-black flex items-center justify-center">
            <img
              src={photo.image_url}
              alt={photo.caption || 'Event photo'}
              className="max-w-full max-h-[60vh] md:max-h-[80vh] object-contain"
            />
          </div>
          <div className="w-full md:w-80 p-4 flex flex-col max-h-[30vh] md:max-h-none">
            <div className="mb-4">
              <p className="font-medium" style={{ color: brandColors.navyDeep }}>{photo.uploader_name || 'Anonymous'}</p>
              {photo.caption && <p className="text-sm text-slate-600 mt-1">{photo.caption}</p>}
              <p className="text-xs text-slate-400 mt-1">{format(new Date(photo.created_date), 'MMM d, h:mma')}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 border-t pt-3">
              {comments.map(c => (
                <div key={c.id} className="text-sm">
                  <span className="font-medium">{c.author_name}</span>{' '}
                  <span className="text-slate-600">{c.content}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSubmitComment} style={{ backgroundColor: brandColors.skyBlue }}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CommentSection({ eventId, comments, onAddComment }) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onAddComment(comment);
      setComment('');
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
          <MessageCircle className="w-5 h-5" />
          Comments
        </h3>
        
        <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-500">No comments yet. Start the conversation!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium shrink-0">
                  {(c.author_name || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{c.author_name || 'Anonymous'}</span>
                    <span className="text-xs text-slate-400">{format(new Date(c.created_date), 'MMM d, h:mma')}</span>
                  </div>
                  <p className="text-sm text-slate-600">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1"
          />
          <Button onClick={handleSubmit} style={{ backgroundColor: brandColors.skyBlue }}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventPage() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasRSVPd, setHasRSVPd] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => base44.entities.Event.filter({ id: eventId }),
    enabled: !!eventId,
    select: (data) => data[0],
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['event-photos', eventId],
    queryFn: () => base44.entities.Photo.filter({ event_id: eventId, status: 'approved' }, '-created_date'),
    enabled: !!eventId,
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['event-comments', eventId],
    queryFn: () => base44.entities.EventComment.filter({ event_id: eventId }, '-created_date'),
    enabled: !!eventId,
  });

  const eventComments = allComments.filter(c => !c.photo_id);
  const photoComments = selectedPhoto ? allComments.filter(c => c.photo_id === selectedPhoto.id) : [];

  useEffect(() => {
    if (event && user) {
      setHasRSVPd(event.attendees?.includes(user.email));
    }
  }, [event, user]);

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, caption }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Photo.create({
        image_url: file_url,
        caption,
        event_id: eventId,
        uploader_email: user?.email || 'anonymous',
        uploader_name: user?.full_name || 'Guest',
        status: 'approved', // Auto-approve for party mode
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-photos', eventId]);
      toast.success('Photo shared!');
      setUploadModalOpen(false);
    },
    onError: () => toast.error('Failed to upload photo'),
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      const currentAttendees = event.attendees || [];
      const newAttendees = hasRSVPd
        ? currentAttendees.filter(e => e !== user.email)
        : [...currentAttendees, user.email];
      
      return base44.entities.Event.update(eventId, {
        attendees: newAttendees,
        rsvp_count: newAttendees.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event', eventId]);
      toast.success(hasRSVPd ? 'RSVP cancelled' : "You're going!");
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ content, photoId }) => base44.entities.EventComment.create({
      event_id: eventId,
      content,
      photo_id: photoId || null,
      author_email: user?.email || 'anonymous',
      author_name: user?.full_name || 'Guest',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-comments', eventId]);
    },
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Calendar className="w-16 h-16 mb-4 text-slate-300" />
        <h1 className="text-2xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>Event Not Found</h1>
        <p className="text-slate-500 mb-4">This event may have been removed or doesn't exist.</p>
        <Link to={createPageUrl('Calendar')}>
          <Button>Browse Events</Button>
        </Link>
      </div>
    );
  }

  const eventDate = parseISO(event.event_date);

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.cream }}>
      {/* Cover Image / Hero */}
      <div 
        className="relative h-32 md:h-40 bg-gradient-to-br from-slate-700 to-slate-900"
        style={event.cover_image_url ? { backgroundImage: `url(${event.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-4 left-4">
          <Link to={createPageUrl('Calendar')}>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
        </div>
        
        {/* Event Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {event.is_official && (
            <Badge className="gap-1" style={{ backgroundColor: brandColors.goldPrestige }}>
              <Award className="w-3 h-3" /> Official
            </Badge>
          )}
          {event.is_public && (
            <Badge className="gap-1 bg-green-500">
              <Globe className="w-3 h-3" /> Public
            </Badge>
          )}
          {event.party_mode && (
            <Badge className="gap-1 bg-pink-500 animate-pulse">
              <Zap className="w-3 h-3" /> Party Mode
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Event Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
                  {event.title}
                </h1>
                
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(eventDate, 'EEEE, MMMM d, yyyy · h:mm a')}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {event.rsvp_count || event.attendees?.length || 0} people going
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {user && (
                  <Button
                    onClick={() => rsvpMutation.mutate()}
                    disabled={rsvpMutation.isPending}
                    variant={hasRSVPd ? 'outline' : 'default'}
                    style={!hasRSVPd ? { backgroundColor: brandColors.green } : {}}
                  >
                    {hasRSVPd ? (
                      <><Check className="w-4 h-4 mr-2" /> Going</>
                    ) : (
                      <><Heart className="w-4 h-4 mr-2" /> Are you going?</>
                    )}
                  </Button>
                )}
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </div>

            {event.description && (
              <p className="mt-4 text-slate-600 border-t pt-4">{event.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Photo Stream Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                <Camera className="w-5 h-5" />
                Photo Stream
                {photos.length > 0 && <span className="text-sm font-normal text-slate-500">({photos.length})</span>}
              </h3>
              <Button 
                size="sm" 
                onClick={() => setUploadModalOpen(true)}
                style={{ backgroundColor: brandColors.goldPrestige }}
              >
                <Camera className="w-4 h-4 mr-2" /> Add Photo
              </Button>
            </div>
            
            <PhotoGrid photos={photos} onPhotoClick={setSelectedPhoto} />
          </CardContent>
        </Card>

        {/* Comments Section */}
        <CommentSection
          eventId={eventId}
          comments={eventComments}
          onAddComment={(content) => addCommentMutation.mutate({ content })}
        />
      </div>

      {/* Modals */}
      <PhotoUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={(file, caption) => uploadPhotoMutation.mutate({ file, caption })}
        isUploading={uploadPhotoMutation.isPending}
      />

      <PhotoLightbox
        photo={selectedPhoto}
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        comments={photoComments}
        onAddComment={(content, photoId) => addCommentMutation.mutate({ content, photoId })}
      />
    </div>
  );
}