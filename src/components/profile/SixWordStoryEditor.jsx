import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Feather, Loader2 } from 'lucide-react';

export default function SixWordStoryEditor({ nominee, onSave, onComplete }) {
  const [story, setStory] = useState(nominee?.six_word_story || '');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const newStory = nominee?.six_word_story || '';
    setStory(newStory);
    const words = newStory.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setIsValid(words.length === 6);
  }, [nominee?.six_word_story]);

  const handleStoryChange = (e) => {
    const text = e.target.value;
    setStory(text);
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setIsValid(words.length === 6);
  };

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    const success = await onSave('six_word_story', story);
    if (success) {
      onComplete();
    }
    setIsSaving(false);
  };

  return (
    <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Feather className="w-6 h-6 text-[var(--accent)]" />
          Six-Word Story
        </CardTitle>
        <CardDescription>
          Craft a six-word summary of your ethos or impact. This will be your personal headline or enduring motto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          value={story}
          onChange={handleStoryChange}
          placeholder="e.g., Engineering the future, one launch at a time."
          className="bg-white/5 text-lg"
        />
        <div className={`text-right text-sm mt-2 transition-colors ${isValid ? 'text-green-500' : 'text-red-500'}`}>
          Word Count: {wordCount} / 6
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={!isValid || isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save & Continue
        </Button>
      </CardFooter>
    </Card>
  );
}