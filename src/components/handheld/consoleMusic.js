import { shellAudio } from "./handheldSound";
import { STATION_1993 } from "./stations1993";
import { setMusicKey } from "./musicKey";

// The console's onboard music: one record of instrumentals — the house side (lo-fi, deep
// and funky house) and the 1993 side — written as note data rather than loaded as files,
// so the device carries its own soundtrack. Nothing to fetch, nothing to licence, and no
// loop ever ends on a gap.
//
// The record is played shuffled, and every change of record is a hand-off: the melody
// drops out of the last bar, a roll and a riser carry it, and the new track is played in
// the nearest key to the one that just left. That is why a shuffled set still sounds
// like a set.
//
// The palette is a small record rather than a sound chip: a soft sine kick, brushed
// claps, dusty hats, a Rhodes-ish key (a sine with a fast second harmonic over it),
// a round sub bass, a low pad, tape hiss and a dotted-eighth echo. Swung sixteenths,
// a few cents of drift on every note and a lowpass across the master keep it warm —
// it is meant to sit under a page you are reading, not to compete with it.

const STEPS = 16; // sixteenth notes: one bar
const LOOKAHEAD = 0.18; // seconds of music kept scheduled ahead of the clock
const TICK_MS = 25;
const MASTER = 0.34;

// The desk faceplate's volume knob turns the record's single gain: 1 leaves the mixing
// level above untouched, 0 is silence, and the level belongs to the sitting.
let level = 1;
const DRIFT = 7; // cents of wobble per note, which is what makes it sound played

// Bass offsets are only ever the root, the fifth, the octave, or a fifth below, so a
// line stays consonant under every chord of a progression without being typed out
// bar by bar. The colour comes from the keys and the pad, which read the chord whole.
const ROOT = 0;
const FIFTH = 7;
const OCTAVE = 12;
const BELOW = -5;

const FOUR = "x...x...x...x..."; // four on the floor
const BACKBEAT = "....x.......x...";
const OFFBEAT = "..o...o...o...o."; // 'o' is an open hat

