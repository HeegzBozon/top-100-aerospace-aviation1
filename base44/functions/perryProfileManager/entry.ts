import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Fields Perry is allowed to write on Nominee
const NOMINEE_WRITABLE_FIELDS = new Set([
  'bio', 'description', 'title', 'company', 'professional_role', 'industry',
  'skills', 'affiliations', 'linkedin_profile_url', 'instagram_url',
  'tiktok_url', 'youtube_url', 'website_url', 'impact_summary',
  'nomination_reason', 'achievements', 'six_word_story', 'career_history',
]);

// Fields Perry is allowed to write on User
const USER_WRITABLE_FIELDS = new Set([
  'professional_bio', 'job_title', 'company', 'linkedin_url',
  'personal_website_url', 'skills', 'industry',
]);

function sanitizeString(val) {
  if (typeof val !== 'string') return val;
  return val.trim().slice(0, 5000);
}

function buildDiff(oldObj, newObj) {
  const diff = {};
  for (const key of Object.keys(newObj)) {
    const oldVal = oldObj?.[key];
    const newVal = newObj[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { from: oldVal ?? null, to: newVal };
    }
  }
  return diff;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── GET PROFILE ────────────────────────────────────────────────────────
    if (action === 'get_profile') {
      const [nominees, userData] = await Promise.all([
        base44.asServiceRole.entities.Nominee.filter({ claimed_by_user_email: user.email }),
        base44.auth.me(),
      ]);
      const nominee = nominees?.[0] || null;
      return Response.json({ success: true, nominee, user: userData });
    }

    // ── UPDATE USER FIELDS ─────────────────────────────────────────────────
    if (action === 'update_user') {
      const { fields } = body;
      if (!fields || typeof fields !== 'object') {
        return Response.json({ error: 'Missing fields' }, { status: 400 });
      }

      const safeFields = {};
      for (const [key, val] of Object.entries(fields)) {
        if (!USER_WRITABLE_FIELDS.has(key)) continue;
        safeFields[key] = typeof val === 'string' ? sanitizeString(val) : val;
      }

      if (Object.keys(safeFields).length === 0) {
        return Response.json({ error: 'No writable fields provided' }, { status: 400 });
      }

      const oldUser = await base44.auth.me();
      await base44.auth.updateMe(safeFields);
      const updatedUser = await base44.auth.me();
      const diff = buildDiff(oldUser, safeFields);

      return Response.json({ success: true, user: updatedUser, diff });
    }

    // ── UPDATE NOMINEE FIELDS ──────────────────────────────────────────────
    if (action === 'update_nominee') {
      const { fields } = body;
      if (!fields || typeof fields !== 'object') {
        return Response.json({ error: 'Missing fields' }, { status: 400 });
      }

      const nominees = await base44.asServiceRole.entities.Nominee.filter({
        claimed_by_user_email: user.email,
      });
      const nominee = nominees?.[0];
      if (!nominee) {
        return Response.json({ error: 'No claimed nominee profile found for this account.' }, { status: 404 });
      }

      const safeFields = {};
      for (const [key, val] of Object.entries(fields)) {
        if (!NOMINEE_WRITABLE_FIELDS.has(key)) continue;
        safeFields[key] = typeof val === 'string' ? sanitizeString(val) : val;
      }

      if (Object.keys(safeFields).length === 0) {
        return Response.json({ error: 'No writable fields provided' }, { status: 400 });
      }

      const diff = buildDiff(nominee, safeFields);
      const updated = await base44.asServiceRole.entities.Nominee.update(nominee.id, safeFields);

      return Response.json({ success: true, nominee: updated, diff });
    }

    // ── CAREER HISTORY CRUD ────────────────────────────────────────────────
    if (action === 'add_career_entry') {
      const { entry } = body;
      const nominees = await base44.asServiceRole.entities.Nominee.filter({
        claimed_by_user_email: user.email,
      });
      const nominee = nominees?.[0];
      if (!nominee) return Response.json({ error: 'No claimed nominee profile found.' }, { status: 404 });

      const existing = Array.isArray(nominee.career_history) ? nominee.career_history : [];
      const newEntry = {
        company_name: sanitizeString(entry.company_name || ''),
        role_title: sanitizeString(entry.role_title || ''),
        start_date: entry.start_date || null,
        end_date: entry.end_date || null,
        description: sanitizeString(entry.description || ''),
        _id: crypto.randomUUID(),
      };
      const updated = await base44.asServiceRole.entities.Nominee.update(nominee.id, {
        career_history: [...existing, newEntry],
      });
      return Response.json({ success: true, nominee: updated, added: newEntry });
    }

    if (action === 'update_career_entry') {
      const { entry_id, entry } = body;
      const nominees = await base44.asServiceRole.entities.Nominee.filter({
        claimed_by_user_email: user.email,
      });
      const nominee = nominees?.[0];
      if (!nominee) return Response.json({ error: 'No claimed nominee profile found.' }, { status: 404 });

      const existing = Array.isArray(nominee.career_history) ? nominee.career_history : [];
      const updated_history = existing.map((e) =>
        e._id === entry_id
          ? {
              ...e,
              company_name: sanitizeString(entry.company_name ?? e.company_name),
              role_title: sanitizeString(entry.role_title ?? e.role_title),
              start_date: entry.start_date ?? e.start_date,
              end_date: entry.end_date ?? e.end_date,
              description: sanitizeString(entry.description ?? e.description),
            }
          : e
      );
      const updated = await base44.asServiceRole.entities.Nominee.update(nominee.id, {
        career_history: updated_history,
      });
      return Response.json({ success: true, nominee: updated });
    }

    if (action === 'delete_career_entry') {
      const { entry_id } = body;
      const nominees = await base44.asServiceRole.entities.Nominee.filter({
        claimed_by_user_email: user.email,
      });
      const nominee = nominees?.[0];
      if (!nominee) return Response.json({ error: 'No claimed nominee profile found.' }, { status: 404 });

      const existing = Array.isArray(nominee.career_history) ? nominee.career_history : [];
      const filtered = existing.filter((e) => e._id !== entry_id);
      const updated = await base44.asServiceRole.entities.Nominee.update(nominee.id, {
        career_history: filtered,
      });
      return Response.json({ success: true, nominee: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});