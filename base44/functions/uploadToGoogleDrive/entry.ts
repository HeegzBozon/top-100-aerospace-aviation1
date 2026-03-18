import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');
        const fileName = formData.get('fileName') || `upload-${Date.now()}.mp4`;

        if (!file) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        // Get Google Drive access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');
        
        if (!accessToken) {
            return Response.json({ error: 'Google Drive not authorized' }, { status: 403 });
        }

        // Get file bytes
        const fileBytes = new Uint8Array(await file.arrayBuffer());
        
        // Step 1: Initiate resumable upload session
        const metadata = {
            name: fileName,
            mimeType: file.type || 'video/mp4'
        };

        const initiateResponse = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Type': file.type || 'video/mp4',
                    'X-Upload-Content-Length': fileBytes.length.toString()
                },
                body: JSON.stringify(metadata)
            }
        );

        if (!initiateResponse.ok) {
            const errorText = await initiateResponse.text();
            console.error('Failed to initiate upload:', errorText);
            return Response.json({ 
                error: 'Failed to start upload session',
                details: errorText 
            }, { status: initiateResponse.status });
        }

        const uploadUrl = initiateResponse.headers.get('Location');
        
        if (!uploadUrl) {
            return Response.json({ error: 'No upload URL received' }, { status: 500 });
        }

        // Step 2: Upload file content
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type || 'video/mp4',
                'Content-Length': fileBytes.length.toString()
            },
            body: fileBytes
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload failed:', errorText);
            return Response.json({ 
                error: 'Upload failed',
                details: errorText 
            }, { status: uploadResponse.status });
        }

        const result = await uploadResponse.json();
        const fileId = result.id;

        // Step 3: Make file publicly readable
        await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: 'reader',
                    type: 'anyone'
                })
            }
        );

        // Return shareable link
        const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
        const directUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

        return Response.json({ 
            success: true, 
            file_url: fileUrl,
            direct_url: directUrl,
            file_id: fileId
        });

    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        return Response.json({ 
            error: error.message || 'Unknown error',
            stack: error.stack 
        }, { status: 500 });
    }
});