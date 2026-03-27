import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

export default function UnauthenticatedCTA({ user }) {
  if (user) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-gray-200">
      <span className="text-sm text-gray-600 hidden sm:inline">Join the community</span>
      <Button
        size="sm"
        className="rounded-full gap-2 bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-white"
        onClick={() => base44.auth.redirectToLogin()}
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </Button>
    </div>
  );
}