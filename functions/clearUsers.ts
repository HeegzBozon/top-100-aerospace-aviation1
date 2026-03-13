import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const adminUser = await base44.auth.me();
        if (!adminUser || adminUser.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }

        const allUsers = await base44.entities.User.list();

        // Ensure we don't delete the admin making the request
        const usersToDelete = allUsers.filter(user => user.role !== 'admin' && user.email !== adminUser.email);
        
        if (usersToDelete.length === 0) {
            return new Response(JSON.stringify({ success: true, message: 'No non-admin users found to delete.', deleted_count: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        const deletePromises = usersToDelete.map(user => base44.entities.User.delete(user.id));
        
        await Promise.all(deletePromises);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Successfully deleted ${usersToDelete.length} non-admin users.`,
            deleted_count: usersToDelete.length 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error clearing users:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});