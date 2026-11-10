import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toggleViewingAsVisitor } from "@/lib/viewerPreview";
import MenuBar, { KEY_CELL, MENU_CELL } from "@/components/shell/MenuBar";
import MenuDropdown from "@/components/shell/MenuDropdown";
import { menuGroups, viewGroups } from "@/components/shell/barMenus";
import { useDevice } from "@/components/handheld/HandheldShell";
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
  // The lens answers to the record, not to the reading: an admin looking at the visitor's
  // machine must still be able to walk back out of it.
  const { realUser, viewingAsVisitor } = useAuth();

  // The desk is put down from the bar now, so the bar has to be able to reach the state
  // the shell holds: one machine, one answer, whichever hand lowers it.
  const { hardwareOn, toggleHardware } = useDevice() || {};

  // Which drawer is down: the surface's own journey map, File, Edit, or View.
  const [open, setOpen] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const locationKey = `${location.pathname}${location.search}`;
  const surface = useMemo(() => surfaceLabel(location, groups), [location, groups]);

  const drawer = useMemo(() => {
    if (open === "file") return fileGroupsWith(menuGroups("file", { isSignedIn, isAdmin }));
    if (open === "edit") return editGroupsWith(menuGroups("edit", { isSignedIn, isAdmin }));
    // The desk has no wheel to turn, so its View menu offers the machine and nothing it
    // does not have: the face is a fitting of the glass.
    if (open === "view") {
      return viewGroups({ hardwareOn: hardwareOn !== false, onToggleHardware: toggleHardware });
    }
    return groups;
  }, [open, isSignedIn, isAdmin, groups, hardwareOn, toggleHardware]);

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

  // Which cell the open drawer hangs from: File, Edit and View are the three words, and
  // the surface's own journey map drops from the cell that names it.
  const drawerOffset =
    open === "file" ? 0 : open === "edit" ? MENU_CELL : open === "view" ? MENU_CELL * 2 : MENU_CELL * 3;

  return (
    <div className="mb-seat">
      <MenuBar
        surface={surface}
        menuOpen={open === "surface"}
        fileOpen={open === "file"}
        editOpen={open === "edit"}
        viewOpen={open === "view"}
        onHome={home}
        onBack={() => { setOpen(null); window.history.length > 1 ? navigate(-1) : navigate("/"); }}
        onMenu={() => toggle("surface")}
        onFile={() => toggle("file")}
        onEdit={() => toggle("edit")}
        onView={() => toggle("view")}
        onNotifications={() => (isSignedIn ? setNotificationsOpen(true) : toLogin())}
        showClock
        showViewAs={realUser?.role === "admin"}
        viewingAsVisitor={viewingAsVisitor}
        onToggleViewAs={toggleViewingAsVisitor}
      />

      <MenuDropdown
        open={open !== null}
        groups={drawer}
        locationKey={locationKey}
        style={{ left: SEAT_PAD + KEY_CELL * 2 + drawerOffset }}
        onGo={go}
        onClose={() => setOpen(null)}
      />

      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}