export const PLAYLIST = [
  {
    title: "Standby",
    kind: "lo-fi",
    bpm: 86,
    swing: 0.3,
    // Am9 · Dm9 · Fmaj7 · G13
    chords: [[57, 60, 64, 67, 71], [50, 53, 57, 60, 64], [53, 57, 60, 64], [55, 59, 62, 65, 69]],
    kick: FOUR,
    clap: BACKBEAT,
    hatsA: "x...x...x...x...",
    hatsB: "x..xx..xx..xx..x",
    perc: "...........x....",
    bass: [ROOT, null, null, null, null, null, FIFTH, null, BELOW, null, null, null, null, null, FIFTH, null],
    keys: "..x...x...x...x.",
  },
  {
    title: "Red-Eye",
    kind: "house",
    bpm: 120,
    swing: 0.1,
    // Fmaj9 · Am7 · Dm9 · Bbmaj7
    chords: [[53, 57, 60, 64, 67], [57, 60, 64, 67], [50, 53, 57, 60, 64], [58, 62, 65, 69]],
    kick: FOUR,
    clap: BACKBEAT,
    hatsA: OFFBEAT,
    hatsB: "x.o.x.o.x.o.x.o.",
    perc: "...x......x.....",
    bass: [ROOT, null, ROOT, OCTAVE, null, null, FIFTH, null, ROOT, null, ROOT, OCTAVE, null, FIFTH, null, FIFTH],
    keys: "..x...x...x...x.",
    stab: "..x...x...x...x.",
    hook: [null, 19, null, 12, null, null, 24, null, null, 19, null, 12, null, 19, null, null],
  },
  {
    title: "Apron Nine",
    kind: "lo-fi",
    bpm: 80,
    swing: 0.32,
    // Cmaj9 · Am9 · Fmaj9 · G7sus
    chords: [[60, 64, 67, 71, 74], [57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [55, 60, 62, 65]],
    kick: "x...x...x.....x.",
    clap: BACKBEAT,
    hatsA: "x.x.x.x.x.x.x.x.",
    hatsB: "x.oxx.oxx.oxx.o.",
    perc: "...x........x...",
    bass: [ROOT, null, null, null, null, null, null, FIFTH, ROOT, null, null, null, BELOW, null, null, null],
    keys: "..x...x...x...x.",
  },
  {
    title: "Slipstream",
    kind: "house",
    bpm: 124,
    swing: 0.08,
    // Am7 · Fmaj7 · G6 · Em7
    chords: [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]],
    kick: FOUR,
    clap: BACKBEAT,
    hatsA: OFFBEAT,
    hatsB: "x.oox.oox.oox.oo",
    perc: "...x......x.....",
    bass: [ROOT, ROOT, null, OCTAVE, null, ROOT, null, FIFTH, ROOT, ROOT, null, OCTAVE, null, FIFTH, OCTAVE, FIFTH],
    keys: "..x...x...x...x.",
    shaker: "x.xxx.xxx.xxx.xx",
    hook: [12, null, null, 19, null, 12, 19, null, null, null, 24, null, null, 19, null, 12],
  },
  {
    title: "Long Haul",
    kind: "house",
    bpm: 112,
    swing: 0.18,
    // Dm9 · Bbmaj7 · Gm9 · Am7
    chords: [[50, 53, 57, 60, 64], [58, 62, 65, 69], [55, 58, 62, 65, 69], [57, 60, 64, 67]],
    kick: FOUR,
    clap: BACKBEAT,
    hatsA: "x...x...x...x...",
    hatsB: OFFBEAT,
    perc: "..x.......x.....",
    bass: [ROOT, null, null, null, null, null, FIFTH, null, ROOT, null, null, null, BELOW, null, null, FIFTH],
    keys: "...x..x....x..x.",
    stab: ".x..x..x..x..x..",
    shaker: "..x.x.x.x.x.x.x.",
    hook: [null, null, 12, null, null, 19, null, null, 14, null, null, 12, null, null, 19, null],
  },

  // ── The funky side ────────────────────────────────────────────────────────────
  // The floor-facing half of the record: a clipped chord stab off the beat, a bass that
  // walks under it, a shaker riding the sixteenths, and one short hook that returns
  // every few bars — the part that is still in the head after the page is closed. Every
  // hook note is a root, a fifth or an octave of the chord under it, so the line can
  // repeat over the whole progression without ever landing wrong.
  {
    title: "Funky Tower",
    kind: "funky",
    bpm: 122,
    swing: 0.12,
    // Fm9 · A♭maj7 · B♭m9 · C7
    chords: [[53, 56, 60, 63, 67], [56, 60, 63, 67], [58, 61, 65, 68, 72], [48, 52, 55, 58]],
    kick: FOUR,
    clap: BACKBEAT,
    hatsA: OFFBEAT,
    hatsB: "x.oox.oox.oox.oo",
    perc: "...x......x.....",
    shaker: "..x.x.x.x.x.x.x.",
    bass: [ROOT, null, ROOT, FIFTH, null, ROOT, null, OCTAVE, ROOT, null, ROOT, FIFTH, null, OCTAVE, FIFTH, BELOW],
    keys: "...x...x...x..x.",
    stab: "..x...x...x...x.",
    hook: [null, null, 19, null, null, 24, null, 19, null, 19, null, 14, 19, null, null, 12],
  },
  {
    title: "Disco Arrivals",
    kind: "funky",
    bpm: 118,
    swing: 0.08,
    // Cmaj7 · Am7 · Fmaj7 · G7
    chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]],
    kick: FOUR,
    clap: BACKBEAT,
    hatsA: OFFBEAT,
    hatsB: "x.o.x.o.x.oox.oo",
    perc: "...x...x..x.....",
    shaker: "x.x.x.x.x.x.x.x.",
    bass: [ROOT, ROOT, null, OCTAVE, null, ROOT, FIFTH, null, ROOT, ROOT, null, OCTAVE, null, FIFTH, OCTAVE, FIFTH],
    keys: "x...x...x...x...",
    stab: "..x..x..x..x..x.",
    hook: [12, null, null, 19, null, 12, null, null, 24, null, 19, null, 12, null, null, 19],
  },
  {
    title: "Afro Terminal",
    kind: "funky",
    bpm: 124,
    swing: 0.14,
    // Dm9 · Fmaj7 · G7 · Cmaj7
    chords: [[50, 53, 57, 60, 64], [53, 57, 60, 64], [55, 59, 62, 65], [48, 52, 55, 58]],
    kick: "x...x...x..x....",
    clap: BACKBEAT,
    hatsA: "..x...x...x...x.",
    hatsB: "x.o.x.o.x.o.x.o.",
    perc: "x..x..x...x..x..",
    shaker: "x.xxx.xxx.xxx.xx",
    bass: [ROOT, null, ROOT, null, FIFTH, null, ROOT, null, OCTAVE, null, ROOT, null, FIFTH, null, BELOW, null],
    keys: "..x.....x.......",
    hook: [null, 19, null, null, 12, null, 14, null, null, 19, null, null, 24, null, 19, null],
  },
  {
    title: "Night Bus",
    kind: "deep",
    bpm: 120,
    swing: 0.1,
    // Am9 · Fmaj7 · Gm7 · Dm7
    chords: [[57, 60, 64, 67, 71], [53, 57, 60, 64], [55, 58, 62, 65], [50, 53, 57, 60]],
    kick: FOUR,
    clap: BACKBEAT,
    hatsA: OFFBEAT,
    hatsB: "x..x..x..x..x..x",
    perc: ".......x........",
    shaker: "..x...x...x...x.",
    bass: [ROOT, null, null, FIFTH, null, null, ROOT, null, OCTAVE, null, null, FIFTH, null, null, ROOT, null],
    keys: "....x.......x...",
    stab: "..x...x...x...x.",
    hook: [null, null, 12, null, null, null, 19, null, null, null, 12, null, 14, null, null, null],
  },
  {
    title: "Gantry Groove",
    kind: "funky",
    bpm: 121,
    swing: 0.16,
    // B♭maj7 · Gm7 · Fmaj7 · Cmaj7
    chords: [[58, 62, 65, 69], [55, 58, 62, 65], [53, 57, 60, 64], [60, 64, 67, 71]],
    kick: FOUR,
    clap: BACKBEAT,
    hatsA: "x...x...x...x...",
    hatsB: "x.o.x.o.x.o.x.o.",
    perc: "...x......x..x..",
    shaker: "x.x.x.x.x.x.x.x.",
    bass: [ROOT, ROOT, null, OCTAVE, ROOT, null, FIFTH, null, ROOT, ROOT, null, OCTAVE, ROOT, null, FIFTH, BELOW],
    keys: "x..x..x...x..x..",
    stab: ".x...x...x...x..",
    hook: [19, null, null, 24, null, 19, null, 12, null, 19, null, null, 24, null, 19, null],
  },
  {
    title: "Turbine",
    kind: "funky",
    bpm: 128,
    swing: 0.06,
    // Em7 · Cmaj7 · G7 · Dm7
    chords: [[52, 55, 59, 62], [48, 52, 55, 58], [55, 59, 62, 65], [50, 54, 57, 60]],
    kick: FOUR,
    clap: BACKBEAT,
    hatsA: OFFBEAT,
    hatsB: "x.oox.oox.oox.oo",
    perc: "...x..x...x..x..",
    shaker: "x.xxx.xxx.xxx.xx",
    bass: [ROOT, null, ROOT, ROOT, OCTAVE, null, ROOT, FIFTH, ROOT, null, ROOT, ROOT, OCTAVE, null, FIFTH, OCTAVE],
    keys: "x.x.x.x.x.x.x.x.",
    stab: "..x...x...x...x.",
    hook: [24, null, 19, 24, null, 19, 24, null, 19, null, 24, 19, null, 19, null, 24],
  },

  // The record turns over: the second side is 1993 — synthwave, dreamwave, vaporwave and
  // chillsynth, so the device's own station carries the whole late-night dial.
  ...STATION_1993,
];

