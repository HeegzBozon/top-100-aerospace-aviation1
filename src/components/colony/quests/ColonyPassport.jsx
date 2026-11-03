import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import PassportQuests from './PassportQuests';
import PassportCard from './PassportCard';
import PassportSave from './PassportSave';
import PassportRecord from './PassportRecord';

const TABS = [{ key: 'quests', label: 'Quests' }, { key: 'record', label: 'Record' }, { key: 'card', label: 'Badge' }, { key: 'save', label: 'Save' }];

// The Campus Passport: the First Flight tracker, the badge, and how to keep it.
export default function ColonyPassport({ passport, isGuest, onSave, makeLink, onClose, onGo, initialTab = 'quests' }) {
  const [tab, setTab] = useState(initialTab);
  return (
    <div className="absolute inset-2 z-30 mx-auto flex max-w-md flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-editorial-navy shadow-xl">
      <div className="flex items-center justify-between border-b border-editorial-copper/50 px-3 py-2">
        <p className="font-heading text-lg text-editorial-cream">Campus Passport</p>
        <button type="button" onClick={onClose} aria-label="Close" className="text-editorial-cream/70"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex border-b border-white/10">
        {TABS.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-[11px] uppercase tracking-widest ${tab === t.key ? 'border-b-2 border-editorial-copper text-editorial-cream' : 'text-editorial-cream/50'}`}>{t.label}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {!passport ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-editorial-gold" />
          : tab === 'quests' ? <PassportQuests passport={passport} onGo={onGo} />
          : tab === 'record' ? <PassportRecord passport={passport} isGuest={isGuest} onSave={onSave} />
          : tab === 'card' ? <PassportCard passport={passport} isGuest={isGuest} onSave={onSave} />
          : <PassportSave isGuest={isGuest} makeLink={makeLink} />}
      </div>
    </div>
  );
}