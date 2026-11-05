import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The Fellow's own block list, read once per surface and held as a set of addresses
// so a feed can drop a blocked author's rows as it renders them. A block is personal
// to the Fellow who made it — it holds nothing back from anyone else.
const norm = (value) => String(value || '').trim().toLowerCase();

export default function useAuthorBlocks(viewerEmail) {
  const [blocked, setBlocked] = useState(() => new Set());

  useEffect(() => {
    if (!viewerEmail) return undefined;
    let live = true;
    base44.entities.AuthorBlock.filter({ blocker_email: viewerEmail })
      .then((rows) => {
        if (live) setBlocked(new Set((rows || []).map((row) => norm(row.blocked_email))));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [viewerEmail]);

  // The row is already on the server by the time this is called; the set only moves
  // so the author's content leaves the surface on the same tap.
  const block = useCallback((email) => {
    setBlocked((prev) => new Set(prev).add(norm(email)));
  }, []);

  return { blocked, block };
}