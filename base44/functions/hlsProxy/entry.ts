import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * HLS Proxy: Relays geo-blocked HLS streams through our backend
 * - Fetches m3u8 manifest from origin
 * - Rewrites segment URLs to proxy through us
 * - Proxies segment/key requests transparently
 * Usage: POST /hlsProxy with { streamUrl, type: 'manifest' | 'segment' }
 */

const CACHE = new Map();
const CACHE_TTL = 300000; // 5 minutes

function isCacheable(url) {
  // Cache manifests, not segments (they're large)
  return url?.includes('.m3u8');
}

function getCached(key) {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    CACHE.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  CACHE.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

function rewriteManifest(manifestContent, proxyBase, originUrl) {
  // Parse the manifest and rewrite segment URLs to proxy through us
  const lines = manifestContent.split('\n');
  const originBase = new URL(originUrl).origin + new URL(originUrl).pathname.split('/').slice(0, -1).join('/');

  return lines.map(line => {
    // Skip comments and playlists that start with http/https
    if (line.startsWith('#') || line.startsWith('http')) return line;

    // Relative path → rewrite to proxy
    if (line.trim() && !line.startsWith('/')) {
      const segmentUrl = new URL(line, originBase).href;
      const proxyUrl = `${proxyBase}?url=${encodeURIComponent(segmentUrl)}`;
      return proxyUrl;
    }

    return line;
  }).join('\n');
}

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { streamUrl, type = 'manifest' } = await req.json();

    if (!streamUrl) {
      return Response.json({ error: 'Missing streamUrl' }, { status: 400 });
    }

    // Validate URL is actually a URL
    try {
      new URL(streamUrl);
    } catch {
      return Response.json({ error: 'Invalid streamUrl' }, { status: 400 });
    }

    // MANIFEST REQUEST: fetch m3u8, rewrite URLs, return
    if (type === 'manifest') {
      const cached = getCached(streamUrl);
      if (cached) {
        return new Response(cached, {
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Cache-Control': 'public, max-age=300',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const response = await fetch(streamUrl, {
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HLS-Proxy)',
        },
      });

      if (!response.ok) {
        console.warn(`[HLS Proxy] Failed to fetch ${streamUrl}: ${response.status}`);
        return Response.json(
          { error: `Origin returned ${response.status}` },
          { status: response.status }
        );
      }

      let manifestContent = await response.text();

      // Rewrite relative URLs in manifest to point back to proxy
      const proxyBase = new URL(req.url).origin + new URL(req.url).pathname;
      manifestContent = rewriteManifest(manifestContent, proxyBase, streamUrl);

      // Cache the rewritten manifest
      if (isCacheable(streamUrl)) {
        setCached(streamUrl, manifestContent);
      }

      return new Response(manifestContent, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // SEGMENT REQUEST: proxy the binary segment
    if (type === 'segment') {
      const response = await fetch(streamUrl, {
        signal: AbortSignal.timeout(15000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HLS-Proxy)',
          'Range': req.headers.get('range') || undefined,
        },
      });

      if (!response.ok) {
        return Response.json(
          { error: `Segment fetch failed: ${response.status}` },
          { status: response.status }
        );
      }

      const contentType = response.headers.get('content-type') || 'video/MP2T';
      const buffer = await response.arrayBuffer();

      return new Response(buffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return Response.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('[HLS Proxy] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});