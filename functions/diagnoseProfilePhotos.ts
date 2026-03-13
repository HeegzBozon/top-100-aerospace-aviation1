import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        console.log('🔍 Starting profile photo diagnostics...');
        
        const report = {
            timestamp: new Date().toISOString(),
            users: {
                total: 0,
                withPhotos: 0,
                withoutPhotos: 0,
                brokenUrls: [],
                sampleUrls: []
            },
            nominees: {
                total: 0,
                withPhotos: 0,
                withoutPhotos: 0,
                brokenUrls: [],
                sampleUrls: []
            },
            urlPatterns: {
                supabaseUrls: 0,
                base44Urls: 0,
                externalUrls: 0,
                emptyUrls: 0,
                nullUrls: 0
            },
            recommendations: []
        };
        
        // Check Users
        console.log('📊 Checking user profile photos...');
        const users = await base44.asServiceRole.entities.User.list('-created_date', 100);
        report.users.total = users.length;
        
        for (const user of users) {
            if (user.avatar_url && user.avatar_url.trim() !== '') {
                report.users.withPhotos++;
                
                // Analyze URL pattern
                const url = user.avatar_url;
                if (url.includes('supabase')) {
                    report.urlPatterns.supabaseUrls++;
                } else if (url.includes('base44')) {
                    report.urlPatterns.base44Urls++;
                } else if (url.startsWith('http')) {
                    report.urlPatterns.externalUrls++;
                }
                
                // Collect sample URLs (first 5)
                if (report.users.sampleUrls.length < 5) {
                    report.users.sampleUrls.push({
                        email: user.email,
                        url: url,
                        urlType: url.includes('supabase') ? 'supabase' : 
                                 url.includes('base44') ? 'base44' : 
                                 url.startsWith('http') ? 'external' : 'unknown'
                    });
                }
                
                // Try to fetch the URL to see if it's accessible
                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    if (!response.ok) {
                        report.users.brokenUrls.push({
                            email: user.email,
                            url: url,
                            status: response.status,
                            error: `HTTP ${response.status}`
                        });
                    }
                } catch (fetchError) {
                    report.users.brokenUrls.push({
                        email: user.email,
                        url: url,
                        error: fetchError.message
                    });
                }
            } else if (user.avatar_url === null) {
                report.users.withoutPhotos++;
                report.urlPatterns.nullUrls++;
            } else {
                report.users.withoutPhotos++;
                report.urlPatterns.emptyUrls++;
            }
        }
        
        // Check Nominees
        console.log('📊 Checking nominee profile photos...');
        const nominees = await base44.asServiceRole.entities.Nominee.list('-created_date', 100);
        report.nominees.total = nominees.length;
        
        for (const nominee of nominees) {
            const photoUrl = nominee.photo_url || nominee.avatar_url;
            
            if (photoUrl && photoUrl.trim() !== '') {
                report.nominees.withPhotos++;
                
                // Collect sample URLs (first 5)
                if (report.nominees.sampleUrls.length < 5) {
                    report.nominees.sampleUrls.push({
                        name: nominee.name,
                        url: photoUrl,
                        urlType: photoUrl.includes('supabase') ? 'supabase' : 
                                 photoUrl.includes('base44') ? 'base44' : 
                                 photoUrl.startsWith('http') ? 'external' : 'unknown'
                    });
                }
                
                // Try to fetch the URL
                try {
                    const response = await fetch(photoUrl, { method: 'HEAD' });
                    if (!response.ok) {
                        report.nominees.brokenUrls.push({
                            name: nominee.name,
                            url: photoUrl,
                            status: response.status,
                            error: `HTTP ${response.status}`
                        });
                    }
                } catch (fetchError) {
                    report.nominees.brokenUrls.push({
                        name: nominee.name,
                        url: photoUrl,
                        error: fetchError.message
                    });
                }
            } else {
                report.nominees.withoutPhotos++;
            }
        }
        
        // Generate Recommendations
        console.log('💡 Generating recommendations...');
        
        if (report.users.withoutPhotos > report.users.withPhotos) {
            report.recommendations.push({
                severity: 'HIGH',
                issue: 'Most users have no profile photos',
                detail: `${report.users.withoutPhotos} of ${report.users.total} users have no avatar_url set`,
                action: 'Check if avatar_url was cleared during a migration or data operation'
            });
        }
        
        if (report.users.brokenUrls.length > 0) {
            report.recommendations.push({
                severity: 'HIGH',
                issue: 'Some user photos have broken URLs',
                detail: `${report.users.brokenUrls.length} user photos cannot be accessed`,
                action: 'Check storage bucket permissions or URL format',
                examples: report.users.brokenUrls.slice(0, 3)
            });
        }
        
        if (report.nominees.brokenUrls.length > 0) {
            report.recommendations.push({
                severity: 'HIGH',
                issue: 'Some nominee photos have broken URLs',
                detail: `${report.nominees.brokenUrls.length} nominee photos cannot be accessed`,
                action: 'Check storage bucket permissions or URL format',
                examples: report.nominees.brokenUrls.slice(0, 3)
            });
        }
        
        if (report.urlPatterns.supabaseUrls > 0) {
            report.recommendations.push({
                severity: 'INFO',
                issue: 'Supabase storage URLs detected',
                detail: `${report.urlPatterns.supabaseUrls} photos use Supabase storage`,
                action: 'Verify Supabase storage bucket is public and accessible'
            });
        }
        
        console.log('✅ Diagnostics complete');
        
        return new Response(JSON.stringify({
            success: true,
            report: report
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Diagnostic error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});