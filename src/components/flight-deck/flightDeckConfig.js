const DAY = 86400000;
const clamp01 = (n) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const upper = (s, fallback = "—") => (s ? String(s).replace(/_/g, " ").toUpperCase() : fallback);

// What the deck's instruments read. Every figure here is the dashboard's own
// state — the season on the calendar, the Fellow's ballot, the platform counters
// the columns are already showing — so the deck never opens a read of its own and
// can never disagree with the board beneath it.
export function buildDials({ current, phase, placed = 0 }) {
  const start = current?.start_date ? new Date(current.start_date).getTime() : null;
  const end = current?.end_date ? new Date(current.end_date).getTime() : null;
  const target = phase?.target ? new Date(phase.target).getTime() : null;
  const now = Date.now();

  const cycle = start && end && end > start ? clamp01((now - start) / (end - start)) : 0;
  const days = target ? Math.max(0, Math.ceil((target - now) / DAY)) : null;

  return [
    {
      key: "season",
      label: "Season",
      caption: current?.name || "No cycle on the calendar",
      readout: phase?.settled || days === null ? upper(phase?.label, "Between cycles") : `T−${days} days`,
      value: cycle,
      max: 1,
      tone: "copper",
    },
    {
      key: "affiliation",
      label: "Affiliation",
      caption: "My TOP 100, in order",
      readout: `${placed} of 8`,
      value: placed,
      max: 8,
      tone: "gold",
    },
  ];
}

// The ticker: the same strings the column cards print, cut to a terminal line.
export function buildTicker({ stats = {}, data, phase, placed = 0 }) {
  return [
    { k: "Season", v: upper(data?.current?.name, "No cycle open") },
    { k: "Phase", v: upper(phase?.label, "—") },
    { k: "Ballot", v: `${placed} / 8` },
    { k: "Availability", v: upper(stats.availability, "—") },
    { k: "Open roles", v: upper(stats.openRoles, "—") },
    { k: "Mission rooms", v: upper(stats.roomsOpen, "—") },
    { k: "Networks", v: upper(stats.networks, "—") },
    { k: "Archive", v: upper(stats.seasonsPast, "—") },
  ];
}

export const LIVE_PHASES = ["nominations_open", "voting_open", "review", "rollover"];