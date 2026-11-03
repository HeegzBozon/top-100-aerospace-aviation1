import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';

// A reader's private notes on one page, and whatever the masthead has written back.
//
// The privacy is the database's, not this hook's: every record carries the email of the
// reader whose thread it belongs to, and the entity's access rules let a reader at their
// own threads and an admin at every thread. So this asks for the page, and what comes
// back is exactly what the person asking is allowed to see.
export default function usePageComments({ issue, page, pageNumber, pageLabel, active }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (live) setUser(me || null);
      } catch (e) {
        // Reading without an account is allowed; the notes simply ask them to sign in.
        if (live) setUser(null);
      } finally {
        if (live) setReady(true);
      }
    })();
    return () => { live = false; };
  }, []);

  const pageId = page?.id;

  const load = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await base44.entities.PageComment.filter(
        { page_id: pageId },
        { sort: 'created_date', limit: 200 },
      );
      setComments(res.items || []);
    } catch (e) {
      setError('Your notes on this page could not be opened.');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  // Nothing is fetched until the margin is opened: a reader turning pages does not ask
  // the database for notes they are not reading.
  useEffect(() => {
    if (!ready || !active) return;
    if (!user) {
      setLoading(false);
      return;
    }
    load();
  }, [ready, user, active, load]);

  const context = useCallback(() => ({
    issue_id: issue?.id || '',
    issue_title: issue?.title || '',
    page_id: pageId || '',
    page_number: pageNumber || 0,
    page_label: pageLabel || '',
  }), [issue?.id, issue?.title, pageId, pageNumber, pageLabel]);

  // One writer for both ends of a conversation: a note that opens a thread, and a reply
  // posted into one. A reply carries the thread's owner, which is what lets the platform
  // answer a reader inside the reader's own thread.
  const write = useCallback(async (body, root = null) => {
    const text = String(body || '').trim();
    if (!text || !user || !pageId) return false;
    setSending(true);
    setError(null);
    try {
      await base44.entities.PageComment.create({
        ...context(),
        thread_owner_email: root?.thread_owner_email || user.email,
        thread_owner_name: root?.thread_owner_name || user.full_name || user.email,
        parent_id: root?.id || '',
        body: text,
        author_email: user.email,
        author_name: user.full_name || user.email,
        author_role: user.role === 'admin' ? 'admin' : 'user',
      });
      await load();
      return true;
    } catch (e) {
      setError('That note could not be sent. Try again.');
      return false;
    } finally {
      setSending(false);
    }
  }, [context, load, pageId, user]);

  const threads = useMemo(() => {
    const roots = comments.filter((c) => !c.parent_id);
    const ordered = [...roots].sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)));
    return ordered.map((root) => ({
      root,
      replies: comments
        .filter((c) => c.parent_id === root.id)
        .sort((a, b) => String(a.created_date).localeCompare(String(b.created_date))),
    }));
  }, [comments]);

  return {
    ready,
    user,
    isAdmin: user?.role === 'admin',
    threads,
    threadCount: threads.length,
    loading: ready && Boolean(user) && loading,
    error,
    sending,
    addNote: (body) => write(body),
    addReply: (root, body) => write(body, root),
    retry: load,
  };
}