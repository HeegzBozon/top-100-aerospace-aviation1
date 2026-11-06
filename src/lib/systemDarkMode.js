// Keeps the `dark` class on <html> in step with the device's own appearance setting,
// so Tailwind's class-based dark variants follow the system without a toggle. It reads
// the media query once at boot and again whenever the system changes its mind.
export function syncDarkModeWithSystem() {
  if (typeof window === 'undefined' || !window.matchMedia) return;
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = () => document.documentElement.classList.toggle('dark', query.matches);
  apply();
  query.addEventListener?.('change', apply);
}