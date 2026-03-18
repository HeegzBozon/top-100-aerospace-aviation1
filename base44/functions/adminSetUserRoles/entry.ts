import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    // Only super admins can use this
    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - super admin access required' }, { status: 401 });
    }

    const body = await req.json();
    const { email, app_roles } = body;

    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }

    if (!app_roles || !Array.isArray(app_roles)) {
      return Response.json({ error: 'app_roles must be an array' }, { status: 400 });
    }

    // Find user
    const users = await base44.asServiceRole.entities.User.filter({ email });
    
    if (!users || users.length === 0) {
      return Response.json({ error: `User not found: ${email}` }, { status: 404 });
    }

    const targetUser = users[0];
    console.log('Found user:', targetUser.id, targetUser.email);
    console.log('Current app_roles:', targetUser.app_roles);
    console.log('New app_roles:', app_roles);

    // Direct update using service role
    const result = await base44.asServiceRole.entities.User.update(targetUser.id, { 
      app_roles: app_roles 
    });
    
    console.log('Update result:', result);

    // Fetch again to verify
    const verifyUsers = await base44.asServiceRole.entities.User.filter({ email });
    const verifiedUser = verifyUsers?.[0];

    return Response.json({
      success: true,
      user_id: targetUser.id,
      email: email,
      previous_app_roles: targetUser.app_roles,
      new_app_roles: verifiedUser?.app_roles,
      update_result: result
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});