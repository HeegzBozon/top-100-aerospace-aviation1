import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BookText, Loader2 } from 'lucide-react';

const MAX_BIO_LENGTH = 200;

export default function BioEditor({ nominee, onSave, onComplete }) {
  const [bio, setBio] = useState(nominee?.description || '');
  const [charCount, setCharCount] = useState(bio.length);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const newBio = nominee?.description || '';
    setBio(newBio);
    setCharCount(newBio.length);
  }, [nominee?.description]);

  const handleBioChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_BIO_LENGTH) {
      setBio(text);
      setCharCount(text.length);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave('description', bio);
    if (success) {
      onComplete();
    }
    setIsSaving(false);
  };

  return (
    <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <BookText className="w-6 h-6 text-[var(--accent)]" />
          Professional Bio
        </CardTitle>
        <CardDescription>
          Write in the third-person (max {MAX_BIO_LENGTH} characters). Highlight achievements, impact, and focus areas.
          Keep the tone serious and biographical, but compelling.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={bio}
          onChange={handleBioChange}
          placeholder="e.g., Jane Doe is a pioneering aerospace engineer..."
          className="h-48 resize-none bg-white/5"
        />
        <p className="text-right text-sm text-[var(--muted)] mt-2">
          {charCount}/{MAX_BIO_LENGTH}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save & Continue
        </Button>
      </CardFooter>
    </Card>
  );
}