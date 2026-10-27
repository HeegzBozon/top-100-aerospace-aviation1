import PublicationBody from '@/components/publication/PublicationBody';
import PublicationSectionBoundary from '@/components/publication/PublicationSectionBoundary';
import PublicationLoading from '@/components/publication/PublicationLoading';
import PublicationUnavailable from '@/components/publication/PublicationUnavailable';
import useTop100WomenNominees, { resetEditionCache } from '@/components/publication/useTop100WomenNominees';

// Standalone publication route — same body as the HomeV3 front door.
// Kept as a distinct crawlable entry point for SEO / deep-linking. It carries its own
// route in App.jsx, so the edition mounts the way every other editorial surface does —
// straight into the device shells — instead of through the legacy comms layout.
export default function Top100Women2025() {
  const { nominees, loading, error } = useTop100WomenNominees();

  const reloadEdition = () => {
    resetEditionCache();
    window.location.reload();
  };

  // All three states of the route — assembling, unavailable, and the edition itself —
  // render inside the edition boundary, so a fault in any of them stays a quiet note
  // on the publication and never reaches the app-wide fault box.
  return (
    <PublicationSectionBoundary name="edition" label="The Orbital Edition">
      {loading ? (
        <PublicationLoading />
      ) : error || nominees.length === 0 ? (
        <PublicationUnavailable onRetry={reloadEdition} />
      ) : (
        <PublicationBody showExports />
      )}
    </PublicationSectionBoundary>
  );
}