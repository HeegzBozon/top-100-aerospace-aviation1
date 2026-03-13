import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  BarChart3, TrendingUp, FileText, Lightbulb, Users,
  Zap, BookOpen, Award, FlaskConical, Radio
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

// Signal type categories
const SIGNAL_CATEGORIES = [
  { id: 'publications', label: 'Publications', icon: FileText, description: 'Research papers & scholarly work' },
  { id: 'citations', label: 'Citations', icon: TrendingUp, description: 'Citation velocity & impact metrics' },
  { id: 'patents', label: 'Patents', icon: Lightbulb, description: 'Patent filings & innovations' },
  { id: 'media', label: 'Media Mentions', icon: Radio, description: 'News coverage & public mentions' },
  { id: 'funding', label: 'Research Funding', icon: Award, description: 'Grants & government contracts' },
  { id: 'institutions', label: 'Institutions', icon: FlaskConical, description: 'Org relationships & affiliations' },
  { id: 'pipelines', label: 'Research Pipelines', icon: Zap, description: 'Research → Patent flow' },
  { id: 'collaboration', label: 'Collaborations', icon: Users, description: 'Author networks & teams' },
];

function SignalCard({ title, value, trend, description, icon: Icon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="glass-card border-slate-200/50 hover:shadow-lg hover:border-slate-300/50 transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg" style={{ background: `${brandColors.skyBlue}15` }}>
                  <Icon className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</p>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold" style={{ color: brandColors.navyDeep }}>{value}</p>
                {trend && (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    className={`text-sm font-bold px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                  </motion.span>
                )}
              </div>
              {description && (
                <p className="text-xs text-slate-600 mt-2.5 font-medium">{description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SignalCategoryPanel({ category, categorySignals }) {
  const Icon = category.icon;
  const categoryData = categorySignals(category.id);
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = categoryData.filter(s => new Date(s.signal_date) >= thisMonth).length;
  const trend = categoryData.length > 0 ? Math.round((thisMonthCount / categoryData.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/50">
              <Icon className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
            </div>
            <div>
              <CardTitle className="text-lg">{category.label}</CardTitle>
              <p className="text-xs text-gray-600 mt-1">{category.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SignalCard
              title="Total"
              value={categoryData.length.toString()}
              description="Detected signals"
              icon={FileText}
            />
            <SignalCard
              title="This Month"
              value={thisMonthCount.toString()}
              trend={trend}
              icon={TrendingUp}
            />
          </div>
          <div className="p-4 rounded-lg bg-white/50 border border-gray-200">
            <p className="text-sm text-gray-600">Data sources:</p>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              {category.id === 'publications' && (
                <>
                  <li>• OpenAlex API</li>
                  <li>• Semantic Scholar</li>
                </>
              )}
              {category.id === 'patents' && (
                <>
                  <li>• USPTO PatentsView</li>
                  <li>• The Lens</li>
                </>
              )}
              {category.id === 'media' && (
                <>
                  <li>• SpaceDevs SNAPI</li>
                  <li>• Google News RSS</li>
                </>
              )}
              {category.id === 'funding' && (
                <>
                  <li>• USAspending.gov</li>
                  <li>• NASA Grants</li>
                  <li>• DoD Contracts</li>
                </>
              )}
              {!['publications', 'patents', 'media', 'funding'].includes(category.id) && (
                <li>• Multi-source aggregation</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function IntelligenceDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('publications');
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const data = await base44.entities.SignalCard.list('-signal_date', 1000);
        setSignals(data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRunIngestion = async () => {
    setIngesting(true);
    try {
      await base44.functions.invoke('runSignalIngestionPipeline', {});
      // Refresh signals after ingestion
      const data = await base44.entities.SignalCard.list('-signal_date', 1000);
      setSignals(data || []);
    } catch (err) {
      console.error('Error running ingestion:', err);
    } finally {
      setIngesting(false);
    }
  };

  const handleExportToNotebookLM = () => {
    const date = new Date().toLocaleDateString();
    let mdContent = `# Aerospace R&D Intelligence Report\n`;
    mdContent += `*Generated: ${date}*\n\n`;

    mdContent += `## Executive Summary\n`;
    mdContent += `This report contains a comprehensive aggregation of aerospace research, innovation, and media signals detected by the TOP 100 Intelligence Engine. It includes publications, patents, media mentions, and funding updates.\n\n`;

    // Group signals by type for better reading
    const grouped = signals.reduce((acc, signal) => {
      const type = signal.signal_type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(signal);
      return acc;
    }, {});

    const typeLabels = {
      'publication': 'Academic Publications',
      'patent': 'Patent Filings & Innovations',
      'media_mention': 'Media & News Coverage',
      'citation': 'Impact & Citations',
      'other': 'Miscellaneous Signals'
    };

    Object.entries(grouped).forEach(([type, items]) => {
      mdContent += `## ${typeLabels[type] || type.toUpperCase()}\n\n`;
      items.forEach(item => {
        mdContent += `### ${item.title || 'Untitled Signal'}\n`;
        mdContent += `**Date:** ${item.signal_date ? new Date(item.signal_date).toLocaleDateString() : 'N/A'}\n`;
        mdContent += `**Source:** ${item.source_name || 'Internal'}\n`;
        if (item.url) mdContent += `**Link:** [Source](${item.url})\n`;
        if (item.summary || item.description) {
          mdContent += `\n**Summary:**\n${item.summary || item.description}\n`;
        }
        mdContent += `\n---\n\n`;
      });
    });

    mdContent += `\n*© ${new Date().getFullYear()} TOP 100 Aerospace & Aviation Intelligence Engine*`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Aerospace-Intelligence-Pack-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
  };

  const activeCategory = SIGNAL_CATEGORIES.find(c => c.id === selectedCategory);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalSignals = signals.length;
    const thisMonthSignals = signals.filter(s => new Date(s.signal_date) >= thisMonth).length;
    const mediaSignals = signals.filter(s => s.signal_type === 'media_mention').length;
    const categorySignals = (type) => signals.filter(s => {
      const typeMap = {
        publications: 'publication',
        citations: 'citation',
        patents: 'patent',
        media: 'media_mention'
      };
      return s.signal_type === typeMap[type];
    });

    return {
      total: totalSignals,
      thisMonth: thisMonthSignals,
      thisMonthTrend: totalSignals > 0 ? Math.round((thisMonthSignals / totalSignals) * 100) : 0,
      mediaCount: mediaSignals,
      categoryCount: (type) => categorySignals(type).length
    };
  }, [signals]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.navyDeep }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden sf-pro" style={{ background: `linear-gradient(135deg, #faf8f5 0%, #f5f1ed 50%, #faf8f5 100%)` }}>
      <div className="px-4 py-8 md:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg"
              >
                <FlaskConical className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: brandColors.navyDeep }}>
                  R&D Intelligence
                </h1>
                <p className="text-sm text-slate-600 mt-2 font-medium">
                  Comprehensive aerospace research & innovation signals
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                onClick={handleExportToNotebookLM}
                className="gap-2 glass-card border-slate-200/50 text-slate-700 hover:bg-white/50 hover:border-slate-300/50 font-medium"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              {user?.role === 'admin' && (
                <Button
                  onClick={handleRunIngestion}
                  disabled={ingesting}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg"
                >
                  <RefreshCw className={`w-4 h-4 ${ingesting ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{ingesting ? 'Ingesting...' : 'Run'}</span>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SignalCard
            title="Total Signals"
            value={stats.total.toString()}
            description="Across all categories"
            icon={BarChart3}
          />
          <SignalCard
            title="This Month"
            value={stats.thisMonth.toString()}
            trend={stats.thisMonthTrend}
            icon={TrendingUp}
          />
          <SignalCard
            title="New Mentions"
            value={stats.mediaCount.toString()}
            description="Alumni in news"
            icon={Radio}
          />
          <SignalCard
            title="Active Sources"
            value={new Set(signals.map(s => s.source_name)).size.toString()}
            description="Data sources active"
            icon={FlaskConical}
          />
        </div>

        {/* Signal Categories */}
        <Card className="glass-card border-slate-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Signal Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-slate-100/50 p-2 rounded-xl">
                {SIGNAL_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="flex flex-col items-center gap-1.5 rounded-lg data-[state=active]:glass-card data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs hidden sm:block font-medium">{cat.label.split(' ')[0]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {SIGNAL_CATEGORIES.map(cat => (
                <TabsContent key={cat.id} value={cat.id} className="mt-6">
                  <SignalCategoryPanel category={cat} categorySignals={(type) => {
                    const typeMap = {
                      publications: 'publication',
                      citations: 'citation',
                      patents: 'patent',
                      media: 'media_mention',
                      research: 'publication',
                      institutions: 'publication',
                      pipelines: 'patent',
                      collaboration: 'publication'
                    };
                    return signals.filter(s => s.signal_type === typeMap[type]);
                  }} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Data Stack Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mt-10 glass-card border-slate-200/50 bg-gradient-to-br from-slate-50/50 to-blue-50/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-slate-900">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                Intelligence Data Stack
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm mb-3" style={{ color: brandColors.navyDeep }}>
                  Academic Research
                </h4>
                <ul className="text-xs space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: brandColors.skyBlue }} />
                    <span><strong>OpenAlex:</strong> Papers, authors, citations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: brandColors.skyBlue }} />
                    <span><strong>Semantic Scholar:</strong> Citation graphs, enriched metadata</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3" style={{ color: brandColors.navyDeep }}>
                  Patents & Innovation
                </h4>
                <ul className="text-xs space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: brandColors.goldPrestige }} />
                    <span><strong>USPTO/PatentsView:</strong> Filings, inventors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: brandColors.goldPrestige }} />
                    <span><strong>The Lens:</strong> Global patents + research links</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3" style={{ color: brandColors.navyDeep }}>
                  News & Media
                </h4>
                <ul className="text-xs space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#d97706' }} />
                    <span><strong>SpaceDevs SNAPI:</strong> Space industry news</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#d97706' }} />
                    <span><strong>Google News RSS:</strong> Global coverage</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3" style={{ color: brandColors.navyDeep }}>
                  Government Funding
                </h4>
                <ul className="text-xs space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#059669' }} />
                    <span><strong>USAspending.gov:</strong> Federal contracts & grants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#059669' }} />
                    <span><strong>NASA/DoD:</strong> Aerospace-specific funding</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}