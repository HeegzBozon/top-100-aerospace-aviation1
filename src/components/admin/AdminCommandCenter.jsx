import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { getDashboardStats } from '@/functions/getDashboardStats';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    LayoutDashboard, Users, Trophy, Camera, Briefcase, Rocket, Award,
    CalendarDays, DollarSign, Settings, FileText, Activity,
    RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Vote, UserPlus,
    Globe, BarChart3, Flame, Bot, Send, Loader2, Minimize2, Maximize2, ChevronDown
} from 'lucide-react';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const B = {
    navy: '#1e3a5a',
    navyDeep: '#0d2035',
    gold: '#c9a87c',
    goldDim: '#c9a87c40',
    sky: '#4a90b8',
    skyDim: '#4a90b840',
    surface: '#111c28',   // card base
    border: '#1e3a5a60', // subtle navy border
};

// ── Section tiles — mirrors adminNavConfig ────────────────────────────────────
const SECTION_TILES = [
    {
        id: 'season-ops',
        label: 'Season Ops',
        description: 'Live season, scoring, nominees & voting',
        icon: Trophy,
        accent: B.gold,
        primaryTab: 'season-command-center',
    },
    {
        id: 'crm',
        label: 'CRM — People',
        description: 'Users, nominees, claims & SMEs',
        icon: Users,
        accent: B.sky,
        primaryTab: 'user-management',
    },
    {
        id: 'cms',
        label: 'CMS — Content',
        description: 'Knowledge base, publications & moderation',
        icon: FileText,
        accent: '#7ec8a8',
        primaryTab: 'content',
    },
    {
        id: 'media',
        label: 'Media & Assets',
        description: 'Photo library, diagnostics & upload tools',
        icon: Camera,
        accent: '#9d7ec8',
        primaryTab: 'assets',
    },
    {
        id: 'marketplace',
        label: 'Marketplace',
        description: 'Services, providers & availability',
        icon: Briefcase,
        accent: '#c8a07e',
        primaryTab: 'services',
    },
    {
        id: 'raising-jupiter',
        label: 'Raising Jupiter',
        description: 'Startups, cohorts & milestones',
        icon: Rocket,
        accent: '#c87e9d',
        primaryTab: 'startups',
    },
    {
        id: 'events-partners',
        label: 'Events & Partners',
        description: 'Event calendar, sponsors & partnerships',
        icon: CalendarDays,
        accent: '#7ec8c8',
        primaryTab: 'events',
    },
    {
        id: 'revenue',
        label: 'Revenue',
        description: 'Sales analytics & financial intelligence',
        icon: DollarSign,
        accent: '#7ec87e',
        primaryTab: 'sales',
    },
    {
        id: 'devops',
        label: 'DevOps & Tools',
        description: 'Platform settings, icon rail & config',
        icon: Settings,
        accent: '#8a9eb8',
        primaryTab: 'settings',
    },
];

