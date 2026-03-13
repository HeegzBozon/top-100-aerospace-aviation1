import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { parse } from "https://deno.land/std@0.224.0/csv/mod.ts";

Deno.serve(async (req) => {
    // This function is a utility and can be called without strict auth,
    // as it only operates on a provided URL.
    try {
        const { file_url } = await req.json();
        if (!file_url) {
            throw new Error('file_url is required.');
        }

        const response = await fetch(file_url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
        }
        const csvText = await response.text();

        // The parse function with skipFirstRow uses the first row as headers
        // and returns an array of objects, which is exactly what we need.
        const records = await parse(csvText, {
            skipFirstRow: true,
            lazy: false,
        });

        return new Response(JSON.stringify({ success: true, data: records }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('CSV Parsing Error in Backend:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});