// Named handles, so a room can lean on a particular record without knowing its index —
// and keep leaning on it after the running order of the record changes.
export const HOUSE_SIDE = {
  standby: PLAYLIST[0],
  redEye: PLAYLIST[1],
  apronNine: PLAYLIST[2],
  slipstream: PLAYLIST[3],
  longHaul: PLAYLIST[4],
  funkyTower: PLAYLIST[5],
  discoArrivals: PLAYLIST[6],
  afroTerminal: PLAYLIST[7],
  nightBus: PLAYLIST[8],
  gantryGroove: PLAYLIST[9],
  turbine: PLAYLIST[10],
};

// How each genre on the record is mixed: how hard the kick sits, how bright the hats run,
// how far the bass leans forward, and how much vinyl is under it. The 1993 side is mixed
// the way those records were — a softer kick, the hat wide open, the bass carrying the
// top line, and the tape pulled back under everything.
const MIX = {
  "lo-fi": { kick: 0.42, hat: 0.035, bass: 0.2, vinyl: 0.14 },
  house: { kick: 0.5, hat: 0.042, bass: 0.24, vinyl: 0.06 },
  synthwave: { kick: 0.55, hat: 0.05, bass: 0.27, vinyl: 0.04 },
  dreamwave: { kick: 0.46, hat: 0.038, bass: 0.23, vinyl: 0.05 },
  vaporwave: { kick: 0.4, hat: 0.03, bass: 0.2, vinyl: 0.16 },
  chillsynth: { kick: 0.44, hat: 0.036, bass: 0.22, vinyl: 0.1 },
  // The funky side is a club record: the kick sits hardest, the hats are right up, and
  // the bass leans further forward because it is carrying the groove.
  funky: { kick: 0.54, hat: 0.048, bass: 0.26, vinyl: 0.05 },
  deep: { kick: 0.5, hat: 0.032, bass: 0.27, vinyl: 0.08 },
};
const mix = (kind) => MIX[kind] || MIX.house;

