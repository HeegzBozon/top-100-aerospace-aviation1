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

    const csvText = csvContent;

    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('googledrive');
      accessToken = conn.accessToken;
    } catch (e) {
      console.error('Could not get Google Drive access token:', e.message);
      accessToken = null;
    }
    const rows = parseCSV(csvText);
    const headers = rows[0] || [];
    const dataRows = rows.slice(1);
    console.log(`Parsed ${dataRows.length} rows from CSV`);
    
    // Standard LinkedIn export column names
    const nameIdx = headers.indexOf('full_name');
    const messageIdx = headers.indexOf('last_received_message_text');
    const headlineIdx = headers.indexOf('headline');
    const unreadIdx = headers.indexOf('has_unread_messages');
    
    const messages = [];

    // Parse rows and extract messages
    dataRows.forEach((row) => {
      if (!row || row.length < 2) return;

      const fullName = nameIdx >= 0 ? row[nameIdx] : '';
      const lastMessage = messageIdx >= 0 ? row[messageIdx] : '';
      const headline = headlineIdx >= 0 ? row[headlineIdx] : '';
      const isUnread = unreadIdx >= 0 ? row[unreadIdx]?.toLowerCase() === 'true' : true;

      if (lastMessage && fullName) {
        messages.push({
          fullName,
          headline,
          lastMessage,
          isUnread,
          profileUrl: ''
        });
      }
    });
    console.log(`Found ${messages.length} messages`);

    // Generate responses using LLM
    const responses = [];
    for (const msg of messages) {
      try {
        const llmResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a professional aerospace industry networking assistant. Generate a thoughtful, personalized 2-3 sentence response to this LinkedIn message. Keep it warm but professional.

From: ${msg.fullName} (${msg.headline})
Message: "${msg.lastMessage}"

Generate only the response text, no preamble.`
        });

        responses.push({
          senderName: msg.fullName,
          headline: msg.headline,
          originalMessage: msg.lastMessage,
          generatedResponse: llmResult,
          profileUrl: msg.profileUrl
        });
      } catch (llmErr) {
        console.error('LLM error:', llmErr);
      }
    }
    console.log(`Generated ${responses.length} responses`);

    // Create Google Doc with responses
    let docUrl = null;
    if (responses.length > 0 && accessToken) {
      const docContent = buildDocContent(responses, user.full_name);
      const docResult = await createGoogleDoc(accessToken, docContent);
      docUrl = docResult.webViewLink;
    }

    return Response.json({
      messages: messages,
      responses: responses,
      docUrl: docUrl
    });
  } catch (error) {
    console.error('Error analyzing inbox:', error);
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

function buildDocContent(responses, userName) {
  let content = `LinkedIn Inbox - Generated Responses\nPrepared for: ${userName}\nDate: ${new Date().toLocaleDateString()}\n\n`;

  responses.forEach((resp, idx) => {
    content += `${idx + 1}. ${resp.senderName}\n`;
    content += `   Title: ${resp.headline}\n\n`;
    content += `   Their Message:\n   "${resp.originalMessage}"\n\n`;
    content += `   Suggested Response:\n   "${resp.generatedResponse}"\n\n`;
    content += `---\n\n`;
  });

  return content;
}

async function createGoogleDoc(accessToken, content) {
  const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: `LinkedIn Inbox - ${new Date().toLocaleDateString()}`
    })
  });

  const docData = await createResponse.json();
  const docId = docData.documentId;

  // Add content to document
  await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            text: content,
            location: { index: 1 }
          }
        }
      ]
    })
  });

  return {
    documentId: docId,
    webViewLink: `https://docs.google.com/document/d/${docId}/edit`
  };
}