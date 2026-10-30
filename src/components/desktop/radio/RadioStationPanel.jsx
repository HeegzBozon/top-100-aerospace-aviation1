import { Link } from "react-router-dom";
import { LogIn, LogOut, Shield, User, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

// The station: who is standing at the machine, and the way in or out of the record. It
// hangs from the copper key at the far end of the faceplate, where a transceiver keeps
// the operator's settings.
export default function RadioStationPanel({ user, onClose }) {
  // The record is still being read; the drawer says so rather than claiming the seat is
  // empty, which would be a lie for the second it takes.
  const pending = user === undefined;
  const signedIn = Boolean(user);

  const signIn = () => {
    onClose();
    base44.auth.redirectToLogin(window.location.href);
  };

  const signOut = () => {
    onClose();
    base44.auth.logout(`${window.location.origin}/`);
  };

  return (
    <div role="menu" aria-label="Station" className="rd-panel rd-panel--station">
      <div className="rd-panel-head">
        <div>
          <p className="rd-panel-kicker">FUNC · Station</p>
          <p className="rd-panel-title">
            {pending ? "Reading the station…" : signedIn ? user.full_name || "Fellow" : "Not signed in"}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close the station" className="rd-panel-x">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {pending ? null : signedIn ? (
        <>
          <p className="rd-panel-mail">{user.email}</p>
          <Link to="/Profile" role="menuitem" onClick={onClose} className="rd-panel-item mt-2">
            <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
            My Profile
          </Link>
          {user.role === "admin" ? (
            <Link to="/Admin" role="menuitem" onClick={onClose} className="rd-panel-item">
              <Shield className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
              Admin Portal
            </Link>
          ) : null}
          <button type="button" role="menuitem" onClick={signOut} className="rd-panel-item rd-panel-item--quiet">
            <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
            Log out
          </button>
        </>
      ) : (
        <button type="button" role="menuitem" onClick={signIn} className="rd-panel-item mt-2 rd-panel-item--loud">
          <LogIn className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
          Sign in · create your account
        </button>
      )}
    </div>
  );
}