import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const member = await base44.auth.me().catch(() => null);
  const { action, roomName, guestName } = await req.json();

  // Guests walk the campus under a name they choose, marked as guests.
  const guest = String(guestName || '').trim().slice(0, 40);
  if (!member && !guest) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = member || {
    full_name: `${guest} (Guest)`,
    email: `guest-${crypto.randomUUID()}`,
  };
  const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY');
  const DAILY_BASE_URL = 'https://api.daily.co/v1';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DAILY_API_KEY}`,
  };

  if (action === 'get_or_create_room') {
    const base = /^colony-[a-z0-9-]{1,40}$/.test(roomName || '') ? roomName : 'colony-main';

    // Overflow: when a room is nearly full, newcomers go to the next copy of it.
    const CAP = 190;
    let name = base;
    let copy = 1;
    for (; copy <= 10; copy++) {
      name = copy === 1 ? base : `${base}-${copy}`;
      const pres = await fetch(`${DAILY_BASE_URL}/rooms/${name}/presence`, { headers });
      const count = pres.ok ? ((await pres.json()).total_count || 0) : 0;
      if (count < CAP) break;
    }

    // Try to get existing room
    const getRoomRes = await fetch(`${DAILY_BASE_URL}/rooms/${name}`, { headers });

    let room;
    // Each campus room is its own call; a room holds up to 200 people.
    if (getRoomRes.ok) {
      room = await getRoomRes.json();
      if (room?.config?.max_participants !== 200) {
        const upd = await fetch(`${DAILY_BASE_URL}/rooms/${name}`, {
          method: 'POST', headers, body: JSON.stringify({ properties: { max_participants: 200 } }),
        });
        if (upd.ok) room = await upd.json();
      }
    } else {
      // Create room
      const createRes = await fetch(`${DAILY_BASE_URL}/rooms`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          properties: {
            enable_chat: true,
            enable_screenshare: true,
            max_participants: 200,
          },
        }),
      });
      room = await createRes.json();
    }

    // Generate a meeting token for this user
    const tokenRes = await fetch(`${DAILY_BASE_URL}/meeting-tokens`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        properties: {
          room_name: room.name,
          user_name: user.full_name || user.email,
          user_id: user.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4, // 4 hours
        },
      }),
    });

    const tokenData = await tokenRes.json();

    return Response.json({
      room,
      token: tokenData.token,
      copy,
      userName: user.full_name || user.email,
      userEmail: user.email,
    });
  }

  if (action === 'list_rooms') {
    const res = await fetch(`${DAILY_BASE_URL}/rooms`, { headers });
    const data = await res.json();
    return Response.json({ rooms: data.data || [] });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
});