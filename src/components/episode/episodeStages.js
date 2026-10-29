// The production pipeline for a Fellow's episode.
//
// The mini-documentary on a record is the foundation; the intake is where that
// foundation becomes a scheduled conversation. The track below is the whole
// pipeline, in order, so both the Fellow and the editorial desk read the same
// stages. Nothing here touches measurement — an episode is editorial matter.

export const EPISODE_TRACK = [
  {
    key: 'intake',
    label: 'Intake',
    note: 'The Fellow has opened their episode. The record is the foundation; the desk has not read it yet.',
  },
  {
    key: 'in_review',
    label: 'In review',
    note: 'The editorial desk is reading the intake alongside the documentary record.',
  },
  {
    key: 'approved',
    label: 'Approved',
    note: 'The episode is greenlit. Production will be in touch to hold a date.',
  },
  {
    key: 'scheduled',
    label: 'Scheduled',
    note: 'A recording date is held on both calendars.',
  },
  {
    key: 'recorded',
    label: 'Recorded',
    note: 'The conversation is in the can. Nothing further is needed from the Fellow.',
  },
  {
    key: 'edited',
    label: 'In the cut',
    note: 'The episode is being edited and scored for release.',
  },
  {
    key: 'published',
    label: 'Published',
    note: 'The episode is live as part of this record.',
  },
];

// Stages that sit off the track: a request for more material, or a decision not
// to proceed. Both are real states and both are shown plainly.
export const EPISODE_ASIDE = {
  changes_requested: {
    label: 'More needed',
    note: 'The desk has asked the Fellow for something before the episode can move on.',
  },
  declined: {
    label: 'Not proceeding',
    note: 'The desk is not taking this episode forward at the moment.',
  },
};

export const EPISODE_STATUSES = [
  ...EPISODE_TRACK.map((s) => s.key),
  ...Object.keys(EPISODE_ASIDE),
];

export const EPISODE_FORMATS = [
  { key: 'audio', label: 'Audio' },
  { key: 'video', label: 'Filmed' },
  { key: 'either', label: 'Either' },
];

export const EPISODE_SETTINGS = [
  { key: 'in_person', label: 'In person' },
  { key: 'remote', label: 'Remote' },
  { key: 'either', label: 'Either' },
];

export const trackIndex = (status) => EPISODE_TRACK.findIndex((s) => s.key === status);

export const stageLabel = (status) =>
  EPISODE_TRACK.find((s) => s.key === status)?.label || EPISODE_ASIDE[status]?.label || 'Intake';

export const stageNote = (status) =>
  EPISODE_TRACK.find((s) => s.key === status)?.note || EPISODE_ASIDE[status]?.note || '';

// Where the desk can move the episode next. A record only ever moves forward
// along the track, or is set aside from wherever it stands.
export const nextStages = (status) => {
  if (status === 'published' || status === 'declined') return [];
  const at = trackIndex(status);
  if (at < 0) return EPISODE_TRACK.slice(1);
  return EPISODE_TRACK.slice(at + 1);
};

export const isLiveEpisode = (status) => status === 'approved'
  || status === 'scheduled'
  || status === 'recorded'
  || status === 'edited'
  || status === 'published';

export const episodeLabel = (format) =>
  EPISODE_FORMATS.find((f) => f.key === format)?.label || '';

export const episodeSettingLabel = (setting) =>
  EPISODE_SETTINGS.find((s) => s.key === setting)?.label || '';