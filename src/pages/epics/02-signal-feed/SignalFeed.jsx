import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    Activity, Zap, BrainCircuit, UserPlus, Award, Trophy,
    Rocket, Building2, BookOpen, ShieldCheck, ArrowUpRight,
    Filter, Bell, TrendingUp, Newspaper, FileText,
    Star, Briefcase, Globe, Sparkles, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const brandColors = {
    navyDeep: '#1e3a5a',
    goldPrestige: '#c9a87c',
    skyBlue: '#4a90b8',
    cream: '#faf8f5',
};

// Signal type → visual config
const SIGNAL_CONFIG = {
    nomination: { icon: UserPlus, label: 'Nomination', color: '#3b82f6', bg: '#eff6ff' },
    patent: { icon: Zap, label: 'Patent', color: '#f97316', bg: '#fff7ed' },
    research: { icon: BrainCircuit, label: 'Research', color: '#8b5cf6', bg: '#f5f3ff' },
    recognition: { icon: Trophy, label: 'Recognition', color: '#eab308', bg: '#fefce8' },
    article: { icon: Newspaper, label: 'Article', color: '#06b6d4', bg: '#ecfeff' },
    startup: { icon: Rocket, label: 'Venture', color: '#10b981', bg: '#ecfdf5' },
    flightography: { icon: Briefcase, label: 'Career Credit', color: '#ec4899', bg: '#fdf2f8' },
    community: { icon: Star, label: 'Community', color: '#6366f1', bg: '#eef2ff' },
    milestone: { icon: Award, label: 'Milestone', color: '#14b8a6', bg: '#f0fdfa' },
    system: { icon: Globe, label: 'Platform', color: '#64748b', bg: '#f8fafc' },
};

