import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import GlassStudioList from '@/components/magazine/glass/GlassStudioList';
import { useNavHint } from '@/components/handheld/faceHint';

// What a File action reports, standing in the glass where the issue is being read.
//
// A File entry does its work behind the reader's back, so the machine says what happened:
// the build is announced while it runs, the file is named when it lands, and an action that
// could not be taken is explained rather than swallowed. It is walked on the ring like
// everything else on this device, so the hand never leaves the wheel.
export default function GlassIssueFilePanel({ kicker = 'File', title, message, tone = 'working', actions = [], onClose }) {
  const keyHint = useNavHint();
  const [cursor, setCursor] = useState(0);
  const cursorRef = useRef(0);
  cursorRef.current = cursor;
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => actionsRef.current.map((action) => action.label),
      index: () => cursorRef.current,
      step: (direction) => {
        const list = actionsRef.current;
        const next = cursorRef.current + direction;
        if (next < 0 || next >= list.length) return null;
        setCursor(next);
        return list[next].label;
      },
      page: (direction) => api.current.step(direction),
      goTo: (index) => {
        const list = actionsRef.current;
        if (index < 0 || index >= list.length) return null;
        setCursor(index);
        return list[index].label;
      },
      enter: () => {
        const action = actionsRef.current[cursorRef.current];
        if (!action) return false;
        action.run?.();
        return true;
      },
      back: () => {
        closeRef.current?.();
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);
  useEffect(() => {
    touchPicker();
  }, [cursor, tone, actions.length]);

  const note = (
    <div className="space-y-1.5">
      <p className="font-heading text-[15px] leading-snug" style={{ color: P.navy }}>
        {title}
      </p>
      {tone === 'working' ? (
        <p className="flex items-center gap-2 text-[10.5px]" style={{ color: 'rgba(30,58,90,0.62)' }}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: P.copper }} />
          {message}
        </p>
      ) : (
        <p
          className="text-[10.5px] leading-relaxed"
          style={{ color: tone === 'error' ? P.copper : 'rgba(30,58,90,0.62)' }}
        >
          {message}
        </p>
      )}
    </div>
  );

  // A panel over the picture rather than a page under it: the report stands where the reader
  // is, on the glass itself, and the issue is still there behind it when it is put away.
  return (
    <div className="hh-glass-panel fixed inset-0 z-[44] flex items-end justify-center md:items-center">
      <div
        className="hh-glass-panel-card w-full overflow-y-auto scrollbar-hide md:max-w-[430px]"
        style={{
          maxHeight: '100%',
          background: '#FAF8F5',
          border: '1px solid rgba(30,58,90,0.14)',
          borderRadius: 16,
          boxShadow: '0 22px 44px -18px rgba(7,17,31,0.55)',
        }}
      >
        <GlassStudioList
          kicker={kicker}
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
      </div>
    </div>
  );
}