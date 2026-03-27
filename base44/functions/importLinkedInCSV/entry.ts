import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { csvContent } = await req.json();
    
    if (!csvContent) {
      return Response.json({ error: 'csvContent is required' }, { status: 400 });
    }

    const rows = parseCSV(csvContent);
    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

    // Map column indices
    const columnMap = {
      full_name: headers.indexOf('full_name'),
      first_name: headers.indexOf('first_name'),
      last_name: headers.indexOf('last_name'),
      headline: headers.indexOf('headline'),
      location: headers.indexOf('location_name'),
      summary: headers.indexOf('summary'),
      current_company: headers.indexOf('current_company'),
      current_position: headers.indexOf('current_company_position'),
      avatar_url: headers.indexOf('avatar'),
      profile_url: headers.indexOf('profile_url'),
      last_received_message: headers.indexOf('last_received_message_text'),
      last_received_date: headers.indexOf('last_received_message_send_at_iso'),
      last_sent_message: headers.indexOf('last_sent_message_text'),
      last_sent_date: headers.indexOf('last_sent_message_send_at_iso'),
      has_unread: headers.indexOf('has_unread_messages'),
      tags: headers.indexOf('tags'),
      mutual_count: headers.indexOf('mutual_count'),
      followers: headers.indexOf('followers'),
      connections_count: headers.indexOf('connections_count'),
    };

    const contacts = [];
    for (const row of dataRows) {
      if (!row || row.length < 2) continue;

      const contact = {
        full_name: row[columnMap.full_name] || '',
        first_name: row[columnMap.first_name] || '',
        last_name: row[columnMap.last_name] || '',
        headline: row[columnMap.headline] || '',
        location: row[columnMap.location] || '',
        summary: row[columnMap.summary] || '',
        current_company: row[columnMap.current_company] || '',
        current_position: row[columnMap.current_position] || '',
        avatar_url: row[columnMap.avatar_url] || '',
        linkedin_profile_url: row[columnMap.profile_url] || '',
        last_received_message: row[columnMap.last_received_message] || '',
        last_received_date: row[columnMap.last_received_date] || '',
        last_sent_message: row[columnMap.last_sent_message] || '',
        last_sent_date: row[columnMap.last_sent_date] || '',
        has_unread: row[columnMap.has_unread]?.toLowerCase() === 'true',
        tags: row[columnMap.tags] ? row[columnMap.tags].split(',').map(t => t.trim()) : [],
        mutual_connections_count: parseInt(row[columnMap.mutual_count]) || 0,
        followers: parseInt(row[columnMap.followers]) || 0,
        connections_count: parseInt(row[columnMap.connections_count]) || 0,
        response_status: 'pending'
      };

      if (contact.full_name && contact.linkedin_profile_url) {
        contacts.push(contact);
      }
    }

    // Bulk create contacts
    if (contacts.length > 0) {
      await base44.entities.LinkedInContact.bulkCreate(contacts);
    }

    return Response.json({
      success: true,
      imported: contacts.length,
      contacts: contacts
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const rows = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    rows.push(fields);
  }

  return rows;
}