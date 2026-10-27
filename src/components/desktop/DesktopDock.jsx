import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Award,
  Calendar,
  CalendarCheck,
  Compass,
  Info,
  Landmark,
  LayoutGrid,
  LogIn,
  LogOut,
  Mail,
  Shield,
  ShoppingBag,
  Ticket,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isViewingAsVisitor } from "@/lib/viewerPreview";
import { INDEX_GROUPS, SHELF } from "@/components/shell/appRegistry";
import "./deskDock.css";

// The desk's shelf: the row of things a hand reaches for without opening a menu.
//
// It is moulded from the machine — the same polymer, the same steel hairline, the same
// brass seam — so the dock reads as a part of the case rather than as a bar laid over the
// picture. Five surfaces stand on the shelf as tiles, each printing its name above itself
// when pointed at; the sixth opens the index, which is everything else the platform holds.
// The seal is the one primary: copper, and the only thing on the shelf with a word always
// showing. The account stands at the far end, where a machine keeps it.
// The shelf's applications and the index behind it come from the machine's one registry
// (components/shell/appRegistry), which the glass reads as well: a surface added there is
// on the shelf, in this drawer, and on the console, without a second list to keep in step.
const pathOf = (to = "") => to.split("?")[0];

export default function DesktopDock() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(null);
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState("checking");

  useEffect(() => {
    // The operator's preview answers here the way it answers everywhere: standing in a
    // visitor's place means the shelf offers the way in, not the way out.
    if (isViewingAsVisitor()) {
      setAuthState("signedout");
      return;
    }
    base44.auth
      .me()
      .then((u) => {
        setUser(u);
        setAuthState("signedin");
      })
      .catch(() => setAuthState("signedout"));
  }, []);

  // The shelf belongs to the surface it was opened on.
  useEffect(() => setOpen(null), [pathname]);

  const signIn = () => base44.auth.redirectToLogin(window.location.href);
  const signOut = () => base44.auth.logout(`${window.location.origin}/`);
  const close = () => setOpen(null);
  const toggle = (kind) => setOpen((prev) => (prev === kind ? null : kind));

  const isAdmin = user?.role === "admin";
  const signedIn = authState === "signedin";
  const initials = (user?.full_name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const visible = (item) => {
    if (item.membersOnly && !signedIn) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  };

  return (
    <div className="imac-lift fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 px-4">
      <div className="relative">
        {/* Anything pressed outside the shelf puts the drawer down. It stands behind the
            shelf itself, so a tile is always still the thing a press lands on. */}
        {open ? <div className="fixed inset-0" onClick={close} aria-hidden="true" /> : null}

        {open === "index" ? (
          <IndexPanel onClose={close} visible={visible} signedIn={signedIn} />
        ) : null}

        <div className="ds-shelf relative flex items-center gap-1 rounded-[22px] px-2.5 py-2">
          {/* The front screen, marked the way a machine marks its own application. */}
          <Link
            to="/"
            aria-label="TOP 100 — the front screen"
            className="ds-tile flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[3px] rounded-[13px]"
          >
            <span className="font-display text-[15px] leading-none text-editorial-gold">
              100
            </span>
            <span className="text-[5px] font-bold uppercase leading-none tracking-[0.24em] text-editorial-cream/45">
              top
            </span>
            <Tip>Front screen</Tip>
          </Link>

          <Seam />

          {SHELF.map((item) => (
            <Tile
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={pathname === pathOf(item.to)}
            />
          ))}

          <Seam />

          <button
            type="button"
            onClick={() => toggle("index")}
            aria-label="Index — every surface"
            aria-expanded={open === "index"}
            aria-haspopup="menu"
            className="ds-tile relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]"
            style={
              open === "index"
                ? { boxShadow: "inset 0 0 0 1px rgb(var(--hh-metal-rgb) / 0.7)" }
                : undefined
            }
          >
            <LayoutGrid
              className={`h-[17px] w-[17px] transition-colors ${
                open === "index"
                  ? "text-editorial-gold"
                  : "text-[color:var(--mb-ink)]"
              }`}
              strokeWidth={1.7}
            />
            <Tip>Index</Tip>
          </button>

          <Seam />

          {/* The seal: the one thing on the shelf that says what it is without being
              pointed at, because it is the one thing a visitor is asked to do. */}
          <Link
            to="/rsvp"
            className="flex h-11 items-center gap-2 rounded-[13px] px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#07111f] transition-all hover:brightness-105 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #c9a87c, #e0c79a)" }}
          >
            <CalendarCheck className="h-4 w-4" strokeWidth={2} />
            RSVP
          </Link>

          <Seam />

          {/* The account, at the far end where a machine keeps it. */}
          <div className="relative">
            <button
              type="button"
              onClick={() => authState !== "checking" && toggle("account")}
              aria-label={signedIn ? "Account" : "Sign in"}
              aria-expanded={open === "account"}
              aria-haspopup="menu"
              className="ds-tile relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={
                open === "account"
                  ? { boxShadow: "inset 0 0 0 1px rgb(var(--hh-metal-rgb) / 0.7)" }
                  : undefined
              }
            >
              {signedIn && initials ? (
                <span className="text-[11px] font-bold tracking-[0.04em] text-editorial-gold">
                  {initials}
                </span>
              ) : (
                <User
                  className="h-[17px] w-[17px] text-[color:var(--mb-ink)]"
                  strokeWidth={1.7}
                />
              )}
              {isAdmin ? (
                <Shield
                  className="absolute -right-0.5 -top-0.5 h-3 w-3 text-editorial-gold"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              ) : null}
              {!signedIn && authState === "signedout" ? (
                <Tip>Sign in</Tip>
              ) : null}
            </button>

            {open === "account" ? (
              <AccountPanel
                signedIn={signedIn}
                user={user}
                onSignIn={signIn}
                onSignOut={signOut}
                onClose={close}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Seam() {
  return <div className="ds-seam" aria-hidden="true" />;
}

function Tip({ children }) {
  return <span className="ds-tip">{children}</span>;
}

function Tile({ to, label, icon: Icon, active }) {
  return (
    <Link
      to={to}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="ds-tile relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]"
    >
      <Icon
        className={`h-[17px] w-[17px] transition-colors ${
          active ? "text-editorial-gold" : "text-[color:var(--mb-ink)]"
        }`}
        strokeWidth={1.7}
      />
      <Tip>{label}</Tip>
      {/* The lamp under the tile: lit for the surface you are on. */}
      <span
        aria-hidden="true"
        className="absolute -bottom-[5px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full"
        style={{
          background: active ? "var(--hh-metal-1)" : "transparent",
          boxShadow: active ? "0 0 5px rgb(var(--hh-metal-rgb) / 0.8)" : "none",
        }}
      />
    </Link>
  );
}

function IndexPanel({ onClose, visible, signedIn }) {
  return (
    <div
      role="menu"
      aria-label="Index"
      className="absolute bottom-[calc(100%+10px)] left-0 w-[452px] rounded-2xl p-5"
      style={{
        background: "linear-gradient(180deg, rgba(9,17,28,0.985), rgba(6,12,21,0.99))",
        border: "1px solid rgb(var(--hh-metal-rgb) / 0.34)",
        boxShadow:
          "0 28px 64px -24px rgba(3,6,13,0.92), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.34em] text-editorial-gold/85">
            Index
          </p>
          <p className="mt-2 font-display text-[17px] leading-tight text-editorial-cream/90">
            Everything the machine holds
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the index"
          className="rounded-md p-1 text-white/40 transition-colors hover:text-editorial-gold"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6">
        {INDEX_GROUPS.map((group) => {
          // A group that belongs to a Fellow's own record goes whole, exactly as it does
          // on the glass: the flag stands on the group, not on every entry inside it.
          if (group.membersOnly && !signedIn) return null;
          const items = group.items.filter(visible);
          if (!items.length) return null;
          return (
            <div key={group.key}>
              <p className="text-[7.5px] font-bold uppercase tracking-[0.3em] text-editorial-cream/35">
                {group.label}
              </p>
              <div className="mt-2">
                {items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    onClick={onClose}
                    className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-[11.5px] font-semibold text-white/75 transition-colors hover:bg-white/[0.06] hover:text-editorial-gold"
                  >
                    <item.icon
                      className="h-3.5 w-3.5 shrink-0 text-editorial-gold/65 transition-colors group-hover:text-editorial-gold"
                      strokeWidth={1.7}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Beyond the machine: the one door that leaves it. */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <a
          href="https://wefunder.com/top.100.aerospace.aviation"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-[11.5px] font-semibold text-white/55 transition-colors hover:bg-white/[0.06] hover:text-editorial-gold"
        >
          <Compass className="h-3.5 w-3.5 text-editorial-gold/65" strokeWidth={1.7} />
          Community Round
          <span className="text-[9px] text-white/35 group-hover:text-editorial-gold/70">
            wefunder.com ↗
          </span>
        </a>
      </div>
    </div>
  );
}

function AccountPanel({ signedIn, user, onSignIn, onSignOut, onClose }) {
  const plate = {
    background: "linear-gradient(180deg, rgba(9,17,28,0.985), rgba(6,12,21,0.99))",
    border: "1px solid rgb(var(--hh-metal-rgb) / 0.34)",
    boxShadow: "0 28px 64px -24px rgba(3,6,13,0.92), inset 0 1px 0 rgba(255,255,255,0.06)",
  };

  if (!signedIn) {
    return (
      <div role="menu" className="absolute bottom-[calc(100%+10px)] right-0 w-60 rounded-2xl p-2" style={plate}>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onSignIn();
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11.5px] font-semibold text-editorial-gold transition-colors hover:bg-white/[0.06]"
        >
          <LogIn className="h-3.5 w-3.5" strokeWidth={1.8} />
          Sign in · create your account
        </button>
      </div>
    );
  }

  return (
    <div role="menu" className="absolute bottom-[calc(100%+10px)] right-0 w-64 rounded-2xl p-2" style={plate}>
      <div className="border-b border-white/10 px-3 pb-2.5 pt-2">
        <p className="truncate text-[12px] font-semibold text-white/90">
          {user?.full_name || "Fellow"}
        </p>
        <p className="truncate text-[10px] text-white/40">{user?.email}</p>
      </div>
      <Link
        to="/Profile"
        role="menuitem"
        onClick={onClose}
        className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[11.5px] font-semibold text-white/75 transition-colors hover:bg-white/[0.06] hover:text-editorial-gold"
      >
        <User className="h-3.5 w-3.5 text-editorial-gold/70" strokeWidth={1.8} />
        My Profile
      </Link>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          onSignOut();
        }}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11.5px] font-semibold text-white/55 transition-colors hover:bg-white/[0.06] hover:text-editorial-gold"
      >
        <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} />
        Log out
      </button>
    </div>
  );
}