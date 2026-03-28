/**
 * StreamObject Schema - Core Data Model for TOP 100 TV
 * Every live feed is a node in the Aerospace Talent Graph
 */

export const STREAM_SCHEMA = {
  stream_id: 'uuid-v4 or unique identifier',
  title: 'string - Stream title',
  subtitle: 'string - Optional subtitle',
  status: 'enum: LIVE, OFFLINE, SCHEDULED',
  category: 'enum: Space Exploration & Systems, Commercial Aviation, Defense & National Security, etc.',
  source: {
    type: 'enum: youtube_live, hls, web_embed, adsb_telemetry',
    url: 'string - Stream URL or video ID',
    is_hls: 'boolean - If true, URL is an m3u8 endpoint',
  },
  graph_bindings: {
    linked_programs: [
      {
        program_id: 'string - Program identifier in Talent Graph',
        name: 'string - Program name (e.g., "Starship Super Heavy")',
      },
    ],
    linked_companies: [
      {
        company_id: 'string - Company identifier',
        name: 'string - Company name',
      },
    ],
  },
  sponsorship: {
    is_sponsored: 'boolean',
    sponsor_name: 'string - Name of sponsor (optional)',
    sponsor_logo_url: 'string - URL to sponsor logo (optional)',
    overlay_asset_url: 'string - URL to L-Bar overlay asset (optional)',
    overlay_position: 'enum: top-left, top-right, bottom-left, bottom-right',
  },
  metadata: {
    icon: 'string - Emoji or icon identifier',
    region: 'string - Geographic region or orbital designation',
    domain: 'string - Industry domain classification',
    signal_value: 'enum: highest, high, medium',
    row: 'number - Grid row position (1-3)',
    col: 'number - Grid column position (1-3)',
  },
};