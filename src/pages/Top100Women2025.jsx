import PublicationBody from '@/components/publication/PublicationBody';
import PublicationLoading from '@/components/publication/PublicationLoading';
import useTop100WomenNominees from '@/components/publication/useTop100WomenNominees';

// Standalone publication route — same body as the HomeV3 front door.
// Kept as a distinct crawlable entry point for SEO / deep-linking.
export default function Top100Women2025() {
  const { loading } = useTop100WomenNominees();
  if (loading) return <PublicationLoading />;
  return <PublicationBody />;
}