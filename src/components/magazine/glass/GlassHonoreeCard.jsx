import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Check, Heart, ListPlus, LogIn, Users } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import GlassStudioList from '@/components/magazine/glass/GlassStudioList';
import { useNavHint } from '@/components/handheld/faceHint';

// One honoree, held under the ring.
//
// The register is a roll of names, and a name is opened before it is acted on: a reader who
// presses a name is asking who she is as often as she is asking for her page. So the card
// stands between the register and the page — her number, her stand, her portrait, and what
// a reader can do with her. Reading her page is the first action, never the only one:
// following her and keeping her on a list are the bridges to the rest of the platform, and
// they are walked on the same ring as everything else in the glass.
export default function GlassHonoreeCard({
  entry = {},
  wasRead = false,
  followed = false,
  inList = false,
  listPosition = 0,
  signedIn = true,
  notice = '',
  onRead,
  onToggleFollow,
  onAddToList,
  onOpenList,
  onOpenAeroSync,
  onSignIn,
  onClose,
}) {
  const keyHint = useNavHint();
  const [cursor, setCursor] = useState(0);
  const cursorRef = useRef(0);
  cursorRef.current = cursor;

  const actions = useMemo(() => {
    const list = [
      {
        key: 'read',
        label: wasRead ? 'Open her page again' : 'Read her page',
        hint: `Her portrait stands on p ${entry.pageNumber || '—'}`,
        icon: BookOpen,
        run: onRead,
      },
    ];

    if (!signedIn) {
      list.push({
        key: 'signin',
        label: 'Sign in to keep her',
        hint: 'Following and lists belong to your account',
        icon: LogIn,
        run: onSignIn,
      });
    } else {
      list.push({
        key: 'follow',
        label: followed ? 'Following' : 'Follow',
        hint: followed ? 'She stands in the people you follow' : 'Keep her in the people you follow, in AeroSync',
        icon: followed ? Check : Heart,
        run: onToggleFollow,
      });
      list.push({
        key: 'list',
        label: inList ? `In my TOP 100 · No. ${listPosition || '—'}` : 'Add to my TOP 100',
        hint: inList ? 'Open your list to order it, and to submit it as a ballot' : 'Your own list, and yours to order',
        icon: ListPlus,
        run: inList ? onOpenList : onAddToList,
      });
    }

    list.push({
      key: 'aerosync',
      label: 'AeroSync',
      hint: 'The people you follow, and the cards you hold for them',
      icon: Users,
      run: onOpenAeroSync,
    });

    return list;
  }, [
    wasRead,
    followed,
    inList,
    listPosition,
    signedIn,
    entry.pageNumber,
    onRead,
    onToggleFollow,
    onAddToList,
    onOpenList,
    onOpenAeroSync,
    onSignIn,
  ]);

  // The console's hands read the card as it stands now, not as it stood when the picker
  // was registered.
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const land = (target) => {
    const rows = actionsRef.current;
    if (target < 0 || target >= rows.length) return null;
    setCursor(target);
    return rows[target].label;
  };

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => actionsRef.current.map((action) => action.label),
      index: () => cursorRef.current,
      step: (direction) => land(cursorRef.current + direction),
      page: (direction) => land(cursorRef.current + direction),
      goTo: (index) => land(index),
      enter: () => {
        const action = actionsRef.current[cursorRef.current];
        if (!action) return false;
        action.run?.();
        return true;
      },
      back: () => {
        onClose?.();
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);
  // Touched on what the keys say, not on the identity of the array that holds them: the
  // console redraws its readout when a label or the standing of one changes.
  useEffect(() => {
    touchPicker();
  }, [cursor, actions.length, followed, inList, notice]);

  const note = (
    <div>
      <div
        className="flex items-start gap-3 rounded-xl px-3 py-3"
        style={{ background: 'rgba(30,58,90,0.04)', border: '1px solid rgba(30,58,90,0.12)' }}
      >
        {entry.portrait ? (
          <img
            src={entry.portrait}
            alt=""
            className="h-14 w-14 flex-none rounded-full object-cover"
            style={{ objectPosition: '50% 22%', border: `1px solid ${P.gold}` }}
          />
        ) : (
          <span
            className="flex h-14 w-14 flex-none items-center justify-center rounded-full font-heading text-[16px]"
            style={{ background: P.navy, color: P.gold }}
          >
            {(entry.name || '?').charAt(0)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-[15px] leading-tight" style={{ color: P.navy }}>
            {entry.name}
          </p>
          {entry.stand ? (
            <p className="mt-0.5 truncate text-[9.5px]" style={{ color: 'rgba(30,58,90,0.6)' }}>
              {entry.stand}
            </p>
          ) : null}
          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: P.copper }}>
            {entry.region || 'The edition'} · portrait p {entry.pageNumber}
          </p>
        </div>
      </div>

      {notice ? (
        <p role="status" className="mt-2 text-[9.5px]" style={{ color: P.copper }}>
          {notice}
        </p>
      ) : null}
    </div>
  );

  return (
    <GlassStudioList
      kicker={`Index of Names · No. ${String(entry.number || 0).padStart(3, '0')}`}
      hint={keyHint({ open: 'Select' })}
      note={note}
      entries={actions.map((action) => ({
        key: action.key,
        label: action.label,
        hint: action.hint,
        icon: action.icon,
      }))}
      cursor={cursor}
      onOpen={(index) => {
        setCursor(index);
        actionsRef.current[index]?.run?.();
      }}
      onBack={onClose}
    />
  );
}