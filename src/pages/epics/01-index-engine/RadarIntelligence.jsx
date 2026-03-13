import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, BrainCircuit, Search, Filter, TrendingUp,
    ArrowUpRight, Users, Building2, Globe, ShieldCheck,
    Rocket, Briefcase, ChevronRight, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const brandColors = {
    navyDeep: '#1e3a5a',
    goldPrestige: '#c9a87c',
    skyBlue: '#4a90b8',
    cream: '#faf8f5',
};

const SECTOR_STATS = [
    { name: 'Propulsion', signals: 142, growth: '+12%', color: '#f97316' },
    { name: 'Orbital Infra', signals: 89, growth: '+24%', color: '#8b5cf6' },
    { name: 'Avionics', signals: 67, growth: '+8%', color: '#0ea5e9' },
    { name: 'Sustainability', signals: 54, growth: '+42%', color: '#10b981' },
];

export default function RadarIntelligence() {
    const [signals, setSignals] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isIngesting, setIsIngesting] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        fetchSignals();
    }, [activeFilter]);

    const fetchSignals = async () => {
        setLoading(true);
        try {
            const filter = activeFilter === 'all' ? {} : { type: activeFilter };
            const data = await base44.entities.IntelligenceSignal.list(filter);
            setSignals(data.sort((a, b) => new Date(b.verified_at || Date.now()) - new Date(a.verified_at || Date.now())));
        } catch (error) {
            console.error('Error fetching signals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIngest = async (source) => {
        if (!searchQuery) {
            toast.error('Enter a search term first');
            return;
        }
        setIsIngesting(true);
        try {
            await base44.functions.invoke('ingestSignals', {
                source,
                query: searchQuery
            });
            toast.success(`Ingestion triggered for ${source}`);
            fetchSignals();
        } catch (error) {
            toast.error('Ingestion failed');
        } finally {
            setIsIngesting(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-xl">
                            <Badge variant="outline" className="mb-4 bg-white shadow-sm border-goldPrestige/20" style={{ color: brandColors.goldPrestige }}>
                                <Activity className="w-3 h-3 mr-1 animate-pulse" /> SYSTEM 3: RADAR INTELLIGENCE
                            </Badge>
                            <h1
                                className="text-4xl md:text-5xl font-bold mb-4"
                                style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                Aerospace Innovation Radar
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Surface, track, and validate technical signals across the global aerospace ecosystem. Bridging the gap between raw data and institutional recognition.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 p-1 bg-white rounded-full shadow-lg border border-slate-100">
                            {['all', 'patent', 'research'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-widest ${activeFilter === f ? 'bg-navy-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    style={activeFilter === f ? { background: brandColors.navyDeep } : {}}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {SECTOR_STATS.map(stat => (
                        <Card key={stat.name} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 rounded-lg" style={{ background: `${stat.color}15` }}>
                                        <TrendingUp className="w-4 h-4" style={{ color: stat.color }} />
                                    </div>
                                    <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px]">{stat.growth}</Badge>
                                </div>
                                <div className="text-2xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>{stat.signals}</div>
                                <div className="text-[10px] uppercase font-black tracking-tighter text-slate-400">{stat.name} Signals</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    className="pl-10 h-12 bg-white border-slate-200 rounded-xl"
                                    placeholder="Filter local feed or search global repos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                className="h-12 px-6 rounded-xl font-bold"
                                style={{ background: brandColors.navyDeep }}
                                onClick={() => fetchSignals()}
                            >
                                Refresh
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-20">
                                <Rocket className="w-12 h-12 animate-bounce text-slate-200" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {signals.map((signal, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={signal.id}
                                        className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-goldPrestige/20 transition-all cursor-pointer"
                                    >
                                        <div className="flex gap-6">
                                            <div className="shrink-0">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${signal.type === 'patent' ? 'bg-orange-50' : 'bg-purple-50'}`}>
                                                    {signal.type === 'patent' ? <Zap className="w-7 h-7 text-orange-400" /> : <BrainCircuit className="w-7 h-7 text-purple-400" />}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold mb-1 group-hover:text-goldPrestige transition-colors" style={{ color: brandColors.navyDeep }}>
                                                            {signal.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold">{signal.type}</Badge>
                                                            <span className="text-xs text-slate-400 font-medium">{signal.source} • {signal.publication_date || signal.verified_at?.split('T')[0]}</span>
                                                        </div>
                                                    </div>
                                                    {signal.external_url && (
                                                        <a href={signal.external_url} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="ghost" size="sm" className="rounded-full">
                                                                <ArrowUpRight className="w-4 h-4" />
                                                            </Button>
                                                        </a>
                                                    )}
                                                </div>
                                                <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                                                    {signal.summary || signal.abstract}
                                                </p>

                                                <div className="flex gap-4 pt-4 border-t border-slate-50">
                                                    {signal.matched_user_id && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                                                            <Users className="w-3 h-3 text-slate-400" />
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Matched to Nominee</span>
                                                        </div>
                                                    )}
                                                    {signal.matched_startup_id && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                                                            <Building2 className="w-3 h-3 text-slate-400" />
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Matched to Venture</span>
                                                        </div>
                                                    )}
                                                    {!signal.matched_user_id && !signal.matched_startup_id && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
                                                            <ShieldCheck className="w-3 h-3 text-amber-500" />
                                                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Awaiting Curation</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Curation */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg overflow-hidden">
                            <CardHeader className="bg-navy-900 text-white" style={{ background: brandColors.navyDeep }}>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-goldPrestige" /> Global Ingestion
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <p className="text-sm text-slate-500">
                                    Trigger targeted ingestion cycles to discover new research and patent activity for specific keywords.
                                </p>
                                <div className="space-y-2">
                                    <Button
                                        className="w-full justify-between"
                                        variant="outline"
                                        onClick={() => handleIngest('openalex')}
                                        disabled={isIngesting}
                                    >
                                        <div className="flex items-center gap-2">
                                            <BrainCircuit className="w-4 h-4 text-purple-500" />
                                            <span>OpenAlex Research</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        className="w-full justify-between"
                                        variant="outline"
                                        onClick={() => handleIngest('uspto')}
                                        disabled={isIngesting}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-orange-500" />
                                            <span>USPTO Patents</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-goldPrestige/5 border-goldPrestige/20">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: brandColors.goldPrestige }} />
                                    <h3 className="font-bold text-slate-800 mb-2">Institutional Authority</h3>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Signals surfaced here are matched against the Aerospace Talent Graph. Use the matching engine to link them to specific profiles.
                                    </p>
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest p-0 h-auto hover:bg-transparent" style={{ color: brandColors.goldPrestige }}>
                                        Open Matching Engine <ArrowUpRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
