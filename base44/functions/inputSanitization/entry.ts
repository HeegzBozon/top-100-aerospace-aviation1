// Input sanitization utility for launch security
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { action, data } = await req.json();

        // Sanitization functions
        const sanitizeText = (text) => {
            if (!text) return text;
            return String(text)
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
                .replace(/javascript:/gi, '') // Remove javascript: protocols
                .replace(/on\w+\s*=/gi, '') // Remove event handlers
                .trim();
        };

        const sanitizeEmail = (email) => {
            if (!email) return email;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email) ? email.toLowerCase().trim() : null;
        };

        const sanitizeUrl = (url) => {
            if (!url) return url;
            try {
                const validUrl = new URL(url);
                return ['http:', 'https:'].includes(validUrl.protocol) ? validUrl.toString() : null;
            } catch {
                return null;
            }
        };

        let sanitizedData = { ...data };

        // Apply sanitization based on action type
        switch (action) {
            case 'nominee_update':
                if (sanitizedData.name) sanitizedData.name = sanitizeText(sanitizedData.name);
                if (sanitizedData.bio) sanitizedData.bio = sanitizeText(sanitizedData.bio);
                if (sanitizedData.six_word_story) sanitizedData.six_word_story = sanitizeText(sanitizedData.six_word_story);
                if (sanitizedData.nominee_email) sanitizedData.nominee_email = sanitizeEmail(sanitizedData.nominee_email);
                if (sanitizedData.linkedin_profile_url) sanitizedData.linkedin_profile_url = sanitizeUrl(sanitizedData.linkedin_profile_url);
                if (sanitizedData.photo_url) sanitizedData.photo_url = sanitizeUrl(sanitizedData.photo_url);
                break;

            case 'user_update':
                if (sanitizedData.full_name) sanitizedData.full_name = sanitizeText(sanitizedData.full_name);
                if (sanitizedData.handle) sanitizedData.handle = sanitizeText(sanitizedData.handle).toLowerCase().replace(/[^a-z0-9_]/g, '');
                if (sanitizedData.avatar_url) sanitizedData.avatar_url = sanitizeUrl(sanitizedData.avatar_url);
                break;

            case 'feedback_create':
                if (sanitizedData.subject) sanitizedData.subject = sanitizeText(sanitizedData.subject);
                if (sanitizedData.description) sanitizedData.description = sanitizeText(sanitizedData.description);
                if (sanitizedData.screenshot_url) sanitizedData.screenshot_url = sanitizeUrl(sanitizedData.screenshot_url);
                if (sanitizedData.loom_link) sanitizedData.loom_link = sanitizeUrl(sanitizedData.loom_link);
                break;
        }

        return new Response(JSON.stringify({
            success: true,
            sanitized_data: sanitizedData,
            changes_made: Object.keys(data).filter(key => data[key] !== sanitizedData[key])
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});