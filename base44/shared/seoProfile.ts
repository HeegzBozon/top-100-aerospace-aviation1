// Shared SEO helpers for profile sitemap, adjacency, and prerender functions.
// Public, governance-safe: only public statuses, only public fields, never
// scores/payment/availability. Kept here so all three functions import one copy.

// Canonical public origin. req.url origin resolves to the internal worker URL
// behind the proxy, so hardcode the published domain. Swap this when a custom
// domain is connected.
export const SITE_ORIGIN = "https://top100aerospaceandaviation.base44.app";

export const PUBLIC_STATUSES = ["active", "approved", "winner", "finalist"];

export const DISCIPLINE_LABELS: Record<string, string> = {
  space_rd: "Space Research & Development",
  commercial_aviation: "Commercial Aviation",
  defense: "Defense Aerospace",
  manufacturing: "Aerospace Manufacturing",
  operations: "Flight Operations",
  engineering: "Aerospace Engineering",
  policy: "Space & Aviation Policy",
  entrepreneurship: "Aerospace Entrepreneurship",
};

// A profile is indexable when it is in a public status AND carries at least
// one substantive content field. Thin/non-public profiles are excluded from
// the sitemap and return 404 from the prerender endpoint.
export function isIndexable(n: any): boolean {
  if (!n) return false;
  if (!PUBLIC_STATUSES.includes(n.status || "active")) return false;
  const hasContent =
    !!(n.description && String(n.description).trim()) ||
    !!(n.bio && String(n.bio).trim()) ||
    !!(n.bio_extended && String(n.bio_extended).trim()) ||
    (Array.isArray(n.career_history) && n.career_history.length > 0) ||
    (Array.isArray(n.education) && n.education.length > 0) ||
    (Array.isArray(n.skills) && n.skills.length > 0) ||
    (n.editorial_article && n.article_status === "published");
  return hasContent;
}

export function escapeHtml(s: any): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeXml(s: any): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Minimal public sibling payload for the adjacency endpoint — only fields the
// profile-neighbors rail renders. Never includes scores or payment fields.
export function publicSibling(n: any) {
  return {
    id: n.id,
    name: n.name,
    title: n.title || n.professional_role || "",
    avatar_url: n.avatar_url || n.photo_url || "",
  };
}