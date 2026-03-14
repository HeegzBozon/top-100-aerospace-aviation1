import React, { useState, useEffect } from 'react';
import { Nominee } from '@/entities/Nominee';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload, ChevronRight, CheckCircle, Camera, Loader2 } from 'lucide-react';

export default function HeadshotUploadWizard() {
  const [nominees, setNominees] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadMissingHeadshots();
  }, []);

  const loadMissingHeadshots = async () => {
    setLoading(true);
    try {
      const allNominees = await Nominee.list('-created_date', 1000);
      const missing = allNominees.filter(n => !n.avatar_url);
      setNominees(missing);
    } catch (error) {
      console.error('Error loading nominees:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load nominees' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentNominee = nominees[currentIndex];
    setUploading(true);

    try {
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse?.file_url || uploadResponse?.data?.file_url;

      if (!fileUrl) {
        throw new Error('No file URL returned from upload');
      }

      await Nominee.update(currentNominee.id, { avatar_url: fileUrl });

      toast({
        title: 'Headshot Uploaded!',
        description: `Photo added for ${currentNominee.name}`,
      });

      setCompleted(prev => prev + 1);
      
      // Move to next nominee
      if (currentIndex < nominees.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast({
          title: 'All Done!',
          description: `Uploaded ${completed + 1} headshots`,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Failed to upload photo',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < nominees.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (nominees.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">All Set!</h2>
        <p className="text-[var(--muted)]">All nominees have headshots uploaded.</p>
      </div>
    );
  }

  const currentNominee = nominees[currentIndex];
  const progress = ((currentIndex + 1) / nominees.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-[var(--text)]">
            Nominee {currentIndex + 1} of {nominees.length}
          </span>
          <span className="text-sm text-[var(--muted)]">
            {completed} completed
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Nominee Card */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar Placeholder */}
          <div className="relative w-32 h-32">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/e15baa063_Gemini_Generated_Image_4pcatw4pcatw4pca.png"
              alt="Laurel wreath"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center p-[12%]">
              <div className="w-full aspect-square rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-white/30">
                {currentNominee.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Nominee Info */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
              {currentNominee.name}
            </h2>
            {currentNominee.title && (
              <p className="text-[var(--muted)]">{currentNominee.title}</p>
            )}
            {currentNominee.company && (
              <p className="text-sm text-[var(--muted)]">{currentNominee.company}</p>
            )}
          </div>

          {/* Upload Button */}
          <label className="w-full max-w-xs">
            <div className={`
              flex flex-col items-center justify-center w-full h-32 border-2 border-dashed 
              rounded-xl cursor-pointer transition-all
              ${uploading ? 'border-[var(--muted)] bg-[var(--card)]' : 'border-[var(--accent)] hover:bg-[var(--accent)]/5'}
            `}>
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-2" />
                  <p className="text-sm text-[var(--muted)]">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[var(--accent)] mb-2" />
                  <p className="text-sm font-semibold text-[var(--text)]">Upload Headshot</p>
                  <p className="text-xs text-[var(--muted)]">Click to browse</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

          {/* Actions */}
          <div className="flex gap-3 w-full max-w-xs">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={uploading || currentIndex >= nominees.length - 1}
              className="flex-1"
            >
              Skip
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}