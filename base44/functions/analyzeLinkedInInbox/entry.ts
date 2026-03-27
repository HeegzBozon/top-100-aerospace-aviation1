import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { folderId, csvContent } = await req.json();
    
    let csvText;
    let accessToken;

    // Get Google access token for creating docs (needed regardless of input mode)
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('googledrive');
      accessToken = conn.accessToken;
    } catch (e) {
      console.error('Could not get Google Drive access token:', e.message);
      accessToken = null;
    }
    
    if (csvContent) {
      // Direct CSV upload
      csvText = csvContent;
    } else if (folderId) {
      // Google Drive folder
      if (!accessToken) {
        return Response.json({ error: 'Google Drive access not available' }, { status: 401 });
      }

      const listResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=files(id,name,mimeType)&pageSize=50`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      const listData = await listResponse.json();
      const csvFiles = listData.files?.filter(f => f.mimeType === 'text/csv' || f.name.endsWith('.csv')) || [];
      
      if (csvFiles.length === 0) {
        return Response.json({ messages: [], responses: [], docUrl: null });
      }

      const csvFile = csvFiles[0];
      const csvResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${csvFile.id}?alt=media`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      csvText = await csvResponse.text();
    } else {
      return Response.json({ error: 'Either folderId or csvContent is required' }, { status: 400 });
    }
    const rows = parseCSV(csvText).slice(1); // Skip header
    console.log(`Parsed ${rows.length} rows from CSV`);
    const messages = [];

    // Parse CSV and extract unread messages
    rows.forEach((row, idx) => {
      if (!row || row.length < 173) {
        console.log(`Row ${idx} skipped: length ${row?.length}`);
        return;
      }

      const parsed = {
        fullName: row[29] || '',
        headline: row[34] || '',
        lastMessage: row[168] || '',
        isUnread: row[172] === 'true',
        profileUrl: row[14] || ''
      };

      if (parsed.isUnread && parsed.lastMessage) {
        messages.push(parsed);
      }
    });
    console.log(`Found ${messages.length} unread messages`);

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
  const rows = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      rows[rows.length] = (rows[rows.length] || []);
      rows[rows.length - 1].push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.trim()) {
        rows[rows.length] = (rows[rows.length] || []);
        rows[rows.length - 1].push(current.trim());
      }
      if (rows[rows.length - 1]?.length > 0) {
        rows.push([]);
      }
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    rows[rows.length] = (rows[rows.length] || []);
    rows[rows.length - 1].push(current.trim());
  }

  return rows.filter(r => r.length > 0);
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