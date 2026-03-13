
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { v4 as uuidv4 } from 'npm:uuid';

const generateDefaultConfig = () => ({
  version_id: uuidv4(),
  status: 'draft',
  yaml_blob: `# Aura Scorealis Engine Configuration v2.0
# This YAML defines how nominee Aura scores are calculated

# === STARPOWER CALCULATION ===
# Defines the contribution of each voting mechanism to the Starpower score.
# These weights MUST sum to 1.0.
starpower:
  components:
    pairwise_voting:
      weight: 0.5000      # ELO from head-to-head battles
      
    ranked_choice:
      weight: 0.3000      # Borda score from ranked ballots
      
    direct_votes:
      weight: 0.2000      # Single-choice votes

# === FINAL AURA FORMULA ===
# Defines how the final score is composed.
# Available variables: starpower, stardust_eff, clout_eff
aura:
  formula: "starpower + stardust_eff + clout_eff"

# === METADATA ===
metadata:
  notes: "Initial default configuration."
  last_tuned: "${new Date().toISOString()}"
`,
  notes: 'Initial default configuration'
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const serviceRole = base44.asServiceRole;
  const url = new URL(req.url);

  // Authorization check
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    // Handle POST requests with action in body
    if (req.method === 'POST') {
      const body = await req.json();
      const { _action, _url_path, yaml_blob, notes } = body;

      // GET /configs - List all score configurations
      if (_action === 'GET' && _url_path === 'configs') {
        const configs = await serviceRole.entities.ScoreConfig.list('-created_date');
        return new Response(JSON.stringify(configs), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // GET /audit - List all audit logs
      if (_action === 'GET' && _url_path === 'audit') {
        const auditLogs = await serviceRole.entities.ScoreAudit.list('-created_date');
        return new Response(JSON.stringify(auditLogs), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // POST /draft - Create a new draft from the current active config
      if (_action === 'POST' && _url_path === 'draft') {
        const activeConfigs = await serviceRole.entities.ScoreConfig.filter({ status: 'active' });
        const defaultDraft = generateDefaultConfig();
        const baseYaml = activeConfigs.length > 0 ? activeConfigs[0].yaml_blob : defaultDraft.yaml_blob;
        const baseNotes = activeConfigs.length > 0 ? `New Draft from active config (version ${activeConfigs[0].version_id})` : defaultDraft.notes;
        
        const newDraft = await serviceRole.entities.ScoreConfig.create({
          version_id: defaultDraft.version_id, // Use the generated version_id
          status: defaultDraft.status,         // Use the generated status
          yaml_blob: baseYaml,
          notes: baseNotes
        });
        
        await serviceRole.entities.ScoreAudit.create({ 
          actor_email: user.email, 
          action_type: 'create_draft', 
          version_id: newDraft.id, 
          timestamp: new Date().toISOString() 
        });
        
        return new Response(JSON.stringify(newDraft), { 
          status: 201, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // PUT /draft/{id} - Update an existing draft
      if (_action === 'PUT' && _url_path && _url_path.startsWith('draft/')) {
        const id = _url_path.split('/')[1];
        
        const updatedDraft = await serviceRole.entities.ScoreConfig.update(id, { 
          yaml_blob, 
          notes 
        });
        
        await serviceRole.entities.ScoreAudit.create({ 
          actor_email: user.email, 
          action_type: 'update_draft', 
          version_id: id, 
          timestamp: new Date().toISOString() 
        });
        
        return new Response(JSON.stringify(updatedDraft), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // POST /publish/{id} - Publish a draft to active
      if (_action === 'POST' && _url_path && _url_path.startsWith('publish/')) {
        const id = _url_path.split('/')[1];
        
        // Find and archive current active configs
        const activeConfigs = await serviceRole.entities.ScoreConfig.filter({ status: 'active' });
        for (const config of activeConfigs) {
          await serviceRole.entities.ScoreConfig.update(config.id, { status: 'archived' });
        }

        // Activate the new config
        const publishedConfig = await serviceRole.entities.ScoreConfig.update(id, { status: 'active' });
        
        await serviceRole.entities.ScoreAudit.create({ 
          actor_email: user.email, 
          action_type: 'publish', 
          version_id: id, 
          timestamp: new Date().toISOString() 
        });
        
        return new Response(JSON.stringify(publishedConfig), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // POST /rollback/{id} - Rollback to a previous config
      if (_action === 'POST' && _url_path && _url_path.startsWith('rollback/')) {
        const id = _url_path.split('/')[1];
        
        // Find and archive current active configs
        const activeConfigs = await serviceRole.entities.ScoreConfig.filter({ status: 'active' });
        for (const config of activeConfigs) {
          await serviceRole.entities.ScoreConfig.update(config.id, { status: 'archived' });
        }

        // Activate the rollback target
        const rolledBackConfig = await serviceRole.entities.ScoreConfig.update(id, { status: 'active' });
        
        await serviceRole.entities.ScoreAudit.create({ 
          actor_email: user.email, 
          action_type: 'rollback', 
          version_id: id, 
          timestamp: new Date().toISOString() 
        });
        
        return new Response(JSON.stringify(rolledBackConfig), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid API route' }), { 
      status: 404, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Error in manageScoreConfig:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});
