import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { appendNominationsToManifest } from '../../shared/manifestAppend.ts';

// The catch-up between a Fellow's nominations and their Manifest.
//
// The Manifest saves itself, so it is where the names a Fellow put forward belong: this
// desk appends whatever their intake holds and their list does not — at the end, in the
// order it was filed, once. It is idempotent by construction: a second call with nothing new
// writes nothing.
//
// It answers for the caller. The operator may name one Fellow to bring forward, which is how
// a filing made before the Manifest carried nominations is caught up once: one Fellow's
// nominations are still only ever read against that Fellow's own list.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.email) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const named = typeof body?.email === 'string' ? body.email.trim() : '';
    if (named && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const result = await appendNominationsToManifest(base44.asServiceRole, named || user.email);
    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}