import Newsstand from '@/pages/Newsstand';
import StudioKey from '@/components/media-hub/StudioKey';
import MediaRoomGrid from '@/components/media-hub/MediaRoomGrid';

// The Media Hub: the campus's press floor — its nine rooms, then the Newsstand.
export default function MediaHub() {
  return (
    <div className="min-h-screen bg-editorial-cream">
      <div className="mx-auto max-w-2xl px-2.5 pt-3 md:px-8 md:pt-6">
        <p className="pd-label">Media Hub · The press floor</p>
        <div className="pd-rule mb-3 mt-2 w-12" />
        <StudioKey />
        <MediaRoomGrid />
      </div>
      <Newsstand />
    </div>
  );
}