import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { blip, buzz } from "./handheldSound";
import { playPlaylist, stopPlaylist, nextTrack, currentTrack, isPlaying } from "./consoleMusic";

// The case speaker, and the machine's own record.
//
// It is moulded the way the desk machine's speaker is: a circle of the case turned
// down into the chin, a fine hole field punched through the middle of it, and the
// clear resin lens that sits over both (see .hh-speaker). Because the well is also
// the control, the press, the glyph and the lamp are all this adds — tap it to take
// the record off standby, tap again to mute, hold it to move on to the next loop.
// The loop's name is printed under it, where the name on a speaker's record belongs.
const HOLD_MS = 620;

export default function HandheldSpeaker({ onAnnounce, onSoundOn }) {
  const [playing, setPlaying] = useState(() => isPlaying());
  const [track, setTrack] = useState(() => currentTrack());
  const holdTimer = useRef(0);
  const advanced = useRef(false);

  useEffect(() => () => clearTimeout(holdTimer.current), []);

  const unmute = () => {
    // Music is the loudest thing the device does, so asking for it also brings
    // the console's sound back on: a speaker that played while the shell was
    // "Sound off" would be a lie.
    onSoundOn?.();
    if (!playPlaylist()) {
      onAnnounce?.("No sound on this device");
      return;
    }
    const now = currentTrack();
    setTrack(now);
    setPlaying(true);
    onAnnounce?.(`♪ ${now.title}`);
  };

  const mute = () => {
    stopPlaylist();
    setPlaying(false);
    onAnnounce?.("Speaker muted");
  };

  const beginHold = () => {
    advanced.current = false;
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      advanced.current = true;
      onSoundOn?.();
      const now = nextTrack();
      playPlaylist();
      setTrack(now);
      setPlaying(true);
      blip("select");
      buzz();
      onAnnounce?.(`♪ ${now.title}`);
    }, HOLD_MS);
  };

  const endHold = () => clearTimeout(holdTimer.current);

  const activate = () => {
    // A hold has already done its work; the release must not also mute it.
    if (advanced.current) {
      advanced.current = false;
      return;
    }
    blip("toggle");
    buzz();
    if (playing) mute();
    else unmute();
  };

  return (
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
          : "Speaker off. Play the console's music, three house loops and two lo-fi"
      }
      title="Tap to play or mute · hold for the next loop"
      className="group relative flex w-[66px] shrink-0 flex-col items-center gap-1 transition-transform active:scale-[0.97]"
    >
      {/* The well itself: plastic, punched through, under its resin lens. */}
      <span className="hh-speaker flex h-[54px] w-[54px] items-center justify-center">
        <span className="relative z-10 flex items-center justify-center">
          {playing ? (
            <Volume2 className="h-[15px] w-[15px]" style={{ color: "var(--hh-metal-1)" }} />
          ) : (
            <VolumeX
              className="h-[15px] w-[15px]"
              style={{ color: "rgb(var(--hh-metal-rgb) / 0.62)" }}
            />
          )}
        </span>

        {/* The lamp, set in the punched field the way the desk's is. */}
        <span className="hh-speaker-led z-10" data-on={playing} aria-hidden="true" />
      </span>

      <span className="flex w-full flex-col items-center leading-none">
        <span
          className="w-full truncate text-center font-heading text-[6.5px] font-bold uppercase tracking-[0.12em]"
          style={{ color: playing ? "var(--hh-key-1)" : "var(--hh-metal-1)" }}
        >
          {playing ? track.title : "Sound off"}
        </span>
        <span
          className="mt-[2px] text-[5.5px] font-bold uppercase tracking-[0.16em]"
          style={{ color: "var(--hh-metal-1)" }}
        >
          {playing ? "Hold ▸ next" : "Tap to play"}
        </span>
      </span>
    </button>
  );
}