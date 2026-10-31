import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  INTENT_DOMAINS,
  HIRE_CAPABILITIES,
  COMMERCIAL_OFFERINGS,
  INTENT_REGIONS,
  HIRE_AVAILABILITY,
  WORK_PREFERENCES,
  COMMERCIAL_ENGAGEMENTS,
  INQUIRY_ROUTES,
  PITCH_MAX,
  pickAllowed,
  oneOf,
} from '../../shared/profileIntent.ts';

const ACCENTS = [
  'space_rd',
  'commercial_aviation',
  'defense',
  'manufacturing',
  'operations',
  'engineering',
  'policy',
  'entrepreneurship',
];
const COVERS = ['none', 'orbit', 'launch', 'runway', 'lunar', 'horizon'];
const LOCKED = ['identity', 'verification'];
const REORDERABLE = ['eight', 'wall', 'flightography'];

// Presentation deck regions. Identity and credential are locked at positions
// 1 and 2; every region below may be ordered or hidden, and nothing else may.
const SLIDE_REGIONS = [
  'viral_post',
  'blurb',
  'documents',
  'availability',
  'eight',
  'flightography',
  'conferences',
];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const patch = {};

    if (body.domain_accent !== undefined) {
      if (!ACCENTS.includes(body.domain_accent)) {
        return Response.json({ error: 'Accent is not in the approved set' }, { status: 400 });
      }
      patch.domain_accent = body.domain_accent;
    }

    if (body.cover_asset_id !== undefined) {
      if (!COVERS.includes(body.cover_asset_id)) {
        return Response.json({ error: 'Cover is not in the verified asset library' }, { status: 400 });
      }
      patch.cover_asset_id = body.cover_asset_id;
    }

    if (body.module_order !== undefined) {
      const order = Array.isArray(body.module_order) ? body.module_order : null;
      if (!order) return Response.json({ error: 'Module order must be a list' }, { status: 400 });

      // Locked modules may never appear in the configurable order.
      if (order.some((k) => LOCKED.includes(k))) {
        return Response.json(
          { error: 'Identity header and verification are locked to positions 1 and 2' },
          { status: 400 }
        );
      }
      const unknown = order.filter((k) => !REORDERABLE.includes(k));
      if (unknown.length) {
        return Response.json({ error: 'Module is not on the allowlist: ' + unknown[0] }, { status: 400 });
      }
      const deduped = order.filter((k, i) => order.indexOf(k) === i);
      if (deduped.length !== REORDERABLE.length) {
        return Response.json({ error: 'Module order must contain every allowed module once' }, { status: 400 });
      }
      patch.module_order = deduped;
    }

    if (body.slide_order !== undefined) {
      const order = Array.isArray(body.slide_order) ? body.slide_order : null;
      if (!order) return Response.json({ error: 'Slide order must be a list' }, { status: 400 });
      if (order[0] !== 'identity' || order[1] !== 'verification') {
        return Response.json(
          { error: 'Identity and Credential are locked to positions 1 and 2' },
          { status: 400 }
        );
      }
      if (order.some((k) => LOCKED.includes(k) && k !== order[0] && k !== order[1])) {
        return Response.json({ error: 'Identity and Credential may only hold positions 1 and 2' }, { status: 400 });
      }
      const rest = order.slice(2);
      const unknown = rest.filter((k) => !SLIDE_REGIONS.includes(k));
      if (unknown.length) {
        return Response.json({ error: 'Slide is not on the allowlist: ' + unknown[0] }, { status: 400 });
      }
      const deduped = rest.filter((k, i) => rest.indexOf(k) === i);
      patch.slide_order = ['identity', 'verification', ...deduped];
    }

    if (body.slide_hidden !== undefined) {
      const hidden = Array.isArray(body.slide_hidden) ? body.slide_hidden : null;
      if (!hidden) return Response.json({ error: 'Hidden slides must be a list' }, { status: 400 });
      if (hidden.some((k) => LOCKED.includes(k))) {
        return Response.json({ error: 'Identity and Credential can never be hidden' }, { status: 400 });
      }
      const unknown = hidden.filter((k) => !SLIDE_REGIONS.includes(k));
      if (unknown.length) {
        return Response.json({ error: 'Slide is not on the allowlist: ' + unknown[0] }, { status: 400 });
      }
      patch.slide_hidden = hidden.filter((k, i) => hidden.indexOf(k) === i);
    }

    if (body.six_word_story !== undefined) {
      patch.six_word_story = String(body.six_word_story).slice(0, 60);
    }

    if (body.activity_seen_at !== undefined) {
      patch.activity_seen_at = body.activity_seen_at;
    }

    // ── The intent layer ──────────────────────────────────────────────────
    // Two independent switches, and the curated fields each one carries. Every
    // value is chosen from an approved set; nothing is free-form. These fields
    // are a conversion surface only — they never reach discovery ordering,
    // measurement, influence tier, or scoring.
    let intentTouched = false;

    for (const flag of ['intent_hire_enabled', 'intent_commercial_enabled', 'dossier_enabled']) {
      if (body[flag] !== undefined) {
        patch[flag] = body[flag] === true;
        intentTouched = true;
      }
    }

    if (body.hire_pitch !== undefined) {
      patch.hire_pitch = String(body.hire_pitch).slice(0, PITCH_MAX);
      intentTouched = true;
    }
    if (body.hire_capabilities !== undefined) {
      patch.hire_capabilities = pickAllowed(body.hire_capabilities, HIRE_CAPABILITIES);
      intentTouched = true;
    }
    if (body.hire_availability !== undefined) {
      const value = oneOf(body.hire_availability, HIRE_AVAILABILITY);
      if (!value) return Response.json({ error: 'Availability is not in the approved set' }, { status: 400 });
      patch.hire_availability = value;
      intentTouched = true;
    }
    if (body.hire_work_preference !== undefined) {
      const value = oneOf(body.hire_work_preference, WORK_PREFERENCES);
      if (!value) return Response.json({ error: 'Work preference is not in the approved set' }, { status: 400 });
      patch.hire_work_preference = value;
      intentTouched = true;
    }
    if (body.hire_regions !== undefined) {
      patch.hire_regions = pickAllowed(body.hire_regions, INTENT_REGIONS);
      intentTouched = true;
    }

    if (body.commercial_pitch !== undefined) {
      patch.commercial_pitch = String(body.commercial_pitch).slice(0, PITCH_MAX);
      intentTouched = true;
    }
    if (body.commercial_offerings !== undefined) {
      patch.commercial_offerings = pickAllowed(body.commercial_offerings, COMMERCIAL_OFFERINGS);
      intentTouched = true;
    }
    if (body.commercial_engagements !== undefined) {
      const value = oneOf(body.commercial_engagements, COMMERCIAL_ENGAGEMENTS);
      if (!value) return Response.json({ error: 'Engagement state is not in the approved set' }, { status: 400 });
      patch.commercial_engagements = value;
      intentTouched = true;
    }
    if (body.commercial_sectors !== undefined) {
      patch.commercial_sectors = pickAllowed(body.commercial_sectors, INTENT_DOMAINS);
      intentTouched = true;
    }

    if (body.inquiry_route !== undefined) {
      const value = oneOf(body.inquiry_route, INQUIRY_ROUTES);
      if (!value) return Response.json({ error: 'Contact preference is not in the approved set' }, { status: 400 });
      patch.inquiry_route = value;
      intentTouched = true;
    }

    if (body.inquiry_last_seen_at !== undefined) {
      patch.inquiry_last_seen_at = body.inquiry_last_seen_at;
    }

    if (intentTouched) patch.intent_updated_at = new Date().toISOString();

    const existing = await base44.asServiceRole.entities.FellowProfileSettings.filter({
      fellow_email: user.email,
    });

    let record;
    if (existing && existing.length) {
      record = await base44.asServiceRole.entities.FellowProfileSettings.update(existing[0].id, patch);
    } else {
      record = await base44.asServiceRole.entities.FellowProfileSettings.create({
        fellow_email: user.email,
        domain_accent: patch.domain_accent || 'entrepreneurship',
        cover_asset_id: patch.cover_asset_id || 'none',
        module_order: patch.module_order || REORDERABLE,
        six_word_story: patch.six_word_story || '',
        activity_seen_at: patch.activity_seen_at,
        // The intent layer is written with the row on first save too, so a Fellow's
        // first opening or closing of a door is never quietly dropped.
        ...patch,
      });
    }

    return Response.json({ settings: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}