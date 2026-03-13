import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Debug function to list users and find Julius
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // List all users to find the right email
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 50);
    
    // Find any user with "julius" in email or name
    const juliusUsers = allUsers.filter(u => 
      u.email?.toLowerCase().includes('julius') || 
      u.full_name?.toLowerCase().includes('julius')
    );

    return Response.json({
      current_user: currentUser.email,
      total_users: allUsers.length,
      julius_matches: juliusUsers.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        app_roles: u.app_roles
      })),
      first_10_users: allUsers.slice(0, 10).map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});