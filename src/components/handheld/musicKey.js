// The key the record is sounding in, held in one place so everything else on the machine
// can play along with it. The console's blips read it, so a press is a note in the same
// key as the music underneath rather than a beep beside it.
//
// Kept apart from consoleMusic.js on purpose: the sound module and the record module both
// import this, and neither imports the other.
let pitchClass = 9; // A — where the record sits until a track says otherwise

export function setMusicKey(pc) {
  const n = Number(pc);
  if (!Number.isFinite(n)) return;
  pitchClass = ((Math.round(n) % 12) + 12) % 12;
}

export function musicKey() {
  return pitchClass;
}