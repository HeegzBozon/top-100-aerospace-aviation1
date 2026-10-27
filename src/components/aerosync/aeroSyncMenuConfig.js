import { Calendar, Camera, Radar, Users } from 'lucide-react';

// The AeroSync title screen: the CRM as a cartridge of its own, the features a Fellow
// meets inside it, in order. Every key routes to a feature that already exists on the
// Networking surface — the title screen holds the menu, the surface holds the work — and
// each lands on the feature itself rather than on the top of the page.
export const AEROSYNC_MENU = [
  { key: 'contacts', index: '00', label: 'Contacts', to: '/networking?tab=contacts', icon: Users },
  { key: 'add-card', index: '01', label: 'Add a card', to: '/networking?tab=capture', icon: Camera },
  { key: 'rooms', index: '02', label: 'Rooms ahead', to: '/networking?section=rooms', icon: Radar },
  { key: 'calendar', index: '03', label: 'The calendar', to: '/events', icon: Calendar },
];

// The two the title screen asks for, read as one row above the keys: the capture, which is
// what the CRM is for, and the shows, which is where the cards come from. Both are
// shortcuts onto keys the grid already carries.
export const AEROSYNC_ACTIONS = [
  { key: 'add-card', label: 'Add a card' },
  { key: 'rooms', label: 'Rooms ahead' },
];