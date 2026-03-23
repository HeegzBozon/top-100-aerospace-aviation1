import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Smile, ChevronRight, ShieldCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { base44 } from "@/api/base44Client";

export default function UserProfilePopover({ user }) {
  const [open, setOpen] = useState(false);

  const handleLogout = () => base44.auth.logout();

  if (!user) return null;

  const initials =
    user.full_name?.slice(0, 2).toUpperCase() ||
    user.email?.slice(0, 2).toUpperCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-11 h-11 rounded-lg overflow-hidden relative hover:opacity-90 transition-all"
          aria-label="User profile menu"
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              className="w-11 h-11 object-cover"
              alt={user.full_name || "User avatar"}
            />
          ) : (
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          )}
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f1a2a] rounded-full" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="end"
        className="w-72 p-0 border-0 shadow-2xl rounded-xl overflow-hidden"
        style={{ background: "#1a1d21" }}
      >
        {/* User header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} className="w-14 h-14 object-cover" alt="" />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-bold text-[15px]">
              {user.full_name || user.email?.split("@")[0]}
            </p>
            <p className="text-green-400 text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Active
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="px-4 pb-3">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/5 transition-colors">
            <Smile className="w-5 h-5" />
            <span className="text-[15px]">Update your status</span>
          </button>
        </div>

        <div className="h-px bg-white/10" />

        <div className="py-2">
          <button className="w-full flex items-center justify-between px-4 py-2 text-white/90 hover:bg-white/10 transition-colors">
            <span className="text-[15px]">
              Set yourself as <strong>away</strong>
            </span>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-2 text-white/90 hover:bg-white/10 transition-colors">
            <span className="text-[15px]">Pause notifications</span>
            <ChevronRight className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="h-px bg-white/10" />

        <div className="py-2">
          <Link
            to={createPageUrl("Profile")}
            onClick={() => setOpen(false)}
            className="flex items-center px-4 py-2 text-white/90 hover:bg-white/10 transition-colors"
          >
            <span className="text-[15px]">Profile</span>
          </Link>
          <Link
            to={createPageUrl("Profile")}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-2 text-white/90 hover:bg-white/10 transition-colors"
          >
            <span className="text-[15px]">Preferences</span>
            <span className="text-white/40 text-xs">⌘,</span>
          </Link>
          {user?.role === "admin" && (
            <Link
              to={createPageUrl("Admin")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-amber-300 hover:bg-white/10 transition-colors font-semibold"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[15px]">Admin Panel</span>
            </Link>
          )}
        </div>

        <div className="h-px bg-white/10" />

        <div className="py-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-white/90 hover:bg-white/10 transition-colors"
          >
            <span className="text-[15px]">Sign out of TOP 100 Aerospace</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}