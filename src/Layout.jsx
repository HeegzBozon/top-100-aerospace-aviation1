// Retired as a chrome host.
//
// The machine draws its own furniture (ImacHousing / HandheldShell), mounts its own
// services (components/core/MachineProviders), and each surface owns its own content — so
// there is nothing left for a page layout to add. This file survives only because
// pagesConfig still exports a Layout; it draws no chrome, holds no state, and must never
// grow either back.
export default function Layout({ children }) {
  return <>{children}</>;
}