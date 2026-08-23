import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Facilitator-or-admin verification of a room's attendance roster. Promotes
// declared ConferenceRsvp records (status: attending) into verified
// ConferenceAttendance records — the only attendance signal that ever feeds
// Flightography. Declared attendance never self-attests; verification is an
// institutional act gated to the room's facilitator or an admin, and only
// after the event has ended. Idempotent: re-running skips already-verified
// fellows and re-stamps the room. Service-role writes bypass RLS by design;
// the function is the gatekeeper.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const roomId = body?.room_id;
    if (!roomId) return Response.json({ error: 'room_id is required' }, { status: 400 });

    const svc = base44.asServiceRole;
    const room = await svc.entities.ConferenceRoom.get(roomId);
    if (!room) return Response.json({ error: 'Room not found' }, { status: 404 });

    const isFacilitator = !!user.email && room.facilitator_email === user.email;
    const isAdmin = user.role === 'admin';
    if (!isFacilitator && !isAdmin) {
      return Response.json({ error: 'Only the facilitator or an admin can verify attendance' }, { status: 403 });
    }

    // Attendance can only be verified after the event ends.
    if (room.end_date) {
      const end = new Date(`${room.end_date}T23:59:59`);
      if (!isNaN(end.getTime()) && new Date() < end) {
        return Response.json({ error: 'Attendance can only be verified after the event ends' }, { status: 400 });
      }
    }

    const rsvps = await svc.entities.ConferenceRsvp.filter({ room_id: roomId, status: 'attending' });
    const existing = await svc.entities.ConferenceAttendance.filter({ room_id: roomId });
    const seen = new Set((existing || []).map((a) => a.fellow_email));

    const toCreate = (rsvps || [])
      .filter((r) => r.fellow_email && !seen.has(r.fellow_email))
      .map((r) => ({
        room_id: roomId,
        conference_name: room.conference_name || '',
        conference_series: room.conference_series || '',
        fellow_email: r.fellow_email,
        fellow_name: r.fellow_name || '',
        fellow_avatar_url: r.fellow_avatar_url || '',
        start_date: room.start_date,
        end_date: room.end_date,
        city: room.city || '',
        country: room.country || '',
        domain_focus: room.domain_focus || '',
        focus_area: r.focus_area || '',
        verified_at: new Date().toISOString(),
        verified_by_email: user.email || '',
        verified_by_name: user.full_name || '',
      }));

    let created = 0;
    if (toCreate.length) {
      await svc.entities.ConferenceAttendance.bulkCreate(toCreate);
      created = toCreate.length;
    }
    await svc.entities.ConferenceRoom.update(roomId, { attendance_verified: true });

    return Response.json({
      verified: created,
      total_verified: (existing?.length || 0) + created,
      rsvp_count: (rsvps || []).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}