// ── Pulse metric strip ────────────────────────────────────────────────────────
function PulseMetric({ icon: Icon, label, value, accent, loading }) {
    return (
        <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}
        >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
            <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider leading-none mb-0.5" style={{ color: '#6b8199' }}>
                    {label}
                </div>
                {loading ? (
                    <div className="h-5 w-12 rounded animate-pulse" style={{ background: '#ffffff15' }} />
                ) : (
                    <div className="text-base font-bold leading-none" style={{ color: '#e8eef4' }}>
                        {value}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Section tile card ─────────────────────────────────────────────────────────
function SectionTile({ tile, onNavigate, statusBadge }) {
    const Icon = tile.icon;
    return (
        <button
            onClick={() => onNavigate(tile.primaryTab)}
            className="group relative w-full text-left rounded-xl focus:outline-none transition-all duration-200"
            style={{
                background: B.surface,
                border: `1px solid ${tile.accent}28`,
                padding: '18px',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${tile.accent}60`;
                e.currentTarget.style.background = `${B.surface}`;
                e.currentTarget.style.boxShadow = `0 4px 24px ${tile.accent}18`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = `${tile.accent}28`;
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Icon */}
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${tile.accent}18`, border: `1px solid ${tile.accent}30` }}
            >
                <Icon className="w-4.5 h-4.5" style={{ color: tile.accent, width: '18px', height: '18px' }} />
            </div>

            {/* Text */}
            <div className="font-semibold text-sm mb-0.5" style={{ color: '#d4e0ec' }}>{tile.label}</div>
            <div className="text-xs leading-snug" style={{ color: '#5d7a94' }}>{tile.description}</div>

            {/* Status */}
            {statusBadge && <div className="mt-2.5">{statusBadge}</div>}

            {/* Arrow */}
            <div
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ArrowRight style={{ width: '14px', height: '14px', color: tile.accent }} />
            </div>
        </button>
    );
}

// ── Agent Skill Panel ─────────────────────────────────────────────────────────

const AGENT_SKILLS = [
    {
        id: 'qa-engineer',
        label: 'QA Engineer',
        agentName: 'qa_engineer',
        color: '#7ec8a8',
        description: 'Test plans, bug triage, release readiness',
        icon: '🧪',
    },
    {
        id: 'principal-engineer',
        label: 'Principal Engineer',
        agentName: 'principal_engineer',
        color: '#c9a87c',
        description: 'Architecture, cross-system design',
        icon: '⚙️',
    },
];

function AgentSkillPanel({ skill }) {
    const [minimized, setMinimized] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [conversation, setConversation] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!minimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, minimized]);

    const initConversation = async () => {
        if (conversation) return conversation;
        const conv = await base44.agents.createConversation({
            agent_name: skill.agentName,
            metadata: { name: `${skill.label} — Admin`, source: 'admin-command-center' }
        });
        setConversation(conv);
        return conv;
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setInput('');
        setSending(true);
        const userMsg = { role: 'user', content: text, id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        try {
            let conv = conversation;
            if (!conv) conv = await initConversation();
            const updated = await base44.agents.addMessage(conv, { role: 'user', content: text });
            setConversation(updated);
            setMessages(updated.messages || []);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again.', id: Date.now() + 1 }]);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (!conversation?.id) return;
        const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
            setMessages(data.messages || []);
        });
        return () => unsub();
    }, [conversation?.id]);

    return (
        <div className="rounded-xl overflow-hidden flex flex-col" style={{ border: `1px solid ${skill.color}28`, background: '#0a1622' }}>
            {/* Header */}
            <button
                onClick={() => setMinimized(!minimized)}
                className="flex items-center gap-3 px-4 py-3 w-full text-left"
                style={{ background: `${skill.color}0e`, borderBottom: minimized ? 'none' : `1px solid ${skill.color}18` }}
            >
                <span className="text-lg">{skill.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#d4e0ec' }}>{skill.label}</p>
                    <p className="text-xs truncate" style={{ color: `${skill.color}90` }}>{skill.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: skill.color }} />
                    {minimized ? <Maximize2 style={{ width: 13, height: 13, color: '#3d6080' }} /> : <Minimize2 style={{ width: 13, height: 13, color: '#3d6080' }} />}
                </div>
            </button>

            {!minimized && (
                <>
                    <div className="overflow-y-auto p-3 space-y-2.5" style={{ minHeight: 180, maxHeight: 260 }}>
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-6 text-center gap-1.5">
                                <span className="text-2xl">{skill.icon}</span>
                                <p className="text-xs" style={{ color: '#3d6080' }}>Ask {skill.label} anything…</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className="max-w-[88%] rounded-lg px-3 py-2 text-xs leading-relaxed"
                                        style={msg.role === 'user'
                                            ? { background: '#1e3a5a', color: '#c8d8e8' }
                                            : { background: `${skill.color}12`, color: '#a8c0d4', border: `1px solid ${skill.color}18` }}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="px-3 py-2 rounded-lg" style={{ background: `${skill.color}12` }}>
                                    <Loader2 className="w-3 h-3 animate-spin" style={{ color: skill.color }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="px-3 pb-3 pt-2 flex gap-2" style={{ borderTop: `1px solid ${skill.color}12` }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder={`Ask ${skill.label}…`}
                            className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                            style={{ background: '#ffffff08', border: `1px solid ${skill.color}20`, color: '#c8d8e8' }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || sending}
                            className="px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40 flex items-center justify-center"
                            style={{ background: skill.color, color: '#0a1622' }}
                        >
                            <Send style={{ width: 13, height: 13 }} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminCommandCenter({ onNavigate, currentUser }) {
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [platformData, setPlatformData] = useState(null);
    const [platformLoading, setPlatformLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const loadingRef = useRef(false);
    const { toast } = useToast();

    // ── Load dashboard KPI stats ──
    const loadStats = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setStatsLoading(true);
        try {
            const { data } = await getDashboardStats();
            if (data?.success) {
                setStats(data.data);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('AdminCommandCenter loadStats error:', err);
        } finally {
            setStatsLoading(false);
            loadingRef.current = false;
        }
    }, []);

    // ── Load cross-platform counts ──
    const loadPlatformData = useCallback(async () => {
        setPlatformLoading(true);
        try {
            const [seasons, events] = await Promise.all([
                base44.entities.Season.list('-created_date', 5).catch(() => []),
                base44.entities.Event.list('-created_date', 3).catch(() => []),
            ]);

            const now = new Date();
            const activeSeason = seasons.find(s => {
                const start = new Date(s.voting_start);
                const end = new Date(s.voting_end);
                return now >= start && now <= end;
            }) || seasons[0] || null;

            let seasonNomineeCount = 0;
            if (activeSeason) {
                const seasonNominees = await base44.entities.Nominee.filter({ season_id: activeSeason.id }).catch(() => []);
                seasonNomineeCount = seasonNominees.length;
            }

            setPlatformData({
                activeSeason,
                seasons,
                seasonNomineeCount,
                upcomingEvents: events.filter(e => new Date(e.event_date) > now).length,
            });
        } catch (err) {
            console.error('AdminCommandCenter loadPlatformData error:', err);
        } finally {
            setPlatformLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
        loadPlatformData();
        const interval = setInterval(loadStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadStats, loadPlatformData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadStats(), loadPlatformData()]);
        setRefreshing(false);
        toast({ title: 'Refreshed', description: 'Mission Control data updated.' });
    };

    // ── Season status badge ──
    const getSeasonStatus = () => {
        if (platformLoading) return null;
        const s = platformData?.activeSeason;
        if (!s) return (
            <Badge className="text-xs" style={{ background: '#ffffff0a', color: '#6b8199', border: '1px solid #2a4a60' }}>
                No Active Season
            </Badge>
        );
        const end = new Date(s.voting_end);
        const daysLeft = Math.ceil((end - new Date()) / 86400000);
        if (daysLeft <= 0) return (
            <Badge className="text-xs" style={{ background: '#ffffff0a', color: '#6b8199', border: '1px solid #2a4a60' }}>
                Season Closed
            </Badge>
        );
        if (daysLeft <= 7) return (
            <Badge className="text-xs" style={{ background: '#c9a87c18', color: B.gold, border: `1px solid ${B.goldDim}` }}>
                <Flame className="w-3 h-3 mr-1" />{daysLeft}d left
            </Badge>
        );
        return (
            <Badge className="text-xs" style={{ background: '#7ec8a818', color: '#7ec8a8', border: '1px solid #7ec8a830' }}>
                <CheckCircle2 className="w-3 h-3 mr-1" />Active · {daysLeft}d
            </Badge>
        );
    };

    const tileStatuses = { 'season-ops': getSeasonStatus() };

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = currentUser?.full_name?.split(' ')[0] || 'Commander';

    return (
        <div className="space-y-6 pb-8">

            {/* ── Hero Header ─────────────────────────────────────────────── */}
            <div
                className="relative overflow-hidden rounded-2xl p-7"
                style={{
                    background: `linear-gradient(135deg, ${B.navyDeep} 0%, #152b43 60%, #0d2035 100%)`,
                    border: `1px solid ${B.navy}`,
                    boxShadow: `0 0 60px ${B.navy}40`,
                }}
            >
                {/* Subtle accent orb — gold, top-right */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: 300, height: 300,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${B.gold}18, transparent 70%)`,
                        top: -80, right: -60,
                    }}
                />
                {/* Subtle accent orb — sky, bottom-left */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: 220, height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${B.sky}14, transparent 70%)`,
                        bottom: -60, left: -40,
                    }}
                />

                <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    {/* Left: title + greeting */}
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: `linear-gradient(135deg, ${B.gold}, ${B.sky})`,
                                    boxShadow: `0 4px 16px ${B.gold}30`,
                                }}
                            >
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e8eef4' }}>
                                    Mission Control
                                </h1>
                                <p className="text-xs" style={{ color: '#4a6880' }}>
                                    TOP 100 — Admin Command Center
                                </p>
                            </div>
                        </div>
                        <p className="text-sm" style={{ color: '#7a9cb8' }}>
                            {greeting},{' '}
                            <span className="font-semibold" style={{ color: '#c8d8e8' }}>{firstName}</span>.{' '}
                            {platformData?.activeSeason ? (
                                <>
                                    Running{' '}
                                    <span className="font-semibold" style={{ color: B.gold }}>
                                        {platformData.activeSeason.name}
                                    </span>
                                    .
                                </>
                            ) : 'No active season running.'}
                        </p>
                    </div>

                    {/* Right: refresh / timestamp */}
                    <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                        {lastUpdated && (
                            <span className="text-xs" style={{ color: '#3a5a74' }}>
                                {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || statsLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                            style={{
                                background: '#ffffff08',
                                border: `1px solid ${B.border}`,
                                color: '#7a9cb8',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = `${B.gold}40`; e.currentTarget.style.color = B.gold; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.color = '#7a9cb8'; }}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── Pulse Metrics ── */}
                <div className="relative mt-5 flex flex-wrap gap-2">
                    <PulseMetric icon={Vote} label="Votes Today" value={stats?.votesToday?.toLocaleString() ?? '—'} accent={B.gold} loading={statsLoading} />
                    <PulseMetric icon={Users} label="Active Voters" value={stats?.dauToday?.toLocaleString() ?? '—'} accent={B.sky} loading={statsLoading} />
                    <PulseMetric icon={UserPlus} label="New Users" value={stats?.usersToday?.toLocaleString() ?? '—'} accent="#9d7ec8" loading={statsLoading} />
                    <PulseMetric icon={Trophy} label="Nominees" value={platformLoading ? '—' : (platformData?.seasonNomineeCount?.toLocaleString() ?? '—')} accent={B.gold} loading={platformLoading} />
                    <PulseMetric icon={Globe} label="Total Users" value={stats?.totalUsers?.toLocaleString() ?? '—'} accent="#7ec8a8" loading={statsLoading} />
                    <PulseMetric icon={CalendarDays} label="Upcoming Events" value={platformLoading ? '—' : (platformData?.upcomingEvents?.toString() ?? '0')} accent="#7ec8c8" loading={platformLoading} />
                </div>
            </div>

            {/* ── Operations Grid ──────────────────────────────────────────── */}
            <div>
                <div className="mb-3 flex items-baseline gap-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#3d6080' }}>
                        Operations Center
                    </h2>
                    <span className="text-xs" style={{ color: '#2a4a60' }}>— navigate to any mission domain</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {SECTION_TILES.map(tile => (
                        <SectionTile
                            key={tile.id}
                            tile={tile}
                            onNavigate={onNavigate}
                            statusBadge={tileStatuses[tile.id]}
                        />
                    ))}
                </div>
            </div>

            {/* ── Health Row ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                {/* Season Health */}
                <div
                    className="rounded-xl p-5"
                    style={{ background: B.surface, border: `1px solid ${B.border}` }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-4 h-4" style={{ color: B.gold }} />
                        <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>Season Health</span>
                        <button
                            onClick={() => onNavigate('season-command-center')}
                            className="ml-auto flex items-center gap-1 text-xs transition-colors"
                            style={{ color: '#3d6080' }}
                            onMouseEnter={e => { e.currentTarget.style.color = B.gold; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#3d6080'; }}
                        >
                            Season Ops <ArrowRight style={{ width: 12, height: 12 }} />
                        </button>
                    </div>
                    {platformLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-5 rounded animate-pulse" style={{ background: '#ffffff08' }} />
                            ))}
                        </div>
                    ) : platformData?.activeSeason ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span style={{ color: '#5d7a94' }}>Active season</span>
                                <span className="text-xs font-semibold" style={{ color: '#c8d8e8' }}>{platformData.activeSeason.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span style={{ color: '#5d7a94' }}>Nominees enrolled</span>
                                <span className="font-bold" style={{ color: B.gold }}>{platformData.seasonNomineeCount}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span style={{ color: '#5d7a94' }}>Votes today</span>
                                <span className="font-semibold" style={{ color: '#c8d8e8' }}>
                                    {statsLoading ? '...' : (stats?.votesToday?.toLocaleString() ?? '—')}
                                </span>
                            </div>
                            {(() => {
                                const end = new Date(platformData.activeSeason.voting_end);
                                const start = new Date(platformData.activeSeason.voting_start);
                                const pct = Math.min(100, Math.max(0, ((new Date() - start) / (end - start)) * 100));
                                return (
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5" style={{ color: '#3d6080' }}>
                                            <span>Season progress</span>
                                            <span>{Math.round(pct)}%</span>
                                        </div>
                                        <Progress value={pct} className="h-1.5" />
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-sm" style={{ color: '#3d6080' }}>
                            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            No active season
                        </div>
                    )}
                </div>

                {/* Platform Activity */}
                <div
                    className="rounded-xl p-5"
                    style={{ background: B.surface, border: `1px solid ${B.border}` }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4" style={{ color: B.sky }} />
                        <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>Platform Activity</span>
                        <button
                            onClick={() => onNavigate('user-management')}
                            className="ml-auto flex items-center gap-1 text-xs transition-colors"
                            style={{ color: '#3d6080' }}
                            onMouseEnter={e => { e.currentTarget.style.color = B.sky; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#3d6080'; }}
                        >
                            CRM <ArrowRight style={{ width: 12, height: 12 }} />
                        </button>
                    </div>
                    {statsLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-5 rounded animate-pulse" style={{ background: '#ffffff08' }} />
                            ))}
                        </div>
                    ) : stats ? (
                        <div className="space-y-3">
                            {[
                                { label: 'Votes today', value: stats.votesToday?.toLocaleString(), icon: Vote, accent: B.gold },
                                { label: 'Active voters (DAU)', value: stats.dauToday?.toLocaleString(), icon: Users, accent: B.sky },
                                { label: 'New signups today', value: stats.usersToday?.toLocaleString(), icon: UserPlus, accent: '#9d7ec8' },
                                { label: 'Votes last 7 days', value: stats.votesLast7Days?.toLocaleString(), icon: BarChart3, accent: '#7ec8a8' },
                                { label: 'Total platform users', value: stats.totalUsers?.toLocaleString(), icon: Globe, accent: '#c8a07e' },
                            ].map(({ label, value, icon: Icon, accent }) => (
                                <div key={label} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2" style={{ color: '#5d7a94' }}>
                                        <Icon style={{ width: 13, height: 13, color: accent }} />
                                        {label}
                                    </div>
                                    <span className="font-semibold tabular-nums" style={{ color: '#c8d8e8' }}>
                                        {value ?? '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-sm" style={{ color: '#3d6080' }}>
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            Stats unavailable
                        </div>
                    )}
                </div>
            </div>

            {/* ── Engineering Agents ───────────────────────────────────────── */}
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <Bot style={{ width: 14, height: 14, color: B.gold }} />
                    <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#3d6080' }}>
                        Engineering Agents
                    </h2>
                    <span className="text-xs ml-1" style={{ color: '#2a4a60' }}>— Season 4 ready</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AGENT_SKILLS.map(skill => (
                        <AgentSkillPanel key={skill.id} skill={skill} />
                    ))}
                </div>
            </div>

            {/* ── Quick Launch ─────────────────────────────────────────────── */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#3d6080' }}>
                    Quick Launch
                </h2>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Season Ops', tab: 'season-command-center', icon: Trophy, accent: B.gold },
                        { label: 'Nominees', tab: 'nominees', icon: Award, accent: B.sky },
                        { label: 'Users', tab: 'user-management', icon: Users, accent: '#9d7ec8' },
                        { label: 'Scoring', tab: 'scoring', icon: BarChart3, accent: '#7ec8a8' },
                        { label: 'Events', tab: 'events', icon: CalendarDays, accent: '#7ec8c8' },
                        { label: 'Assets', tab: 'assets', icon: Camera, accent: '#c8a07e' },
                        { label: 'Startups', tab: 'startups', icon: Rocket, accent: '#c87e9d' },
                        { label: 'Settings', tab: 'settings', icon: Settings, accent: '#8a9eb8' },
                    ].map(({ label, tab, icon: Icon, accent }) => (
                        <button
                            key={tab}
                            onClick={() => onNavigate(tab)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
                            style={{
                                background: '#ffffff06',
                                border: `1px solid ${B.border}`,
                                color: '#7a9cb8',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = `${accent}50`;
                                e.currentTarget.style.color = accent;
                                e.currentTarget.style.background = `${accent}0a`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = B.border;
                                e.currentTarget.style.color = '#7a9cb8';
                                e.currentTarget.style.background = '#ffffff06';
                            }}
                        >
                            <Icon style={{ width: 13, height: 13, color: accent }} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}