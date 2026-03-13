import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    try {
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }

        const { nominee_id, file_url } = await req.json();
        if (!nominee_id || !file_url) {
            return new Response(JSON.stringify({ success: false, error: 'nominee_id and file_url are required' }), { status: 400 });
        }

        // Enhanced extraction schema for comprehensive LinkedIn PDF parsing
        const extractionSchema = {
            type: "object",
            properties: {
                full_name: { 
                    type: "string", 
                    description: "The full name of the person from the header/contact section." 
                },
                current_job_title: { 
                    type: "string", 
                    description: "The current or most recent job title, typically shown prominently near the name." 
                },
                current_company: { 
                    type: "string", 
                    description: "The current or most recent company/organization name." 
                },
                linkedin_url: { 
                    type: "string", 
                    description: "The LinkedIn profile URL, usually in contact information." 
                },
                website_url: { 
                    type: "string", 
                    description: "Personal or company website URL from contact section." 
                },
                professional_summary: { 
                    type: "string", 
                    description: "The professional summary/about section - a comprehensive paragraph describing their background and expertise." 
                },
                location: { 
                    type: "string", 
                    description: "Geographic location (city, state/country) from contact info." 
                },
                industry: { 
                    type: "string", 
                    description: "The industry or sector they work in." 
                },
                top_skills: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Top skills listed in the skills section (limit to top 5-7)." 
                },
                email: { 
                    type: "string", 
                    description: "Email address if visible in contact information." 
                }
            },
            required: ["full_name"]
        };

        console.log(`Starting PDF extraction for nominee ${nominee_id}`);
        
        const extractionResult = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: extractionSchema
        });

        if (extractionResult.status !== 'success' || !extractionResult.output) {
            console.error('Extraction failed:', extractionResult);
            throw new Error(extractionResult.details || 'Failed to extract data from PDF.');
        }

        const extractedData = extractionResult.output;
        console.log('Extracted data:', extractedData);

        // Build the nominee update payload
        const payload = {};

        // Core identity fields
        if (extractedData.full_name) payload.name = extractedData.full_name.trim();
        if (extractedData.current_job_title) payload.title = extractedData.current_job_title.trim();
        if (extractedData.current_company) payload.company = extractedData.current_company.trim();
        if (extractedData.location) payload.country = extractedData.location.trim();
        if (extractedData.industry) payload.industry = extractedData.industry.trim();
        if (extractedData.email) payload.nominee_email = extractedData.email.trim();

        // Social links
        if (extractedData.linkedin_url) payload.linkedin_profile_url = extractedData.linkedin_url.trim();
        if (extractedData.website_url) payload.website_url = extractedData.website_url.trim();
        
        // Bio and description handling
        if (extractedData.professional_summary) {
            const summary = extractedData.professional_summary.trim();
            payload.bio = summary;
            
            // Generate a concise description (first sentence or truncated)
            const firstSentence = summary.match(/^[^.!?]*[.!?]/);
            if (firstSentence) {
                payload.description = firstSentence[0].trim();
            } else {
                // Fallback to truncated version
                payload.description = summary.length > 200 
                    ? summary.substring(0, 200).trim() + '...' 
                    : summary;
            }
        }

        // Skills handling (if we want to store as comma-separated string)
        if (extractedData.top_skills && Array.isArray(extractedData.top_skills)) {
            // Could store in additional_links or create a new field
            const skillsString = extractedData.top_skills.join(', ');
            if (skillsString) {
                payload.additional_links = [skillsString]; // Store skills as first item
            }
        }

        console.log('Update payload:', payload);

        // Update the nominee record
        if (Object.keys(payload).length > 0) {
            await base44.asServiceRole.entities.Nominee.update(nominee_id, payload);
            console.log(`Successfully updated nominee ${nominee_id}`);
        } else {
            console.warn('No data extracted to update nominee profile');
        }

        // Fetch the updated nominee record
        const updatedNominee = await base44.asServiceRole.entities.Nominee.get(nominee_id);

        return new Response(JSON.stringify({ 
            success: true, 
            updatedNominee,
            extractedFields: Object.keys(payload),
            message: `Successfully enriched profile with ${Object.keys(payload).length} fields`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in enrichProfileFromPdf:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            details: 'Failed to process PDF. Please ensure the PDF is a valid LinkedIn profile export.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});