import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Map } from 'lucide-react';
import { findMediaRoom } from '@/components/media-hub/mediaRooms';
import PageNotFound from '@/lib/PageNotFound';

// A room's title card: its name and purpose, then the way in — or a planned-room notice.
export default function MediaRoom() {
  const { roomKey } = useParams();
  const navigate = useNavigate();
  const room = findMediaRoom(roomKey);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter' && room?.to) navigate(room.to); if (e.key === 'Escape') navigate(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [room, navigate]);

  if (!room) return <PageNotFound />;
  return (
    <div className="doc-stage flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <p className="as-rise text-[10px] font-bold uppercase tracking-[0.3em] text-editorial-gold">Media Hub · Now entering</p>
      <h1 className="as-title mt-2 font-heading text-4xl text-editorial-cream md:text-5xl">{room.label}</h1>
      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-editorial-cream/60">{room.kicker}</p>
      <div className="pd-rule mx-auto my-5 w-16" />
      <p className="max-w-md text-sm leading-relaxed text-editorial-cream/80">{room.line}</p>
      {room.to ? (
        <button onClick={() => navigate(room.to)} className="doc-key-primary mt-8 min-h-[44px] gap-2 px-6 text-xs font-bold uppercase tracking-[0.16em]">
          Step inside <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <div className="doc-sheet mt-8 max-w-sm text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-gold">Planned room</p>
          <p className="mt-1 text-sm text-editorial-cream/80">This room is being fitted out. Its programming opens here when it is ready.</p>
        </div>
      )}
      <div className="mt-6 flex gap-2">
        <Link to="/colony" className="doc-key min-h-[44px] text-xs"><Map className="h-4 w-4" /> Back to the floor</Link>
        <Link to="/media-hub" className="doc-key min-h-[44px] text-xs"><ArrowLeft className="h-4 w-4" /> All rooms</Link>
      </div>
    </div>
  );
}