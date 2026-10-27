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

const TONES = {
  move: [430, 0.035],
  select: [660, 0.06],
  open: [760, 0.07],
  back: [300, 0.05],
  start: [900, 0.09],
  toggle: [540, 0.045],
};

export function blip(kind = "select") {
  if (!isSoundOn()) return;
  const ac = shellAudio();
  if (!ac) return;
  const [freq, duration] = TONES[kind] || TONES.select;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
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