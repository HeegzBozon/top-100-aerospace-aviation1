import { Briefcase, Calendar, Camera, Heart, LayoutGrid, Radar, Users } from 'lucide-react';

// The AeroSync title screen: the CRM as a cartridge of its own, the features a Fellow meets
// inside it, in order. Each key lands on a surface of its own — the title screen holds the
// menu, the surfaces hold the work — and opens the view that was asked for rather than the
// top of the page.
export const AEROSYNC_MENU = [
  { key: 'contacts', index: '00', label: 'Contacts', to: '/aerosync/contacts', icon: Users },
  // The ledger of the people a Fellow follows, beside the cards they captured: the two are
  // the same work — knowing who matters and holding a way to reach them — read together.
  { key: 'following', index: '01', label: 'Following', to: '/aerosync/following', icon: Heart },
  { key: 'add-card', index: '02', label: 'Add a card', to: '/aerosync/contacts?tab=capture', icon: Camera },
  { key: 'rooms', index: '03', label: 'Rooms ahead', to: '/aerosync/rooms', icon: Radar },
  { key: 'calendar', index: '04', label: 'The calendar', to: '/events', icon: Calendar },
  // The two surfaces that used to stand on the platform's title screen and belong to the
  // same work as the rolodex: the dashboard is the whole board a Fellow keeps, and the
  // desk is who has a door open. Both are keys inside the CRM now.
  { key: 'dashboard', index: '05', label: 'Dashboard', to: '/board', icon: LayoutGrid },
  { key: 'talent-desk', index: '06', label: 'Talent Desk', to: '/talent-desk', icon: Briefcase },
];

// The two the title screen asks for, read as one row above the keys: the capture, which is
// what the CRM is for, and the shows, which is where the cards come from. Both are
// shortcuts onto keys the grid already carries.
export const AEROSYNC_ACTIONS = [
  { key: 'add-card', label: 'Add a card' },
  { key: 'rooms', label: 'Rooms ahead' },
];