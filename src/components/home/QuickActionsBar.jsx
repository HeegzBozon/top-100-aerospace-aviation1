import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Users, Vote, Video, Mic, Type, Upload, X, Play, Pause, Check, BookOpen, Heart, Calendar, HelpCircle } from 'lucide-react';
import { VotingModal } from '@/components/epics/06-nomination-engine/voting';
import { NominationModal } from '@/components/epics/06-nomination-engine/nominations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function QuickActionsBar({ user }) {
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showNominationModal, setShowNominationModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [mode, setMode] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const startRecording = async (type) => {
    try {
      const constraints = type === 'audio' 
        ? { audio: true } 
        : { audio: true, video: { facingMode: 'user', width: 1280, height: 720 } };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Show live preview for video
      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: type === 'audio' ? 'audio/webm' : 'video/webm' });
        setMediaBlob(blob);
        
        // Create preview URL for playback
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        
        // Stop live preview
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Recording Error', description: 'Could not access media devices.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      
      // Use Google Drive for videos, Core.UploadFile for audio
      if (file.type.startsWith('video/')) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        
        const { data } = await base44.functions.invoke('uploadToGoogleDrive', formData);
        setMediaBlob({ url: data.file_url, type: file.type });
      } else {
        const response = await base44.integrations.Core.UploadFile({ file });
        const fileUrl = response.file_url || response.data?.file_url;
        setMediaBlob({ url: fileUrl, type: file.type });
      }
      
      toast({ title: 'Upload Successful', description: 'Your file has been uploaded.' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload file.' });
    } finally {
      setUploading(false);
    }
  };

  const handleTestimonialSubmit = async () => {
    try {
      setUploading(true);
      let mediaUrl = null;
      
      if (mediaBlob && !mediaBlob.url) {
        const fileName = `testimonial-${Date.now()}.${mode === 'audio' ? 'webm' : 'webm'}`;
        const file = new File([mediaBlob], fileName, { 
          type: mode === 'audio' ? 'audio/webm' : 'video/webm' 
        });
        
        // Use Google Drive for videos, Core.UploadFile for audio
        if (mode === 'video') {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileName', fileName);
          
          const { data } = await base44.functions.invoke('uploadToGoogleDrive', formData);
          mediaUrl = data.file_url;
        } else {
          const response = await base44.integrations.Core.UploadFile({ file });
          mediaUrl = response.file_url || response.data?.file_url;
        }
      } else if (mediaBlob?.url) {
        mediaUrl = mediaBlob.url;
      }

      await base44.entities.Testimonial.create({
        user_email: user.email,
        user_name: user.full_name,
        content_type: mode === 'text' ? 'text' : mode === 'audio' ? 'audio' : 'video',
        text_content: mode === 'text' ? textContent : null,
        media_url: mediaUrl,
      });

      toast({ title: 'Testimonial Submitted!', description: 'Thank you for sharing your experience.' });
      resetTestimonialForm();
      setShowTestimonialModal(false);
    } catch (error) {
      console.error('Testimonial submission error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Submission Failed', 
        description: error?.message || 'Could not submit testimonial.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const resetTestimonialForm = () => {
    setMode('text');
    setTextContent('');
    setMediaBlob(null);
    setIsRecording(false);
    setPreviewUrl(null);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  const votingDisabled = true; // Season 4 is in nominations period - voting not yet open
  const nominationsOpen = true; // Season 4 nominations are open

  const primaryActions = [
    { icon: Users, label: 'Nominate', color: 'from-blue-500 to-cyan-500', onClick: () => setShowNominationModal(true), disabled: !nominationsOpen },
    { icon: Vote, label: 'Vote Now', color: 'from-amber-500 to-yellow-500', onClick: () => setShowVotingModal(true), disabled: votingDisabled },
    { icon: BookOpen, label: 'Share Story', color: 'from-purple-500 to-indigo-500', onClick: () => setShowTestimonialModal(true), disabled: false },
  ];

  const quickLinks = [
    { icon: Heart, label: 'Favorites', href: createPageUrl('MyFavorites') },
    { icon: HelpCircle, label: 'Help Center', href: createPageUrl('HelpCenter') },
  ];

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
        <CardContent className="p-4">
          {/* Primary Actions Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {primaryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    onClick={action.disabled ? undefined : action.onClick}
                    className={`group bg-slate-50 rounded-xl p-3 border transition-all text-center relative overflow-hidden ${action.disabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md cursor-pointer hover:bg-slate-100'}`}
                    style={{ borderColor: `${brandColors.navyDeep}10` }}
                  >
                    {action.disabled && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-xl">
                        <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-full">
                          {action.label === 'Vote Now' ? 'COMING SOON' : 'CONCLUDED'}
                        </span>
                      </div>
                    )}
                    <div 
                      className={`w-10 h-10 mx-auto mb-1.5 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center ${!action.disabled ? 'group-hover:scale-110' : ''} transition-transform`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span 
                      className="text-[11px] font-semibold block leading-tight"
                      style={{ color: brandColors.navyDeep }}
                    >
                      {action.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Links Row */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={link.label} to={link.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${brandColors.goldPrestige}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                    </div>
                    <span 
                      className="text-[10px] font-medium"
                      style={{ color: brandColors.navyDeep }}
                    >
                      {link.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <VotingModal 
        isOpen={showVotingModal} 
        onClose={() => setShowVotingModal(false)} 
      />

      <NominationModal 
        isOpen={showNominationModal} 
        onClose={() => setShowNominationModal(false)} 
      />

      <Dialog open={showTestimonialModal} onOpenChange={(open) => { setShowTestimonialModal(open); if (!open) resetTestimonialForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
              <Video className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              Testimonials Creation Studio
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={mode === 'text' ? 'default' : 'outline'}
                onClick={() => { resetTestimonialForm(); setMode('text'); }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Type className="w-5 h-5" />
                <span className="text-xs">Text</span>
              </Button>
              <Button
                variant={mode === 'audio' ? 'default' : 'outline'}
                onClick={() => { resetTestimonialForm(); setMode('audio'); }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Mic className="w-5 h-5" />
                <span className="text-xs">Audio</span>
              </Button>
              <Button
                variant={mode === 'video' ? 'default' : 'outline'}
                onClick={() => { resetTestimonialForm(); setMode('video'); }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Video className="w-5 h-5" />
                <span className="text-xs">Video</span>
              </Button>
              <Button
                variant={mode === 'upload' ? 'default' : 'outline'}
                onClick={() => { resetTestimonialForm(); setMode('upload'); }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs">Upload</span>
              </Button>
            </div>

            {/* Content Area */}
            <div className="min-h-[200px] p-4 border rounded-lg" style={{ borderColor: brandColors.navyDeep + '20' }}>
              {mode === 'text' && (
                <Textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Share your experience with TOP 100 Aerospace & Aviation..."
                  className="min-h-[180px] resize-none"
                />
              )}

              {(mode === 'audio' || mode === 'video') && (
                <div className="space-y-4">
                  {mode === 'video' && (
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <video
                        ref={videoPreviewRef}
                        autoPlay
                        muted
                        playsInline
                        src={previewUrl}
                        className="w-full h-full object-cover"
                      />
                      {!isRecording && !mediaBlob && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                          <Video className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-center space-y-3">
                    {!mediaBlob ? (
                      <>
                        {!isRecording && (
                          <p className="text-sm text-gray-600">
                            {mode === 'audio' ? 'Record your testimonial audio' : 'Record your video testimonial'}
                          </p>
                        )}
                        {!isRecording ? (
                          <Button
                            onClick={() => startRecording(mode)}
                            style={{ background: brandColors.goldPrestige, color: 'white' }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Recording
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-red-600">
                              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                              <span className="text-sm font-semibold">Recording...</span>
                            </div>
                            <Button
                              onClick={stopRecording}
                              variant="destructive"
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Stop Recording
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Check className="w-12 h-12 mx-auto text-green-600" />
                        <p className="text-sm font-semibold">Recording Complete - Review Above</p>
                        <Button
                          variant="outline"
                          onClick={() => { setMediaBlob(null); setPreviewUrl(null); }}
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Re-record
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mode === 'upload' && (
                <div className="text-center space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">Upload audio or video file</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ background: brandColors.goldPrestige, color: 'white' }}
                  >
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                  {mediaBlob?.url && (
                    <p className="text-xs text-green-600">✓ File uploaded successfully</p>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => { resetTestimonialForm(); setShowTestimonialModal(false); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTestimonialSubmit}
                disabled={uploading || (mode === 'text' && !textContent.trim()) || ((mode === 'audio' || mode === 'video' || mode === 'upload') && !mediaBlob)}
                className="flex-1"
                style={{ background: brandColors.goldPrestige, color: 'white' }}
              >
                {uploading ? 'Submitting...' : 'Submit Testimonial'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}