// The audit's own inks. A finding is not a warning: severity says what it costs the house,
// confidence says how sure the reading is. The two are drawn differently on purpose so a
// likely risk is never mistaken for a confirmed one.

export const SEVERITY_TONE = {
  critical: {
    label: 'Critical',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-[#f2a1a1]/45 bg-[#f2a1a1]/10 text-[#f2a1a1]',
    rule: 'bg-[#f2a1a1]',
    ink: 'text-[#f2a1a1]',
  },
  high: {
    label: 'High',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-[#e0a96b]/45 bg-[#e0a96b]/10 text-[#e0a96b]',
    rule: 'bg-[#e0a96b]',
    ink: 'text-[#e0a96b]',
  },
  medium: {
    label: 'Medium',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-editorial-gold/45 bg-editorial-gold/10 text-editorial-gold',
    rule: 'bg-editorial-gold',
    ink: 'text-editorial-gold',
  },
  low: {
    label: 'Low',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-[#85c1e9]/40 bg-[#85c1e9]/10 text-[#85c1e9]',
    rule: 'bg-[#85c1e9]',
    ink: 'text-[#85c1e9]',
  },
};

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

export const CONFIDENCE_TONE = {
  confirmed: { label: 'Confirmed in code', ink: 'text-[#8ad4a8]', dot: 'bg-[#8ad4a8]' },
  likely: { label: 'Likely', ink: 'text-editorial-gold', dot: 'bg-editorial-gold' },
  unknown: { label: 'Unknown', ink: 'text-[#7d97ad]', dot: 'bg-[#7d97ad]' },
};

// A rung of a journey: is the instrument there or not?
export const STAGE_TONE = {
  recorded: {
    label: 'Recorded',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-[#8ad4a8]/40 bg-[#8ad4a8]/10 text-[#8ad4a8]',
    mark: 'bg-[#8ad4a8]',
  },
  partial: {
    label: 'Partly',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-[#e0a96b]/40 bg-[#e0a96b]/10 text-[#e0a96b]',
    mark: 'bg-[#e0a96b]',
  },
  missing: {
    label: 'No instrument',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-[#f2a1a1]/35 bg-[#f2a1a1]/10 text-[#f2a1a1]',
    mark: 'bg-[#f2a1a1]',
  },
  unverified: {
    label: 'Unverified',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-[#85c1e9]/35 bg-[#85c1e9]/10 text-[#85c1e9]',
    mark: 'bg-[#85c1e9]',
  },
};

export const NURTURE_TONE = {
  live: {
    label: 'Live',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-[#8ad4a8]/40 bg-[#8ad4a8]/10 text-[#8ad4a8]',
  },
  manual: {
    label: 'By hand',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-editorial-gold/40 bg-editorial-gold/10 text-editorial-gold',
  },
  missing: {
    label: 'None',
    chip: 'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] border-[#f2a1a1]/35 bg-[#f2a1a1]/10 text-[#f2a1a1]',
  },
};

export const EFFORT_LABEL = {
  small: 'A day',
  medium: 'A few days',
  large: 'A cycle',
};

export const plural = (count, one, many) => `${count.toLocaleString()} ${count === 1 ? one : many}`;