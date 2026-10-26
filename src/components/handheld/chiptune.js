import { shellAudio } from "./handheldSound";

// The console's onboard music. Five loops written as note data rather than loaded
// as files, so the device carries its own soundtrack: nothing to fetch, nothing to
// licence, and no loop ever ends on a gap. They are house records played on a sound
// chip — four-on-the-floor kick, an open hat on the offbeat, a clap on two and four,
// a rolling bass, and a square-wave arpeggio walking the chord of the bar. Every
// line is transposed into one register per part (bass low, stabs middle, arp high),
// so a progression can be written naturally and still sit right.

const STEPS = 16; // sixteenth notes: one bar
const LOOKAHEAD = 0.16; // seconds of music kept scheduled ahead of the clock
const TICK_MS = 25;
const MASTER = 0.4;

const RHYTHM = {
  kick: "x...x...x...x...",
  clap: "....x.......x...",
  eight: "x.x.x.x.x.x.x.x.",
  offbeat: "..o...o...o...o.", // 'o' = open hat, 'x' = closed
  stab: "..x...x...x...x.",
};

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// A triad is written wherever it reads naturally, then shifted by whole octaves
// until its root lands in the stab register (A3–G#4). One rule, so the bass and the
// arpeggio are derived from the root instead of typed out chord by chord.
const inRegister = (triad) => {
  let shift = 0;
  while (triad[0] + shift < 57) shift += 12;
  while (triad[0] + shift > 68) shift -= 12;
  return triad.map((midi) => midi + shift);
};

export const PLAYLIST = [
  {
    title: "Pre-Flight",
    bpm: 122,
    wave: "square",
    hats: RHYTHM.eight,
    stabs: true,
    chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], // Am F C G
    bass: [0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 7, 12, 7],
    arp: [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 1, 3, 4, 2, 1, 0],
  },
  {
    title: "Ascent Stage",
    bpm: 124,
    wave: "square",
    hats: RHYTHM.offbeat,
    stabs: true,
    chords: [[48, 51, 55], [44, 48, 51], [51, 55, 58], [46, 50, 53]], // Cm Ab Eb Bb
    bass: [0, 0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 12, 7, 12, 7, 12],
    arp: [0, 1, 2, 4, 2, 1, 0, 2, 3, 2, 1, 3, 2, 4, 3, 4],
  },
  {
    title: "Orbit Insertion",
    bpm: 126,
    wave: "triangle",
    hats: RHYTHM.eight,
    stabs: false,
    chords: [[50, 53, 57], [55, 58, 62], [58, 62, 65], [57, 61, 64]], // Dm Gm Bb A
    bass: [0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 12, 0, 7, 0, 0, 0],
    arp: [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 2, 1, 0, 3, 4],
  },
  {
    title: "Re-Entry",
    bpm: 128,
    wave: "sawtooth",
    hats: RHYTHM.offbeat,
    stabs: true,
    chords: [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]], // Em C G D
    bass: [0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 7, 12, 7, 12],
    arp: [0, 3, 1, 4, 2, 4, 1, 3, 0, 3, 1, 4, 2, 1, 3, 4],
  },
  {
    title: "Night Watch",
    bpm: 118,
    wave: "triangle",
    hats: RHYTHM.offbeat,
    stabs: true,
    chords: [[53, 56, 60], [49, 53, 56], [56, 60, 63], [51, 55, 58]], // Fm Db Ab Eb
    bass: [0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 7, 0, 0],
    arp: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 2],
  },
];

let ctx = null;
let bus = null;
let noise = null;
let timer = 0;
let nextTime = 0;
let step = 0;
let bar = 0;
let index = 0;
let playing = false;
let ctxBound = false;

// The audio context is the shell's own, so the music and the control blips share
// one clock. It is only asked for on a real press, which is what lets the browser
// allow playback at all.
function ensure() {
  const ac = shellAudio();
  if (!ac) return false;
  ctx = ac;

  if (!bus) {
    bus = ac.createGain();
    bus.gain.value = 0;
    const speaker = ac.createBiquadFilter();
    speaker.type = "lowpass";
    speaker.frequency.value = 6800; // a console's speaker, not a studio monitor
    bus.connect(speaker).connect(ac.destination);
  }

  if (!noise) {
    const frames = Math.floor(ac.sampleRate * 0.35);
    noise = ac.createBuffer(1, frames, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
  }

  // The clock freezes while the context is parked, so when it starts running
  // mid-loop the bar is re-anchored to now: the music resumes rather than
  // catching up on everything it missed.
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

function note(type, freq, at, dur, level) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(bus);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

// One voice for the whole kit: a burst of noise through a band, which is a clap at
// 1900 Hz, a closed hat at 8200 and an open hat in between.
function drum(at, level, dur, freq) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = freq;
  band.Q.value = 0.9;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(level, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(band).connect(gain).connect(bus);
  src.start(at);
  src.stop(at + dur + 0.02);
}

function kickDrum(at) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, at);
  osc.frequency.exponentialRampToValueAtTime(46, at + 0.15);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.6, at + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2);
  osc.connect(gain).connect(bus);
  osc.start(at);
  osc.stop(at + 0.24);
}

function playStep(at) {
  const track = PLAYLIST[index];
  const chord = inRegister(track.chords[bar % track.chords.length]);
  const voicing = [chord[0], chord[1], chord[2], chord[0] + 12, chord[1] + 12];
  const beat = 60 / track.bpm / 4;

  if (RHYTHM.kick[step] === "x") kickDrum(at);
  if (RHYTHM.clap[step] === "x") drum(at, 0.15, 0.11, 1900);

  const hat = track.hats[step];
  if (hat === "o") drum(at, 0.1, 0.13, 7800);
  else if (hat === "x") drum(at, 0.07, 0.04, 8200);

  const bass = track.bass[step];
  if (bass != null) note("square", hz(chord[0] - 24 + bass), at, beat * 0.8, 0.17);

  const arp = track.arp[step];
  if (arp != null) note(track.wave, hz(voicing[arp] + 12), at, beat * 1.4, 0.075);

  if (track.stabs && RHYTHM.stab[step] === "x") {
    voicing.slice(0, 3).forEach((midi) => note("square", hz(midi), at, beat * 0.75, 0.05));
  }
}

// A lookahead scheduler: notes are booked into the audio clock ahead of real time,
// so the loop keeps its tempo even when the phone drops frames.
function pump() {
  if (!ctx) return;
  const beat = 60 / PLAYLIST[index].bpm / 4;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    // Never book a note into the past: a context that was paused for a moment
    // must not come back as one bar played all at once.
    playStep(Math.max(nextTime, ctx.currentTime + 0.005));
    nextTime += beat;
    step += 1;
    if (step >= STEPS) {
      step = 0;
      bar += 1;
    }
  }
}

export function isPlaying() {
  return playing;
}

export function currentTrack() {
  return PLAYLIST[index];
}

export function playPlaylist() {
  if (!ensure()) return false;
  if (!playing) {
    step = 0;
    bar = 0;
    nextTime = ctx.currentTime + 0.06;
  }
  if (!timer) timer = setInterval(pump, TICK_MS);
  bus.gain.cancelScheduledValues(ctx.currentTime);
  bus.gain.setTargetAtTime(MASTER, ctx.currentTime, 0.08);
  playing = true;
  return true;
}

export function stopPlaylist() {
  playing = false;
  if (timer) {
    clearInterval(timer);
    timer = 0;
  }
  if (ctx && bus) {
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
  }
}

export function nextTrack() {
  index = (index + 1) % PLAYLIST.length;
  step = 0;
  bar = 0;
  return PLAYLIST[index];
}