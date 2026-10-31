import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { INDEX_GROUPS } from "@/components/shell/appRegistry";

const pathOf = (to = "") => to.split("?")[0];

// THE BAND. Every surface the machine can tune, in registry order, each one appearing
// once — the same registry the shelf and the index read, so a surface added there is a
// channel on the dial without a second list to keep in step.
export function useRadioChannels() {
  return useMemo(() => {
    const seen = new Set();
    const channels = [];
    INDEX_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        const path = pathOf(item.to);
        if (!path || seen.has(path)) return;
        seen.add(path);
        channels.push({ label: item.label, to: item.to, path, band: group.label });
      });
    });
    return channels;
  }, []);
}

// The dial stands wherever the surface stands until a hand turns it, and turning it
// tunes without moving: the readout shows the channel it is on, and PUSH goes there.
// Arriving anywhere re-centres the dial, the way a station's pointer follows the band.
export default function useRadioBand() {
  const channels = useRadioChannels();
  const { pathname } = useLocation();
  const [dial, setDial] = useState(null);

  useEffect(() => setDial(null), [pathname]);

  const current = channels.findIndex((channel) => channel.path === pathname);
  const index = dial === null ? current : dial;
  const target = index >= 0 ? channels[index] : null;
  const tuning = dial !== null && dial !== current;

  // A fast drag can ask for several clicks before React has drawn the first one, so the
  // step is worked out from the dial's own last value rather than from the render it was
  // handed — otherwise a quick turn would collapse into a single click.
  const step = (direction) =>
    setDial((previous) => {
      const standing = previous === null ? current : previous;
      const from = standing >= 0 ? standing : 0;
      const size = channels.length || 1;
      return (from + direction + size) % size;
    });

  return { channels, current, index, target, tuning, step };
}