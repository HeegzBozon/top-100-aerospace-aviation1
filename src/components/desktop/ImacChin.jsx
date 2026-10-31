import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Layers, Palette, Power, RefreshCw, User } from "lucide-react";
import ImacMusicControl from "./ImacMusicControl";
import RadioDisplay from "./radio/RadioDisplay";
import RadioKey from "./radio/RadioKey";
import RadioKnob from "./radio/RadioKnob";
import RadioIndexPanel from "./radio/RadioIndexPanel";
import RadioStationPanel from "./radio/RadioStationPanel";
import RadioBandPanel from "./radio/RadioBandPanel";
import useRadioBand from "./radio/useRadioBand";
import useStationUser from "./radio/useStationUser";
import { getVolume, setVolume as setRecordVolume } from "@/components/handheld/consoleMusic";
import "./deskRadio.css";

const MODES = ["CH", "VOL", "CLK"];
const percent = () => Math.round(getVolume() * 100);

// THE FACEPLATE. The machine's chin is a transceiver face, and every control on it is
// real. The display reads the station: the channel the dial is on, the record's volume,
// the hour, and the lamps for who is signed in and what is down. MODE gives the big
// figures their three meanings, SCAN steps the band, MEM drops the memory list, BAND
// opens the moulding's colours. The channel keys stand in a recessed bay across the
// middle — that bay is the desk's shelf, seated in the bezel rather than floating on the
// picture — and the two knobs at the end tune it: the small one sets the record's volume,
// the large one walks the band and presses to go where it is pointing. The copper key is
// the station, and the power key is still the platform's front door.
export default function ImacChin({ shelf, finish, pack, packs, options, finishKey, onChoose, onChoosePack }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useStationUser();
  const band = useRadioBand();

  const [mode, setMode] = useState("CH");
  const [panel, setPanel] = useState(null);
  const [volume, setVolume] = useState(percent);
  const shaft = useRef(percent());

  // A drawer belongs to the surface it was opened on.
  useEffect(() => setPanel(null), [pathname]);

  const signedIn = Boolean(user);
  const isAdmin = user?.role === "admin";
  const close = () => setPanel(null);
  const toggle = (kind) => setPanel((current) => (current === kind ? null : kind));

  const cycleMode = () => setMode((current) => MODES[(MODES.indexOf(current) + 1) % MODES.length]);

  // Turning the volume knob shows what it is doing, the way a radio's display does. The
  // level is kept on the shaft as well as in state, so a fast drag steps from the last
  // click rather than from the last render.
  const turnVolume = (direction) => {
    const next = Math.min(100, Math.max(0, shaft.current + direction * 5));
    shaft.current = next;
    setVolume(next);
    setRecordVolume(next / 100);
    setMode("VOL");
  };

  const tune = (direction) => {
    setMode("CH");
    band.step(direction);
  };

  const tuneIn = () => {
    if (band.target) navigate(band.target.to);
  };

  return (
    <div className="imac-chin imac-band">
      {panel ? <div className="rd-backdrop" onClick={close} aria-hidden="true" /> : null}

      <div className="rd-face">
        <ImacMusicControl />
        <span className="imac-screw rd-screw" aria-hidden="true" />

        <RadioDisplay
          mode={mode}
          index={band.index}
          total={band.channels.length}
          target={band.target}
          tuning={band.tuning}
          volume={volume}
          signedIn={signedIn}
          memOpen={panel === "index"}
        />

        <div className="rd-keys">
          <RadioKey
            label="MODE"
            glyph={RefreshCw}
            onClick={cycleMode}
            title="Display — channel, volume, clock"
          />
          <RadioKey
            label="BAND"
            glyph={Palette}
            on={panel === "band"}
            onClick={() => toggle("band")}
            title="Band — the colour the machine is moulded in"
          />
          <RadioKey
            label="SCAN"
            glyph={ChevronRight}
            onClick={() => tune(1)}
            title="Scan to the next channel"
          />
          <RadioKey
            label="MEM"
            glyph={Layers}
            on={panel === "index"}
            onClick={() => toggle("index")}
            title="Memory — every surface the machine holds"
          />
        </div>

        {/* The channel keys: the shelf, in the bezel. */}
        <div className="rd-bay">{shelf}</div>

        <RadioKnob
          label="VOL"
          ariaLabel="Volume"
          value={volume}
          min={0}
          max={100}
          onTurn={turnVolume}
          onPush={cycleMode}
        />
        <RadioKnob
          label="CH · PUSH"
          ariaLabel="Channel — turn to tune, press to go"
          size="lg"
          value={band.index + 1}
          min={1}
          max={Math.max(band.channels.length, 1)}
          onTurn={tune}
          onPush={tuneIn}
        />

        <RadioKey
          label="STN"
          glyph={User}
          tone="copper"
          on={panel === "station"}
          onClick={() => toggle("station")}
          title="Station — sign in, or your own record"
        />

        <span className="rd-seam" aria-hidden="true" />

        <button
          type="button"
          onClick={() => navigate("/")}
          className="imac-power flex flex-none items-center justify-center"
          aria-label="Front door"
          title="Front door"
        >
          <Power className="h-[15px] w-[15px]" />
        </button>
        <span className="imac-led flex-none" aria-hidden="true" />
        <span className="imac-screw rd-screw" aria-hidden="true" />

        {panel === "index" ? (
          <RadioIndexPanel signedIn={signedIn} isAdmin={isAdmin} onClose={close} />
        ) : null}
        {panel === "band" ? (
          <RadioBandPanel
            finish={finish}
            pack={pack}
            packs={packs}
            options={options}
            finishKey={finishKey}
            onChoose={onChoose}
            onChoosePack={onChoosePack}
            onClose={close}
          />
        ) : null}
        {panel === "station" ? <RadioStationPanel user={user} onClose={close} /> : null}
      </div>
    </div>
  );
}