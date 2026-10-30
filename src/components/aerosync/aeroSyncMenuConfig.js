import { Briefcase, Camera, LayoutGrid, Users } from 'lucide-react';

// The AeroSync title screen: the CRM as a cartridge of its own, the features a Fellow meets
// inside it, in order. Each key lands on a surface of its own — the title screen holds the
// menu, the surfaces hold the work — and opens the view that was asked for rather than the
// top of the page.
//
// Three keys, in the order the work is done: a card is scanned when it is handed to you, the
// people it belongs to are kept in one place, and the dashboard is where the whole of it —
// the cycle, the rooms, the calendar — is read at once. The desk is who has a door open, read
// beside the rolodex it comes out of.
export const AEROSYNC_MENU = [
  { key: 'scan', index: '01', label: 'Scan', to: '/aerosync/scan', icon: Camera },
  // Cards and following are one surface: both are the people a Fellow keeps, held two ways.
  { key: 'people', index: '02', label: 'People', to: '/aerosync/people', icon: Users },
  { key: 'dashboard', index: '03', label: 'Dashboard', to: '/board', icon: LayoutGrid },
  { key: 'talent-desk', index: '04', label: 'Talent Desk', to: '/talent-desk', icon: Briefcase },
];

// The two the title screen asks for, read as one row above the keys: the capture, which is
// what the CRM is for, and the people it fills. Both are shortcuts onto keys the grid already
// carries.
export const AEROSYNC_ACTIONS = [
  { key: 'scan', label: 'Scan' },
  { key: 'people', label: 'People' },
];