function timeAgo(dateString) {
    if (!dateString) return 'recently';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildFeedItems(nominations, signals, articles, startups) {
    const items = [];

    // Nominations → feed items
    (nominations || []).forEach(n => {
        items.push({
            id: `nom-${n.id}`,
            type: 'nomination',
            title: `${n.full_name || 'A nominee'} was nominated`,
            subtitle: n.title || n.current_organization || '',
            description: n.nomination_reason ? n.nomination_reason.slice(0, 160) + '...' : 'Nominated for the TOP 100 recognition list.',
            link: n.id ? `Nominee?id=${n.id}` : null,
            timestamp: n.created_date || n.updated_date,
            avatar: n.avatar_url,
            meta: n.category || 'Aerospace',
        });
    });

    // Intelligence Signals → feed items
    (signals || []).forEach(s => {
        items.push({
            id: `sig-${s.id}`,
            type: s.type || 'research',
            title: s.title,
            subtitle: s.source || '',
            description: s.summary || s.abstract || '',
            link: s.external_url,
            externalLink: true,
            timestamp: s.publication_date || s.verified_at || s.created_date,
            meta: s.matched_user_id ? 'Matched' : 'Unmatched',
        });
    });

    // Articles → feed items
    (articles || []).forEach(a => {
        items.push({
            id: `art-${a.id}`,
            type: 'article',
            title: a.title,
            subtitle: a.author_name || 'Editorial Team',
            description: a.excerpt || a.summary || '',
            link: a.id ? `Article?id=${a.id}` : null,
            timestamp: a.publish_date || a.created_date,
            avatar: a.cover_image_url,
            meta: a.category || 'Journal',
        });
    });

    // Startups → feed items  
    (startups || []).forEach(s => {
        if (s.status === 'active' || s.visibility === 'public') {
            items.push({
                id: `startup-${s.id}`,
                type: 'startup',
                title: `${s.company_name || s.name} joined the Capital Network`,
                subtitle: s.sector || s.industry || '',
                description: s.one_liner || s.description?.slice(0, 160) || '',
                link: s.id ? `ProfileView?id=${s.id}` : null,
                timestamp: s.created_date,
                avatar: s.logo_url,
                meta: s.stage || 'Pre-Seed',
            });
        }
    });

    // Sort by timestamp descending
    items.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return items;
}

export default function SignalFeed() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [user, setUser] = useState(null);

    useEffect(() => {
        User.me().then(setUser).catch(() => { });
    }, []);

    // Fetch nominations
    const { data: nominations = [] } = useQuery({
        queryKey: ['feed-nominations'],
        queryFn: () => base44.entities.Nominee.list('-created_date', 25),
        staleTime: 60000,
    });

    // Fetch intelligence signals
    const { data: signals = [] } = useQuery({
        queryKey: ['feed-signals'],
        queryFn: () => base44.entities.IntelligenceSignal.list('-verified_at', 25),
        staleTime: 60000,
    });

    // Fetch articles
    const { data: articles = [] } = useQuery({
        queryKey: ['feed-articles'],
        queryFn: () => base44.entities.Article.filter({ status: 'published' }, '-publish_date', 15),
        staleTime: 60000,
    });

    // Fetch startups
    const { data: startups = [] } = useQuery({
        queryKey: ['feed-startups'],
        queryFn: () => base44.entities.StartupProfile.list('-created_date', 15),
        staleTime: 60000,
    });

    const feedItems = useMemo(
        () => buildFeedItems(nominations, signals, articles, startups),
        [nominations, signals, articles, startups]
    );

    const filteredItems = activeFilter === 'all'
        ? feedItems
        : feedItems.filter(item => item.type === activeFilter);

    // Count by type for filter badges
    const typeCounts = useMemo(() => {
        const counts = {};
        feedItems.forEach(item => {
            counts[item.type] = (counts[item.type] || 0) + 1;
        });
        return counts;
    }, [feedItems]);

    const filterTabs = [
        { key: 'all', label: 'All', count: feedItems.length },
        { key: 'nomination', label: 'Nominations', count: typeCounts.nomination || 0 },
        { key: 'patent', label: 'Patents', count: typeCounts.patent || 0 },
        { key: 'research', label: 'Research', count: typeCounts.research || 0 },
        { key: 'article', label: 'Journal', count: typeCounts.article || 0 },
        { key: 'startup', label: 'Ventures', count: typeCounts.startup || 0 },
    ].filter(t => t.count > 0 || t.key === 'all');

    return (
        <div className="min-h-screen py-8 px-4" style={{ background: brandColors.cream }}>
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${brandColors.navyDeep}10` }}>
                            <Activity className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
                                Signal Feed
                            </h1>
                            <p className="text-sm text-slate-500">
                                Everything happening across the aerospace ecosystem
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {filterTabs.map(tab => {
                        const config = SIGNAL_CONFIG[tab.key];
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === tab.key
                                    ? 'text-white shadow-lg scale-105'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                                    }`}
                                style={activeFilter === tab.key ? {
                                    background: tab.key === 'all' ? brandColors.navyDeep : config?.color || brandColors.navyDeep,
                                } : {}}
                            >
                                {tab.label}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeFilter === tab.key ? 'bg-white/20' : 'bg-slate-100'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Live indicator */}
                <div className="flex items-center gap-2 mb-6 px-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Live • {filteredItems.length} signals
                    </span>
                </div>

                {/* Feed Items */}
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, idx) => {
                            const config = SIGNAL_CONFIG[item.type] || SIGNAL_CONFIG.system;
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                                    className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all overflow-hidden"
                                >
                                    <div className="p-5">
                                        <div className="flex gap-4">
                                            {/* Signal Icon */}
                                            <div className="shrink-0">
                                                <div
                                                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                                                    style={{ background: config.bg }}
                                                >
                                                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 mb-1">
                                                    <h3 className="font-semibold text-[15px] leading-snug group-hover:text-goldPrestige transition-colors" style={{ color: brandColors.navyDeep }}>
                                                        {item.title}
                                                    </h3>
                                                    {item.link && (
                                                        item.externalLink ? (
                                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                                                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                                            </a>
                                                        ) : (
                                                            <Link to={createPageUrl(item.link)} className="shrink-0">
                                                                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                                            </Link>
                                                        )
                                                    )}
                                                </div>

                                                {item.subtitle && (
                                                    <p className="text-xs text-slate-400 mb-2 font-medium">{item.subtitle}</p>
                                                )}

                                                {item.description && (
                                                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
                                                        {item.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        className="text-[10px] font-bold uppercase tracking-wider border-none"
                                                        style={{ background: config.bg, color: config.color }}
                                                    >
                                                        {config.label}
                                                    </Badge>
                                                    {item.meta && (
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {item.meta}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-300 ml-auto">
                                                        {timeAgo(item.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-20">
                            <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="text-sm text-slate-400">No signals found for this filter</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
