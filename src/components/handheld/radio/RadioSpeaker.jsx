import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { currentTrack, isPlaying, nextTrack, playPlaylist, stopPlaylist } from "../consoleMusic";
import { blip, buzz } from "../handheldSound";

// The radio face's sound key: the same record the wheel's speaker plays, on a cap the
// size of a key. A press takes it off standby or mutes it; a hold moves to the next
// loop. The lamp on the cap follows the machine rather than the press.
const HOLD_MS = 620;

export default function RadioSpeaker({ onAnnounce, onSoundOn }) {
  const [playing, setPlaying] = useState(() => isPlaying());
  const timer = useRef(0);
  const advanced = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const beginHold = () => {
    advanced.current = false;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      advanced.current = true;
      onSoundOn?.();
      const track = nextTrack();
      playPlaylist();
      setPlaying(true);
      blip("select");
      buzz();
      onAnnounce?.(`♪ ${track.title}`);
    }, HOLD_MS);
  };

  const activate = () => {
    if (advanced.current) {
      advanced.current = false;
      return;
    }
    blip("toggle");
    buzz();
    onSoundOn?.();
    if (playing) {
      stopPlaylist();
      setPlaying(false);
      onAnnounce?.("Speaker muted");
      return;
    }
    if (!playPlaylist()) {
      onAnnounce?.("No sound on this device");
      return;
    }
    setPlaying(true);
    onAnnounce?.(`♪ ${currentTrack().title}`);
  };

  return (
    <button
      type="button"
      onClick={activate}
      onPointerDown={beginHold}
      onPointerUp={() => clearTimeout(timer.current)}
      onPointerLeave={() => clearTimeout(timer.current)}
      onPointerCancel={() => clearTimeout(timer.current)}
      onContextMenu={(event) => event.preventDefault()}
      aria-pressed={playing}
      aria-label={playing ? "Speaker on. Mute the music" : "Speaker off. Play the console's music"}
      title="Tap to play or mute · hold for the next loop"
      className="hh-pad-key relative flex h-full w-[26px] shrink-0 items-center justify-center rounded-[7px]"
      style={{ color: playing ? "var(--hh-metal-1)" : "var(--hh-pad-ink)" }}
    >
      {playing ? <Volume2 className="h-[11px] w-[11px]" /> : <VolumeX className="h-[11px] w-[11px]" />}
      <span
        className="hh-speaker-led"
        data-on={playing}
        style={{ top: 3, right: 3, width: 3, height: 3 }}
        aria-hidden="true"
      />
    </button>
  );
}