let ctx = null;
let master = null;
let dry = null;
let melody = null; // every voice with a pitch; the kick ducks this bus
let duck = null;
let echo = null;
let room = null;
let delayNode = null;
let noise = null;
let timer = 0;
let nextTime = 0;
let step = 0;
let bar = 0;
let index = 0;
// The record currently loaded: the house playlist unless a surface hands over its own.
let queue = PLAYLIST;
let queueKey = "house";
// Each track plays this many bars, then the record moves on through the playlist.
const TRACK_BARS = 32;
const listeners = new Set();
const announce = () => listeners.forEach((fn) => fn(queue[index]));
let playing = false;
let ctxBound = false;

// ── The deck ────────────────────────────────────────────────────────────────────
// The record is played shuffled. A deck is dealt for every playlist and walked to the
// end, then dealt again — so a room's own set never runs in the order it was written,
// and no track ever comes up twice in a row.
let order = [];
let orderPos = 0;
let shift = 0; // semitones the current record is playing in
let sounding = null; // the pitch class the last record was sounding in

const rootPc = (track) => ((track.chords[0][0] % 12) + 12) % 12;

function deal(avoid) {
  order = queue.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.length > 1 && order[0] === avoid) {
    const j = 1 + Math.floor(Math.random() * (order.length - 1));
    [order[0], order[j]] = [order[j], order[0]];
  }
  orderPos = 0;
}

// A record is never dropped in on a remote key: it is played the fewest semitones from
// the one that just left, so a change of record sounds like a change of record and never
// like a mistake.
function nearest(from, to) {
  if (from == null) return 0;
  let d = (((to - from) % 12) + 12) % 12;
  if (d > 6) d -= 12;
  return d;
}

deal(-1);

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const drift = () => (Math.random() - 0.5) * DRIFT;
// The slow, wide genres take the darker voices: a longer kick, a brushed clap, the pad
// an octave-down mood under the keys.
const SOFT_KINDS = new Set(["lo-fi", "vaporwave", "dreamwave"]);
const lofi = () => SOFT_KINDS.has(queue[index].kind);

// A gain that rises fast and falls away — every voice in here is built on it.
function env(gain, at, level, attack, decay) {
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
}

