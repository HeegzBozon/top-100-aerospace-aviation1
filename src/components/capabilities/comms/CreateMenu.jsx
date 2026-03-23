import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  MessageCircle,
  Briefcase,
  Calendar,
  Trophy,
  Users,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { brandColors } from "@/components/core/brandTheme";
import InvitePeopleModal from "./InvitePeopleModal";

export default function CreateMenu() {
  const [open, setOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      label: "Message",
      sublabel: "Start a conversation in a DM or channel",
      icon: MessageCircle,
      color: brandColors.skyBlue,
      shortcut: "⌘N",
      onAction: () => {
        setOpen(false);
        navigate(createPageUrl("Comms"));
        window.dispatchEvent(new CustomEvent("openNewConversation", { detail: { type: "dm" } }));
      },
    },
    {
      label: "New Job/Opportunity",
      sublabel: "Post a job or opportunity listing",
      icon: Briefcase,
      color: brandColors.goldPrestige,
      onAction: () => {
        setOpen(false);
        navigate(createPageUrl("MissionControl") + "?module=employer");
      },
    },
    {
      label: "Event",
      sublabel: "Schedule a meeting or event",
      icon: Calendar,
      color: brandColors.roseAccent,
      onAction: () => {
        setOpen(false);
        navigate(createPageUrl("Calendar") + "?action=create");
      },
    },
    {
      label: "Nomination",
      sublabel: "Nominate someone for TOP 100",
      icon: Trophy,
      color: brandColors.navyDeep,
      onAction: () => {
        setOpen(false);
        navigate(createPageUrl("Nominations") + "?nominate=true");
      },
    },
  ];

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
            aria-label="Create new"
          >
            <Plus className="w-6 h-6" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="right"
          align="end"
          className="w-72 p-0 border-0 shadow-2xl rounded-xl overflow-hidden bg-white"
        >
          <div className="p-3 border-b border-gray-100">
            <p className="font-semibold text-[15px] text-[#1e3a5a]">Create</p>
          </div>

          <div className="py-2">
            {actions.map(({ label, sublabel, icon: Icon, color, shortcut, onAction }) => (
              <button
                key={label}
                onClick={onAction}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] text-[#1e3a5a]">{label}</p>
                  <p className="text-xs text-[#1e3a5a]/60 truncate">{sublabel}</p>
                </div>
                {shortcut && (
                  <span className="text-xs text-[#1e3a5a]/40 shrink-0">{shortcut}</span>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 py-2">
            <button
              onClick={() => { setOpen(false); setShowInviteModal(true); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-5 h-5 ml-2.5 text-[#1e3a5a]/60" />
              <span className="text-[15px] text-[#1e3a5a]">Invite people</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <InvitePeopleModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </>
  );
}