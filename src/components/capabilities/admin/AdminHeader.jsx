import { Settings, Database, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ADMIN_TABS } from "./AdminTabs";

export function AdminHeader({
  currentUser,
  activeTab,
  onTabChange,
  toolsExpanded,
  onToggleTools,
}) {
  return (
    <div className="mb-6 relative z-50">
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[var(--card)]/60 backdrop-blur-sm rounded-xl border border-[var(--border)]">
        {/* Left: Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-lg flex items-center justify-center shadow-md">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-[var(--text)] leading-tight">Admin</h1>
            <p className="text-xs text-[var(--muted)]">{currentUser?.full_name?.split(' ')[0] || 'Admin'}</p>
          </div>
        </div>

        {/* Center: Section Dropdown */}
        <div className="flex-1 max-w-xs">
          <Select value={activeTab} onValueChange={onTabChange}>
            <SelectTrigger className="w-full bg-white/50 dark:bg-gray-800/50 border-[var(--border)] text-[var(--text)]">
              <SelectValue placeholder="Select section..." />
            </SelectTrigger>
            <SelectContent className="max-h-80" style={{ zIndex: 99999 }}>
              {ADMIN_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={tab.id} value={tab.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Right: Tools Toggle */}
        <button
          onClick={onToggleTools}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--border)]/50 transition-colors flex-shrink-0"
        >
          <Database className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text)]">Tools</span>
          <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${toolsExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}