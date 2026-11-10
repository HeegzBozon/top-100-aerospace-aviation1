/**
 * GET the wall of TOP 100 TV.
 *
 * A Stream record says whether a channel is carried, who sponsors it and where it sits.
 * This resolves each one to its broadcasting video so the square actually plays: a record
 * that names a channel is asked which of its broadcasts is live right now, and the answer
 * is held for a few minutes. A channel that is between broadcasts still returns its channel
 * id, so the player falls back to the channel's own live window rather than a black frame.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { secrets } from 'base44:runtime';
import { TV_CHANNELS, channelForStream, isVideoId } from '../../shared/tvChannels.ts';

const CACHE_MS = 3 * 60 * 1000;
let cache = { at: 0, rows: null };

const chunk = (list, size) => {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

async function findLiveBroadcast(channelId, apiKey) {
  const params = new URLSearchParams({
    part: 'snippet',
    channelId,
    eventType: 'live',
    type: 'video',
    maxResults: '1',
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;

  const data = await res.json();
  const item = data?.items?.[0];
  if (!item) return null;

  return {
    videoId: item.id?.videoId || null,
    title: item.snippet?.title || null,
    thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || null,
  };
}

// One lookup per channel, in batches so the worker never opens the whole wall at once.
async function resolveBroadcasts(channels, apiKey) {
  const found = new Map();
  if (!apiKey) return found;

  for (const batch of chunk(channels, 6)) {
    const answers = await Promise.allSettled(
      batch.map((channel) => findLiveBroadcast(channel.channelId, apiKey))
    );
    answers.forEach((answer, i) => {
      if (answer.status === 'fulfilled' && answer.value) {
        found.set(batch[i].channelId, answer.value);
      }
    });
  }
  return found;
}

function shapeStream(stream, broadcasts) {
  const channel = channelForStream(stream);
  const source = String(stream.stream_url || '').trim();

  // A record may carry a finished video rather than a channel.
  const directVideo = !channel && isVideoId(source) ? source : null;
  const broadcast = channel ? broadcasts.get(channel.channelId) : null;

  const videoId = directVideo || broadcast?.videoId || null;
  const channelId = channel?.channelId || null;

  return {
    id: stream.id,
    title: stream.title || channel?.name || 'Untitled channel',
    subtitle: stream.subtitle || null,
    description: stream.description || null,
    category: stream.category || null,
    domain: stream.metadata?.domain || channel?.domain || null,
    region: stream.region || channel?.region || null,
    icon: stream.metadata?.icon || channel?.icon || null,
    row: stream.metadata?.grid_row || channel?.row || 3,
    column: stream.metadata?.grid_column || null,
    source_type: 'youtube',
    video_id: videoId,
    channel_id: channelId,
    is_live: !!videoId,
    watch_url: channelId
      ? `https://www.youtube.com/channel/${channelId}/live`
      : videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : null,
    thumbnail_url: stream.thumbnail_url || broadcast?.thumbnail || null,
    status: videoId ? 'LIVE' : 'OFFLINE',
    sponsorship: stream.sponsorship || null,
    display_order: stream.display_order || 0,
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    if (cache.rows && Date.now() - cache.at < CACHE_MS) {
      return Response.json(cache.rows, { headers: { 'Cache-Control': 'private, max-age=60' } });
    }

    const streams = await base44.asServiceRole.entities.Stream.list('display_order', 200);

    const apiKey = secrets.get('YOUTUBE_API_KEY');

    // A record governs the channel it names: it carries the sponsor, the order, and the
    // decision to drop the channel (is_active: false). The line-up itself is the desk's, so
    // a channel it carries with no record filed yet is still drawn — the wall is never
    // half-built because the paperwork is behind.
    const suppressed = new Set(
      streams
        .filter((s) => s.is_active === false)
        .map((s) => channelForStream(s)?.key)
        .filter(Boolean)
    );
    const filed = streams.filter((s) => s.is_active !== false);
    const covered = new Set(filed.map((s) => channelForStream(s)?.key).filter(Boolean));

    const unfiled = TV_CHANNELS.filter(
      (channel) => !covered.has(channel.key) && !suppressed.has(channel.key)
    ).map((channel, i) => ({
      id: `lineup-${channel.key}`,
      title: channel.name,
      stream_url: channel.channelId,
      is_active: true,
      display_order: 1000 + i,
      metadata: { channel_key: channel.key, grid_row: channel.row, icon: channel.icon },
    }));

    const carried = [...filed, ...unfiled];

    const channels = carried
      .map((stream) => channelForStream(stream))
      .filter(Boolean);
    const unique = Array.from(new Map(channels.map((c) => [c.channelId, c])).values());

    const broadcasts = await resolveBroadcasts(unique, apiKey);

    const rows = carried
      .map((stream) => shapeStream(stream, broadcasts))
      .sort(
        (a, b) =>
          a.row - b.row ||
          a.display_order - b.display_order ||
          String(a.title).localeCompare(String(b.title))
      );

    cache = { at: Date.now(), rows };

    return Response.json(rows, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (error) {
    console.error('[getTVStreams]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}