import { B } from '@/components/fellow-home/fellowHomeConfig';
import { orderedBulletinTools, toolByKey } from './bulletinConfig';

// The 30% compose rail. Renders a compose button per enabled tool.
// Clicking opens the composer seeded with that tool's post_type.
export default function BulletinComposeRail({ tools, accent, onCompose }) {
  const ordered = orderedBulletinTools(tools);

  return (
    <div
      className="h-full rounded-2xl p-3 flex flex-col gap-2"
      style={{ background: B.cream, border: `1px solid ${B.border}` }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] px-1" style={{ color: B.muted }}>
        Bulletin Board
      </span>
      <div className="flex flex-col gap-1.5">
        {ordered.map((key) => {
          const tool = toolByKey(key);
          const Icon = tool.icon;
          return (
            <button
              key={key}
              onClick={() => onCompose(tool.postType)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-left transition-colors hover:bg-black/[0.04]"
              style={{ color: B.navy, border: `1px solid ${B.navy}14` }}
            >
              <Icon className="w-4 h-4" style={{ color: accent }} />
              Compose {tool.label}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] italic leading-snug mt-auto px-1" style={{ color: B.muted }}>
        Your board, your voice. Dispatches and notes publish to your profile.
      </p>
    </div>
  );
}