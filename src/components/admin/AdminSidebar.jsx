import { useState, useEffect } from 'react';
import { ADMIN_SECTIONS, findTabById } from './adminNavConfig';
import { ChevronDown, PanelLeftClose, PanelLeft, Search, Command } from 'lucide-react';

const COLLAPSED_KEY = 'adminSidebarCollapsed';
const SECTIONS_KEY = 'adminSidebarSections';

export default function AdminSidebar({ activeTab, onTabChange, onCommandPaletteOpen, collapsed, onCollapsedChange }) {
    // Track which sections are expanded
    const [expandedSections, setExpandedSections] = useState(() => {
        try {
            const saved = localStorage.getItem(SECTIONS_KEY);
            if (saved) return JSON.parse(saved);
        } catch { }
        // Default: expand the section containing the active tab
        const result = findTabById(activeTab);
        if (result) return { [result.section.id]: true };
        return { 'command-center': true };
    });

    // Auto-expand section when activeTab changes
    useEffect(() => {
        const result = findTabById(activeTab);
        if (result && !expandedSections[result.section.id]) {
            setExpandedSections(prev => ({ ...prev, [result.section.id]: true }));
        }
    }, [activeTab]);

    // Persist expanded sections
    useEffect(() => {
        localStorage.setItem(SECTIONS_KEY, JSON.stringify(expandedSections));
    }, [expandedSections]);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    return (
        <aside
            className={`
        ${collapsed ? 'w-16' : 'w-64'}
        flex-shrink-0 bg-[#0c1929] border-r border-white/5
        flex flex-col h-full transition-all duration-300 ease-in-out
        overflow-hidden
      `}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-4 border-b border-white/5">
                {!collapsed && (
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a87c] to-[#4a90b8] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#c9a87c]/20">
                            <span className="text-white font-black text-xs">T</span>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-white truncate leading-tight">Mission Control</h2>
                            <p className="text-[10px] text-slate-500 leading-tight">Admin Console</p>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a87c] to-[#4a90b8] flex items-center justify-center mx-auto shadow-lg shadow-[#c9a87c]/20">
                        <span className="text-white font-black text-xs">T</span>
                    </div>
                )}
                <button
                    onClick={() => onCollapsedChange(!collapsed)}
                    className="text-slate-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 flex-shrink-0"
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
            </div>

            {/* Search trigger */}
            {!collapsed && (
                <button
                    onClick={onCommandPaletteOpen}
                    className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all text-xs"
                >
                    <Search className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="flex-1 text-left">Search...</span>
                    <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-slate-500 border border-white/5">
                        <Command className="w-2.5 h-2.5" />K
                    </kbd>
                </button>
            )}

            {/* Navigation Sections */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1 scrollbar-thin">
                {ADMIN_SECTIONS.map((section) => {
                    const SectionIcon = section.icon;
                    const isExpanded = expandedSections[section.id];
                    const hasActiveTab = section.tabs.some(t => t.id === activeTab);

                    return (
                        <div key={section.id}>
                            {/* Section header */}
                            <button
                                onClick={() => {
                                    if (collapsed) {
                                        // When collapsed, clicking section goes to first tab
                                        onCollapsedChange(false);
                                        onTabChange(section.tabs[0].id);
                                    } else {
                                        toggleSection(section.id);
                                    }
                                }}
                                className={`
                  w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all duration-150
                  ${hasActiveTab
                                        ? 'text-[#c9a87c] bg-[#c9a87c]/5'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }
                `}
                                title={collapsed ? section.label : undefined}
                            >
                                <SectionIcon className={`w-4 h-4 flex-shrink-0 ${hasActiveTab ? 'text-[#c9a87c]' : ''}`} />
                                {!collapsed && (
                                    <>
                                        <span className="flex-1 text-xs font-semibold uppercase tracking-wider truncate">
                                            {section.label}
                                        </span>
                                        <ChevronDown
                                            className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-0' : '-rotate-90'
                                                }`}
                                        />
                                    </>
                                )}
                            </button>

                            {/* Sub-tabs */}
                            {!collapsed && isExpanded && (
                                <div className="mt-0.5 ml-3 pl-3 border-l border-white/5 space-y-0.5">
                                    {section.tabs.map((tab) => {
                                        const TabIcon = tab.icon;
                                        const isActive = tab.id === activeTab;

                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => onTabChange(tab.id)}
                                                className={`
                          w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-all duration-150 group
                          ${isActive
                                                        ? 'bg-gradient-to-r from-[#c9a87c]/15 to-[#4a90b8]/10 text-white border border-[#c9a87c]/20'
                                                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                                    }
                        `}
                                            >
                                                {isActive && (
                                                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#c9a87c] to-[#4a90b8] flex-shrink-0" />
                                                )}
                                                <TabIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#c9a87c]' : 'group-hover:text-slate-300'}`} />
                                                <span className="text-[13px] truncate">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="px-3 py-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Mission Control v2</span>
                    </div>
                </div>
            )}
        </aside>
    );
}
