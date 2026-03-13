import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const DEFAULT_CHANNELS = [
  {
    type: 'channel',
    name: 'announcements',
    description: 'Official platform updates and news',
    is_private: false,
    is_default: true,
    is_readonly: true,
    channel_category: 'announcements',
    icon: '📢',
    participants: [],
  },
  {
    type: 'channel',
    name: 'general',
    description: 'Community-wide discussion',
    is_private: false,
    is_default: true,
    is_readonly: false,
    channel_category: 'community',
    icon: '💬',
    participants: [],
  },
  {
    type: 'channel',
    name: 'introductions',
    description: 'Introduce yourself to the community',
    is_private: false,
    is_default: true,
    is_readonly: false,
    channel_category: 'community',
    icon: '👋',
    participants: [],
  },
  {
    type: 'channel',
    name: 'community-polls',
    description: 'Community voting and poll discussions',
    is_private: false,
    is_default: true,
    is_readonly: false,
    channel_category: 'community',
    icon: '🗳️',
    participants: [],
  },
  {
    type: 'channel',
    name: 'development',
    description: 'Technical development and engineering discussions',
    is_private: false,
    is_default: true,
    is_readonly: false,
    channel_category: 'feedback',
    icon: '⚙️',
    participants: [],
  },
  {
    type: 'channel',
    name: 'feature-requests',
    description: 'Suggest and discuss new features',
    is_private: false,
    is_default: true,
    is_readonly: false,
    channel_category: 'feedback',
    icon: '💡',
    participants: [],
  },
  {
    type: 'channel',
    name: 'bug-reports',
    description: 'Report and discuss platform bugs',
    is_private: false,
    is_default: true,
    is_readonly: false,
    channel_category: 'feedback',
    icon: '🐛',
    participants: [],
  },
  {
    type: 'channel',
    name: 'help',
    description: 'Get help and support from the community',
    is_private: false,
    is_default: true,
    is_readonly: false,
    channel_category: 'support',
    icon: '❓',
    participants: [],
  },
  {
    type: 'channel',
    name: 'hangar-talk',
    description: 'Casual off-topic hangout and watercooler conversations',
    is_private: false,
    is_default: true,
    is_readonly: false,
    channel_category: 'hangout',
    icon: '☕',
    participants: [],
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin for creating default channels
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get existing channels
    const existingChannels = await base44.asServiceRole.entities.Conversation.filter({ 
      type: 'channel',
      is_default: true 
    });

    const existingNames = existingChannels.map(c => c.name);
    const created = [];
    const skipped = [];

    for (const channel of DEFAULT_CHANNELS) {
      if (existingNames.includes(channel.name)) {
        skipped.push(channel.name);
        continue;
      }

      const newChannel = await base44.asServiceRole.entities.Conversation.create({
        ...channel,
        owner_email: user.email,
        created_date: new Date().toISOString(),
      });
      created.push(newChannel.name);
    }

    return Response.json({ 
      success: true,
      created,
      skipped,
      message: `Created ${created.length} channels, skipped ${skipped.length} existing`
    });

  } catch (error) {
    console.error('Error initializing default channels:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});