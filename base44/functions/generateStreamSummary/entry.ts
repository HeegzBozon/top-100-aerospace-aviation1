import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { YoutubeTranscript } from 'npm:youtube-transcript';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Video ID from the Artemis Mission Theater
        const videoId = '8n1GGe0fUBs';
        
        // Fetch transcript
        let transcriptContent = '';
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(videoId);
            // Grab the last 100 transcript chunks to simulate a "recent" summary
            const recentTranscript = transcript.slice(-100); 
            transcriptContent = recentTranscript.map(t => t.text).join(' ');
        } catch (e) {
            // Fallback for prototype if the live video doesn't have transcripts enabled
            console.log('Transcript disabled or unavailable. Using simulation fallback.');
            transcriptContent = "The Artemis mission is proceeding nominally. We have just completed the orbital insertion burn. The crew is preparing for the next phase of the mission. Life support systems are fully functional. We are seeing some incredible views of the lunar surface. Next milestone is the lunar landing module separation. All stations report go for separation.";
        }

        if (!transcriptContent || transcriptContent.trim() === '') {
             return Response.json({ message: 'No transcript available.' });
        }

        // Summarize using LLM
        const summary = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are the "Mission AI" monitoring a live broadcast.
            Summarize the following recent broadcast transcript in 2-3 short, engaging bullet points for the live chat viewers. 
            Keep it exciting and concise.
            
            Transcript: ${transcriptContent}`
        });

        // Insert summary into chat
        await base44.asServiceRole.entities.LiveStreamComment.create({
            text: summary,
            user_name: 'Mission AI',
            user_avatar: 'https://ui-avatars.com/api/?name=Mission+AI&background=c9a87c&color=1e3a5a',
            user_email: 'ai@missioncontrol.space'
        });

        return Response.json({ success: true, summary });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});