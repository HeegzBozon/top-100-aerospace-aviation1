import { secrets } from "base44:runtime";

// THE HOUSE CHANNELS' PROGRAMME.
//
// The television's first station is the house's own YouTube channel, read through the
// Data API: the channel is resolved from its handle, its uploads playlist is read, and the
// newest videos are handed back as a programme the glass can draw.
//
// Public on purpose. A channel is on the air to everyone, and everything returned here is
// already published to the world — so the set works for a visitor as well as a Fellow, and
// asking for an account would be asking someone to sign in to watch television. The key
// never leaves the server, the input is only ever a channel handle or id from the app's own
// registry, and nothing is written.

const API = "https://www.googleapis.com/youtube/v3";

const thumbOf = (thumbnails = {}) =>
  thumbnails.maxres?.url ||
  thumbnails.standard?.url ||
  thumbnails.high?.url ||
  thumbnails.medium?.url ||
  thumbnails.default?.url ||
  "";

export default async function (req) {
  try {
    const key = secrets.get("YOUTUBE_API_KEY");
    if (!key) {
      return Response.json({ error: "YOUTUBE_API_KEY is not configured" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const channelId = String(body?.channelId || "").trim();
    const handle = String(body?.handle || "").replace(/^@/, "").trim();
    if (!channelId && !handle) {
      return Response.json({ error: "A channel handle or id is required" }, { status: 400 });
    }

    const limit = Math.min(Math.max(Number(body?.max) || 12, 1), 24);

    // 1. The channel itself, so the uploads playlist can be read from its own record.
    const lookup = new URLSearchParams({ part: "snippet,contentDetails", key });
    lookup.set(channelId ? "id" : "forHandle", channelId || handle);

    const channelRes = await fetch(`${API}/channels?${lookup}`, { signal: AbortSignal.timeout(10000) });
    const channelBody = await channelRes.json().catch(() => ({}));
    if (!channelRes.ok) {
      return Response.json(
        { error: channelBody?.error?.message || "YouTube refused the channel lookup" },
        { status: 502 },
      );
    }

    const channel = channelBody.items?.[0];
    if (!channel) {
      return Response.json(
        { error: "That channel could not be found", channel: null, videos: [] },
        { status: 404 },
      );
    }

    const uploads = channel.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) {
      return Response.json(
        { error: "That channel publishes no uploads list", channel: null, videos: [] },
        { status: 404 },
      );
    }

    // 2. The newest of what it put out.
    const list = new URLSearchParams({
      part: "snippet,contentDetails",
      playlistId: uploads,
      maxResults: String(limit),
      key,
    });

    const listRes = await fetch(`${API}/playlistItems?${list}`, { signal: AbortSignal.timeout(10000) });
    const listBody = await listRes.json().catch(() => ({}));
    if (!listRes.ok) {
      return Response.json(
        { error: listBody?.error?.message || "YouTube refused the uploads list" },
        { status: 502 },
      );
    }

    const videos = (listBody.items || [])
      .map((item) => {
        const snippet = item.snippet || {};
        const id = snippet.resourceId?.videoId || item.contentDetails?.videoId;
        return {
          id,
          title: snippet.title || "",
          description: snippet.description || "",
          published_at: snippet.publishedAt || item.contentDetails?.videoPublishedAt || "",
          thumbnail: thumbOf(snippet.thumbnails),
          url: id ? `https://www.youtube.com/watch?v=${id}` : "",
        };
      })
      .filter((video) => video.id);

    return Response.json({
      channel: {
        id: channel.id,
        title: channel.snippet?.title || "",
        handle: channel.snippet?.customUrl || handle,
        description: channel.snippet?.description || "",
        thumbnail: thumbOf(channel.snippet?.thumbnails),
        url: channel.snippet?.customUrl
          ? `https://www.youtube.com/${channel.snippet.customUrl}`
          : `https://www.youtube.com/channel/${channel.id}`,
      },
      videos,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}