// The audio context is the shell's own, so the music and the control blips share one
// clock. It is only asked for on a real press, which is what lets the browser allow
// playback at all.
function ensure() {
  const ac = shellAudio();
  if (!ac) return false;
  ctx = ac;

  if (!master) {
    // The console's own level, and the only thing that is muted: everything below
    // hangs off it, so stopping the record stops every voice and the tape at once.
    master = ac.createGain();
    master.gain.value = 0;
    const tone = ac.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 5200; // a speaker in a case, never a bright room
    const glue = ac.createDynamicsCompressor();
    glue.threshold.value = -20;
    glue.knee.value = 14;
    glue.ratio.value = 3;
    glue.attack.value = 0.02;
    glue.release.value = 0.3;
    master.connect(tone).connect(glue).connect(ac.destination);

    dry = ac.createGain();
    dry.connect(master);

    // The groove bus: everything with a pitch rides it, and the kick ducks it. That dip
    // under every beat is the pump the whole record breathes with. The drums stay off it
    // so the floor never loses its footing.
    duck = ac.createGain();
    duck.gain.value = 1;
    duck.connect(master);
    melody = ac.createGain();
    melody.connect(duck);

    // Dotted-eighth echo. The delay time is re-set for each record, because an
    // echo that is out of time with its own track is just mud.
    delayNode = ac.createDelay(1.5);
    const feed = ac.createGain();
    feed.gain.value = 0.36;
    const damp = ac.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 2600;
    const echoOut = ac.createGain();
    echoOut.gain.value = 0.32;
    delayNode.connect(damp).connect(feed).connect(delayNode);
    delayNode.connect(echoOut).connect(melody);
    echo = ac.createGain();
    echo.connect(delayNode);

    // A room, generated once: noise with an exponential tail.
    const len = Math.floor(ac.sampleRate * 1.4);
    const ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch += 1) {
      const data = ir.getChannelData(ch);
      for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const convolver = ac.createConvolver();
    convolver.buffer = ir;
    const soften = ac.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.value = 2600;
    const roomOut = ac.createGain();
    roomOut.gain.value = 0.4;
    convolver.connect(soften).connect(roomOut).connect(melody);
    room = ac.createGain();
    room.connect(convolver);

    // Tape: a continuous band of hiss, only ever heard while the record plays,
    // because the master is what it hangs from.
    const hissFrames = Math.floor(ac.sampleRate * 2);
    const hissBuf = ac.createBuffer(1, hissFrames, ac.sampleRate);
    const hissData = hissBuf.getChannelData(0);
    for (let i = 0; i < hissFrames; i += 1) hissData[i] = Math.random() * 2 - 1;
    const hiss = ac.createBufferSource();
    hiss.buffer = hissBuf;
    hiss.loop = true;
    const hissHigh = ac.createBiquadFilter();
    hissHigh.type = "highpass";
    hissHigh.frequency.value = 1600;
    const hissGain = ac.createGain();
    hissGain.gain.value = 0.015;
    hiss.connect(hissHigh).connect(hissGain).connect(master);
    hiss.start();
  }

  if (!noise) {
    const frames = Math.floor(ac.sampleRate * 0.4);
    noise = ac.createBuffer(1, frames, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
  }

  // The clock freezes while the context is parked, so when it starts running mid-loop
  // the bar is re-anchored to now: the record resumes rather than catching up on
  // everything it missed.
  if (!ctxBound) {
    ctxBound = true;
    ac.addEventListener("statechange", () => {
      if (playing && ac.state === "running") {
        step = 0;
        bar = 0;
        nextTime = ac.currentTime + 0.06;
      }
    });
  }

  return true;
}

// ── The kit ──────────────────────────────────────────────────────────────────────

// A sine dropping from 112Hz to 44: soft, round, and gone before the bass arrives.
function kick(at, level = 0.5) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(112, at);
  osc.frequency.exponentialRampToValueAtTime(44, at + 0.16);
  env(gain, at, level, 0.006, lofi() ? 0.3 : 0.22);
  osc.connect(gain).connect(dry);
  osc.start(at);
  osc.stop(at + 0.42);
}

// One voice for everything struck: a burst of noise through a band, which is a hat
// up at 9000, a snare around 1700 and a rim between the two.
function struck(at, level, decay, freq, q) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.85 + Math.random() * 0.3;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = freq;
  band.Q.value = q;
  const gain = ctx.createGain();
  env(gain, at, level, 0.003, decay);
  src.connect(band).connect(gain).connect(dry);
  src.start(at);
  src.stop(at + decay + 0.06);
}

