import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { PUBLIC_STATUSES, publicSibling } from "../../shared/seoProfile.ts";

// Lightweight adjacency endpoint. Given a nominee id, returns prev/next within
// the same discipline plus up to 4 sibling Fellows for the on-profile internal
// linking rail. Replaces the client-side 100-nominee fetch with a tiny payload.
// Public — used by the profile page for logged-out visitors.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const nomineeId = body?.nomineeId;
    if (!nomineeId) {
      return Response.json({ error: "nomineeId required" }, { status: 400 });
    }
    const current = await base44.asServiceRole.entities.Nominee.get(nomineeId);
    if (!current || !PUBLIC_STATUSES.includes(current.status || "active")) {
      return Response.json({ prev: null, next: null, siblings: [] });
    }
    if (!current.discipline) {
      return Response.json({ prev: null, next: null, siblings: [] });
    }
    const siblings = await base44.asServiceRole.entities.Nominee.filter(
      { discipline: current.discipline },
      "name",
      100
    );
    const publicList = (siblings || []).filter((n) =>
      PUBLIC_STATUSES.includes(n.status || "active")
    );
    const idx = publicList.findIndex((n) => n.id === nomineeId);
    const prev = idx > 0 ? publicSibling(publicList[idx - 1]) : null;
    const next =
      idx >= 0 && idx < publicList.length - 1
        ? publicSibling(publicList[idx + 1])
        : null;
    const siblingCards = publicList
      .filter((n) => n.id !== nomineeId)
      .slice(0, 4)
      .map(publicSibling);
    return Response.json({ prev, next, siblings: siblingCards });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}