import { musicKey } from "./musicKey";

// Tactile feedback for the handheld shell: a short square-wave blip per control
// plus a 10ms haptic tick. Audio is created lazily on the first press so the
// browser's autoplay policy never blocks it, and the SOUND control remembers
// the choice.
const STORAGE_KEY = "top100-handheld-sound";

let audioContext = null;

export function isSoundOn() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function persistSound(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Storage unavailable — the toggle stays session-only.
  }
}

// iOS sends web audio to the "ambient" session, which the hardware ring/silent
// switch mutes — so the console can look like it is playing and make no sound at
// all. Asking for the playback session is what puts the speaker past that switch.
// Browsers without the API ignore this and the switch keeps its say.
function requestPlaybackSession() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = "playback";
  } catch {
    // Not supported — nothing to ask for.
  }
}

let unlockBound = false;

// A context may only start inside a real gesture. The first press normally does
// it, but a context the browser parked at load can survive that attempt, and a
// parked context is silence. So while one is suspended, any press or key is
// another chance to start it, and the listeners retire themselves once it runs.
function unlockOnGesture(ac) {
  const tryResume = () => {
    const settle = () => {
      if (ac.state !== "running") return;
      unlockBound = false;
      window.removeEventListener("pointerdown", tryResume, true);
      window.removeEventListener("keydown", tryResume, true);
    };
    let started;
    try {
      started = ac.resume();
    } catch {
      return;
    }
    if (started && typeof started.then === "function") started.then(settle, () => {});
    else settle();
  };

  tryResume();
  if (ac.state !== "running" && !unlockBound) {
    unlockBound = true;
    window.addEventListener("pointerdown", tryResume, true);
    window.addEventListener("keydown", tryResume, true);
  }
}

// The shell's one audio context: the blips below and the onboard music
// (consoleMusic.js) share it, so the device has a single clock. Created lazily on the
// first press, which is what lets the browser allow sound at all.
export function shellAudio() {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioContext) {
    requestPlaybackSession();
    audioContext = new AudioCtor();
  }
  if (audioContext.state === "suspended") unlockOnGesture(audioContext);
  return audioContext;
}

// The blips are tuned to the record that is playing. Each control is a degree of the
// same minor pentatonic the record sits in, so a press is a note under the music rather
// than a beep beside it — the machine sounds like one instrument with the record.
const SCALE = [0, 3, 5, 7, 10]; // minor pentatonic
const TONES = {
  move: [2, 0.035, 12],
  select: [3, 0.06, 12],
  open: [4, 0.07, 12],
  back: [0, 0.05, 0],
  start: [5, 0.09, 12],
  toggle: [1, 0.045, 12],
};

const noteHz = (degree, octave) => {
  const midi = 48 + musicKey() + octave + SCALE[degree % 5] + 12 * Math.floor(degree / 5);
  return 440 * Math.pow(2, (midi - 69) / 12);
};

export function blip(kind = "select") {
  if (!isSoundOn()) return;
  const ac = shellAudio();
  if (!ac) return;
  const [degree, duration, octave] = TONES[kind] || TONES.select;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "square";
  osc.frequency.value = noteHz(degree, octave);
  gain.gain.setValueAtTime(0.0001, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.045, ac.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration + 0.02);
}

export function buzz(ms = 10) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch {
    // Vibration unsupported — silent.
  }
}