function hat(at, open, level) {
  struck(at, level, open ? 0.2 : 0.032, open ? 7600 : 9200, 0.7);
}

// Three bursts eight milliseconds apart is a clap; one burst alone is a snare.
function clap(at) {
  [0, 0.008, 0.017].forEach((offset) => struck(at + offset, 0.085, 0.1, 1650, 0.85));
  struck(at, lofi() ? 0.05 : 0.03, 0.16, 320, 0.6);
}

// The Rhodes-ish key: a sine with a fast second harmonic over it, which is the tine.
// It answers to the echo and to the room, because that is where a keys part lives.
function key(at, midi, decay, level) {
  const f = hz(midi);
  const body = ctx.createOscillator();
  body.type = "sine";
  body.frequency.value = f;
  body.detune.value = drift();
  const tine = ctx.createOscillator();
  tine.type = "sine";
  tine.frequency.value = f * 2.01;
  const tineGain = ctx.createGain();
  env(tineGain, at, level * 0.5, 0.002, 0.14);
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2300;
  const gain = ctx.createGain();
  env(gain, at, level, 0.012, decay);
  tine.connect(tineGain).connect(tone);
  body.connect(tone);
  tone.connect(gain);
  gain.connect(melody);
  gain.connect(echo);
  gain.connect(room);
  body.start(at);
  tine.start(at);
  body.stop(at + decay + 0.12);
  tine.stop(at + decay + 0.12);
}

// A triangle an octave low, filtered down to a round bass with a hint of glide.
function bassNote(at, midi, decay, level) {
  const f = hz(midi);
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.detune.value = drift() * 0.5;
  osc.frequency.setValueAtTime(f * 1.012, at);
  osc.frequency.exponentialRampToValueAtTime(f, at + 0.06);
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = lofi() ? 280 : 360;
  const gain = ctx.createGain();
  env(gain, at, level, 0.02, decay);
  osc.connect(tone).connect(gain).connect(melody);
  osc.start(at);
  osc.stop(at + decay + 0.12);
}

// The bed: two saws a few cents apart per note, drawn in slowly and left to ring
// away into the room. Quiet on purpose.
function pad(at, chord, decay) {
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 1400;
  tone.Q.value = 0.6;
  const swell = ctx.createGain();
  swell.gain.setValueAtTime(0.0001, at);
  swell.gain.linearRampToValueAtTime(0.5, at + 0.7);
  swell.gain.setTargetAtTime(0.0001, at + decay, 0.4);
  tone.connect(swell).connect(room).connect(melody);
  chord.slice(0, 4).forEach((midi) => {
    [-7, 7].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = hz(midi);
      osc.detune.value = cents;
      const voice = ctx.createGain();
      voice.gain.value = 0.07;
      osc.connect(voice).connect(tone);
      osc.start(at);
      osc.stop(at + decay + 1.8);
    });
  });
}

// The pump: the kick takes the groove bus down with it and the bus breathes back over a
// beat. Booked on the audio clock, so it never depends on a frame arriving.
function sidechain(at) {
  if (!duck) return;
  duck.gain.setValueAtTime(1, at);
  duck.gain.linearRampToValueAtTime(0.58, at + 0.014);
  duck.gain.setTargetAtTime(1, at + 0.05, 0.11);
}

// The chord stab: the sound the funky side is built on. Two saws a few cents apart on
// three notes, through a filter that clamps shut behind the hit — a clipped organ chord,
// off the beat, gone in a tenth of a second.
function stab(at, chord, level) {
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.setValueAtTime(4200, at);
  tone.frequency.exponentialRampToValueAtTime(900, at + 0.13);
  tone.Q.value = 1.2;
  const gain = ctx.createGain();
  env(gain, at, level, 0.004, 0.14);
  tone.connect(gain);
  gain.connect(melody);
  gain.connect(echo);
  chord.slice(0, 3).forEach((midi) => {
    [-6, 6].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = hz(midi);
      osc.detune.value = cents;
      osc.connect(tone);
      osc.start(at);
      osc.stop(at + 0.22);
    });
  });
}

