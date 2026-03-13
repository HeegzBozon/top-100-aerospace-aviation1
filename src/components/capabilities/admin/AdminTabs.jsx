/**
 * AdminTabs.jsx — backwards-compatible re-export.
 * The canonical source of truth is now adminNavConfig.js.
 */
import { ALL_ADMIN_TABS } from './adminNavConfig';

// Re-export the flat tab list as ADMIN_TABS for any legacy consumers
export const ADMIN_TABS = ALL_ADMIN_TABS.map(tab => ({
  id: tab.id,
  label: tab.label,
  icon: tab.icon,
}));