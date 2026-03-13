import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Updates nomination status and tracks the change
 * Expects payload: { nomination_id, new_status }
 * Admin-only
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { nomination_id, new_status } = body;

    if (!nomination_id || !new_status) {
      return Response.json(
        { error: 'Missing required fields: nomination_id, new_status' },
        { status: 400 }
      );
    }

    // Fetch the nomination to get old status
    const nomination = await base44.asServiceRole.entities.Nomination.get(nomination_id);
    if (!nomination) {
      return Response.json(
        { error: 'Nomination not found' },
        { status: 404 }
      );
    }

    const oldStatus = nomination.status;

    // Update nomination status
    const updatedNomination = await base44.asServiceRole.entities.Nomination.update(
      nomination_id,
      { status: new_status }
    );

    // Track status change
    await base44.analytics.track({
      eventName: 'nomination_status_changed',
      properties: {
        nomination_id,
        nominee_email: nomination.nominee_email,
        nominator_email: nomination.nominator_email,
        old_status: oldStatus,
        new_status,
        changed_by_email: user.email,
        category_id: nomination.category_id,
        cycle_year: nomination.cycle_year
      }
    });

    return Response.json({
      success: true,
      nomination: updatedNomination
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});