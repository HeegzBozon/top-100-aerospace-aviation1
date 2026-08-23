import { B } from '@/components/fellow-home/fellowHomeConfig';

export const JOB_TYPE_LABELS = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  temporary: 'Temporary',
  fellowship: 'Fellowship',
};

export const EXP_LABELS = {
  entry: 'Entry',
  mid: 'Mid',
  senior: 'Senior',
  executive: 'Executive',
  intern: 'Intern',
};

export const REMOTE_LABELS = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
  flexible: 'Flexible',
};

export const labelOf = (map, v) => map[v] || (v ? v.replace(/_/g, ' ') : '');