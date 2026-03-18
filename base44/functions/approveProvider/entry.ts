import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const adminUser = await base44.auth.me();

        // 1. Security Check: Ensure caller is Admin
        if (!adminUser || adminUser.role !== 'admin') {
            return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const payload = await req.json();
        const { applicationId, decision } = payload; // 'approved' or 'rejected'

        if (!applicationId || !['approved', 'rejected'].includes(decision)) {
            return Response.json({ error: 'Invalid request: applicationId and decision required' }, { status: 400 });
        }

        // 2. Fetch Application
        const allApps = await base44.asServiceRole.entities.ProviderApplication.list();
        const app = allApps.find(a => a.id === applicationId);
        
        if (!app) {
            return Response.json({ error: 'Application not found' }, { status: 404 });
        }

        // 3. Update Application Status
        await base44.asServiceRole.entities.ProviderApplication.update(app.id, {
            status: decision
        });

        // 4. If Approved, Update User Profile
        if (decision === 'approved') {
            // Check if user has a profile
            const profiles = await base44.asServiceRole.entities.Profile.filter({ 
                user_email: app.applicant_email 
            });
            
            if (profiles && profiles.length > 0) {
                // Update existing profile with service areas
                await base44.asServiceRole.entities.Profile.update(profiles[0].id, {
                    service_areas: app.service_categories || [],
                    service_bio: app.experience_summary
                });
            } else {
                // Create a new profile for the provider
                await base44.asServiceRole.entities.Profile.create({
                    user_email: app.applicant_email,
                    service_areas: app.service_categories || [],
                    service_bio: app.experience_summary,
                    linkedin_url: app.linkedin_profile || ''
                });
            }
        }

        return Response.json({ success: true, status: decision });

    } catch (error) {
        console.error('approveProvider error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});