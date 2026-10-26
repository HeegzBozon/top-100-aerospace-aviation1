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

function context() {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioContext) audioContext = new AudioCtor();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

const TONES = {
  tick: [1180, 0.018],
  move: [430, 0.035],
  select: [660, 0.06],
  open: [760, 0.07],
  back: [300, 0.05],
  start: [900, 0.09],
  toggle: [540, 0.045],
};

export function blip(kind = "select") {
  // "tick" is the detent click of the wheel — the shortest sound in the kit.
  if (!isSoundOn()) return;
  const ac = context();
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