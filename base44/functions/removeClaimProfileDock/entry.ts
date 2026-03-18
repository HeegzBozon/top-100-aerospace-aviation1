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
        // Find and delete the Claim Profile dock item
        const allDockItems = await base44.asServiceRole.entities.DockItem.list();
        const claimProfileItem = allDockItems.find(item => 
            item.label === 'Claim Profile' || item.pageName === 'ClaimProfile'
        );
        
        if (claimProfileItem) {
            await base44.asServiceRole.entities.DockItem.delete(claimProfileItem.id);
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Claim Profile removed from dock.' 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Claim Profile dock item was not found (may already be removed).' 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Failed to remove Claim Profile from dock:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});