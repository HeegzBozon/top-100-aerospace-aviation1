import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { iconMap, DefaultIcon } from "@/components/icons";
import {
  buildGroups,
  destinationTo,
  MORE_FALLBACK,
  RAIL_FALLBACK,
} from "./handheldDestinations";

// Reads the ADMIN-configured rail from RailItem so the handheld keeps the same
// action wiring the legacy dock had, then folds it into navigator groups.
export default function useHandheldDestinations() {
  const [rail, setRail] = useState(RAIL_FALLBACK);
  const [more, setMore] = useState(MORE_FALLBACK);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    base44.auth
      .me()
      .then((user) => {
        if (!active) return;
        setIsSignedIn(true);
        setIsAdmin(user?.role === "admin");
      })
      .catch(() => {});

    base44.entities.RailItem.list()
      .then((data) => {
        if (!active || !Array.isArray(data)) return;
        const enabled = data.filter((i) => i.is_enabled !== false && i.is_mobile !== false);
        const sorted = [...enabled].sort((a, b) => (a.mobile_order ?? 0) - (b.mobile_order ?? 0));
        const toDestination = (record) => {
          const to = destinationTo(record);
          if (!to) return null;
          return { label: record.label, to, icon: iconMap[record.icon] || DefaultIcon };
        };
        const railItems = sorted.filter((i) => !i.is_more_item).map(toDestination).filter(Boolean);
        const moreItems = sorted.filter((i) => i.is_more_item).map(toDestination).filter(Boolean);
        if (railItems.length) setRail(railItems);
        if (moreItems.length) setMore(moreItems);
      })
      .catch(() => {
        // Unconfigured rail — the fallback keeps the console navigable.
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    rail,
    more,
    isSignedIn,
    isAdmin,
    groups: buildGroups({ rail, more, isSignedIn, isAdmin }),
  };
}