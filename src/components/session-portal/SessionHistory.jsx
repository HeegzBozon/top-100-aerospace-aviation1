import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Clock, Filter, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FORMAT_COLORS = {
  'Hot Seat': '#f97316',
  'Live Build': '#6366f1',
  'Workshop': '#c9a87c',
  'Q&A': '#0ea5e9',
  'Hackathon': '#10b981',
  'Shoot the Shit': '#d4a090',
  'Breakout Rooms': '#8b5cf6',
  'Townhall': '#f59e0b',
  'Networking 101': '#ec4899',
};

function SessionCard({ session, parkingLot, actions, agendaItems }) {
  const [expanded, setExpanded] = useState(false);
  const color = FORMAT_COLORS[session.format] || '#c9a87c';
  const openActions = actions.filter(a => !a.is_complete);
  const date = new Date(session.session_date);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div layout className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="shrink-0 text-center">
          <p className="text-white/40 text-xs">{date.toLocaleString('default', { month: 'short' })}</p>
          <p className="text-white font-bold text-xl leading-none">{date.getDate()}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: `${color}20`, color }}>{session.format}</span>
            {openActions.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                {openActions.length} open action{openActions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h3 className="text-white font-bold text-sm">{session.title}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            {session.host_name && (
              <span className="text-white/40 text-xs flex items-center gap-1"><Users className="w-3 h-3" />{session.host_name}</span>
            )}
            {session.attendance_count > 0 && (
              <span className="text-white/40 text-xs">{session.attendance_count} attended</span>
            )}
            {agendaItems.length > 0 && (
              <span className="text-white/40 text-xs">{agendaItems.length} tactics</span>
            )}
          </div>
          {session.outcome_notes && (
            <p className="text-white/60 text-xs mt-2 leading-relaxed line-clamp-2">{session.outcome_notes}</p>
          )}
          {agendaItems.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {agendaItems.slice(0, 4).map(item => (
                <span key={item.id} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/50">{item.tactic_name}</span>
              ))}
              {agendaItems.length > 4 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/40">+{agendaItems.length - 4} more</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {session.replay_url && (
            <a href={session.replay_url} target="_blank" rel="noopener noreferrer"
              className="text-[#c9a87c] hover:text-white transition-colors" title="Watch replay">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button onClick={() => setExpanded(e => !e)} className="text-white/40 hover:text-white transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-white/8 px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Parking Lot */}
              {parkingLot.length > 0 && (
                <div>
                  <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">Parking Lot</p>
                  <ul className="space-y-1.5">
                    {parkingLot.map(p => (
                      <li key={p.id} className="flex gap-2 text-xs text-white/65">
                        <span className="w-1 h-1 rounded-full bg-[#c9a87c] mt-1.5 shrink-0" />
                        {p.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              {actions.length > 0 && (
                <div>
                  <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">Actions</p>
                  <ul className="space-y-2">
                    {actions.map(a => (
                      <li key={a.id} className="flex gap-2 items-start text-xs">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${a.is_complete ? 'text-green-400' : 'text-white/30'}`} />
                        <div>
                          <span className="text-[#c9a87c] font-semibold">{a.who}</span>
                          <span className="text-white/70 mx-1">→</span>
                          <span className="text-white/70">{a.what}</span>
                          {a.when && <span className="text-white/40 ml-1">· {a.when}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {session.outcome_notes && (
              <div className="mt-4">
                <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">Outcome Notes</p>
                <p className="text-white/65 text-xs leading-relaxed">{session.outcome_notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [parkingLots, setParkingLots] = useState({});
  const [actionsMap, setActionsMap] = useState({});
  const [agendaMap, setAgendaMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [formatFilter, setFormatFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      const [sess, parking, acts, agenda] = await Promise.all([
        base44.entities.HangoutSession.list('-session_date', 50),
        base44.entities.ParkingLotItem.list('-created_date', 200),
        base44.entities.SessionAction.list('-created_date', 200),
        base44.entities.AgendaItem.list('-created_date', 500),
      ]);
      setSessions(sess);
      const pl = {};
      parking.forEach(p => { if (!pl[p.session_id]) pl[p.session_id] = []; pl[p.session_id].push(p); });
      setParkingLots(pl);
      const am = {};
      acts.forEach(a => { if (!am[a.session_id]) am[a.session_id] = []; am[a.session_id].push(a); });
      setActionsMap(am);
      const ag = {};
      agenda.forEach(a => { if (!ag[a.session_id]) ag[a.session_id] = []; ag[a.session_id].push(a); });
      setAgendaMap(ag);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, []);

  const formats = ['All', ...Array.from(new Set(sessions.map(s => s.format).filter(Boolean)))];
  const filtered = sessions.filter(s => formatFilter === 'All' || s.format === formatFilter);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Session History
          </h2>
          <p className="text-white/50 text-sm mt-1">{sessions.length} session{sessions.length !== 1 ? 's' : ''} on record</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {formats.map(f => (
          <button key={f} onClick={() => setFormatFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              formatFilter === f ? 'text-[#07111f]' : 'text-white/60 hover:text-white border border-white/10 hover:border-white/30'
            }`}
            style={formatFilter === f ? { background: FORMAT_COLORS[f] || '#c9a87c' } : {}}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-white/40 py-20">Loading sessions...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 border-dashed flex flex-col items-center py-20"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <Calendar className="w-8 h-8 text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No sessions yet.</p>
          <p className="text-white/25 text-xs mt-1">Run your first Moon Joy session to see history here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(session => (
            <SessionCard key={session.id} session={session}
              parkingLot={parkingLots[session.id] || []}
              actions={actionsMap[session.id] || []}
              agendaItems={agendaMap[session.id] || []} />
          ))}
        </div>
      )}
    </div>
  );
}