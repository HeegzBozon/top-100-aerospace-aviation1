import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Find the Vote dock item by various possible old names
        const allDockItems = await base44.asServiceRole.entities.DockItem.list();
        const voteItem = allDockItems.find(item => 
            item.label === 'Vote' || 
            item.pageName === 'Play' || 
            item.pageName === 'VotingWizard' ||
            item.pageName === 'BallotBox'
        );
        
        if (voteItem) {
            // Update it to point to the new VotingHub and hide it
            await base44.asServiceRole.entities.DockItem.update(voteItem.id, {
                pageName: 'VotingHub',
                label: 'Vote',
                icon: 'Vote',
                isEnabled: false
            });
            
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Vote button has been hidden.' 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
             // If it doesn't exist, create it as hidden
            await base44.asServiceRole.entities.DockItem.create({
                label: 'Vote',
                pageName: 'VotingHub',
                icon: 'Vote',
                order: 1, // Or a suitable order
                isEnabled: false,
            });
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'New Vote button created and hidden.' 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Failed to fix/hide vote button:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});