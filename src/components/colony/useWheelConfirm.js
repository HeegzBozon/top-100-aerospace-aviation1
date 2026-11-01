import { useEffect, useRef } from 'react';
import { registerPicker } from '@/components/handheld/handheldPicker';

// Hands the click wheel's centre (and A) to a one-button scene: pressing it calls `onPress`.
export default function useWheelConfirm(onPress, active = true, enterLabel) {
  const ref = useRef(onPress);
  ref.current = onPress;
  useEffect(() => {
    if (!active) return undefined;
    return registerPicker({
      modal: true,
      enterLabel,
      labels: () => ['Continue'],
      index: () => 0,
      step: () => true,
      goTo: () => null,
      page: () => true,
      enter: () => { ref.current?.(); return true; },
      back: () => true,
    });
  }, [active, enterLabel]);
}