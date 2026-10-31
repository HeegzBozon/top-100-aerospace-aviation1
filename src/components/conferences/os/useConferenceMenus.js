import { useEffect, useRef } from 'react';
import { BedDouble, Compass, Download, Landmark, Users } from 'lucide-react';
import { registerSurfaceEditGroups, registerSurfaceFileGroups } from '@/components/shell/surfaceFileMenu';
import { EXPEDIA_AFFILIATE_URL } from '@/components/travel/travelConfig';
import { CONFERENCE_APPS } from './conferenceApps';

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function exportContacts(room, contacts) {
  const cols = ['full_name', 'role_title', 'company', 'email', 'phone', 'linkedin_url', 'promise', 'next_step', 'outcome'];
  const rows = [cols.join(','), ...contacts.map((c) => cols.map((k) => csvCell(c[k])).join(','))];
  const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${room?.name || 'conference'}-contacts.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// The Conferences app's own File and Edit menus. File opens the app's documents (the
// circuit, the host desk, your rooms, travel, an export); Edit jumps straight to the
// stage being worked. Inside one conference, the stages switch in place.
export default function useConferenceMenus({ room, contacts, onStage } = {}) {
  const ref = useRef({});
  ref.current = { room, contacts, onStage };

  useEffect(() => {
    const file = () => {
      const { room: r, contacts: list } = ref.current;
      const groups = [{
        key: 'conf-file',
        label: 'Conferences',
        items: [
          { label: 'Discover conferences', to: '/conferences/discover', icon: Compass },
          { label: 'Host a conference', to: '/conferences/host', icon: Landmark },
          { label: 'My conferences', to: '/conferences/attend', icon: Users },
          { label: 'Plan your stay', icon: BedDouble, onSelect: () => window.open(EXPEDIA_AFFILIATE_URL, '_blank', 'noopener') },
        ],
      }];
      if (r && list?.length) {
        groups[0].items.push({ label: 'Export my contacts (CSV)', icon: Download, onSelect: () => exportContacts(r, list) });
      }
      return groups;
    };
    const edit = () => {
      const { onStage: go } = ref.current;
      return [{
        key: 'conf-edit',
        label: 'Stages',
        items: CONFERENCE_APPS.map((s) => (
          go ? { label: `${s.index} ${s.label}`, icon: s.icon, onSelect: () => go(s.key) } : { label: `${s.index} ${s.label}`, icon: s.icon, to: s.to }
        )),
      }];
    };
    const offFile = registerSurfaceFileGroups(file);
    const offEdit = registerSurfaceEditGroups(edit);
    return () => { offFile(); offEdit(); };
  }, []);
}