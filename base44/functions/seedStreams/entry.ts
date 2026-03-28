import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const streams = [
      {
        title: 'France 24 Live',
        category: 'news',
        stream_url: 'static_france24',
        source_type: 'youtube',
        description: 'International news from France 24',
        region: 'Europe',
        is_active: true,
        order: 1,
      },
      {
        title: 'Al Jazeera English',
        category: 'news',
        stream_url: '01.m3u8',
        source_type: 'hls',
        description: 'Breaking news and documentaries',
        region: 'Middle East',
        is_active: true,
        order: 2,
      },
      {
        title: 'Sky News',
        category: 'news',
        stream_url: 'static_skynews',
        source_type: 'youtube',
        description: 'UK and world news',
        region: 'Europe',
        is_active: true,
        order: 3,
      },
      {
        title: 'Bloomberg Live',
        category: 'news',
        stream_url: 'Bloomberg',
        source_type: 'youtube',
        description: 'Markets, finance, and business news',
        region: 'North America',
        is_active: true,
        order: 4,
      },
      {
        title: 'BBC News',
        category: 'news',
        stream_url: 'UCn84jAPeC7nUIJNbwHI5ocQ',
        source_type: 'youtube',
        description: 'BBC World Service',
        region: 'Europe',
        is_active: true,
        order: 5,
      },
      {
        title: 'NHK World',
        category: 'news',
        stream_url: 'UCuBlJV_eIMf7sG0BHXrC1rw',
        source_type: 'youtube',
        description: 'Japanese public broadcasting',
        region: 'Asia',
        is_active: true,
        order: 6,
      },
    ];

    const result = await base44.asServiceRole.entities.Stream.bulkCreate(streams);

    return Response.json({
      success: true,
      created: result.length,
      streams: result.map(s => ({ id: s.id, title: s.title })),
    });
  } catch (error) {
    console.error('[seedStreams]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});