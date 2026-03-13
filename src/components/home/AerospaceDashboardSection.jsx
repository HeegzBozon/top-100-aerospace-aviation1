import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Satellite, Newspaper, ExternalLink, ArrowRight, Loader2, MapPin, Clock, Radio, Award, BookOpen, Zap, FlaskConical } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';
import { format, parseISO, formatDistanceToNow, isPast } from 'date-fns';
import { createPageUrl } from '@/utils';
import LaunchDetailModal from '@/components/home/LaunchDetailModal';

const brand = {
  navy: '#1e3a5a',
  skyBlue: '#4a90b8',
  gold: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

// ── Launch list item ────────────────────────────────────────────────
function LaunchItem({ launch, onClick }) {
  const net = launch.net ? parseISO(launch.net) : null;
  const status = launch.status?.abbrev || '';
  const statusName = launch.status?.name || 'TBD';
  const isGo = status === 'Go';
  const isTBD = status === 'TBD' || status === 'TBC';
  const hasStream = (launch.vidURLs?.length ?? 0) > 0;
  const provider = launch.launch_service_provider?.abbrev || launch.launch_service_provider?.name || null;
  const rocketName = launch.rocket?.configuration?.name || null;
  const missionType = launch.mission?.type || null;
  const countdownLabel = net
    ? isPast(net)
      ? 'Launched'
      : formatDistanceToNow(net, { addSuffix: true })
    : null;

  return (
    <button
      onClick={() => onClick(launch)}
      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a90b8] group"
      aria-label={`View details for ${launch.name}`}
    >
      {/* Status indicator */}
      <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
        <span
          className={`w-2 h-2 rounded-full ${isGo ? 'bg-emerald-400' : isTBD ? 'bg-white/30' : 'bg-amber-400'}`}
          title={statusName}
          aria-hidden="true"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Mission name + provider */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-semibold text-white leading-tight group-hover:text-[#e8d4b8] transition-colors truncate">
            {launch.mission?.name || launch.name}
          </p>
          {provider && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 flex-shrink-0">
              {provider}
            </span>
          )}
          {hasStream && (
            <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-red-600/80 text-white flex-shrink-0">
              <Radio className="w-2 h-2" aria-hidden="true" /> LIVE
            </span>
          )}
        </div>

        {/* Rocket + mission type */}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {rocketName && (
            <span className="text-[11px] text-white/50 truncate">{rocketName}</span>
          )}
          {missionType && (
            <span className="text-[10px] text-white/40">· {missionType}</span>
          )}
        </div>

        {/* Time + location */}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {net && (
            <span className="flex items-center gap-0.5 text-[11px]" style={{ color: brand.goldLight }}>
              <Clock className="w-2.5 h-2.5 flex-shrink-0" aria-hidden="true" />
              {isTBD ? format(net, 'MMM d, yyyy') : format(net, 'MMM d · h:mm a')}
              {countdownLabel && !isPast(net) && (
                <span className="text-white/40 ml-1">({countdownLabel})</span>
              )}
            </span>
          )}
          {launch.pad?.location?.name && (
            <span className="flex items-center gap-0.5 text-[11px] text-white/40 truncate">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" aria-hidden="true" />
              {launch.pad.location.name.split(',')[0]}
            </span>
          )}
        </div>
      </div>

      <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/50 flex-shrink-0 transition-colors mt-0.5" aria-hidden="true" />
    </button>
  );
}

// ── Signal type config ──────────────────────────────────────────────
const SIGNAL_CONFIG = {
  patent:       { icon: Award,       label: 'Patent',      color: 'bg-purple-500' },
  publication:  { icon: BookOpen,    label: 'Research',    color: 'bg-blue-500' },
  media_mention:{ icon: Newspaper,   label: 'Media',       color: 'bg-amber-500' },
  citation:     { icon: Zap,         label: 'Citation',    color: 'bg-emerald-500' },
  news:         { icon: Newspaper,   label: 'News',        color: 'bg-rose-500' },
};

// ── Unified intelligence feed item ─────────────────────────────────
function IntelFeedItem({ item }) {
  const cfg = SIGNAL_CONFIG[item.type] || SIGNAL_CONFIG.news;
  const Icon = cfg.icon;
  const date = item.date ? new Date(item.date) : null;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-2.5 p-2.5 rounded-xl border transition-all duration-150 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a90b8]"
      style={{ background: '#ffffff', borderColor: brand.goldLight }}
      aria-label={`Read: ${item.title}`}
    >
      {/* Type indicator */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
        <Icon className="w-3.5 h-3.5 text-white" aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: brand.navy }}>
            {cfg.label}
          </span>
          {item.personName && (
            <span className="text-[10px] font-semibold truncate" style={{ color: brand.skyBlue }}>
              · {item.personName}
            </span>
          )}
        </div>
        <p className="text-xs font-medium leading-snug line-clamp-2" style={{ color: brand.navy }}>
          {item.title}
        </p>
        {date && (
          <time className="text-[10px] text-gray-400 mt-0.5 block" dateTime={item.date}>
            {format(date, 'MMM d')}
          </time>
        )}
      </div>
      <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors mt-0.5" aria-hidden="true" />
    </a>
  );
}

