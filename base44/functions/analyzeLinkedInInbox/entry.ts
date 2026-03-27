import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { folderId } = await req.json();
    if (!folderId) {
      return Response.json({ error: 'Google Drive folder ID is required' }, { status: 400 });
    }

    // Get Google Drive access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // List CSV files in Google Drive folder
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType='text/csv'&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const driveData = await driveResponse.json();
    if (!driveData.files || driveData.files.length === 0) {
      return Response.json({ messages: [], responses: [], docUrl: null });
    }

    // Download and parse the most recent CSV
    const csvFile = driveData.files[0];
    const csvResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${csvFile.id}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const csvText = await csvResponse.text();
    const rows = csvText.split('\n').slice(1); // Skip header
    const messages = [];

    // Parse CSV and extract unread messages
    rows.forEach((row, idx) => {
      if (!row.trim()) return;

      const cols = row.split(',').map(c => c.trim().slice(1, -1)); // Remove quotes
      const parsed = {
        fullName: cols[29],
        headline: cols[34],
        lastMessage: cols[168],
        isUnread: cols[172] === 'true',
        profileUrl: cols[14]
      };

      if (parsed.isUnread && parsed.lastMessage) {
        messages.push(parsed);
      }
    });

    // Generate responses using LLM
    const responses = [];
    for (const msg of messages) {
      const llmResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional aerospace industry networking assistant. Generate a thoughtful, personalized 2-3 sentence response to this LinkedIn message. Keep it warm but professional.

From: ${msg.fullName} (${msg.headline})
Message: "${msg.lastMessage}"

Generate only the response text, no preamble.`,
        model: 'gpt_4o_mini'
      });

      responses.push({
        senderName: msg.fullName,
        headline: msg.headline,
        originalMessage: msg.lastMessage,
        generatedResponse: llmResult,
        profileUrl: msg.profileUrl
      });
    }

    // Create Google Doc with responses
    let docUrl = null;
    if (responses.length > 0) {
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