// The hook: a thin bell-pluck high over the chord, and its own echo answering it. This is
// the line that makes a loop stick, so it is deliberately the simplest voice in the kit.
function pluck(at, midi, level) {
  const f = hz(midi);
  const body = ctx.createOscillator();
  body.type = "triangle";
  body.frequency.value = f;
  const tine = ctx.createOscillator();
  tine.type = "sine";
  tine.frequency.value = f * 3.01;
  const tineGain = ctx.createGain();
  env(tineGain, at, level * 0.3, 0.002, 0.07);
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 5200;
  const gain = ctx.createGain();
  env(gain, at, level, 0.004, 0.28);
  tine.connect(tineGain).connect(tone);
  body.connect(tone);
  tone.connect(gain);
  gain.connect(melody);
  gain.connect(echo);
  body.start(at);
  tine.start(at);
  body.stop(at + 0.42);
  tine.stop(at + 0.42);
}

// A shaker: the same struck noise as a hat, but higher, tighter and a touch irregular —
// it is what makes a sixteenth pattern sound played rather than typed.
function shaker(at, level) {
  struck(at, level, 0.035, 6200 + Math.random() * 1800, 1.6);
}

// The hand-off between two records: a band of noise sweeping up under the last bar of the
// old track and cutting dead as the new one lands. It is what makes a shuffled change of
// key sound like a DJ move instead of a skip.
function riser(at, duration) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 1.1;
  band.frequency.setValueAtTime(420, at);
  band.frequency.exponentialRampToValueAtTime(6800, at + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.09, at + duration * 0.92);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration + 0.06);
  src.connect(band).connect(gain).connect(master);
  src.start(at);
  src.stop(at + duration + 0.1);
}

// ── The record ───────────────────────────────────────────────────────────────────

// Bars 0–3 are the A section, 4–7 the B: the hats open up, a percussion line comes
// in and the pad arrives under the keys. An eight-bar cycle is long enough that the
// loop does not announce itself.
const isBSection = (at) => at % 8 >= 4;

function playStep(at) {
  const track = queue[index];
  const base = track.chords[bar % track.chords.length];
  // Every record is played in the key the deck tuned it to, so a shuffled change of
  // record never lands a semitone from the last one.
  const chord = shift ? base.map((n) => n + shift) : base;
  const beat = 60 / track.bpm / 4;
  const busy = isBSection(bar);
  const ending = queue.length > 1 && bar === TRACK_BARS - 1;

  const levels = mix(track.kind);

  if (track.kick[step] === "x") {
    kick(at, levels.kick);
    sidechain(at);
  }
  if (track.clap[step] === "x") clap(at);

  const hats = busy ? track.hatsB : track.hatsA;
  if (hats[step] === "o") hat(at, true, 0.055);
  else if (hats[step] === "x") hat(at, false, levels.hat);

  if (busy && track.shaker && track.shaker[step] === "x") shaker(at, 0.026);
  if (busy && track.perc[step] === "x") struck(at, 0.05, 0.06, 2500, 1.5);

  const offset = track.bass[step];
  if (offset != null) bassNote(at, chord[0] + offset, beat * 1.7, levels.bass);

  // The last bar of a record hands the floor over: the melody drops out, a roll builds
  // across the second half, and a riser carries the next track in on the change.
  if (ending) {
    if (step === 8) riser(at, beat * 8);
    if (step >= 8 && step % 2 === 0) struck(at, 0.026 + (step - 8) * 0.007, 0.07, 1900, 1.1);
    return;
  }

  if (track.stab && track.stab[step] === "x") stab(at, chord, 0.034);

  // The hook comes in with the B section: the groove has four bars on its own first, so
  // the line lands as a lift rather than as wallpaper.
  if (busy && track.hook && track.hook[step] != null) {
    pluck(at, chord[0] + track.hook[step], 0.055);
  }

  if (track.keys[step] === "x") {
    const voicing = busy ? chord : chord.slice(0, 4);
    voicing.forEach((midi, i) => key(at, midi + (i === 0 ? 0 : 12), beat * 1.6, 0.045));
  }

  // The pad is laid down once a bar, on the downbeat of the B section only.
  if (busy && step === 0) pad(at, chord, beat * STEPS);

  // The record itself: a crackle under everything, denser on the lo-fi loops.
  if (Math.random() < levels.vinyl) {
    struck(at + Math.random() * beat, 0.02, 0.004, 2400 + Math.random() * 2400, 0.7);
  }
}

