import { useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, MessageSquare, PenLine } from 'lucide-react';
import { registerSurfaceEditGroups } from '@/components/shell/surfaceFileMenu';
import { reasonLine } from '@/components/following/followingCopy';
import GlassIssueEditForm from '@/components/magazine/glass/GlassIssueEditForm';
import GlassIssueFilePanel from '@/components/magazine/glass/GlassIssueFilePanel';

// The issue's own Edit menu.
//
// Edit belongs to the machine — everything a Fellow authors — but a reader standing on a
// page of an issue has work of its own in it: a note to the masthead about what they have
// just read, or a correction proposed against the article as it stands. Both are filed
// against the page the reader was on, both are read by the masthead, and neither is printed
// into the issue by being filed.
//
// What a reader files here is kept apart from everything the institution measures with: a
// note is not an endorsement and not a vote, and nothing filed from this menu is read by
// discovery, ranking, or scoring.
export default function useIssueEditMenu({
  issue,
  pages = [],
  articles = [],
  position = 0,
  enabled = true,
  onBusy,
}) {
  const [work, setWork] = useState(null);
  const [me, setMe] = useState(undefined);

  useEffect(() => {
    let alive = true;
    base44.auth
      .me()
      .then((user) => alive && setMe(user || null))
      .catch(() => alive && setMe(null));
    return () => {
      alive = false;
    };
  }, []);

  const page = pages[position] || null;

  // The article standing on the page the reader is on: on a profile page it is her profile,
  // on a page of writing it is the piece itself.
  const article = useMemo(() => {
    const id = page?.article_id;
    return (id && articles.find((entry) => entry.id === id)) || null;
  }, [page?.article_id, articles]);

  const subject = article?.title || issue?.title || 'this page';

  const close = () => setWork(null);

  const done = (title, message) =>
    setWork({
      tone: 'done',
      title,
      message,
      actions: [{ key: 'close', label: 'Back to the issue', icon: BookOpen, run: close }],
    });

  const fail = (title, reason, retry) =>
    setWork({
      tone: 'error',
      title,
      message: reasonLine(reason),
      actions: [
        ...(retry ? [{ key: 'retry', label: 'Try it again', icon: PenLine, run: retry }] : []),
        { key: 'close', label: 'Back to the issue', icon: BookOpen, run: close },
      ],
    });

  // Both entries open the same sheet: what is being filed, and the line that is filed.
  const openNote = () => setWork({ kind: 'form', mode: 'note' });
  const openEdit = () => setWork({ kind: 'form', mode: 'edit_request' });

  const file = async (values) => {
    const user = me || (await base44.auth.me().catch(() => null));
    if (!user) return fail('Sign in to file it', 'signed-out', () => setWork({ kind: 'form', mode: values.mode }));

    onBusy?.();
    setWork({
      tone: 'working',
      title: values.mode === 'note' ? 'Filing your note' : 'Filing your correction',
      message: `Putting what you wrote in the masthead’s hands, on “${subject}”…`,
    });

    try {
      await base44.entities.IssueFeedback.create({
        kind: values.mode,
        issue_id: issue?.id || '',
        issue_title: issue?.title || '',
        page_number: page?.page_number ?? 0,
        article_id: article?.id || '',
        subject,
        author_email: user.email,
        author_name: user.full_name || user.email,
        summary: values.summary || '',
        message: values.message,
      });
    } catch {
      return fail('That did not go through', 'failed', () => setWork({ kind: 'form', mode: values.mode }));
    }

    return done(
      values.mode === 'note' ? 'Your note is with the masthead' : 'Your correction is with the masthead',
      values.mode === 'note'
        ? `It is filed against “${subject}” in this issue, and read before the next printing. A note is never printed into the issue, and never counted as an endorsement.`
        : `It is filed against “${subject}” in this issue. The masthead reads every proposed correction; nothing is reprinted until an editor has.`,
    );
  };

  const explain = () =>
    setWork({
      tone: 'done',
      title: 'Nothing to edit on this page',
      message:
        'A note or a correction is filed against a written article. Turn to one — the contents will walk you there — or open the Index of Names from the File menu.',
      actions: [{ key: 'close', label: 'Back to the issue', icon: BookOpen, run: close }],
    });

  const groups = useMemo(() => {
    const items = article
      ? [
          {
            key: 'edit-note',
            label: 'Add a community note',
            hint: 'A note to the masthead about this article',
            icon: MessageSquare,
            onSelect: openNote,
          },
          {
            key: 'edit-request',
            label: 'Request an edit',
            hint: 'Propose a correction, for the masthead to read',
            icon: PenLine,
            onSelect: openEdit,
          },
        ]
      : [
          {
            key: 'edit-none',
            label: 'Nothing to edit on this page',
            hint: 'Turn to a written article',
            icon: PenLine,
            onSelect: explain,
          },
        ];

    return [{ key: 'issue-edit-page', label: article ? 'This article' : 'This page', items }];
    // The runner closes over the account it files under, so the list is rebuilt when the
    // answer to "who is reading" arrives as well.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id, article?.title, subject, me?.email]);

  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  useEffect(() => {
    if (!enabled) return undefined;
    return registerSurfaceEditGroups(() => groupsRef.current);
  }, [enabled]);

  const panel = !work ? null : work.kind === 'form' ? (
    <GlassIssueEditForm
      mode={work.mode}
      subject={subject}
      onClose={close}
      onSubmit={(values) => file({ ...values, mode: work.mode })}
    />
  ) : (
    <GlassIssueFilePanel kicker="Edit" {...work} onClose={close} />
  );

  return { panel };
}