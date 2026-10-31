import { Check } from 'lucide-react';
import { EPISODE_TRACK, EPISODE_ASIDE, trackIndex } from './episodeStages';

const COPPER = '#B87333';
const NAVY = '#1E3A5A';
const LABEL = '#8F5C2C';

// The pipeline, read end to end. A stage already passed is filled; the stage the
// episode stands in now is the one named beside the track. Nothing is hidden to
// make progress look better than it is.
export default function EpisodeStatusTrack({ status, compact }) {
  const at = trackIndex(status);
  const aside = EPISODE_ASIDE[status];

  return (
    <div>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {EPISODE_TRACK.map((stage, i) => {
          const done = at >= i;
          const current = at === i;
          return (
            <li key={stage.key} className="flex items-center gap-2">
              <span
                className="flex h-4 w-4 flex-none items-center justify-center rounded-full"
                style={{
                  background: done ? COPPER : 'transparent',
                  border: done ? `1px solid ${COPPER}` : '1px solid rgba(30,58,90,0.25)',
                }}
              >
                {done && <Check className="h-2.5 w-2.5" strokeWidth={3} color="#FAF8F5" />}
              </span>
              <span
                className={`font-body ${compact ? 'text-[9px]' : 'text-[10px]'} uppercase tracking-[0.16em]`}
                style={{
                  color: current ? NAVY : done ? 'rgba(30,58,90,0.7)' : 'rgba(30,58,90,0.35)',
                  fontWeight: current ? 700 : 500,
                }}
              >
                {stage.label}
              </span>
              {i < EPISODE_TRACK.length - 1 && (
                <span
                  aria-hidden="true"
                  className="mx-1 h-px w-3"
                  style={{ background: done ? 'rgba(184,115,51,0.5)' : 'rgba(30,58,90,0.15)' }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {aside && (
        <p className="mt-3 font-body text-[10px] uppercase tracking-[0.2em]" style={{ color: LABEL }}>
          {aside.label}
        </p>
      )}
    </div>
  );
}