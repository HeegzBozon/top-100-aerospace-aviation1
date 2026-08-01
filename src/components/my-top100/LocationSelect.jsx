import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, Plus } from 'lucide-react';
import { COUNTRIES, parseLocations } from '@/components/my-top100/countries';
import { getFlagEmoji } from '@/components/profile/countryFlags';
import { brand } from '@/components/nominate/NominateConfig';

export default function LocationSelect({ value, onChange }) {
  const initial = parseLocations(value);
  const [primary, setPrimary] = useState(initial.primary);
  const [secondaries, setSecondaries] = useState(initial.secondaries);

  // Sync from external value changes (e.g. pre-fill from an existing nominee)
  useEffect(() => {
    const parsed = parseLocations(value);
    setPrimary(parsed.primary);
    setSecondaries(parsed.secondaries);
  }, [value]);

  const emit = (p, secs) => {
    const parts = [p, ...secs].filter(Boolean);
    onChange(parts.join(', '));
  };

  const changePrimary = (v) => { setPrimary(v); emit(v, secondaries); };
  const addSecondary = () => setSecondaries((s) => [...s, '']);
  const updateSecondary = (i, v) => {
    const next = [...secondaries];
    next[i] = v;
    setSecondaries(next);
    emit(primary, next);
  };
  const removeSecondary = (i) => {
    const next = secondaries.filter((_, idx) => idx !== i);
    setSecondaries(next);
    emit(primary, next);
  };

  return (
    <div className="space-y-2">
      <CountryPicker value={primary} placeholder="Primary location" onChange={changePrimary} />

      {secondaries.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1">
            <CountryPicker
              value={s}
              placeholder={`Secondary location ${i + 1}`}
              onChange={(v) => updateSecondary(i, v)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeSecondary(i)}
            className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center"
            style={{ background: `${brand.navy}08` }}
            aria-label="Remove secondary location"
          >
            <X className="w-4 h-4" style={{ color: `${brand.navy}60` }} />
          </button>
        </div>
      ))}

      {primary && secondaries.length < 5 && (
        <button
          type="button"
          onClick={addSecondary}
          className="flex items-center gap-1.5 text-[11px] font-bold"
          style={{ color: brand.navy }}
        >
          <Plus className="w-3.5 h-3.5" /> Add secondary location
        </button>
      )}
    </div>
  );
}

function CountryPicker({ value, placeholder, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = search
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;
  const selected = COUNTRIES.find((c) => c.name === value);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const btnStyle = {
    background: 'white',
    border: `1px solid ${brand.navy}15`,
    color: selected ? brand.navy : `${brand.navy}50`,
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm rounded-xl px-3 py-3 text-left transition-colors"
        style={btnStyle}
      >
        <span className="truncate">
          {selected ? (
            <span className="flex items-center gap-2">
              <span>{getFlagEmoji(selected.code)}</span>
              {selected.name}
            </span>
          ) : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 shrink-0" style={{ color: `${brand.navy}40` }} />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden"
          style={{ background: 'white', border: `1px solid ${brand.navy}15`, boxShadow: '0 8px 24px rgba(10,18,30,0.12)' }}
        >
          <div className="p-2" style={{ borderBottom: `1px solid ${brand.navy}10` }}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: `${brand.navy}40` }} />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries…"
                className="w-full h-8 pl-8 pr-2 text-sm rounded-lg outline-none"
                style={{ background: `${brand.navy}05`, color: brand.navy }}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-center" style={{ color: `${brand.navy}40` }}>No countries found</div>
            )}
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.name); setOpen(false); setSearch(''); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors"
                style={{ background: value === c.name ? `${brand.gold}10` : 'transparent', color: brand.navy }}
              >
                <span className="text-base">{getFlagEmoji(c.code)}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}