import { useEffect, useRef } from 'react';
import { trackCommitteeAction, trackSelectionCommittee } from '@/lib/selectionCommitteeAnalytics';

// Resolve the role before recording one landing, rather than counting auth changes.
export default function useSelectionCommitteeAnalytics(signedIn, user, preview) {
  const viewed = useRef(false);
  useEffect(() => {
    if (preview || viewed.current || signedIn === null || (signedIn && !user)) return;
    viewed.current = true;
    trackSelectionCommittee('view', {
      user_role: !signedIn ? 'anonymous' : user?.role === 'admin' ? 'admin' : 'fellow',
    });
  }, [signedIn, user, preview]);

  useEffect(() => {
    if (preview) return;
    const click = (event) => {
      const control = event.target.closest?.('button, a, [role="button"], [role="tab"]');
      if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true') return;
      const label = (control.getAttribute('aria-label') || control.textContent || '').replace(/\s+/g, ' ').trim();
      // Only fixed action labels, never candidate names, answers or arbitrary link text.
      if (!/^(submit (all nominations|evaluation)|nominate( fellow| another woman| another man)?|cast vote|vote now|crosscheck|the crosscheck)$/i.test(label)) return;
      const href = control.getAttribute('href');
      const destination = href ? new URL(href, window.location.origin).pathname : '/selection-committee';
      trackCommitteeAction(label, destination);
    };
    document.addEventListener('click', click, true);
    return () => document.removeEventListener('click', click, true);
  }, [preview]);
}