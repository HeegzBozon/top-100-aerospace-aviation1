import { shellAudio } from "./handheldSound";

// The console's onboard music: five instrumental loops — three house, two lo-fi —
// written as note data rather than loaded as files, so the device carries its own
// soundtrack. Nothing to fetch, nothing to licence, and no loop ever ends on a gap.
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
  },
];

let ctx = null;
let master = null;
let dry = null;
let echo = null;
let room = null;
let delayNode = null;
let noise = null;
let timer = 0;
let nextTime = 0;
let step = 0;
let bar = 0;
let index = 0;
let playing = false;
let ctxBound = false;

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const drift = () => (Math.random() - 0.5) * DRIFT;
const lofi = () => PLAYLIST[index].kind === "lo-fi";

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
    delayNode.connect(echoOut).connect(master);
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
    convolver.connect(soften).connect(roomOut).connect(master);
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
  gain.connect(dry);
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
  osc.connect(tone).connect(gain).connect(dry);
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
  tone.connect(swell).connect(room).connect(dry);
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

// ── The record ───────────────────────────────────────────────────────────────────

// Bars 0–3 are the A section, 4–7 the B: the hats open up, a percussion line comes
// in and the pad arrives under the keys. An eight-bar cycle is long enough that the
// loop does not announce itself.
const isBSection = (at) => at % 8 >= 4;

function playStep(at) {
  const track = PLAYLIST[index];
  const chord = track.chords[bar % track.chords.length];
  const beat = 60 / track.bpm / 4;
  const busy = isBSection(bar);

  if (track.kick[step] === "x") kick(at, track.kind === "lo-fi" ? 0.42 : 0.5);
  if (track.clap[step] === "x") clap(at);

  const hats = busy ? track.hatsB : track.hatsA;
  if (hats[step] === "o") hat(at, true, 0.055);
  else if (hats[step] === "x") hat(at, false, track.kind === "lo-fi" ? 0.035 : 0.042);

  if (busy && track.perc[step] === "x") struck(at, 0.05, 0.06, 2500, 1.5);

  const offset = track.bass[step];
  if (offset != null) bassNote(at, chord[0] + offset, beat * 1.7, track.kind === "lo-fi" ? 0.2 : 0.24);

  if (track.keys[step] === "x") {
    const voicing = busy ? chord : chord.slice(0, 4);
    voicing.forEach((midi, i) => key(at, midi + (i === 0 ? 0 : 12), beat * 1.6, 0.045));
  }

  // The pad is laid down once a bar, on the downbeat of the B section only.
  if (busy && step === 0) pad(at, chord, beat * STEPS);

  // The record itself: a crackle under everything, denser on the lo-fi loops.
  if (Math.random() < (track.kind === "lo-fi" ? 0.14 : 0.06)) {
    struck(at + Math.random() * beat, 0.02, 0.004, 2400 + Math.random() * 2400, 0.7);
  }
}

// A lookahead scheduler: notes are booked into the audio clock ahead of real time, so
// the record keeps its tempo even when the phone drops frames. Odd sixteenths are
// pushed back by the track's own swing — the grid stays even and the playing does not.
function pump() {
  if (!ctx) return;
  const track = PLAYLIST[index];
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
    }
  }
}

function setTiming() {
  if (!delayNode || !ctx) return;
  delayNode.delayTime.setTargetAtTime((60 / PLAYLIST[index].bpm) * 0.75, ctx.currentTime, 0.05);
}

export function isPlaying() {
  return playing;
}

export function currentTrack() {
  return PLAYLIST[index];
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
  index = (index + 1) % PLAYLIST.length;
  step = 0;
  bar = 0;
  setTiming();
  return PLAYLIST[index];
}