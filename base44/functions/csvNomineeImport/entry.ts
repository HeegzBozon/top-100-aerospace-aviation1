import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { parse } from "https://deno.land/std@0.224.0/csv/mod.ts";

// This map defines the exact headers we're looking for and where they go.
const HEADER_MAP = {
  'Email Address': 'nominee_email',
  'Full Name': 'name',
  'LinkedIn Profile URL': 'linkedin_profile_url',
  'Country': 'country',
  'Industry': 'industry',
  'Tell us about yourself in one sentence.': 'description',
  'What is your professional role or expertise?': 'professional_role',
  'Why should people follow you on LinkedIn?': 'linkedin_follow_reason',
  'What post or achievement are you most proud of on LinkedIn?': 'linkedin_proudest_achievement'
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const serviceRoleClient = base44.asServiceRole;
    const { csv_content, season_id } = await req.json();

    if (!csv_content || !season_id) {
        return new Response(JSON.stringify({ success: false, error: 'CSV content and season ID are required.' }), { status: 400 });
    }

    const report = {
        total_rows_in_file: 0,
        processed_rows: 0,
        success: 0,
        errors: 0,
        error_details: [],
        summary: ''
    };

    const rawLines = csv_content.trim().split('\n');
    report.total_rows_in_file = rawLines.length > 0 ? rawLines.length - 1 : 0; // Exclude header

    try {
        const records = await parse(csv_content, {
            skipFirstRow: true,
        });
        report.processed_rows = records.length;
        
        const currentUserEmail = (await base44.auth.me())?.email || 'csv-import-admin';

        let rowNumber = 1;
        for (const record of records) {
            rowNumber++;
            try {
                // Ensure the record is a valid object
                if (typeof record !== 'object' || record === null) {
                    throw new Error("Row is not a valid object. Check for formatting errors like unclosed quotes in the CSV file.");
                }

                // Build nominee data object based on the specific headers
                const nomineeData = {};
                let hasRequiredField = false;

                for (const [header, fieldName] of Object.entries(HEADER_MAP)) {
                    if (record[header] && record[header].trim()) {
                        nomineeData[fieldName] = record[header].trim();
                        if (fieldName === 'name') {
                            hasRequiredField = true;
                        }
                    }
                }

                // The 'Full Name' is required. If not found, skip this row.
                if (!hasRequiredField) {
                    throw new Error("Missing required 'Full Name' field in this row.");
                }

                // Add system-managed fields
                nomineeData.season_id = season_id;
                nomineeData.status = 'pending';
                nomineeData.nominated_by = currentUserEmail;
                
                // Ensure description is not empty
                if (!nomineeData.description) {
                    nomineeData.description = `Nominee imported on ${new Date().toLocaleDateString()}`;
                }

                await serviceRoleClient.entities.Nominee.create(nomineeData);
                report.success++;

            } catch (error) {
                report.errors++;
                report.error_details.push({
                    row_number: rowNumber,
                    row_content: JSON.stringify(record),
                    error_message: error.message
                });
            }
        }

        report.summary = `Import finished. Successfully created ${report.success} nominees. Failed to import ${report.errors} rows.`;
        
        if (report.total_rows_in_file !== report.processed_rows) {
            report.summary += ` Warning: The file contained ${report.total_rows_in_file} data rows, but the CSV parser could only process ${report.processed_rows}. This may indicate a formatting issue in your file (like an unclosed quote).`;
        }

        return new Response(JSON.stringify({ success: true, report }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        report.summary = `A fatal error occurred during parsing: ${error.message}`;
        return new Response(JSON.stringify({ 
            success: false, 
            error: `Fatal parsing error: ${error.message}`,
            report
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});