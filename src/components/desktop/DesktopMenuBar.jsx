import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import MenuBar, { KEY_CELL, MENU_CELL } from "@/components/shell/MenuBar";
import MenuDropdown from "@/components/shell/MenuDropdown";
import { menuGroups } from "@/components/shell/barMenus";
import { editGroupsWith, fileGroupsWith } from "@/components/shell/surfaceFileMenu";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import useHandheldDestinations from "@/components/handheld/useHandheldDestinations";
import { surfaceLabel } from "@/components/handheld/handheldDestinations";

// The seat's own left padding, then the home key — the line the bar's word cells start
// from. A drawer drops from its own cell, so File lands one word along, Edit two, and
// the surface's journey map at the surface cell itself.
const SEAT_PAD = 9;

// The desk's menu bar: the same strip the glass wears, standing across the head of
// the tube and holding its place while the surface beneath it scrolls under. There
// is no wheel on a desk, so the cells are pressed with the pointer instead — home,
// File, Edit, the surface you are on, and what has come in.
export default function DesktopMenuBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, isSignedIn, isAdmin } = useHandheldDestinations();

  // Which drawer is down: the surface's own journey map, File, or Edit.
  const [open, setOpen] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const locationKey = `${location.pathname}${location.search}`;
  const surface = useMemo(() => surfaceLabel(location, groups), [location, groups]);

  const drawer = useMemo(
    () =>
      open === "file"
        ? fileGroupsWith(menuGroups("file", { isSignedIn, isAdmin }))
        : open === "edit"
          ? editGroupsWith(menuGroups("edit", { isSignedIn, isAdmin }))
          : groups,
    [open, isSignedIn, isAdmin, groups],
  );

  // The menu belongs to the surface it was opened on.
  useEffect(() => setOpen(null), [locationKey]);

  const toLogin = () => base44.auth.redirectToLogin(window.location.href);

  const go = (item) => {
    setOpen(null);
    if (!item) return;
    if (item.action === "signin" || item.action === "join") return toLogin();
    if (item.action === "logout") return base44.auth.logout(`${window.location.origin}/`);
    // A surface's own File entry does its work where it stands: the drawer goes down on the
    // press and the surface reports what came of it.
    if (item.onSelect) return item.onSelect();
    if (item.href) {
      window.open(item.href, "_blank", "noopener");
      return;
    }
    if (item.to) navigate(item.to);
  };

  const toggle = (kind) => setOpen((prev) => (prev === kind ? null : kind));

  // Home is a press of its own, not an entry in a list: the drawer goes down and the
  // front screen comes up.
  const home = () => {
    setOpen(null);
    navigate("/");
  };

  // Which cell the open drawer hangs from.
  const drawerOffset = open === "file" ? 0 : open === "edit" ? MENU_CELL : MENU_CELL * 2;

  return (
    <div className="mb-seat">
      <MenuBar
        surface={surface}
        menuOpen={open === "surface"}
        fileOpen={open === "file"}
        editOpen={open === "edit"}
        onHome={home}
        onMenu={() => toggle("surface")}
        onFile={() => toggle("file")}
        onEdit={() => toggle("edit")}
        onNotifications={() => (isSignedIn ? setNotificationsOpen(true) : toLogin())}
      />

      <MenuDropdown
        open={open !== null}
        groups={drawer}
        locationKey={locationKey}
        style={{ left: SEAT_PAD + KEY_CELL + drawerOffset }}
        onGo={go}
        onClose={() => setOpen(null)}
      />

      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}