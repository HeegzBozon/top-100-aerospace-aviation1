import { findTabById } from './adminNavConfig';
import { ChevronRight, LayoutDashboard } from 'lucide-react';

export default function AdminBreadcrumbs({ activeTab }) {
    const result = findTabById(activeTab);

    if (!result) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="font-medium text-[var(--text)]">Admin</span>
            </div>
        );
    }

    const { tab, section } = result;
    const SectionIcon = section.icon;

    return (
        <div className="flex items-center gap-1.5 text-xs">
            <LayoutDashboard className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span className="text-[var(--muted)]">Admin</span>
            <ChevronRight className="w-3 h-3 text-[var(--muted)]" />
            <SectionIcon className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span className="text-[var(--muted)]">{section.label}</span>
            <ChevronRight className="w-3 h-3 text-[var(--muted)]" />
            <span className="font-medium text-[var(--text)]">{tab.label}</span>
        </div>
    );
}
