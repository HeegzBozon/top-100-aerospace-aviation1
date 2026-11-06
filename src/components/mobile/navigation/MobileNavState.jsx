import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Where each tab was last left.
//
// A phone's bar keeps one journey per tab: you walk into a section, step a few pages
// deeper, press another tab, then come back to the first — and it opens where you left
// it rather than at its root. The history is held in memory for the session (a
// convenience, never the record) and keyed by the tab's first path segment.
export const tabOf = (path) => `/${String(path || '/').split('/').filter(Boolean)[0] || ''}`;

const MobileNavContext = createContext(null);

export function MobileNavProvider({ children }) {
  const { pathname } = useLocation();
  const [byTab, setByTab] = useState({});

  useEffect(() => {
    const tab = tabOf(pathname);
    setByTab((prev) => (prev[tab] === pathname ? prev : { ...prev, [tab]: pathname }));
  }, [pathname]);

  const value = useMemo(
    () => ({
      tabOf,
      /* Where a tab was last standing: the nested page if one was open, its root otherwise. */
      lastPathFor: (tab) => byTab[tabOf(tab)] || tabOf(tab),
    }),
    [byTab],
  );

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

export const useMobileNav = () => useContext(MobileNavContext);