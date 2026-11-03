import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Admin-only door from the press floor into Magazine Studio.
export default function StudioKey() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    base44.auth.me().then((u) => setIsAdmin(u?.role === 'admin')).catch(() => setIsAdmin(false));
  }, []);
  if (!isAdmin) return null;
  return (
    <Link to="/magazine-studio"
      className="mb-3 flex items-center gap-3 border border-editorial-copper bg-white px-4 py-3 transition-colors hover:bg-editorial-navy hover:text-editorial-cream group">
      <BookOpen className="h-4 w-4 text-editorial-copper" />
      <div className="flex-1">
        <p className="font-heading text-sm text-editorial-navy group-hover:text-editorial-cream">Magazine Studio</p>
        <p className="font-body text-[11px] text-editorial-navy/60 group-hover:text-editorial-cream/70">Admin · draft, compose and publish issues</p>
      </div>
      <ArrowRight className="h-4 w-4 text-editorial-copper" />
    </Link>
  );
}