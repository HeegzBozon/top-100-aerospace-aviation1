// Short synthesized effects, no files fetched.
let ctx = null;
const ac = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());

function tone(c, freq, at, dur, type = 'square', vol = 0.12) {
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(c.destination);
  o.start(at); o.stop(at + dur + 0.02);
}

// The stamp: a rubber thunk on the page, then a bright rising chime.
export function playStampSfx() {
  const c = ac();
  if (c.state === 'suspended') c.resume();
  const t = c.currentTime;
  tone(c, 140, t, 0.12, 'triangle', 0.3);
  tone(c, 70, t, 0.18, 'sine', 0.3);
  [784, 988, 1175, 1568].forEach((f, i) => tone(c, f, t + 0.14 + i * 0.08, 0.32, 'square', 0.07));
  tone(c, 2093, t + 0.5, 0.6, 'sine', 0.06);
}