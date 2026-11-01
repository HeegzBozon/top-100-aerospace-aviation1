// How the cast lives in their rooms. Each character wanders short errands around their post,
// pauses to look about, and, when a colleague is close by, sometimes walks over for a chat.
// Purely visual: nothing here decides anything or touches a record.
const STEP_MS = 380;
const RANGE = 4;
const LINES = ['…', 'Ha!', '!', '♪', '?', '…!'];

const rnd = (n) => Math.floor(Math.random() * n);
const dirOf = (dc, dr) => (Math.abs(dc) >= Math.abs(dr) ? (dc < 0 ? 'left' : 'right') : (dr < 0 ? 'up' : 'down'));

export function stepCast(npcs, brain, now, blocked) {
  npcs.forEach((n) => {
    const b = brain[n.id] || (brain[n.id] = { col: n.col, row: n.row, facing: 'down', next: now + rnd(2000), target: null, mode: 'idle' });
    if (now < b.next) return;
    if (b.mode === 'chat') { b.mode = 'idle'; b.chatWith = null; b.line = null; b.next = now + 1500 + rnd(2500); return; }
    if (!b.target) {
      // Choose: visit a colleague nearby (1 in 4), wander an errand, or simply look around.
      const pal = npcs.find(o => o.id !== n.id && brain[o.id] && brain[o.id].mode !== 'chat'
        && Math.hypot(brain[o.id].col - b.col, brain[o.id].row - b.row) < 9);
      const roll = Math.random();
      if (pal && roll < 0.25) b.target = { col: brain[pal.id].col + (brain[pal.id].col > b.col ? -1 : 1), row: brain[pal.id].row, pal: pal.id };
      else if (roll < 0.75) b.target = { col: n.col + rnd(RANGE * 2 + 1) - RANGE, row: n.row + rnd(5) - 2 };
      else { b.facing = ['down', 'left', 'right', 'up'][rnd(4)]; b.next = now + 1200 + rnd(2400); return; }
    }
    const dc = Math.sign(b.target.col - b.col), dr = Math.sign(b.target.row - b.row);
    if (!dc && !dr) {
      const pal = b.target.pal && brain[b.target.pal];
      if (pal) {
        // Arrived beside a colleague: both turn in and trade a line.
        b.facing = dirOf(pal.col - b.col, 0); pal.facing = dirOf(b.col - pal.col, 0);
        b.mode = pal.mode = 'chat'; b.chatWith = b.target.pal; pal.chatWith = n.id;
        b.line = LINES[rnd(LINES.length)]; pal.line = LINES[rnd(LINES.length)];
        b.next = pal.next = now + 3200 + rnd(1800);
      } else b.next = now + 900 + rnd(2600);
      b.target = null;
      return;
    }
    const nc = b.col + dc, nr = dc ? b.row : b.row + dr;
    if (blocked(nc, nr)) { b.target = null; b.next = now + 600; return; }
    b.col = nc; b.row = nr; b.facing = dirOf(dc, dc ? 0 : dr); b.next = now + STEP_MS;
  });
  return brain;
}