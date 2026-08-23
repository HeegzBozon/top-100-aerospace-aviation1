import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import DocumentPill from '@/components/fellow-home/DocumentPill';
import LinkedInPill from '@/components/fellow-home/LinkedInPill';

// Biographer step: gather professional documents upfront during onboarding.
// All optional/skippable — the Fellow brings what they have and skips the
// rest. Uploads save directly to the User record so they persist even if the
// wizard is abandoned. The CommonApp principle: capture once, reuse everywhere.
export default function WizardDocuments({ accent }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: B.muted }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 items-start py-1">
      <DocumentPill field="resume_url" label="Resume" user={user} accent={accent} onUserUpdate={setUser} />
      <DocumentPill field="cover_letter_url" label="Cover Letter" user={user} accent={accent} onUserUpdate={setUser} />
      <DocumentPill field="portfolio_url" label="Portfolio" user={user} accent={accent} onUserUpdate={setUser} accept=".pdf,.png,.jpg,.jpeg" />
      <LinkedInPill user={user} accent={accent} onUserUpdate={setUser} />
      <p className="text-[11px] mt-1 leading-relaxed" style={{ color: B.muted }}>
        Bring what you have, skip what you don't. We keep everything on file so you never re-upload it again.
      </p>
    </div>
  );
}