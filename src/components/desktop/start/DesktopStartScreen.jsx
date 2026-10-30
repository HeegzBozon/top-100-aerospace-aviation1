import StartMetaRow from "@/components/start/StartMetaRow";
import TitleCardQr from "@/components/start/TitleCardQr";
import DesktopStartSky from "./DesktopStartSky";
import DesktopStartRail from "./DesktopStartRail";
import DesktopStartHero from "./DesktopStartHero";
import DesktopCyclePanel from "./DesktopCyclePanel";
import DesktopSurfaceIndex from "./DesktopSurfaceIndex";
import "../deskTitle.css";

// What a desk opens on. The phone gets the machine's keypad; the desk gets the cover:
// the hour's sky over the whole plate, the masthead struck in metal, the watch's line
// set beside it, the cycle read as instrument figures, and every surface listed as an
// index underneath. Same menu, same actions, same season record — read as a magazine
// rather than as a joystick.
export default function DesktopStartScreen({
  user = null,
  phase,
  status,
  onRetry,
  menuItems,
  signedIn,
  voteLive,
  vote,
  notifyOpen,
  onNotifyChange,
}) {
  return (
    /* The plate is measured against the tube rather than the window: the cover fills
       exactly the picture it is printed on, and never leaves a scroll of empty sky
       under the last rule. */
    <div
      className="relative min-h-[calc(100vh-var(--imac-top)-var(--imac-bottom))] overflow-hidden"
      style={{ background: phase.sky }}
    >
      <DesktopStartSky phase={phase} />

      {/* The Fellow's card, printed in the corner of the cover: a hand turns the screen
          round, and the person opposite scans the record rather than copying a name. */}
      <div className="absolute right-8 top-7 z-20">
        <TitleCardQr user={user} variant="desk" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-var(--imac-top)-var(--imac-bottom))] w-full max-w-[1180px] flex-col px-12 pb-32 pt-9 xl:px-16">
        <DesktopStartRail phase={phase} />
        <DesktopStartHero phase={phase} />
        <div className="mt-11">
          <DesktopCyclePanel
            status={status}
            onRetry={onRetry}
            signedIn={signedIn}
            voteLive={voteLive}
            vote={vote}
            notifyOpen={notifyOpen}
            onNotifyChange={onNotifyChange}
          />
        </div>
        <DesktopSurfaceIndex items={menuItems} />

        <div className="mt-auto pt-14">
          <StartMetaRow />
        </div>
      </div>

    </div>
  );
}