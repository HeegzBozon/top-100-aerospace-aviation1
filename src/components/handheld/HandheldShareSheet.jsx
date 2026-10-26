import { Check, Copy, QrCode, Settings2, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { blip, buzz } from "./handheldSound";

// The share drawer, opened in the glass where the app lives: the link you are
// holding, the code that opens it on a phone, and every way out of it. Nothing
// leaves the screen unless you say so.
const QR_SERVICE = "https://api.qrserver.com/v1/create-qr-code/";

// One line of the drawer: a glyph, a label, and where it lands.
function Row({ icon: Icon, label, detail, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
      style={{ borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.16)" }}
    >
      <Icon className="h-[13px] w-[13px] shrink-0" style={{ color: "var(--hh-lcd)" }} />
      <span className="flex-1 truncate text-[11.5px] font-semibold" style={{ color: "var(--hh-lcd-bright)" }}>
        {label}
      </span>
      {detail ? (
        <span
          className="shrink-0 text-[7px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--hh-lcd-soft)" }}
        >
          {detail}
        </span>
      ) : null}
    </button>
  );
}

export default function HandheldShareSheet({ open, onClose, surface, isSignedIn }) {
  const navigate = useNavigate();
  const [copyState, setCopyState] = useState("idle");

  if (!open) return null;

  const url = window.location.href;
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const qr = `${QR_SERVICE}?size=200x200&qzone=1&bgcolor=faf8f5&color=1e3a5a&data=${encodeURIComponent(url)}`;

  const copy = async () => {
    blip("select");
    buzz();
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 1800);
  };

  const nativeShare = async () => {
    blip("select");
    buzz();
    try {
      await navigator.share({ title: document.title, url });
      onClose();
    } catch {
      // The drawer was dismissed — this one stays open where it is.
    }
  };

  const openSettings = () => {
    blip("select");
    buzz();
    if (!isSignedIn) return base44.auth.redirectToLogin(window.location.href);
    onClose();
    navigate("/Profile?settings=presentation");
  };

  const copyDetail = copyState === "copied" ? "Copied" : copyState === "failed" ? "Blocked" : null;

  return (
    <div
      className="fixed z-[45] flex flex-col md:hidden"
      style={{
        top: "calc(var(--hh-top, 12px) + var(--hh-bar, 52px) + env(safe-area-inset-top) + 5px)",
        bottom: "calc(var(--hh-bottom, 176px) + env(safe-area-inset-bottom) + 5px)",
        left: 7,
        right: 7,
        borderRadius: 15,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, var(--hh-well-1) 0%, var(--hh-well-2) 60%, var(--hh-well-3) 100%)",
        boxShadow: "inset 0 0 0 2px var(--hh-bezel)",
      }}
      role="dialog"
      aria-label="Share"
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.28)" }}
      >
        <span
          className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.28em]"
          style={{ color: "var(--hh-lcd)" }}
        >
          <Share className="h-[11px] w-[11px]" /> Share
        </span>
        <span
          className="max-w-[55%] truncate text-[8px] font-bold uppercase tracking-[0.28em]"
          style={{ color: "var(--hh-lcd-soft)" }}
        >
          {surface}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* The code: point a phone at it and this surface opens there */}
        <div
          className="flex items-center gap-3 px-3 py-3"
          style={{ borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.16)" }}
        >
          <span
            className="shrink-0 rounded-[7px] p-1.5"
            style={{
              background: "rgb(var(--editorial-cream-rgb))",
              boxShadow: "0 0 0 1px rgb(var(--hh-metal-rgb) / 0.35)",
            }}
          >
            <img src={qr} alt="QR code for this page" className="h-[72px] w-[72px]" />
          </span>

          <span className="min-w-0 flex-1">
            <span
              className="flex items-center gap-1.5 text-[7.5px] font-bold uppercase tracking-[0.28em]"
              style={{ color: "var(--hh-lcd-soft)" }}
            >
              <QrCode className="h-[11px] w-[11px]" /> Scan to open
            </span>
            <span className="mt-1.5 block truncate text-[10px] leading-snug" style={{ color: "var(--hh-lcd)" }}>
              {url}
            </span>
          </span>
        </div>

        <Row
          icon={copyState === "copied" ? Check : Copy}
          label="Copy link"
          detail={copyDetail}
          onClick={copy}
        />
        {canShare ? <Row icon={Share} label="Device share drawer" onClick={nativeShare} /> : null}
        <Row
          icon={Settings2}
          label="Profile settings"
          detail={isSignedIn ? null : "Sign in"}
          onClick={openSettings}
        />
      </div>

      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderTop: "1px solid rgb(var(--hh-metal-rgb) / 0.24)", background: "rgba(7,16,9,0.35)" }}
      >
        <span
          className="text-[7px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--hh-lcd-soft)" }}
        >
          ● Choose · B Back
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close share"
          className="text-[7px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--hh-lcd-bright)" }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}