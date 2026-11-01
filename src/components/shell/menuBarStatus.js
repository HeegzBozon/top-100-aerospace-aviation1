import { useEffect, useState } from 'react';

// A surface's live status cell in the menu bar (e.g. Colony's online count). One at a time.
let current = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l(current));

export function setMenuBarStatus(status) {
  current = status;
  emit();
  return () => { if (current === status) { current = null; emit(); } };
}

export function useMenuBarStatus() {
  const [s, setS] = useState(current);
  useEffect(() => { listeners.add(setS); return () => listeners.delete(setS); }, []);
  return s;
}