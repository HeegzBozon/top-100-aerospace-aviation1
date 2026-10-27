import PublicationBody from '@/components/publication/PublicationBody';
import PublicationSectionBoundary from '@/components/publication/PublicationSectionBoundary';
import PublicationLoading from '@/components/publication/PublicationLoading';
import PublicationUnavailable from '@/components/publication/PublicationUnavailable';
import useTop100WomenNominees, { resetEditionCache } from '@/components/publication/useTop100WomenNominees';

// Standalone publication route — same body as the HomeV3 front door.
// Kept as a distinct crawlable entry point for SEO / deep-linking.
export default function Top100Women2025() {
  const { nominees, loading, error } = useTop100WomenNominees();

  const reloadEdition = () => {
    resetEditionCache();
    window.location.reload();
  };

  if (loading) return <PublicationLoading />;
  if (error || nominees.length === 0) return <PublicationUnavailable onRetry={reloadEdition} />;
  // The edition's own body sits inside an edition boundary as well, so nothing this
  // route renders can ever reach the app-wide fault box marked "Section failed to load".
  return (
    <PublicationSectionBoundary name="edition" label="The Orbital Edition">
      <PublicationBody showExports />
    </PublicationSectionBoundary>
  );
}