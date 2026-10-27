import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Download, FileText, Heart, Link2, UserPlus } from 'lucide-react';
import { registerSurfaceFileGroups } from '@/components/shell/surfaceFileMenu';
import { reasonLine } from '@/components/following/followingCopy';
import { readHonoree } from '@/components/following/honoreeRecord';
import useFollowing from '@/components/following/useFollowing';
import useRolodexLedger from '@/components/following/useRolodexLedger';
import {
  downloadIssuePdf,
  downloadProfileSheet,
  issueProfilePath,
  issueReaderPath,
  shareLink,
} from '@/components/magazine/magazineDownloads';
import GlassIssueFilePanel from '@/components/magazine/glass/GlassIssueFilePanel';

const first = (name = '') => String(name).trim().split(/\s+/)[0] || 'her';

// The issue's own File menu.
//
// File belongs to the machine, but a reader with an issue open has work of its own in it,
// and this is where that work is declared: the honoree the reader has turned to can be
// followed or connected to their private rolodex, her profile can be shared or taken away as
// a sheet, and the whole issue can be handed out or downloaded as a PDF that prints. The
// list is registered with the machine for exactly as long as the reader is open.
//
// Following, connecting and keeping a list are a Fellow's own keeping: they are written to
// the follow graph and the rolodex and are read by nothing the institution measures with.
export default function useIssueFileMenu({
  issue,
  pages = [],
  articles = [],
  nameIndex = [],
  position = 0,
  enabled = true,
  present = 'panel',
  onOpenRegister,
  onNotice,
  onBusy,
}) {
  const following = useFollowing();
  // The rolodex, for the one press that keeps a card. No addresses are handed in: this
  // surface only writes, and reads nothing of another Fellow's contacts.
  const rolodex = useRolodexLedger([]);
  const [work, setWork] = useState(null);

  // The honoree the reader has turned to: the name standing on the page that is open, from
  // the issue's own register, so following her here is the same act as following her there.
  const honoree = useMemo(
    () => nameIndex.find((entry) => entry.position === position) || null,
    [nameIndex, position],
  );
  const her = honoree ? first(honoree.name) : 'her';
  const followed = !!honoree && !!following.rowFor({ name: honoree.name });

  const close = () => setWork(null);

  const report = (next) => {
    setWork(next);
    onNotice?.(next);
  };

  const fail = (title, reason, retry) => {
    report({
      tone: 'error',
      title,
      message: reasonLine(reason),
      actions: [
        ...(retry ? [{ key: 'retry', label: 'Try it again', icon: Heart, run: retry }] : []),
        { key: 'close', label: 'Back to the issue', icon: BookOpen, run: close },
      ],
    });
  };

  const done = (title, message) => {
    report({
      tone: 'done',
      title,
      message,
      actions: [{ key: 'close', label: 'Back to the issue', icon: BookOpen, run: close }],
    });
  };

  const runFollow = async () => {
    if (!honoree) return;
    onBusy?.();
    report({
      tone: 'working',
      title: `${followed ? 'Releasing' : 'Following'} ${honoree.name}`,
      message: followed ? 'Taking her out of the people you keep…' : 'Writing her to the people you follow…',
    });
    const res = await following.toggle({ name: honoree.name, portrait: honoree.portrait, nomineeId: honoree.nomineeId });
    if (!res.ok) return fail('That did not go through', res.reason, runFollow);
    return done(
      res.following ? `Following ${res.name}` : `${res.name} released`,
      res.following
        ? 'She stands in the people you follow, in AeroSync — with the card you hold for her beside her.'
        : 'She is no longer among the people you follow.',
    );
  };

  const runConnect = async () => {
    if (!honoree) return;
    onBusy?.();
    report({
      tone: 'working',
      title: `Connecting ${honoree.name}`,
      message: 'Keeping her card in your private rolodex…',
    });
    const record = await readHonoree(honoree);
    if (!record.email) return fail('No card to keep yet', 'no-address');
    const res = await rolodex.keep(record);
    if (!res.ok) return fail('That did not go through', res.reason, runConnect);
    return done(
      `${record.name} is in your rolodex`,
      'Her card stands in AeroSync · Contacts, with the address her record carries. Open it to add what you learned at the show.',
    );
  };

  const runShareProfile = async () => {
    if (!honoree?.nomineeId) return;
    onBusy?.();
    const res = await shareLink({
      title: `${honoree.name} · TOP 100 Aerospace & Aviation`,
      path: issueProfilePath(honoree.nomineeId),
    });
    if (!res.ok) {
      if (res.reason === 'cancelled') return close();
      return fail('That did not go through', res.reason, runShareProfile);
    }
    return done(
      res.via === 'copied' ? 'The profile link is on your clipboard' : `${honoree.name} shared`,
      `${honoree.name}'s profile reads at ${issueProfilePath(honoree.nomineeId)} on the institution's own address.`,
    );
  };

  const runExportProfile = async () => {
    if (!honoree?.nomineeId) return;
    onBusy?.();
    report({
      tone: 'working',
      title: `Setting ${honoree.name}'s details`,
      message: 'Building the sheet from her record…',
    });
    try {
      const res = await downloadProfileSheet({
        entry: honoree,
        issue,
        pageNumber: honoree.pageNumber,
      });
      return done(`${res.name} · profile sheet`, `Saved to your downloads as ${res.filename}.`);
    } catch {
      return fail('The sheet could not be built', 'failed', runExportProfile);
    }
  };

  const runIssuePdf = async () => {
    if (!issue) return;
    onBusy?.();
    report({
      tone: 'working',
      title: 'Building the issue',
      message: `Setting ${pages.length} ${pages.length === 1 ? 'page' : 'pages'} as a PDF you keep…`,
    });
    // Give the panel the frame it needs before the build takes the thread.
    await new Promise((resolve) => setTimeout(resolve, 80));
    try {
      const res = downloadIssuePdf({ issue, pages, articles });
      return done('The issue is ready', `Saved to your downloads as ${res.filename} · ${res.pages} pages.`);
    } catch {
      return fail('The issue could not be built', 'failed', runIssuePdf);
    }
  };

  const runShareIssue = async () => {
    if (!issue) return;
    onBusy?.();
    const res = await shareLink({ title: issue.title, path: issueReaderPath(issue.id) });
    if (!res.ok) {
      if (res.reason === 'cancelled') return close();
      return fail('That did not go through', res.reason, runShareIssue);
    }
    return done(
      res.via === 'copied' ? 'The issue link is on your clipboard' : 'The issue is shared',
      `${issue.title}, handed over as it stands.`,
    );
  };

  const openRegister = () => {
    close();
    onOpenRegister?.();
  };

  const groups = useMemo(() => {
    const honoreeItems = [
      honoree && {
        key: 'file-follow',
        label: followed ? `Following ${her}` : `Follow ${her}`,
        hint: followed ? 'She stands in the people you follow' : 'Keep her in your AeroSync',
        icon: Heart,
        onSelect: runFollow,
      },
      honoree && {
        key: 'file-connect',
        label: `Connect ${her}`,
        hint: 'Keeps her card in your private rolodex',
        icon: UserPlus,
        onSelect: runConnect,
      },
      {
        key: 'file-register',
        label: 'Open the Index of Names',
        hint: 'Every honoree in the issue, and her page',
        icon: BookOpen,
        onSelect: openRegister,
      },
    ].filter(Boolean);

    const list = [{ key: 'issue-file-honoree', label: 'Honorees', items: honoreeItems }];

    if (honoree?.nomineeId) {
      list.push({
        key: 'issue-file-profile',
        label: 'Her profile',
        items: [
          {
            key: 'file-share-profile',
            label: `Share ${her}'s profile`,
            hint: 'The canonical profile link',
            icon: Link2,
            onSelect: runShareProfile,
          },
          {
            key: 'file-export-profile',
            label: `Export ${her}'s details`,
            hint: 'A profile sheet, as a PDF',
            icon: FileText,
            onSelect: runExportProfile,
          },
        ],
      });
    }

    list.push({
      key: 'issue-file-issue',
      label: 'This issue',
      items: [
        {
          key: 'file-issue-pdf',
          label: 'Download this issue as a PDF',
          hint: pages.length ? `${pages.length} pages` : '',
          icon: Download,
          onSelect: runIssuePdf,
        },
        {
          key: 'file-share-issue',
          label: 'Share this issue',
          hint: "The reader's link",
          icon: Link2,
          onSelect: runShareIssue,
        },
      ],
    });

    // The runners close over the state they need, so the list is rebuilt whenever any of it
    // moves — the register re-reads it through a getter, so a drawer always opens on the
    // honoree the reader is actually standing on.
    return list;
    // The runners close over the account they write to, so the list is rebuilt when the
    // answer to "who is reading" arrives as well.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [honoree, her, followed, pages.length, issue?.id, issue?.title, following.me?.email, rolodex.me?.id]);

  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  useEffect(() => {
    if (!enabled) return undefined;
    return registerSurfaceFileGroups(() => groupsRef.current);
  }, [enabled]);

  const panel =
    present === 'panel' && work ? (
      <GlassIssueFilePanel
        kicker="File"
        title={work.title}
        message={work.message}
        tone={work.tone}
        actions={work.actions || []}
        onClose={close}
      />
    ) : null;

  return { panel, honoree, busy: work?.tone === 'working' };
}