/**
 * The flightography behind one channel: who is verified as having built the programme it
 * is covering.
 *
 * A channel on the wall that has no record filed is not an error — it simply has nothing
 * bound to it yet, and says so.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EMPTY = {
  stream: null,
  program: null,
  verified_contributors: [],
  total_contributors: 0,
  bound: false,
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // The id arrives in the payload — the surface calls this through the SDK, which posts a
    // body rather than addressing a path. A path form is still read for older links.
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const streamId = body?.stream_id || (pathParts[5] !== 'context' ? pathParts[5] : null);

    if (!streamId) {
      return Response.json({ error: 'stream_id required' }, { status: 400 });
    }

    // A channel drawn from the line-up rather than from a filed record carries a made-up id,
    // which the database rightly refuses to read. That is simply a channel with nothing bound
    // to it, not a fault.
    const isRecordId = /^[a-f0-9]{24}$/i.test(String(streamId));
    if (!isRecordId) {
      return Response.json({ ...EMPTY, stream: { id: streamId } });
    }

    const found = await base44.asServiceRole.entities.Stream.filter({ id: streamId }).catch(() => []);
    const stream = found[0] || null;

    if (!stream) {
      return Response.json({ ...EMPTY, stream: { id: streamId } });
    }

    const bindings = await base44.asServiceRole.entities.StreamProgramBinding.filter(
      { stream_id: streamId, is_active: true },
      'created_date',
      10
    );

    if (bindings.length === 0) {
      return Response.json({ ...EMPTY, stream: { id: stream.id, title: stream.title } });
    }

    const primaryBinding = bindings[0];

    const contributors = await base44.asServiceRole.entities.Nominee.filter(
      {
        $or: [
          { career_history: { $elemMatch: { company_name: primaryBinding.program_name } } },
          { affiliations: { $in: [primaryBinding.program_name, primaryBinding.program_id] } },
          { organization: primaryBinding.program_name },
        ],
        verified_status: { $in: ['self_verified', 'fully_verified', 'partially_verified'] },
      },
      '-updated_date',
      8
    ).catch(() => []);

    const verifiedContributors = contributors.map((contributor) => {
      const careerEntry =
        contributor.career_history?.find(
          (entry) => entry.company_name === primaryBinding.program_name
        ) || contributor.career_history?.[0];

      return {
        person_id: contributor.id,
        name: contributor.name,
        role: contributor.professional_role || contributor.title || 'Contributor',
        subsystem: careerEntry?.description || contributor.industry || 'Aerospace',
        status:
          contributor.verified_status === 'fully_verified' ? 'Peer Verified' : 'Self Verified',
        avatar_url: contributor.avatar_url || contributor.photo_url,
        profile_url: `/profiles/${contributor.id}`,
      };
    });

    return Response.json(
      {
        stream: { id: stream.id, title: stream.title, category: stream.category },
        program: {
          program_id: primaryBinding.program_id,
          name: primaryBinding.program_name,
          organization: primaryBinding.organization,
        },
        verified_contributors: verifiedContributors,
        total_contributors: verifiedContributors.length,
        bound: true,
      },
      { headers: { 'Cache-Control': 'public, max-age=120' } }
    );
  } catch (error) {
    console.error('[getStreamContext]', error);
    return Response.json({ error: error.message, verified_contributors: [] }, { status: 500 });
  }
}