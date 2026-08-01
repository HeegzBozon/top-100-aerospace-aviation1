// De-identification helpers for the blind "judge" voting view.
// Strip what identifies the person; keep everything that justifies the judgment.

export const DISCIPLINE_LABELS = {
  space_rd: 'Space R&D',
  commercial_aviation: 'Commercial Aviation',
  defense: 'Defense',
  manufacturing: 'Manufacturing',
  operations: 'Operations',
  engineering: 'Engineering',
  policy: 'Policy',
  entrepreneurship: 'Entrepreneurship',
};

// Discipline + domain (kept). Employer name (stripped).
export function disciplineLabel(n) {
  if (!n) return '';
  return DISCIPLINE_LABELS[n.discipline] || n.industry || '';
}

// Derive an employer TYPE + SCALE label without naming the employer.
// e.g. "Enterprise · 5,000+ staff" or "Startup · <50 staff · $10M+ budget".
export function orgScaleLabel(n) {
  if (!n) return '';
  const lm = n.leadership_metrics || {};
  const im = n.impact_metrics || {};
  const team = lm.team_size_managed || im.teams_influenced_size || 0;
  const budget = lm.budget_responsibility || 0;

  let scale = '';
  if (team >= 5000) scale = '5,000+ staff';
  else if (team >= 1000) scale = '1,000–5,000 staff';
  else if (team >= 200) scale = '200–1,000 staff';
  else if (team >= 50) scale = '50–200 staff';
  else if (team > 0) scale = '<50 staff';

  let budgetTier = '';
  if (budget >= 1e9) budgetTier = '$1B+ budget';
  else if (budget >= 1e8) budgetTier = '$100M+ budget';
  else if (budget >= 1e7) budgetTier = '$10M+ budget';

  let type = '';
  if (team >= 1000) type = 'Enterprise';
  else if (team >= 200) type = 'Mid-size';
  else if (team > 0) type = 'Startup / SME';

  return [type, scale, budgetTier].filter(Boolean).join(' · ');
}

// Region (kept). Country is stripped to avoid thin-field identification.
export function regionLabel(n) {
  return n?.continent || '';
}

// Flightography: career trajectory with employer NAMES stripped.
export function careerTrajectory(n) {
  const history = Array.isArray(n?.career_history) ? n.career_history : [];
  return history
    .map((c) => ({
      role: c.role_title || '',
      period: [c.start_date, c.end_date].filter(Boolean).join(' — '),
      description: c.description || '',
    }))
    .filter((c) => c.role || c.description);
}

// Quantitative signal counts — evidence, not identity.
export function metricCounts(n) {
  const im = n?.impact_metrics || {};
  const lm = n?.leadership_metrics || {};
  const innov = n?.innovation_metrics || {};
  return {
    teamSize: lm.team_size_managed || im.teams_influenced_size || 0,
    patents: innov.patents_filed || im.patents_count || 0,
    startups: innov.startups_founded || 0,
    publications: im.research_publications || 0,
    missions: im.missions_flown || 0,
    awards: (lm.awards || []).length,
  };
}