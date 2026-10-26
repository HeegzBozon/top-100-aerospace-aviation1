import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { blip, buzz } from "./handheldSound";
import { playPlaylist, stopPlaylist, nextTrack, currentTrack, isPlaying } from "./chiptune";

// The case speaker. The punched well the hardware already had is now the control:
// tap it to unmute the console's own playlist — five 8-bit house loops written
// into the device — and tap again to mute. Hold it to move on to the next loop,
// which is how the rest of the playlist is reached without a screen for it. The
// LED is lit while music is playing and the loop's name is printed on the well.
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
          : "Speaker off. Play the console's music, five loops"
      }
      title="Tap to play or mute · hold for the next loop"
      className="hh-speaker relative flex h-[76px] w-[76px] shrink-0 flex-col justify-between overflow-hidden rounded-[14px] p-2.5 text-left transition-transform active:scale-[0.97]"
      style={{
        background: "radial-gradient(circle at 50% 8%, rgba(9,19,33,0.92), rgba(3,7,13,0.97))",
        boxShadow: playing
          ? "inset 0 0 0 1px rgb(var(--hh-metal-rgb) / 0.55), inset 0 2px 8px rgba(0,0,0,0.55), 0 0 12px rgb(var(--hh-metal-rgb) / 0.20)"
          : "inset 0 0 0 1px rgb(var(--hh-metal-rgb) / 0.30), inset 0 2px 8px rgba(0,0,0,0.55)",
      }}
    >
      {/* The punched grille stays exactly as the moulding had it, drawn over the
          well so the speaker still reads as hardware rather than as a button. */}
      <span
        aria-hidden="true"
        className="hh-grille pointer-events-none absolute inset-0 rounded-[14px] opacity-70"
      />

      <span className="relative flex items-start justify-between">
        {playing ? (
          <Volume2 className="h-[16px] w-[16px]" style={{ color: "var(--hh-metal-1)" }} />
        ) : (
          <VolumeX
            className="h-[16px] w-[16px]"
            style={{ color: "rgb(var(--hh-metal-rgb) / 0.62)" }}
          />
        )}

        <span
          className={playing ? "hh-led h-[5px] w-[5px] rounded-full" : "h-[5px] w-[5px] rounded-full"}
          style={{
            background: playing ? "var(--hh-led)" : "rgba(150,166,184,0.22)",
            boxShadow: playing ? undefined : "inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        />
      </span>

      <span className="relative block">
        <span
          className="block font-heading text-[7.5px] font-bold uppercase leading-[1.25] tracking-[0.14em]"
          style={{ color: playing ? "var(--hh-key-1)" : "rgb(var(--hh-metal-rgb) / 0.74)" }}
        >
          {playing ? track.title : "Sound off"}
        </span>
        <span
          className="mt-[3px] block text-[5.5px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "rgb(var(--hh-metal-rgb) / 0.68)" }}
        >
          {playing ? "Hold ▸ next" : "Tap to play"}
        </span>
      </span>
    </button>
  );
}