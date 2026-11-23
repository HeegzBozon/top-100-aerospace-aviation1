import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const STUDIO_PATH = '/Profile?studio=open';

export function useOpenViralPostStudio(referrer) {
  const navigate = useNavigate();
  return useCallback(async () => {
    const path = referrer ? `${STUDIO_PATH}&ref=${encodeURIComponent(referrer)}` : STUDIO_PATH;
    try {
      if (await base44.auth.isAuthenticated()) {
        navigate(path);
        return;
      }
    } catch {
      // Fall back to the platform sign-in flow if the session check fails.
    }
    base44.auth.redirectToLogin(`${window.location.origin}${path}`);
  }, [navigate, referrer]);
}

export default function ViralPostSubmissionFooter({ onOpen, buttonRef, onFocus, selected = false }) {
  return (
    <section className="border-t border-editorial-copper/30 bg-editorial-sand text-editorial-navy">
      <div className="mx-auto max-w-3xl px-5 py-10 text-center md:px-10 md:py-16">
        <h2 className="mb-4 font-heading text-2xl font-bold md:text-3xl">Have a post that moved the community?</h2>
        <p className="mx-auto mb-6 max-w-xl font-body text-base leading-relaxed text-editorial-navy/85">
          TOP 100 Aerospace &amp; Aviation is a verified reputation graph that measures contribution, verification, and reach across a global directory of Fellows. Submit your top viral post and join the record.
        </p>
        <Button ref={buttonRef} type="button" onClick={onOpen} onFocus={onFocus} className={`h-12 rounded-full bg-editorial-navy px-7 font-body font-semibold text-editorial-cream hover:bg-editorial-navy/90 focus-visible:ring-2 focus-visible:ring-editorial-label focus-visible:ring-offset-2 ${selected ? 'ring-2 ring-editorial-label ring-offset-2' : ''}`}>
          Add my own Viral Post
        </Button>
      </div>
    </section>
  );
}