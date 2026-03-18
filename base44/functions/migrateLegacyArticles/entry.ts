import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can run this
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Find or create "general" channel
    let conversations = [];
    try {
      conversations = await base44.entities.Conversation.filter({ name: 'general', type: 'channel' }, '-created_date', 10);
    } catch (err) {
      console.warn('Error fetching conversations:', err.message);
    }

    if (conversations.length === 0) {
      return Response.json({ 
        error: 'General channel not found. Please create a "general" channel first.',
        success: false 
      }, { status: 400 });
    }

    const generalChannelId = conversations[0].id;
    let migratedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Migrate JournalEntry records
    let journalEntries = [];
    try {
      journalEntries = await base44.entities.JournalEntry.list('-created_date', 1000);
    } catch (err) {
      console.warn('Error fetching journal entries:', err.message);
    }

    for (const entry of journalEntries) {
      try {
        // Check if already migrated
        const existingPosts = await base44.entities.Post.filter({ 
          legacy_id: entry.id,
          legacy_source: 'journal_entry' 
        }, '-created_date', 1);

        if (existingPosts.length > 0) {
          console.log(`JournalEntry ${entry.id} already migrated, skipping`);
          continue;
        }

        await base44.entities.Post.create({
          title: entry.title,
          content: entry.content,
          excerpt: entry.excerpt || entry.content?.substring(0, 200),
          post_type: 'article',
          channel_id: generalChannelId,
          author_email: entry.author_email || entry.created_by,
          author_name: entry.author_name,
          published_date: entry.published_date || entry.created_date,
          featured_image_url: entry.featured_image_url,
          category: entry.category,
          legacy_source: 'journal_entry',
          legacy_id: entry.id,
          view_count: entry.views || 0,
          upvotes: entry.upvotes || 0,
          upvoted_by: entry.upvoted_by || []
        });
        migratedCount++;
      } catch (err) {
        errorCount++;
        errors.push({ type: 'JournalEntry', id: entry.id, error: err.message });
        console.error(`Failed to migrate JournalEntry ${entry.id}:`, err.message);
      }
    }

    // Migrate KBArticle records
    let kbArticles = [];
    try {
      kbArticles = await base44.entities.KBArticle.filter({ status: 'published' }, '-created_date', 1000);
    } catch (err) {
      console.warn('Error fetching KB articles:', err.message);
    }

    for (const article of kbArticles) {
      try {
        // Check if already migrated
        const existingPosts = await base44.entities.Post.filter({ 
          legacy_id: article.id,
          legacy_source: 'kb_article' 
        }, '-created_date', 1);

        if (existingPosts.length > 0) {
          console.log(`KBArticle ${article.id} already migrated, skipping`);
          continue;
        }

        await base44.entities.Post.create({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt || article.content?.substring(0, 200),
          post_type: 'article',
          channel_id: generalChannelId,
          author_email: article.author_email || article.created_by,
          author_name: article.author_name,
          published_date: article.publish_date || article.created_date,
          featured_image_url: article.featured_image_url,
          category: article.category,
          legacy_source: 'kb_article',
          legacy_id: article.id,
          view_count: article.views || 0,
          upvotes: article.upvotes || 0,
          upvoted_by: article.upvoted_by || []
        });
        migratedCount++;
      } catch (err) {
        errorCount++;
        errors.push({ type: 'KBArticle', id: article.id, error: err.message });
        console.error(`Failed to migrate KBArticle ${article.id}:`, err.message);
      }
    }

    return Response.json({
      success: true,
      message: `Migration complete`,
      stats: {
        totalMigrated: migratedCount,
        totalErrors: errorCount,
        generalChannelId,
        journalEntriesProcessed: journalEntries.length,
        kbArticlesProcessed: kbArticles.length
      },
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});