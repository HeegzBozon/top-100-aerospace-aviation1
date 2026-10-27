import HomeDock from '@/components/home-v3/HomeDock';
import BeforeYouGo from '@/components/networking/BeforeYouGo';
import RoomsAheadBoard from '@/components/aerosync/RoomsAheadBoard';
import useRoomsAhead from '@/components/aerosync/useRoomsAhead';
import { C } from '@/components/crm/crmConfig';

// AeroSync's conferencing surface: the shows still ahead, the rooms Fellows have opened in
// each one, and who is already standing in them — then the three things worth having in
// place before standing in one yourself.
export default function AeroSyncRooms() {
  const rooms = useRoomsAhead();

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-12">
        <header>
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: C.copper }}>
            The shows
          </p>
          <h1 className="mt-1 font-heading text-2xl md:text-4xl" style={{ color: C.navy }}>
            The rooms ahead.
          </h1>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
            The shows on the calendar, the rooms Fellows have opened in each one, and who is already
            standing in them. Declare your attendance, and the introductions follow.
          </p>
        </header>

        <RoomsAheadBoard rooms={rooms} />

        <BeforeYouGo
          nominee={rooms.data?.nominee}
          availability={rooms.data?.availability || 0}
          pendingIntros={rooms.data?.pendingIntros || 0}
          user={rooms.me}
        />

        <div className="h-24" />
      </div>
      <HomeDock />
    </div>
  );
}