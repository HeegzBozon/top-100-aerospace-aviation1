import { Navigate, useParams } from 'react-router-dom';

// Legacy /Top100Women2025/:nomineeId route. The canonical public profile URL is
// /profiles/:id (ProfileView), which carries the SEO meta + JSON-LD. This route
// now 301-equivalents (client replace) to the canonical URL to eliminate
// duplicate-content cannibalization between the two surfaces.
export default function DynamicProfilePage() {
  const { nomineeId } = useParams();
  return <Navigate to={`/profiles/${nomineeId}`} replace />;
}