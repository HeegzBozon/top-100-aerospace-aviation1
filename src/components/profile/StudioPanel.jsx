import { Camera, PenLine, TrendingUp, ArrowRight, Check } from "lucide-react";
import { SITTINGS, SITTING_FIELDS, countFilled } from "@/components/profile/wizard/sittings";
import { B } from "@/components/fellow-home/fellowHomeConfig";

const ICONS = { viral: TrendingUp, photographer: Camera, biographer: PenLine };

// The Studio, read on the glass: the sittings that make the record, each one
// opening the wizard at that sitting. The bars read the record as it stands —
// what has been saved — never the half-finished draft, so they never promise
// more than the profile can show.
export default function StudioPanel({ user, nominee, settings, onOpenSitting }) {
  const record = {
    ...(user || {}),
    avatar_url: user?.avatar_url || nominee?.avatar_url,
    industry_role: user?.industry_role || nominee?.title,
    six_word_story: settings?.six_word_story || user?.six_word_story,
    bio: user?.bio || nominee?.bio,
  };

  return (
    <div className="px-3 pb-4 pt-3">
      <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
        Three Sittings
      </p>
      <h2 className="mt-1.5 font-heading text-[19px] font-semibold leading-tight" style={{ color: B.navy }}>
        Your profile is made by a few good hands.
      </h2>
      <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
        One takes the portrait. One takes the record. One takes the post that traveled. Sit with any,
        or walk the whole studio.
      </p>

      <div className="mt-3 space-y-2.5">
        {SITTINGS.map((sitting) => {
          const Icon = ICONS[sitting.id];
          const fields = SITTING_FIELDS[sitting.id];
          const filled = countFilled(fields, record);
          const complete = filled === fields.length;
          const isEditorial = sitting.id === "viral";

          return (
            <button
              key={sitting.id}
              type="button"
              onClick={() => onOpenSitting([sitting.id])}
              className="w-full rounded-2xl px-3 py-3 text-left transition-[transform,box-shadow] duration-200 active:scale-[0.99]"
              style={{
                background: "rgba(255,255,255,0.86)",
                border: `1px solid ${isEditorial ? "rgb(201 168 124 / 0.55)" : B.border}`,
                boxShadow: "0 1px 2px rgba(7,17,31,0.05)",
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: isEditorial ? "rgba(201,168,124,0.15)" : "rgba(30,58,90,0.06)",
                    border: `1px solid ${B.border}`,
                  }}
                >
                  <Icon className="h-[16px] w-[16px]" style={{ color: isEditorial ? B.copper : B.navy }} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span
                      className="text-[8.5px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: isEditorial ? B.copper : B.gold }}
                    >
                      {sitting.chapter}
                    </span>
                    <span className="text-[8.5px] uppercase tracking-[0.14em]" style={{ color: B.muted }}>
                      {sitting.minutes}
                    </span>
                  </div>

                  <p className="mt-0.5 font-heading text-[15px] font-semibold leading-snug" style={{ color: B.navy }}>
                    {sitting.name}
                  </p>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: B.muted }}>
                    {sitting.covers}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 w-14 rounded-full" style={{ background: "rgba(30,58,90,0.10)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(filled / fields.length) * 100}%`,
                          background: complete ? B.gold : B.copper,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: complete ? B.copper : B.muted }}>
                      {complete ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" /> On the record
                        </span>
                      ) : (
                        `${filled} of ${fields.length} answered`
                      )}
                    </span>
                    <ArrowRight className="ml-auto h-3.5 w-3.5" style={{ color: B.navy }} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onOpenSitting(SITTINGS.map((sitting) => sitting.id))}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold transition-opacity active:opacity-80"
        style={{ background: B.navy, color: "#fff" }}
      >
        Sit for all <ArrowRight className="h-3.5 w-3.5" />
      </button>

      <p className="mt-2 text-center text-[10.5px]" style={{ color: B.muted }}>
        Nothing publishes until you say so at the end.
      </p>
    </div>
  );
}