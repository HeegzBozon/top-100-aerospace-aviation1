import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        console.log('🔧 Starting Aura Score Fix with 80/20 Split...');
        
        // Updated weights: 80% ELO, 20% Borda
        const ELO_WEIGHT = 0.8;
        const BORDA_WEIGHT = 0.2;
        
        // Get all nominees
        console.log('📋 Loading all nominees...');
        const nominees = await base44.asServiceRole.entities.Nominee.list();
        console.log(`Found ${nominees.length} nominees to fix`);
        
        let fixed = 0;
        let errors = 0;
        
        for (const nominee of nominees) {
            try {
                const elo = nominee.elo_rating || 1200;
                const borda = nominee.borda_score || 0;
                
                // Calculate: 80% ELO + 20% Borda
                const newAura = (ELO_WEIGHT * elo) + (BORDA_WEIGHT * borda);
                const roundedAura = Math.round(newAura * 100) / 100;
                
                // Log before update
                console.log(`🔄 Updating ${nominee.name}: ELO(${elo}) × 0.8 + Borda(${borda}) × 0.2 = ${roundedAura}`);
                
                // Update the nominee
                const updateResult = await base44.asServiceRole.entities.Nominee.update(nominee.id, {
                    aura_score: roundedAura
                });
                
                console.log(`✅ ${nominee.name}: Successfully updated to ${roundedAura}`);
                fixed++;
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 10));
                
            } catch (error) {
                console.error(`❌ Failed to fix ${nominee.name}:`, error.message);
                errors++;
            }
        }
        
        console.log(`🎉 Process Complete: ${fixed} fixed, ${errors} errors`);
        
        return new Response(JSON.stringify({
            success: true,
            message: `Fixed Aura scores for ${fixed} nominees with ${errors} errors`,
            formula: "Aura = (80% × ELO) + (20% × Borda)",
            weights: {
                elo: ELO_WEIGHT,
                borda: BORDA_WEIGHT
            },
            processed: fixed,
            errors: errors,
            total: nominees.length,
            examples: {
                "Omur (ELO 1469, Borda 100)": `${Math.round(((0.8 * 1469) + (0.2 * 100)) * 100) / 100}`,
                "Phnam (ELO 1127, Borda 0)": `${Math.round((0.8 * 1127) * 100) / 100}`,
                "Kelli (ELO 1331, Borda 0)": `${Math.round((0.8 * 1331) * 100) / 100}`
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Aura Score Fix Failed:', error);
        console.error('Stack trace:', error.stack);
        
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});