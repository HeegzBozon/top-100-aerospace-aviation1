import { useLocation, useNavigate } from "react-router-dom";
import useHandheldDestinations from "@/components/handheld/useHandheldDestinations";
import SwitchBank from "./SwitchBank";

// The command rail, thrown by hand. These are the same admin-owned destinations the
// handheld's own rail carries, read from the same records, so the desk and the
// device can never offer two different routes to one surface. A switch sits up
// while the surface it opens is the one on the screen.
export default function CommandRail() {
  const { rail } = useHandheldDestinations();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = rail.slice(0, 7).map((item) => ({
    key: item.to,
    label: item.label,
    on: item.to.split("?")[0] === pathname,
  }));

  return <SwitchBank items={items} onThrow={(to) => navigate(to)} />;
}