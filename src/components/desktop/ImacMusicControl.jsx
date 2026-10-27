import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { blip, buzz } from "@/components/handheld/handheldSound";
import {
  currentTrack,
  isPlaying,
  nextTrack,
  playPlaylist,
  stopPlaylist,
} from "@/components/handheld/consoleMusic";

// The machine's own record, on the desk. The left speaker of the chin's pair is the
// control, exactly as the well on the console's chin is on the glass: tap it and the
// desk plays the onboard loops, tap again and the machine is muted, and a hold moves
// on to the next loop. The grille and the resin lens are the moulding's own — all
// that is added is the glyph, the lamp, and the press.
const HOLD_MS = 620;

export default function ImacMusicControl() {
  const [playing, setPlaying] = useState(() => isPlaying());
  const [track, setTrack] = useState(() => currentTrack());
  const holdTimer = useRef(0);
  const advanced = useRef(false);

  useEffect(() => () => clearTimeout(holdTimer.current), []);

  const play = () => {
    if (!playPlaylist()) return;
    setTrack(currentTrack());
    setPlaying(true);
    blip("toggle");
    buzz();
  };

  const mute = () => {
    stopPlaylist();
    setPlaying(false);
    blip("toggle");
    buzz();
  };

  const beginHold = () => {
    advanced.current = false;
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      advanced.current = true;
      const now = nextTrack();
      playPlaylist();
      setTrack(now);
      setPlaying(true);
      blip("select");
      buzz();
    }, HOLD_MS);
  };

  const endHold = () => clearTimeout(holdTimer.current);

  const activate = () => {
    // A hold has already done its work; the release must not also mute it.
    if (advanced.current) {
      advanced.current = false;
      return;
    }
    if (playing) mute();
    else play();
  };

  const glyph = { filter: "drop-shadow(0 0 3px rgba(3,6,13,0.85))" };

  return (
    <div className="flex flex-none items-center gap-3">
      <button
        type="button"
        onClick={activate}
        onPointerDown={beginHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={(event) => event.preventDefault()}
        aria-pressed={playing}
        aria-label={
          playing
            ? `Speaker on, playing ${track.title}. Mute the music`
            : "Speaker off. Play the machine's music"
        }
        title="Tap to play or mute · hold for the next loop"
        className="imac-speaker imac-speaker-key"
      >
        {playing ? (
          <Volume2 className="h-[13px] w-[13px]" style={{ color: "var(--imac-ink)", ...glyph }} />
        ) : (
          <VolumeX
            className="h-[13px] w-[13px]"
            style={{ color: "var(--imac-ink-soft)", ...glyph }}
          />
        )}
        <span className="imac-speaker-led" data-on={playing} aria-hidden="true" />
      </button>

      <span className="flex flex-col leading-none">
        <span
          className="text-[7px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--imac-ink)" }}
        >
          {playing ? track.title : "Sound off"}
        </span>
        <span
          className="mt-[4px] text-[6.5px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--imac-ink-soft)" }}
        >
          {playing ? "Hold ▸ next loop" : "Tap to play"}
        </span>
      </span>
    </div>
  );
}