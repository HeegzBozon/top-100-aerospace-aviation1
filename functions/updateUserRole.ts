import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - admin access required' }, { status: 401 });
    }

    const body = await req.json();
    const email = body.email || body.user_email;
    // Support both single role (string) and multiple roles (array)
    let newRoles = body.roles || body.app_roles;
    
    // Backwards compatibility: if single role passed, convert to array
    if (!newRoles && (body.role || body.new_role)) {
      newRoles = [body.role || body.new_role];
    }

    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }
    
    if (!newRoles || !Array.isArray(newRoles) || newRoles.length === 0) {
      return Response.json({ error: 'Missing or invalid roles array' }, { status: 400 });
    }

    // Season 4+ IAM roles
    const validAppRoles = ['admin', 'editor', 'collaborator', 'member', 'nominee', 'honoree', 'sponsor', 'company', 'deactivated'];
    const invalidRoles = newRoles.filter(r => !validAppRoles.includes(r));
    if (invalidRoles.length > 0) {
      return Response.json({ error: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles: ${validAppRoles.join(', ')}` }, { status: 400 });
    }

    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({ email });
    
    if (!users || users.length === 0) {
      return Response.json({ error: `User not found: ${email}` }, { status: 404 });
    }

    const targetUser = users[0];
    const previousAppRoles = targetUser.app_roles || [];

    console.log(`Updating user ${targetUser.id} (${email}) app_roles from [${previousAppRoles.join(', ')}] to [${newRoles.join(', ')}]`);
    
    // Season 4+ IAM: Update app_roles array
    const updateData = { 
      app_roles: newRoles 
    };
    
    console.log('Sending update:', JSON.stringify(updateData));
    
    // Perform the update
    await base44.asServiceRole.entities.User.update(targetUser.id, updateData);
    
    // Verify immediately
    const verified = await base44.asServiceRole.entities.User.filter({ email });
    const verifiedUser = verified?.[0];
    
    console.log('After update - app_roles:', verifiedUser?.app_roles);

    return Response.json({
      success: true,
      message: `Updated ${email} app_roles to [${newRoles.join(', ')}]`,
      user_id: targetUser.id,
      previous_app_roles: previousAppRoles,
      new_app_roles: verifiedUser?.app_roles,
      built_in_role: verifiedUser?.role
    });

  } catch (error) {
    console.error('Update role error:', error);
    return Response.json({ 
      error: 'Failed to update role', 
      details: error.message 
    }, { status: 500 });
  }
});