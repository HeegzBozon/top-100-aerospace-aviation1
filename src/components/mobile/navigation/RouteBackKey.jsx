import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { tabOf } from './MobileNavState';

// The way out of a page you walked into.
//
// A nested address — anything below a tab's own root — puts an arrow at the head of the
// phone's band, so a page always carries its own way back and never leans on the
// browser's. At a tab's root there is nothing to step back to, and the key is absent.
export default function RouteBackKey() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const nested = pathname.split('/').filter(Boolean).length > 1;
  if (!nested) return null;

  const stepBack = () => {
    const depth = window.history.state?.idx;
    if (typeof depth === 'number' ? depth > 0 : window.history.length > 1) navigate(-1);
    else navigate(tabOf(pathname));
  };

  return (
    <button
      type="button"
      onClick={stepBack}
      aria-label="Back"
      role="menuitem"
      className="mb-cell flex shrink-0 items-center justify-center"
      style={{ color: 'var(--mb-ink)', width: 30 }}
    >
      <ChevronLeft className="h-[16px] w-[16px]" strokeWidth={2} />
    </button>
  );
}