// THE RECORD PLAYER
//
// The machine plays masters, not arithmetic. Two audio elements are held — one
// sounding, one loading — so a record can be handed to the next without a gap: the
// one leaving fades out on the same beat the arriving one fades in on.
//
// Everything a surface needs is here and nothing more: the deck it asked for, walked
// shuffled and dealt again when it runs out, the record that is playing, and the
// volume the chin's knob holds. A surface never touches an audio element.

import { HOUSE_DECK } from './musicLibrary';

const FADE = 900; // ms of handover between one record and the next
const BASE = 0.6; // how loud a record sits under the shell's own sounds

let queue = HOUSE_DECK;
let queueKey = 'house';
let index = 0;
let deck = [];
let deckPos = 0;
let playing = false;
let level = 1;
let live = 0; // which of the two elements is sounding

const els = [];
const listeners = new Set();

const announce = () => listeners.forEach((fn) => fn(queue[index]));

// A deck is the surface's own order: dealt at random, walked to its end, then dealt
// again with the record that just finished kept out of the first slot.
function deal(avoid) {
  deck = queue.map((_, i) => i);
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (deck.length > 1 && deck[0] === avoid) {
    const j = 1 + Math.floor(Math.random() * (deck.length - 1));
    [deck[0], deck[j]] = [deck[j], deck[0]];
  }
  deckPos = 0;
}

// The console's own deck is dealt before anything is asked for, so its first record is
// the first card of its shuffled set rather than the top of a written list.
deal(-1);
index = deck[0] ?? 0;

// A record is faded, never cut: silence where a master stops mid-phrase is heard as a
// fault in the machine rather than as the end of a tune.
function fadeTo(audio, to, ms = FADE) {
  clearInterval(audio.handover);
  const from = audio.volume;
  const started = Date.now();
  audio.handover = setInterval(() => {
    const k = Math.min(1, (Date.now() - started) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) return;
    clearInterval(audio.handover);
    audio.handover = 0;
    if (to === 0) audio.pause();
  }, 20);
}

function element(i) {
  if (!els[i]) {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = 0;
    audio.handover = 0;
    // A record that runs out is the deck's cue, exactly as a hold on the speaker is.
    audio.addEventListener('ended', () => {
      if (playing && els[live] === audio) nextTrack();
    });
    els[i] = audio;
  }
  return els[i];
}

function start(track) {
  const next = els.length ? 1 - live : 0;
  const leaving = els[live];
  if (leaving && !leaving.paused) fadeTo(leaving, 0);
  const audio = element(next);
  audio.src = track.src;
  audio.currentTime = 0;
  audio.volume = 0;
  // A browser may refuse the cue — a handover landing on top of another, a record
  // replaced while it was still loading. The speaker's own lamp already reports what
  // the machine is doing, so the refusal is dropped rather than shown to the reader.
  const cue = audio.play();
  if (cue && cue.catch) cue.catch(() => {});
  fadeTo(audio, BASE * level);
  live = next;
}

// A surface loads its own deck (a room, a character's theme). The same key twice is a
// no-op, so a re-render never restarts a room's record.
export function loadPlaylist(key, tracks, startAt = 0) {
  if (!tracks?.length || key === queueKey) return;
  queue = tracks;
  queueKey = key;
  deal(-1);
  // A surface opens on a record from its own deck, so two surfaces built from the same
  // masters never open on the same tune.
  index = startAt ? Math.min(startAt, tracks.length - 1) : deck[0];
  announce();
  if (playing) start(queue[index]);
}

export function onTrackChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
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

export function setVolume(next) {
  const wanted = Number(next);
  level = Number.isFinite(wanted) ? Math.min(1, Math.max(0, wanted)) : level;
  const audio = els[live];
  if (audio && playing) audio.volume = BASE * level;
  return level;
}

export function playPlaylist() {
  if (typeof Audio === 'undefined') return false;
  if (!playing) {
    playing = true;
    start(queue[index]);
    return true;
  }
  // Already on, but the element was stopped underneath us: pick it back up.
  const audio = els[live];
  if (audio && audio.paused) {
    const cue = audio.play();
    if (cue && cue.catch) cue.catch(() => {});
    fadeTo(audio, BASE * level, 400);
  }
  return true;
}

export function stopPlaylist() {
  playing = false;
  els.forEach((audio) => {
    if (!audio.paused) fadeTo(audio, 0, 420);
  });
}

export function nextTrack() {
  deckPos += 1;
  // The deck is walked to its end and then dealt again, so a surface's set is always
  // shuffled and never stutters on the same record twice.
  if (deckPos >= deck.length) deal(index);
  index = deck[deckPos] ?? deck[0] ?? 0;
  announce();
  if (playing) start(queue[index]);
  return queue[index];
}

// What the record is, in one line, for a surface that has to print the credit: the work,
// who made it, the licence it travels under, and the page it came from. A Creative Commons
// attribution is only complete with all four, so a surface that shows the title hands the
// reader this.
export function trackCredit(track) {
  if (!track) return '';
  return [track.title, track.artist, track.licence, track.credit].filter(Boolean).join(' · ');
}