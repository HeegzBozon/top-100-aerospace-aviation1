import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, Mic, Type, Upload, X, Play, Pause, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function TestimonialsModule({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('text'); // text, audio, video, upload
  const [textContent, setTextContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const startRecording = async (type) => {
    try {
      const constraints = type === 'audio' 
        ? { audio: true } 
        : { audio: true, video: { facingMode: 'user' } };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: type === 'audio' ? 'audio/webm' : 'video/webm' });
        setMediaBlob(blob);
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

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      const { data } = await base44.integrations.Core.UploadFile({ file });
      setMediaBlob({ url: data.file_url, type: file.type });
      toast({ title: 'Upload Successful', description: 'Your file has been uploaded.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload file.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      let mediaUrl = null;
      
      if (mediaBlob && !mediaBlob.url) {
        const file = new File([mediaBlob], `testimonial-${Date.now()}.${mode === 'audio' ? 'webm' : 'mp4'}`, { type: mediaBlob.type });
        const { data } = await base44.integrations.Core.UploadFile({ file });
        mediaUrl = data.file_url;
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
      resetForm();
      setIsOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit testimonial.' });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setMode('text');
    setTextContent('');
    setMediaBlob(null);
    setIsRecording(false);
  };

  return (
    <>
      <Card className="bg-white/60 backdrop-blur-sm border-[var(--border)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Video className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            Share Your Story
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full font-semibold"
            style={{ background: brandColors.goldPrestige, color: 'white' }}
          >
            Create Testimonial
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                onClick={() => { resetForm(); setMode('text'); }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Type className="w-5 h-5" />
                <span className="text-xs">Text</span>
              </Button>
              <Button
                variant={mode === 'audio' ? 'default' : 'outline'}
                onClick={() => { resetForm(); setMode('audio'); }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Mic className="w-5 h-5" />
                <span className="text-xs">Audio</span>
              </Button>
              <Button
                variant={mode === 'video' ? 'default' : 'outline'}
                onClick={() => { resetForm(); setMode('video'); }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Video className="w-5 h-5" />
                <span className="text-xs">Video</span>
              </Button>
              <Button
                variant={mode === 'upload' ? 'default' : 'outline'}
                onClick={() => { resetForm(); setMode('upload'); }}
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
                <div className="text-center space-y-4">
                  {!mediaBlob ? (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        {mode === 'audio' ? 'Record your testimonial audio' : 'Record your video testimonial'}
                      </p>
                      {!isRecording ? (
                        <Button
                          onClick={() => startRecording(mode)}
                          style={{ background: brandColors.goldPrestige, color: 'white' }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Check className="w-12 h-12 mx-auto text-green-600" />
                      <p className="text-sm font-semibold">Recording Complete</p>
                      <Button
                        variant="outline"
                        onClick={() => setMediaBlob(null)}
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Re-record
                      </Button>
                    </div>
                  )}
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
                    onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
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
                onClick={() => { resetForm(); setIsOpen(false); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
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