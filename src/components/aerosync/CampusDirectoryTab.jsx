import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { COLONY_ROOMS } from '@/components/colony/colonyZones';
import { C } from '@/components/crm/crmConfig';

// The Colony's campus directory, read from AeroSync: every room, one tap from walking in.
export default function CampusDirectoryTab() {
  const navigate = useNavigate();
  const last = localStorage.getItem('colony-room');
  const go = (key) => { localStorage.setItem('colony-room', key); navigate(`/colony?room=${key}`); };

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(COLONY_ROOMS).map(([key, r]) => (
        <button key={key} type="button" onClick={() => go(key)}
          className="flex items-center gap-3 rounded-lg bg-white p-3 text-left transition-shadow hover:shadow-md"
          style={{ border: `1px solid ${C.border}` }}>
          <MapPin className="h-4 w-4 shrink-0" style={{ color: C.copper }} />
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-[15px]" style={{ color: C.navy }}>{r.label}</span>
            {key === last && <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>Last visited</span>}
          </span>
          <ChevronRight className="h-4 w-4" style={{ color: C.muted }} />
        </button>
      ))}
    </div>
  );
}