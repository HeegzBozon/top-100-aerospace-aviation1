import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Play, Pause, SkipForward, CheckCircle2, GripVertical, ChevronDown, ChevronUp, Plus, X, Clock, Square, Trash2, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORY_COLORS = {
  Goals: '#6366f1', Understand: '#0ea5e9', Frame: '#f59e0b',
  Ideas: '#10b981', Evaluate: '#f97316', Decide: '#c9a87c',
  Discuss: '#d4a090', Technique: '#8b5cf6',
};

// ── BUILD MODE ──────────────────────────────────────────────────────────────────

function AddTacticDrawer({ onAdd, onClose }) {
  const [tactics, setTactics] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.WorkshopTactic.list('-created_date', 100).then(setTactics).catch(() => {});
  }, []);

  const filtered = tactics.filter(t => {
    const q = search.toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || (t.keywords || []).some(k => k.toLowerCase().includes(q));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(7,17,31,0.88)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-lg mx-4 mb-4 sm:mb-0 rounded-3xl border border-[#c9a87c]/30 overflow-hidden"
        style={{ background: '#0d1f36', maxHeight: '70vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-white font-bold">Add Tactic</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-4 py-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tactics..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/20 bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none" />
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
          {filtered.map(t => {
            const color = CATEGORY_COLORS[t.category] || '#c9a87c';
            return (
              <button key={t.id} onClick={() => { onAdd(t); onClose(); }}
                className="w-full flex items-start gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5 shrink-0"
                  style={{ background: `${color}20`, color }}>{t.category}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-white/50 text-xs mt-0.5">{t.duration_min}–{t.duration_max} min</p>
                </div>
                <Plus className="w-4 h-4 text-[#c9a87c] ml-auto shrink-0 mt-0.5" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function AgendaItemCard({ item, index, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const color = CATEGORY_COLORS[item.tactic_category] || '#c9a87c';

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}
          className={`rounded-2xl border overflow-hidden transition-all ${snapshot.isDragging ? 'border-[#c9a87c]/50 shadow-2xl' : 'border-white/10'}`}
          style={{ background: snapshot.isDragging ? 'rgba(201,168,124,0.08)' : 'rgba(255,255,255,0.03)', ...provided.draggableProps.style }}>
          <div className="flex items-center gap-3 px-4 py-4">
            <div {...provided.dragHandleProps} className="text-white/30 hover:text-white/60 cursor-grab transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${color}20`, color }}>{index + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{item.tactic_name}</p>
              <p className="text-white/50 text-xs truncate">{item.tactic_description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                <input type="number" value={item.duration} min={1} max={120}
                  onChange={e => onUpdate(item.id, { duration: +e.target.value })}
                  className="w-12 text-center py-1 rounded-lg border border-white/20 bg-white/5 text-white text-xs focus:outline-none" />
                <span className="text-white/40 text-xs">min</span>
              </div>
              <button onClick={() => setExpanded(e => !e)} className="text-white/40 hover:text-[#c9a87c] transition-colors">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button onClick={() => onRemove(item.id)} className="text-white/30 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <AnimatePresence>
            {expanded && item.how_to_facilitate?.length > 0 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="border-t border-white/8 px-5 pb-4 pt-3">
                <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-wider mb-2">How to Facilitate</p>
                <ol className="space-y-1.5">
                  {item.how_to_facilitate.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                      <span className="shrink-0 font-bold text-[#c9a87c]">{i + 1}.</span> {step}
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Draggable>
  );
}

// ── LIVE MODE ──────────────────────────────────────────────────────────────────

function useTimer(duration, onExpire) {
  const [remaining, setRemaining] = useState(duration * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(duration * 60);
    setRunning(false);
  }, [duration]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { clearInterval(intervalRef.current); setRunning(false); onExpire(); return 0; }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { display: `${mm}:${ss}`, running, setRunning, remaining, total: duration * 60 };
}

function LiveMode({ items, onEnd }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [parkingLot, setParkingLot] = useState([]);
  const [actions, setActions] = useState([]);
  const [parkingInput, setParkingInput] = useState('');
  const [actionForm, setActionForm] = useState({ who: '', what: '', when: '' });
  const [showSummary, setShowSummary] = useState(false);
  const [outcomeNote, setOutcomeNote] = useState('');
  const [parkingOpen, setParkingOpen] = useState(false);
  const [wwwOpen, setWwwOpen] = useState(false);

  const current = items[currentIdx];
  const next = items[currentIdx + 1];
  const totalDuration = items.reduce((a, b) => a + b.duration, 0);
  const elapsed = items.slice(0, currentIdx).reduce((a, b) => a + b.duration, 0);
  const progressPct = Math.round((elapsed / totalDuration) * 100);

  const timer = useTimer(current?.duration || 5, () => {});

  const handleSkip = () => {
    if (currentIdx < items.length - 1) setCurrentIdx(i => i + 1);
    else setShowSummary(true);
  };

  const handleAddParking = () => {
    if (!parkingInput.trim()) return;
    setParkingLot(p => [...p, { id: Date.now(), text: parkingInput.trim() }]);
    setParkingInput('');
  };

  const handleAddAction = () => {
    if (!actionForm.who || !actionForm.what) return;
    setActions(a => [...a, { id: Date.now(), ...actionForm, done: false }]);
    setActionForm({ who: '', what: '', when: '' });
  };

  if (showSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'rgba(7,17,31,0.98)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl rounded-3xl border border-[#c9a87c]/30 overflow-hidden"
          style={{ background: '#0d1f36' }}>
          <div className="px-8 py-6 border-b border-white/10">
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-1">Session Complete</p>
            <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Mission Accomplished</h2>
          </div>
          <div className="px-8 py-6 space-y-4">
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Outcome Notes</label>
              <textarea value={outcomeNote} onChange={e => setOutcomeNote(e.target.value)} rows={4}
                placeholder="What happened? What did we decide? What's the energy?"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none resize-none" />
            </div>
            {parkingLot.length > 0 && (
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Parking Lot ({parkingLot.length})</p>
                {parkingLot.map(p => <div key={p.id} className="text-white/70 text-sm py-1.5 border-b border-white/5">{p.text}</div>)}
              </div>
            )}
            {actions.length > 0 && (
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Actions ({actions.length})</p>
                {actions.map(a => (
                  <div key={a.id} className="flex gap-2 text-xs text-white/70 py-1.5 border-b border-white/5">
                    <span className="font-bold text-[#c9a87c]">{a.who}</span>
                    <span className="flex-1">{a.what}</span>
                    {a.when && <span className="text-white/40">{a.when}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="px-8 py-5 border-t border-white/10">
            <button onClick={() => onEnd(outcomeNote, parkingLot, actions)}
              className="w-full py-3 rounded-xl font-bold text-sm text-[#07111f]"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
              Save & Close Session
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#07111f' }}>
      {/* Progress Bar */}
      <div className="h-1 bg-white/10">
        <div className="h-full bg-gradient-to-r from-[#c9a87c] to-[#d4a090] transition-all duration-1000" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 min-w-0">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
            Tactic {currentIdx + 1} of {items.length}
          </p>

          {current && (
            <motion.div key={currentIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block"
                style={{ background: `${CATEGORY_COLORS[current.tactic_category] || '#c9a87c'}20`, color: CATEGORY_COLORS[current.tactic_category] || '#c9a87c' }}>
                {current.tactic_category}
              </span>
              <h1 className="text-white text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {current.tactic_name}
              </h1>
              <p className="text-white/70 text-lg mb-10">{current.tactic_description}</p>

              {/* Timer */}
              <div className="mb-8">
                <div className="text-7xl font-bold text-[#c9a87c] font-mono mb-4" style={{ fontFamily: 'monospace' }}>
                  {timer.display}
                </div>
                <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-[#c9a87c] rounded-full transition-all"
                    style={{ width: `${((timer.total - timer.remaining) / timer.total) * 100}%` }} />
                </div>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button onClick={() => timer.setRunning(r => !r)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: timer.running ? 'rgba(255,255,255,0.1)' : 'rgba(201,168,124,0.2)', color: '#c9a87c', border: '1px solid rgba(201,168,124,0.3)' }}>
                    {timer.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timer.running ? 'Pause' : 'Start'}
                  </button>
                  <button onClick={handleSkip}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-all">
                    <SkipForward className="w-4 h-4" /> Skip
                  </button>
                </div>
              </div>

              {/* Facilitation Steps */}
              {current.how_to_facilitate?.length > 0 && (
                <div className="text-left bg-white/3 border border-white/10 rounded-2xl p-6 mt-2">
                  <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-3">Facilitation Steps</p>
                  <ol className="space-y-2">
                    {current.how_to_facilitate.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                        <span className="font-bold text-[#c9a87c] shrink-0">{i + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          )}

          {next && (
            <div className="mt-8 text-center">
              <p className="text-white/30 text-xs uppercase tracking-widest">Next up</p>
              <p className="text-white/60 text-sm font-medium">{next.tactic_name}</p>
            </div>
          )}
        </div>

        {/* Sidebar Panels */}
        <div className="w-72 border-l border-white/10 flex flex-col overflow-hidden shrink-0">
          {/* Parking Lot */}
          <div className="border-b border-white/10">
            <button onClick={() => setParkingOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
              <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Parking Lot ({parkingLot.length})</span>
              {parkingOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>
            <AnimatePresence>
              {parkingOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-3 space-y-2">
                    <div className="flex gap-2">
                      <input value={parkingInput} onChange={e => setParkingInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddParking()}
                        placeholder="Park an idea..." className="flex-1 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white text-xs placeholder-white/30 focus:outline-none" />
                      <button onClick={handleAddParking} className="text-[#c9a87c] hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                    {parkingLot.map(p => (
                      <div key={p.id} className="flex items-start gap-2 text-xs text-white/60 py-1">
                        <span className="w-1 h-1 rounded-full bg-[#c9a87c] mt-1.5 shrink-0" />
                        <span className="flex-1">{p.text}</span>
                        <button onClick={() => setParkingLot(pl => pl.filter(i => i.id !== p.id))} className="text-white/20 hover:text-red-400 transition-colors shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Who What When */}
          <div className="border-b border-white/10">
            <button onClick={() => setWwwOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
              <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Who / What / When ({actions.length})</span>
              {wwwOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>
            <AnimatePresence>
              {wwwOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-3 space-y-2">
                    <div className="space-y-1.5">
                      <input value={actionForm.who} onChange={e => setActionForm(f => ({ ...f, who: e.target.value }))}
                        placeholder="Who" className="w-full px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white text-xs placeholder-white/30 focus:outline-none" />
                      <input value={actionForm.what} onChange={e => setActionForm(f => ({ ...f, what: e.target.value }))}
                        placeholder="What" className="w-full px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white text-xs placeholder-white/30 focus:outline-none" />
                      <div className="flex gap-1.5">
                        <input value={actionForm.when} onChange={e => setActionForm(f => ({ ...f, when: e.target.value }))}
                          placeholder="When" className="flex-1 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white text-xs placeholder-white/30 focus:outline-none" />
                        <button onClick={handleAddAction} className="text-[#c9a87c] hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {actions.map(a => (
                      <div key={a.id} className="text-xs border border-white/8 rounded-lg p-2 space-y-0.5">
                        <p className="text-[#c9a87c] font-semibold">{a.who}</p>
                        <p className="text-white/70">{a.what}</p>
                        {a.when && <p className="text-white/40">{a.when}</p>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* End Session */}
          <div className="mt-auto p-4">
            <button onClick={() => setShowSummary(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
              <Square className="w-4 h-4" /> End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export default function SessionAgenda({ currentSession, setCurrentSession }) {
  const [mode, setMode] = useState('build');
  const [items, setItems] = useState([]);
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  // Pre-load from currentSession if tactics were provided
  useEffect(() => {
    if (currentSession?.tactics?.length && items.length === 0) {
      const timePerTactic = Math.round((currentSession.time || 60) / currentSession.tactics.length);
      const preloaded = currentSession.tactics.map((name, i) => ({
        id: `pre-${i}`,
        tactic_name: name,
        tactic_category: null,
        tactic_description: '',
        how_to_facilitate: [],
        duration: timePerTactic,
        order: i,
      }));
      setItems(preloaded);
    }
  }, [currentSession]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = [...items];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered.map((item, i) => ({ ...item, order: i })));
  };

  const handleAddTactic = (tactic) => {
    setItems(prev => [...prev, {
      id: `${tactic.id}-${Date.now()}`,
      tactic_id: tactic.id,
      tactic_name: tactic.name,
      tactic_category: tactic.category,
      tactic_description: tactic.description,
      how_to_facilitate: tactic.how_to_facilitate || [],
      duration: tactic.duration_min || 10,
      order: prev.length,
    }]);
  };

  const handleUpdateItem = (id, changes) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...changes } : item));
  };

  const handleRemoveItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const totalDuration = items.reduce((a, b) => a + b.duration, 0);

  const handleEndSession = (outcomeNote, parkingLot, actions) => {
    // Save session + related records
    const sessionData = {
      title: currentSession?.template || 'Moon Joy Session',
      session_date: new Date().toISOString(),
      host_email: '',
      format: 'Workshop',
      status: 'completed',
      outcome_notes: outcomeNote,
      topic: currentSession?.topic || '',
    };
    base44.entities.HangoutSession.create(sessionData).then(async (session) => {
      await Promise.all([
        ...parkingLot.map(p => base44.entities.ParkingLotItem.create({ session_id: session.id, text: p.text })),
        ...actions.map(a => base44.entities.SessionAction.create({ session_id: session.id, who: a.who, what: a.what, when: a.when })),
        ...items.map(item => base44.entities.AgendaItem.create({ session_id: session.id, tactic_name: item.tactic_name, tactic_category: item.tactic_category, tactic_description: item.tactic_description, how_to_facilitate: item.how_to_facilitate, duration: item.duration, order: item.order, status: 'completed' })),
      ]);
    });
    setCurrentSession(null);
    setItems([]);
    setMode('build');
  };

  if (mode === 'live') {
    return <LiveMode items={items} onEnd={handleEndSession} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {showAddDrawer && <AddTacticDrawer onAdd={handleAddTactic} onClose={() => setShowAddDrawer(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {currentSession?.template || 'Agenda Builder'}
          </h2>
          {currentSession?.topic && <p className="text-white/50 text-sm mt-0.5">{currentSession.topic}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs font-medium">{totalDuration} min total</span>
          <div className="flex rounded-xl border border-white/20 overflow-hidden">
            {['build', 'live'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${mode === m ? 'bg-[#c9a87c] text-[#07111f]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="rounded-2xl border border-white/10 border-dashed flex flex-col items-center justify-center py-20"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-white/40 text-sm mb-4">No tactics in the agenda yet.</p>
          <button onClick={() => setShowAddDrawer(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#07111f]"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
            <Plus className="w-4 h-4" /> Add Tactic
          </button>
        </div>
      )}

      {/* Drag-and-drop list */}
      {items.length > 0 && (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="agenda">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {items.map((item, index) => (
                    <AgendaItemCard key={item.id} item={item} index={index}
                      onUpdate={handleUpdateItem} onRemove={handleRemoveItem} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex items-center gap-3 mt-6">
            <button onClick={() => setShowAddDrawer(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all">
              <Plus className="w-4 h-4" /> Add Tactic
            </button>
            <div className="flex-1" />
            <button onClick={() => setMode('live')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-[#07111f]"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
              <Play className="w-4 h-4" /> Start Session
            </button>
          </div>
        </>
      )}
    </div>
  );
}