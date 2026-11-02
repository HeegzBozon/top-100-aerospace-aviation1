// Meteorological seasons: Winter Dec–Feb, Spring Mar–May, Summer Jun–Aug, Fall Sep–Nov.
const NAMES = ['Winter', 'Spring', 'Summer', 'Fall'];
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function seasonFor(date = new Date()) {
  const m = date.getMonth();
  const idx = m === 11 ? 0 : Math.floor((m + 1) / 3);
  const year = m === 11 ? date.getFullYear() + 1 : date.getFullYear();
  return buildSeason(idx, year);
}

function buildSeason(idx, year) {
  const startMonth = idx === 0 ? 11 : idx * 3 - 1; // Dec, Mar, Jun, Sep
  const startYear = idx === 0 ? year - 1 : year;
  const start = new Date(startYear, startMonth, 1);
  const end = new Date(startYear, startMonth + 3, 0);
  const months = [0, 1, 2].map((i) => new Date(startYear, startMonth + i, 1));
  const quarters = [...new Set(months.map((d) => `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`))];
  return { idx, year, name: `${NAMES[idx]} ${year}`, start: iso(start), end: iso(end), months, quarters };
}

export function shiftSeason(s, step) {
  let idx = s.idx + step, year = s.year;
  if (idx > 3) { idx = 0; year += 1; }
  if (idx < 0) { idx = 3; year -= 1; }
  return buildSeason(idx, year);
}

export const inSeason = (date, s) => !!date && date.slice(0, 10) >= s.start && date.slice(0, 10) <= s.end;