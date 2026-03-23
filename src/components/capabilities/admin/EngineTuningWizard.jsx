
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// This import is unused in the new structure but kept for completeness
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
    Settings, 
    Save, // This import is unused but kept for completeness
    Zap, // This import is unused but kept for completeness
    AlertTriangle,
    Loader2,
    RefreshCw
} from 'lucide-react';
import ScoringConfigBuilder from './ScoringConfigBuilder';
import { manageScoreConfig } from '@/functions/manageScoreConfig';

export default function EngineTuningWizard() {
    const [activeConfig, setActiveConfig] = useState(null);
    const [configs, setConfigs] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const [showConfigBuilder, setShowConfigBuilder] = useState(false);
    const [currentDraft, setCurrentDraft] = useState(null);
    
    const { toast } = useToast();

    const loadAllData = useCallback(async () => {
        setLoading(true);
        try {
            // Load configurations
            const { data: configsData } = await manageScoreConfig({
                _action: 'GET',
                _url_path: 'configs'
            });
            setConfigs(configsData || []);
            
            // Find active config
            const active = (configsData || []).find(c => c.status === 'active');
            setActiveConfig(active);
            
            // Load audit logs
            const { data: auditData } = await manageScoreConfig({
                _action: 'GET',
                _url_path: 'audit'
            });
            setAuditLogs((auditData || []).slice(0, 10)); // Show last 10 actions
            
        } catch (error) {
            console.error('Error loading engine tuning data:', error);
            toast({
                variant: "destructive",
                title: "Loading Error",
                description: `Failed to load configuration data: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const refreshData = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
        toast({
            title: "Data Refreshed",
            description: "Configuration data has been updated."
        });
    };

    const handleCreateDraft = async () => {
        setSaving(true);
        try {
            const { data: newDraft } = await manageScoreConfig({
                _action: 'POST',
                _url_path: 'draft'
            });
            setCurrentDraft(newDraft);
            setShowConfigBuilder(true);
            await loadAllData(); // Refresh to show the new draft
            toast({
                title: "Draft Created",
                description: "New configuration draft ready for editing."
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to create draft: ${error.message}`
            });
        } finally {
            setSaving(false);
        }
    };

    const generateYamlFromConfig = (config) => {
        if (!config) return '';
        
        return `# Simple ELO + Borda Scoring Configuration
# Notes: ${config.notes || 'No notes'}

# Scoring weights (must sum to 1.0)
elo_weight: ${config.elo_weight ? config.elo_weight.toFixed(4) : (0.5).toFixed(4)}
borda_weight: ${config.borda_weight ? config.borda_weight.toFixed(4) : (0.5).toFixed(4)}

# Formula: aura_score = (elo_weight * normalized_elo) + (borda_weight * normalized_borda)
`;
    };

    const handleDraftUpdate = (newConfig) => {
        const yamlBlob = generateYamlFromConfig(newConfig);
        // Assuming newConfig object contains notes for direct update
        setCurrentDraft(prev => ({ ...prev, yaml_blob: yamlBlob, notes: newConfig.notes }));
    };

    const handleSaveDraft = async () => {
        if (!currentDraft) return;

        setSaving(true);
        try {
            await manageScoreConfig({
                _action: 'PUT',
                _url_path: `draft/${currentDraft.id}`,
                yaml_blob: currentDraft.yaml_blob,
                notes: currentDraft.notes || 'Updated via Engine Tuning Wizard'
            });
            await loadAllData(); // Refresh list to show saved changes
            toast({
                title: "Draft Saved",
                description: "Your configuration changes have been saved.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Save Error",
                description: `Failed to save configuration: ${error.message}`
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async (configId) => {
        setSaving(true);
        try {
            await manageScoreConfig({
                _action: 'POST',
                _url_path: `publish/${configId}`
            });
            setShowConfigBuilder(false);
            setCurrentDraft(null);
            await loadAllData();
            toast({
                title: "Configuration Published!",
                description: "The new scoring configuration is now active.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Publish Error",
                description: `Failed to publish configuration: ${error.message}`
            });
        } finally {
            setSaving(false);
        }
    };

    const parseConfigFromYaml = (yamlBlob) => {
        if (!yamlBlob) {
            // Default values for an empty or invalid YAML
            return {
                elo_weight: 0.5,
                borda_weight: 0.5,
                notes: "Default configuration for ELO + Borda scoring."
            };
        }
        
        try {
            let config = {
                elo_weight: 0.5, // Default
                borda_weight: 0.5, // Default
                notes: ""
            };

            const eloMatch = yamlBlob.match(/elo_weight:\s*([\d.]+)/);
            const bordaMatch = yamlBlob.match(/borda_weight:\s*([\d.]+)/);
            const notesMatch = yamlBlob.match(/Notes:\s*([^\n]+)/i); // Case-insensitive 'Notes'

            if (eloMatch) {
                config.elo_weight = parseFloat(eloMatch[1]);
            }
            if (bordaMatch) {
                config.borda_weight = parseFloat(bordaMatch[1]);
            }
            if (notesMatch) {
                config.notes = notesMatch[1].trim();
            }

            // Basic validation: ensure weights sum to 1, or normalize if close
            const sum = config.elo_weight + config.borda_weight;
            if (Math.abs(sum - 1.0) > 0.0001) { // Check if sum is not approximately 1.0
                console.warn(`Weights (${config.elo_weight} + ${config.borda_weight} = ${sum}) do not sum to 1.0. Normalizing.`);
                if (sum !== 0) { // Avoid division by zero
                    config.elo_weight = config.elo_weight / sum;
                    config.borda_weight = config.borda_weight / sum;
                } else {
                    // Fallback if both are zero
                    config.elo_weight = 0.5;
                    config.borda_weight = 0.5;
                }
            }

            return config;
        } catch (error) {
            console.warn('Error parsing YAML config for ELO + Borda:', error);
            // Return a default valid structure on error
            return {
                elo_weight: 0.5,
                borda_weight: 0.5,
                notes: "Error during YAML parsing, using default configuration."
            };
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }
    
    return (
        <Card className="p-0">
            <CardHeader className="p-6 pb-4">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                    <Settings className="w-5 h-5" />
                    Scoring Engine Configuration
                </CardTitle>
                <CardDescription>
                    Configure how ELO and Borda scores combine into the final Aura score.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-[var(--text)]">Active Configuration</h3>
                    <Button onClick={refreshData} variant="outline" size="sm" disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
                
                {activeConfig ? (
                    <div className="space-y-3">
                        <pre className="bg-gray-800 text-white p-4 rounded-lg text-xs overflow-x-auto">
                            <code>{activeConfig.yaml_blob}</code>
                        </pre>
                        <div className="text-sm text-[var(--muted)]">
                            Last updated: {new Date(activeConfig.updated_date).toLocaleString()}
                        </div>
                    </div>
                ) : (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>No active configuration found. Create and publish a draft to begin.</AlertDescription>
                    </Alert>
                )}

                <Separator />

                {showConfigBuilder && currentDraft ? (
                    <div>
                        <ScoringConfigBuilder
                            initialYaml={currentDraft.yaml_blob}
                            onChange={handleDraftUpdate}
                        />
                        <div className="mt-4 p-6 border-t border-[var(--border)] flex justify-end gap-2 bg-[var(--card)]/50 -mx-6 -mb-6 rounded-b-lg">
                            <Button variant="outline" onClick={() => { setShowConfigBuilder(false); setCurrentDraft(null); }}>Cancel</Button>
                            <Button onClick={handleSaveDraft} disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2" />}
                                Save Draft
                            </Button>
                            <Button onClick={() => handlePublish(currentDraft.id)} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Zap className="w-4 h-4 mr-2" />}
                                Save and Publish
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-lg font-medium text-[var(--text)] mb-2">Configuration Drafts</h3>
                        <div className="space-y-2 mb-4">
                            {configs.filter(c => c.status === 'draft').length > 0 ? (
                                configs.filter(c => c.status === 'draft').map(draft => (
                                    <div key={draft.id} className="flex justify-between items-center p-3 rounded-lg border border-[var(--border)] bg-transparent hover:bg-white/5">
                                        <div>
                                            <p className="font-medium">Draft <span className="text-xs font-mono text-[var(--muted)]">({draft.id.slice(0,8)})</span></p>
                                            <p className="text-xs text-[var(--muted)]">Last updated: {new Date(draft.updated_date).toLocaleString()}</p>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => { setCurrentDraft(draft); setShowConfigBuilder(true); }}>Edit</Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No active drafts found. Create a new one to start tuning.</p>
                            )}
                        </div>
                        <Button onClick={handleCreateDraft} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Settings className="w-4 h-4 mr-2" />}
                            Create New Draft
                        </Button>
                    </div>
                )}
                
                <Separator />

                <div>
                    <h3 className="text-lg font-medium text-[var(--text)] mb-2">Recent Changes</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {auditLogs.map((log, index) => (
                            <div key={index} className="flex justify-between items-center p-2 text-sm border-b border-[var(--border)] last:border-b-0">
                                <div>
                                    <span className="font-medium">{log.action_type}</span>
                                    <span className="text-[var(--muted)] ml-2">by {log.actor_email}</span>
                                </div>
                                <div className="text-xs text-[var(--muted)]">
                                    {new Date(log.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {auditLogs.length === 0 && (
                            <div className="text-center text-[var(--muted)] py-4">No recent changes</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
