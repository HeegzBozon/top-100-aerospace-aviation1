import { useState, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const defaultConfig = {
    notes: 'Simple ELO + Borda configuration',
    elo_weight: 0.7,
    borda_weight: 0.3
};

const parseYamlConfig = (yamlString) => {
    const config = { ...defaultConfig };

    if (!yamlString) return config;
    
    const notesMatch = yamlString.match(/notes: "([^"]+)"/);
    if (notesMatch) config.notes = notesMatch[1];
    
    const eloMatch = yamlString.match(/elo_weight:\s*([\d.]+)/);
    if (eloMatch) config.elo_weight = parseFloat(eloMatch[1]);
    
    const bordaMatch = yamlString.match(/borda_weight:\s*([\d.]+)/);
    if (bordaMatch) config.borda_weight = parseFloat(bordaMatch[1]);
    
    return config;
};

const ScoringConfigBuilder = ({ initialYaml, onChange }) => {
    const [config, setConfig] = useState(() => parseYamlConfig(initialYaml));

    useEffect(() => {
        setConfig(parseYamlConfig(initialYaml));
    }, [initialYaml]);
    
    // Debounced onChange call to parent
    useEffect(() => {
        const handler = setTimeout(() => {
            if (JSON.stringify(config) !== JSON.stringify(parseYamlConfig(initialYaml))) {
                onChange(config);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [config, onChange, initialYaml]);
    
    const totalWeight = useMemo(() => {
        return config.elo_weight + config.borda_weight;
    }, [config.elo_weight, config.borda_weight]);

    const handleWeightChange = (type, newWeight) => {
        const weight = newWeight / 100; // Convert percentage to decimal
        setConfig(prev => {
            if (type === 'elo') {
                return {
                    ...prev,
                    elo_weight: weight,
                    borda_weight: 1.0 - weight
                };
            } else {
                return {
                    ...prev,
                    borda_weight: weight,
                    elo_weight: 1.0 - weight
                };
            }
        });
    };

    const isWeightValid = Math.abs(totalWeight - 1.0) < 0.001;
    
    return (
        <div className="p-6 border rounded-lg bg-white/5 space-y-6">
            <div>
                <h4 className="font-semibold text-xl mb-2">Scoring Configuration</h4>
                <p className="text-sm text-[var(--muted)] mb-6">
                    Configure how ELO Rating and Borda Score combine to create the final Aura score.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ELO Weight */}
                    <div className="p-4 rounded-md border bg-blue-50/10">
                        <Label className="text-base font-medium flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            ELO Rating Weight
                        </Label>
                        <div className="space-y-3">
                            <Slider
                                value={[config.elo_weight * 100]}
                                onValueChange={([val]) => handleWeightChange('elo', val)}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={(config.elo_weight * 100).toFixed(0)}
                                    onChange={(e) => handleWeightChange('elo', parseFloat(e.target.value) || 0)}
                                    className="w-20 text-right"
                                    min="0"
                                    max="100"
                                />
                                <span className="text-sm text-[var(--muted)]">%</span>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-2">
                            From head-to-head pairwise voting battles
                        </p>
                    </div>

                    {/* Borda Weight */}
                    <div className="p-4 rounded-md border bg-green-50/10">
                        <Label className="text-base font-medium flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            Borda Score Weight
                        </Label>
                        <div className="space-y-3">
                            <Slider
                                value={[config.borda_weight * 100]}
                                onValueChange={([val]) => handleWeightChange('borda', val)}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={(config.borda_weight * 100).toFixed(0)}
                                    onChange={(e) => handleWeightChange('borda', parseFloat(e.target.value) || 0)}
                                    className="w-20 text-right"
                                    min="0"
                                    max="100"
                                />
                                <span className="text-sm text-[var(--muted)]">%</span>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-2">
                            From "Your TOP 100" ranked-choice ballots
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    {isWeightValid ? (
                        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Formula:</strong> Aura = ({(config.elo_weight * 100).toFixed(0)}% × ELO) + ({(config.borda_weight * 100).toFixed(0)}% × Borda)
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Weights must total 100%. Current: {(totalWeight * 100).toFixed(1)}%
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            <div>
                <Label htmlFor="config-notes">Configuration Notes</Label>
                <Input
                    id="config-notes"
                    placeholder="e.g., Increasing Borda weight for ranked-choice focus"
                    value={config.notes}
                    onChange={(e) => setConfig(prev => ({...prev, notes: e.target.value}))}
                    className="mt-2"
                />
            </div>
        </div>
    );
};

export default ScoringConfigBuilder;