// ── Main component ──────────────────────────────────────────────────
export default function AerospaceDashboardSection() {
  const [launches, setLaunches] = useState([]);
  const [signals, setSignals] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [isLoadingLaunches, setIsLoadingLaunches] = useState(true);
  const [isLoadingIntel, setIsLoadingIntel] = useState(true);

  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const openLaunch = useCallback((launch) => setSelectedLaunch(launch), []);

  useEffect(() => {
    getUpcomingLaunches({ limit: 5 })
      .then(res => {
        const payload = res?.data;
        setLaunches(payload?.launches || payload?.results || []);
      })
      .catch(() => { })
      .finally(() => setIsLoadingLaunches(false));

    Promise.all([
      base44.entities.SignalCard.list('-signal_date', 20),
      base44.entities.HonoreeMention.list('-published_at', 20),
      base44.entities.Nominee.filter({ status: 'active' }, null, 500),
    ])
      .then(([signalData, mentionData, nomineeData]) => {
        setSignals(signalData || []);
        setNominees(nomineeData || []);
        const seen = new Set();
        const deduped = (mentionData || []).filter(m => {
          const key = m.article_id ?? m.article_url;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setMentions(deduped);
      })
      .catch(() => { })
      .finally(() => setIsLoadingIntel(false));
  }, []);
  const nomineeMap = useMemo(() => {
    const m = {};
    nominees.forEach(n => { m[n.id] = n.name; });
    return m;
  }, [nominees]);

  // Merge signals + mentions into unified feed sorted by date
  const intelFeed = useMemo(() => {
    const items = [
      ...signals.map(s => ({
        id: `sig-${s.id}`,
        type: s.signal_type || 'media_mention',
        title: s.headline || s.title || '',
        personName: s.nominee_name || nomineeMap[s.nominee_id] || null,
        url: s.evidence_links?.[0] || '#',
        date: s.signal_date,
      })),
      ...mentions.map(m => ({
        id: `men-${m.id}`,
        type: 'news',
        title: m.article_title || '',
        personName: m.nominee_name || null,
        url: m.article_url || '#',
        date: m.published_at,
      })),
    ];
    items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return items;
  }, [signals, mentions, nomineeMap]);

  const isEmpty = !isLoadingLaunches && !isLoadingIntel && launches.length === 0 && intelFeed.length === 0;
  if (isEmpty) return null;

  return (
    <section className="px-4 pb-6" aria-label="Aerospace Dashboard">
      {/* Shared gradient card */}
      <div className="rounded-2xl overflow-hidden shadow-md" style={{ background: `linear-gradient(140deg, ${brand.navy} 0%, #2a4f7a 100%)` }}>

        {/* Header row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4" style={{ color: brand.gold }} aria-hidden="true" />
            <span className="text-sm font-bold text-white">Aerospace &amp; Aviation</span>
          </div>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">

          {/* LEFT — Intelligence Feed */}
          <div className="p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: brand.gold }}>
                Intelligence Feed
              </p>
              <a
                href={createPageUrl('SignalFeed')}
                className="flex items-center gap-0.5 text-[11px] transition-opacity hover:opacity-70"
                style={{ color: brand.goldLight }}
                aria-label="View all intelligence signals"
              >
                All <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>

            {isLoadingIntel ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-white/40" />
              </div>
            ) : intelFeed.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-4">No signals detected yet.</p>
            ) : (
              <div className="overflow-y-auto scrollbar-hide space-y-1.5" style={{ maxHeight: '280px' }}>
                {intelFeed.map(item => (
                  <IntelFeedItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Upcoming Launches */}
          <div className="p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: brand.gold }}>
                Upcoming Launches
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={createPageUrl('LaunchParty')}
                  className="flex items-center gap-0.5 text-[11px] transition-opacity hover:opacity-70"
                  style={{ color: brand.goldLight }}
                  aria-label="View all upcoming launches"
                >
                  All <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </a>
                <a
                  href="https://ll.thespacedevs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
                >
                  via LL2
                </a>
              </div>
            </div>

            {isLoadingLaunches ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-white/40" />
              </div>
            ) : launches.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-4">No upcoming launches found.</p>
            ) : (
              <div className="overflow-y-auto scrollbar-hide space-y-0.5" style={{ maxHeight: '280px' }}>
                {launches.map(launch => (
                  <LaunchItem key={launch.id} launch={launch} onClick={openLaunch} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <LaunchDetailModal launch={selectedLaunch} onClose={() => setSelectedLaunch(null)} />
    </section>
  );
}