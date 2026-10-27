import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import MenuBar from "@/components/shell/MenuBar";
import MenuDropdown from "@/components/shell/MenuDropdown";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import useHandheldDestinations from "@/components/handheld/useHandheldDestinations";
import { surfaceLabel } from "@/components/handheld/handheldDestinations";
import { isPlaying, playPlaylist, stopPlaylist } from "@/components/handheld/consoleMusic";

// The desk's menu bar: the same strip the glass wears, standing across the head of
// the tube and holding its place while the surface beneath it scrolls under. There
// is no wheel on a desk, so the title is pressed with the pointer instead — and the
// machine's own record hangs off the sound key, exactly as the chin's speaker below
// it does.
export default function DesktopMenuBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, isSignedIn } = useHandheldDestinations();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [playing, setPlaying] = useState(() => isPlaying());

  const locationKey = `${location.pathname}${location.search}`;
  const surface = useMemo(() => surfaceLabel(location, groups), [location, groups]);

  // The menu belongs to the surface it was opened on.
  useEffect(() => setMenuOpen(false), [locationKey]);

  const toLogin = () => base44.auth.redirectToLogin(window.location.href);

  const go = (item) => {
    setMenuOpen(false);
    if (!item) return;
    if (item.action === "signin") return toLogin();
    if (item.action === "logout") return base44.auth.logout(`${window.location.origin}/`);
    if (item.href) {
      window.open(item.href, "_blank", "noopener");
      return;
    }
    if (item.to) navigate(item.to);
  };

  const toggleSound = () => {
    if (playing) {
      stopPlaylist();
      setPlaying(false);
      return;
    }
    if (playPlaylist()) setPlaying(true);
  };

  return (
    <div className="mb-seat">
      <MenuBar
        surface={surface}
        menuOpen={menuOpen}
        onHome={() => navigate("/")}
        onMenu={() => setMenuOpen((prev) => !prev)}
        onProfile={() => (isSignedIn ? navigate("/Profile") : toLogin())}
        onNotifications={() => (isSignedIn ? setNotificationsOpen(true) : toLogin())}
        soundOn={playing}
        onToggleSound={toggleSound}
      />

      <MenuDropdown
        open={menuOpen}
        groups={groups}
        locationKey={locationKey}
        onGo={go}
        onClose={() => setMenuOpen(false)}
      />

      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}