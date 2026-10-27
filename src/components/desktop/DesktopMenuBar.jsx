import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import MenuBar, { MENU_CELL } from "@/components/shell/MenuBar";
import MenuDropdown from "@/components/shell/MenuDropdown";
import { menuGroups } from "@/components/shell/barMenus";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import useHandheldDestinations from "@/components/handheld/useHandheldDestinations";
import { surfaceLabel } from "@/components/handheld/handheldDestinations";

// The seat's own left padding, which is where the bar's first cell starts; the
// drawers drop from their cell, so Edit's lands one cell further along.
const SEAT_PAD = 9;

// The desk's menu bar: the same strip the glass wears, standing across the head of
// the tube and holding its place while the surface beneath it scrolls under. There
// is no wheel on a desk, so the cells are pressed with the pointer instead — File,
// Edit, the surface you are on, and what has come in.
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
        ? menuGroups("file", { isSignedIn, isAdmin })
        : open === "edit"
          ? menuGroups("edit", { isSignedIn, isAdmin })
          : groups,
    [open, isSignedIn, isAdmin, groups],
  );

  // The menu belongs to the surface it was opened on.
  useEffect(() => setOpen(null), [locationKey]);

  const toLogin = () => base44.auth.redirectToLogin(window.location.href);

  const go = (item) => {
    setOpen(null);
    if (!item) return;
    if (item.action === "signin") return toLogin();
    if (item.action === "logout") return base44.auth.logout(`${window.location.origin}/`);
    if (item.href) {
      window.open(item.href, "_blank", "noopener");
      return;
    }
    if (item.to) navigate(item.to);
  };

  const toggle = (kind) => setOpen((prev) => (prev === kind ? null : kind));

  return (
    <div className="mb-seat">
      <MenuBar
        surface={surface}
        menuOpen={open === "surface"}
        fileOpen={open === "file"}
        editOpen={open === "edit"}
        onMenu={() => toggle("surface")}
        onFile={() => toggle("file")}
        onEdit={() => toggle("edit")}
        onNotifications={() => (isSignedIn ? setNotificationsOpen(true) : toLogin())}
      />

      <MenuDropdown
        open={open !== null}
        groups={drawer}
        locationKey={locationKey}
        style={{ left: SEAT_PAD + (open === "edit" ? MENU_CELL : 0) }}
        onGo={go}
        onClose={() => setOpen(null)}
      />

      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}