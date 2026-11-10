/**
 * Files the wall of TOP 100 TV — the repair path for the lineup.
 *
 * Run once by an admin and every carried channel is written with its real channel id and
 * its place on the wall. It matches on title, so running it again corrects the records in
 * place instead of piling up a second wall beside the first.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { TV_CHANNELS } from '../../shared/tvChannels.ts';

const existingTitles = (rows) => {
  const map = new Map();
  rows.forEach((row) => map.set(String(row.title || '').trim().toLowerCase(), row));
  return map;
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const carried = await base44.asServiceRole.entities.Stream.list('display_order', 200);
    const byTitle = existingTitles(carried);

    const created = [];
    const corrected = [];

    for (let i = 0; i < TV_CHANNELS.length; i += 1) {
      const channel = TV_CHANNELS[i];
      const fields = {
        title: channel.name,
        category: channel.domain,
        stream_url: channel.channelId,
        source_type: 'youtube',
        region: channel.region,
        is_active: true,
        display_order: i,
        metadata: {
          channel_key: channel.key,
          grid_row: channel.row,
          domain: channel.domain,
          icon: channel.icon,
        },
      };

      const match = byTitle.get(channel.name.toLowerCase());
      if (match) {
        await base44.asServiceRole.entities.Stream.update(match.id, fields);
        corrected.push({ id: match.id, title: channel.name });
      } else {
        const made = await base44.asServiceRole.entities.Stream.create(fields);
        created.push({ id: made.id, title: channel.name });
      }
    }

    return Response.json({ success: true, created, corrected, total: TV_CHANNELS.length });
  } catch (error) {
    console.error('[seedStreams]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}