// A lookahead scheduler: notes are booked into the audio clock ahead of real time, so
// the record keeps its tempo even when the phone drops frames. Odd sixteenths are
// pushed back by the track's own swing — the grid stays even and the playing does not.
function pump() {
  if (!ctx) return;
  const track = queue[index];
  const beat = 60 / track.bpm / 4;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    // Never book a note into the past: a context that was paused for a moment must
    // not come back as one bar played all at once.
    const at = Math.max(nextTime, ctx.currentTime + 0.005) + (step % 2 ? beat * track.swing : 0);
    playStep(at);
    nextTime += beat;
    step += 1;
    if (step >= STEPS) {
      step = 0;
      bar += 1;
      // The playlist plays through: a single-track scene theme keeps looping.
      if (bar >= TRACK_BARS && queue.length > 1) {
        nextTrack();
        return;
      }
    }
  }
}

// A surface loads its own playlist (a room, a character's theme). The same key twice is
// a no-op, so a room's record is never restarted by a re-render.
export function loadPlaylist(key, tracks, startAt = 0) {
  if (!tracks?.length || key === queueKey) return;
  queue = tracks;
  queueKey = key;
  // Every surface gets a freshly dealt deck: two rooms built from the same records never
  // run them in the same order.
  deal(-1);
  // A surface opens on a random record from its own deck, unless it asks for one by index.
  index = startAt ? Math.min(startAt, tracks.length - 1) : order[0];
  shift = Math.round(nearest(sounding, rootPc(queue[index])));
  sounding = (rootPc(queue[index]) + shift + 12) % 12;
  setMusicKey(sounding);
  step = 0;
  bar = 0;
  if (ctx) nextTime = Math.max(nextTime, ctx.currentTime + 0.06);
  setTiming();
  announce();
}

export function onTrackChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setTiming() {
  if (!delayNode || !ctx) return;
  delayNode.delayTime.setTargetAtTime((60 / queue[index].bpm) * 0.75, ctx.currentTime, 0.05);
}

export function isPlaying() {
  return playing;
}

export function currentTrack() {
  return queue[index];
}

export function getVolume() {
  return level;
}

// Turning the knob while the record is playing is heard at once; turning it in silence
// simply sets where the next loop will start.
export function setVolume(next) {
  const wanted = Number(next);
  level = Number.isFinite(wanted) ? Math.min(1, Math.max(0, wanted)) : level;
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(MASTER * level, ctx.currentTime, 0.06);
  }
  return level;
}

export function playPlaylist() {
  if (!ensure()) return false;
  if (!playing) {
    step = 0;
    bar = 0;
    nextTime = ctx.currentTime + 0.06;
    setTiming();
  }
  if (!timer) timer = setInterval(pump, TICK_MS);
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(MASTER * level, ctx.currentTime, 0.12);
  playing = true;
  return true;
}

export function stopPlaylist() {
  playing = false;
  if (timer) {
    clearInterval(timer);
    timer = 0;
  }
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
  }
}

export function nextTrack() {
  orderPos += 1;
  // The deck is walked to its end and then dealt again, so the set is always shuffled
  // but never stutters on the same track twice.
  if (orderPos >= order.length) deal(index);
  index = order[orderPos] ?? order[0] ?? 0;
  // The transposition stays inside an octave by folding, never by clamping: a shift of
  // twelve is the same key, so folding costs nothing while a clamp would cost the tune.
  let folded = shift + nearest(sounding, rootPc(queue[index]));
  while (folded > 6) folded -= 12;
  while (folded < -6) folded += 12;
  shift = folded;
  sounding = (rootPc(queue[index]) + shift + 12) % 12;
  setMusicKey(sounding);
  step = 0;
  bar = 0;
  setTiming();
  announce();
  return queue[index];
}