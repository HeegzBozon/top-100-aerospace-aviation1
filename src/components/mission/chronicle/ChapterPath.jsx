import { CHAPTERS } from './missionConfig';
import MissionRow from './MissionRow';
import DialogueScene from './DialogueScene';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The season's path, chapter by chapter. The chapters are the hero's journey in the
// institution's register; the missions inside them are the actual work of the cycle.
// Nothing is gated except the turning of the cycle itself, so a Fellow can move at
// whatever pace the week allows and always see what is still open.
export default function ChapterPath({ completed, choices, activeKey, onOpen, onFinish, onChoose, saving }) {
  const allDone = CHAPTERS.filter((chapter) => chapter.key !== 'turning').every((chapter) =>
    chapter.missions.every((mission) => completed.includes(mission.key)),
  );

  return (
    <div className="mt-8 space-y-7">
      {CHAPTERS.map((chapter) => {
        const doneCount = chapter.missions.filter((mission) => completed.includes(mission.key)).length;
        const closed = doneCount === chapter.missions.length;
        const locked = chapter.missions[0].unlockAfter === 'all' && !allDone;

        return (
          <section key={chapter.key} aria-labelledby={`chapter-${chapter.key}`}>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
                  {chapter.index} · {chapter.stage}
                </p>
                <h3 id={`chapter-${chapter.key}`} className="mt-1 font-heading text-lg md:text-xl" style={{ color: B.navy }}>
                  {chapter.label}
                </h3>
              </div>
              <span className="flex-none text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: closed ? B.copper : 'rgba(30,58,90,0.38)' }}>
                {closed ? 'Complete' : `${doneCount}/${chapter.missions.length}`}
              </span>
            </div>
            <p className="mt-1 max-w-xl text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
              {chapter.lede}
            </p>

            <div role="list" className="mt-2">
              {chapter.missions.map((mission) => (
                <div key={mission.key}>
                  <MissionRow
                    mission={{ ...mission, value: choices?.[mission.choiceKey] || null }}
                    done={completed.includes(mission.key)}
                    active={activeKey === mission.key}
                    locked={locked}
                    onOpen={onOpen}
                  />
                  {activeKey === mission.key && !locked ? (
                    <div className="pb-3">
                      <DialogueScene mission={mission} onFinish={onFinish} onChoose={onChoose} saving={saving} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}