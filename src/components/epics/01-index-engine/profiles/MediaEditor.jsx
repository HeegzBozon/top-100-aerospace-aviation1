import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadFile } from '@/integrations/Core';
import { Camera, Loader2, Image, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function MediaEditor({ nominee, onSave, onComplete }) {
  const [photoUrl, setPhotoUrl] = useState(nominee?.photo_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File is too large. Please select an image under 5MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const { file_url } = await UploadFile({ file });
      setPhotoUrl(file_url);
      toast({
        title: "Photo Uploaded!",
        description: "Your new profile photo is ready. Don't forget to save.",
      });
    } catch (err) {
      console.error("Photo upload failed:", err);
      setError('An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!photoUrl) return;
    const success = await onSave('photo_url', photoUrl);
    if (success) {
      onComplete();
    }
  };

  return (
    <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-[var(--accent)]" />
          Profile Photo
        </CardTitle>
        <CardDescription>
          Upload a professional headshot. This image will represent you across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-48 h-48 rounded-full bg-[var(--card)] border-2 border-[var(--border)] flex items-center justify-center overflow-hidden">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
          ) : photoUrl ? (
            <img src={photoUrl} alt="Nominee profile" className="w-full h-full object-cover" />
          ) : (
            <Image className="w-16 h-16 text-[var(--muted)]" />
          )}
        </div>
        
        <Button asChild variant="outline">
          <label htmlFor="photo-upload">
            {isUploading ? 'Uploading...' : 'Choose Photo'}
          </label>
        </Button>
        <input
          id="photo-upload"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handlePhotoUpload}
          className="hidden"
          disabled={isUploading}
        />
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={!photoUrl || isUploading}>
          Save & Continue
        </Button>
      </CardFooter>
    </Card>
  );
}