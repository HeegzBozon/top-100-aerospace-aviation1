import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, roomName } = await req.json();
  const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY');
  const DAILY_BASE_URL = 'https://api.daily.co/v1';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DAILY_API_KEY}`,
  };

  if (action === 'get_or_create_room') {
    const name = roomName || 'colony-main';

    // Try to get existing room
    const getRoomRes = await fetch(`${DAILY_BASE_URL}/rooms/${name}`, { headers });

    let room;
    if (getRoomRes.ok) {
      room = await getRoomRes.json();
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
            max_participants: 50,
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