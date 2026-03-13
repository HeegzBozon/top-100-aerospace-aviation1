import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Linkedin, Instagram, Loader2 } from 'lucide-react';

export default function SocialsEditor({ nominee, onSave, onComplete }) {
  const [linkedinUrl, setLinkedinUrl] = useState(nominee?.linkedin_profile_url || '');
  const [instagramUrl, setInstagramUrl] = useState(nominee?.instagram_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(nominee?.website_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Save all three fields in one go for efficiency
    const linkedinPromise = onSave('linkedin_profile_url', linkedinUrl);
    const instagramPromise = onSave('instagram_url', instagramUrl);
    const websitePromise = onSave('website_url', websiteUrl);
    
    const [linkedinSuccess, instagramSuccess, websiteSuccess] = await Promise.all([
      linkedinPromise, 
      instagramPromise, 
      websitePromise
    ]);

    if (linkedinSuccess && instagramSuccess && websiteSuccess) {
      onComplete();
    }
    setIsSaving(false);
  };

  return (
    <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Link2 className="w-6 h-6 text-[var(--accent)]" />
          Social & Professional Links
        </CardTitle>
        <CardDescription>
          Provide links to your LinkedIn profile, Instagram, and personal or company website.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
            <Linkedin className="w-4 h-4" />
            LinkedIn Profile URL
          </label>
          <Input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/your-profile"
            className="bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
            <Instagram className="w-4 h-4" />
            Instagram Profile URL
          </label>
          <Input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://www.instagram.com/your-profile"
            className="bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
            <Link2 className="w-4 h-4" />
            Personal or Company Website
          </label>
          <Input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="bg-white/5"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save & Finish
        </Button>
      </CardFooter>
    </Card>
  );
}