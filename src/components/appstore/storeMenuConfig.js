import { STORE_TOOLS } from './storeCatalog';

// The App Store's own menu: the same five tools the shelf lists, drawn as keys on the
// store's title screen. A tool that is open carries its way in; a tool still on the
// bench carries no destination of its own — its key reads "In build" and opens the
// shelf, where every tool is described in full.
export const storeMenuItems = () =>
  STORE_TOOLS.map((tool, i) => ({
    key: tool.key,
    index: String(i + 1).padStart(2, '0'),
    label: tool.name,
    icon: tool.icon,
    to: tool.status === 'available' ? tool.to : '/app-store/shelf',
    progressLabel: tool.status === 'available' ? undefined : 'In build',
  }));

// What the store's title screen is asking for, in one line: how much of the shelf is
// actually open, and how much is still being built.
export const storeCounts = () => {
  const open = STORE_TOOLS.filter((tool) => tool.status === 'available').length;
  return { open, building: STORE_TOOLS.length - open };
};