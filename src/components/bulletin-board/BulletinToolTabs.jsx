import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { orderedBulletinTools, toolByKey } from './bulletinConfig';
import { useBulletins } from './useBulletins';
import BulletinPost from './BulletinPost';

function Tab({ active, onClick, icon: Icon, label, accent }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-colors shrink-0 whitespace-nowrap"
      style={{ background: active ? B.navy : 'transparent', color: active ? '#fff' : B.muted }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: active ? '#fff' : accent }} />
      {label}
    </button>
  );
}

// The 70% reading surface. Renders the Fellow's enabled tools as horizontal
// pill tabs, each loading its own bulletins via useBulletins.
export default function BulletinToolTabs({ tools, authorEmail, accent, isOwner, onEditPost }) {
  const ordered = orderedBulletinTools(tools).filter((k) => toolByKey(k).postType);
  const [active, setActive] = useState(ordered[0]);
  const tool = toolByKey(active);
  const { items, loading, remove } = useBulletins(authorEmail, tool.postType);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try { await remove(id); } finally { setDeletingId(null); }
  };

  return (
    <div className="min-w-0 flex flex-col gap-3">
      <div
        className="flex items-center gap-1 rounded-full p-1 w-fit max-w-full overflow-x-auto scrollbar-hide"
        style={{ background: B.cream, border: `1px solid ${B.border}` }}
      >
        {ordered.map((key) => {
          const t = toolByKey(key);
          const Icon = t.icon;
          return (
            <Tab
              key={key}
              active={active === key}
              onClick={() => setActive(key)}
              icon={Icon}
              label={t.label}
              accent={accent}
            />
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin" style={{ color: B.muted }} /></div>
      ) : items.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{ border: `1px dashed ${B.border}`, background: B.cream }}
        >
          <p className="text-sm italic" style={{ color: B.muted }}>{tool.emptyState}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((post) => (
            <BulletinPost
              key={post.id}
              post={post}
              accent={accent}
              isOwner={isOwner}
              onEdit={onEditPost}
              onDelete={handleDelete}
              deleting={deletingId === post.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}