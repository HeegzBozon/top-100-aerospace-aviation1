import { useEffect, useState } from "react";
import moment from "moment";

// A running clock: the moment, re-read every second and cleared when the reader goes.
// The device's own readout at the foot of the glass and the stamp that closes the
// title screen on a desk both run from here, so the machine carries one clock and can
// never read two different times.
export default function useClock() {
  const [now, setNow] = useState(() => moment());

  useEffect(() => {
    const tick = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(tick);
  }, []);

  return now;
}