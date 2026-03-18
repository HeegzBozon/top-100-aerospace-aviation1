import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        console.log('🚀 Syncing Aura Score to ELO Rating for ALL nominees...');
        
        let allNominees = [];
        let offset = 0;
        const BATCH_SIZE = 100;
        let hasMore = true;

        // Robust pagination loop to fetch ALL nominees.
        while(hasMore) {
            console.log(`Fetching nominees batch, offset: ${offset}`);
            const batch = await base44.asServiceRole.entities.Nominee.filter({}, null, BATCH_SIZE, offset);
            
            if (batch && batch.length > 0) {
                allNominees = allNominees.concat(batch);
                offset += batch.length;
                if(batch.length < BATCH_SIZE) {
                    hasMore = false; // Last page was found
                }
            } else {
                hasMore = false; // No more records
            }
        }

        console.log(`📝 Found ${allNominees.length} total nominees to process.`);
        
        let updatedCount = 0;
        let errorCount = 0;
        
        for (const nominee of allNominees) {
            try {
                const elo = nominee.elo_rating || 1200;
                
                // Only update if the aura_score is different from the elo_rating
                if (nominee.aura_score !== elo) {
                    await base44.asServiceRole.entities.Nominee.update(nominee.id, {
                        aura_score: elo
                    });
                    console.log(`✅ Synced ${nominee.name}: Aura set to ELO ${elo}`);
                    updatedCount++;
                }
            } catch (error) {
                console.error(`❌ Error updating ${nominee.name}:`, error.message);
                errorCount++;
            }
        }
        
        const response = {
            success: true,
            message: `Processing complete. Synced ${updatedCount} of ${allNominees.length} nominees.`,
            total_nominees: allNominees.length,
            updated_nominees: updatedCount,
            errors: errorCount,
            formula: "Aura Score = ELO Rating"
        };
        
        console.log('🎉 Sync Complete:', response);
        
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ ELO-Aura Sync Failed:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});