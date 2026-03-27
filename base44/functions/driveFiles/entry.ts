import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType="text/csv"&fields=files(id,name,createdTime)&pageSize=50&orderBy=createdTime%20desc',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    const data = await response.json();
    return Response.json({ files: data.files || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});