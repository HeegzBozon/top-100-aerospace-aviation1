import { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_ADMIN_TABS } from './adminNavConfig';
import { Search, ArrowRight, Clock, Command, X } from 'lucide-react';

const RECENT_KEY = 'adminRecentTabs';
const MAX_RECENT = 5;

function getRecentTabs() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
        return [];
    }
}

export function addRecentTab(tabId) {
    const recent = getRecentTabs().filter(id => id !== tabId);
    recent.unshift(tabId);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export default function AdminCommandPalette({ isOpen, onClose, onTabChange }) {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Global ⌘K listener
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else onClose(); // toggle via parent
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const selectTab = useCallback((tabId) => {
        addRecentTab(tabId);
        onTabChange(tabId);
        onClose();
    }, [onTabChange, onClose]);

    // Filter tabs by query
    const filteredTabs = query.trim()
        ? ALL_ADMIN_TABS.filter(tab =>
            tab.label.toLowerCase().includes(query.toLowerCase()) ||
            tab.sectionLabel.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    // Recent tabs
    const recentIds = getRecentTabs();
    const recentTabs = recentIds
        .map(id => ALL_ADMIN_TABS.find(t => t.id === id))
        .filter(Boolean);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh]" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Palette */}
            <div
                className="relative w-full max-w-lg bg-[#0c1929] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                    <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') onClose();
                            if (e.key === 'Enter' && filteredTabs.length > 0) {
                                selectTab(filteredTabs[0].id);
                            }
                        }}
                        placeholder="Search admin sections..."
                        className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 outline-none"
                    />
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-2">
                    {query.trim() === '' && recentTabs.length > 0 && (
                        <>
                            <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                Recent
                            </div>
                            {recentTabs.map((tab) => {
                                const TabIcon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => selectTab(tab.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                        <TabIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm text-white">{tab.label}</span>
                                            <span className="text-xs text-slate-500 ml-2">{tab.sectionLabel}</span>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                );
                            })}
                        </>
                    )}

                    {query.trim() !== '' && filteredTabs.length === 0 && (
                        <div className="px-4 py-8 text-center text-slate-500 text-sm">
                            No results for "{query}"
                        </div>
                    )}

                    {filteredTabs.length > 0 && (
                        <>
                            <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                Results
                            </div>
                            {filteredTabs.map((tab) => {
                                const TabIcon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => selectTab(tab.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <TabIcon className="w-4 h-4 text-[#c9a87c] flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm text-white">{tab.label}</span>
                                            <span className="text-xs text-slate-500 ml-2">{tab.sectionLabel}</span>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                );
                            })}
                        </>
                    )}

                    {query.trim() === '' && recentTabs.length === 0 && (
                        <div className="px-4 py-8 text-center text-sm">
                            <Command className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-400">Start typing to search</p>
                            <p className="text-slate-600 text-xs mt-1">Search across all admin sections</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-[10px] text-slate-600">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/5">↵</kbd> select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/5">esc</kbd> close
                        </span>
                    </div>
                    <span>{ALL_ADMIN_TABS.length} sections available</span>
                </div>
            </div>
        </div>
    );
}
