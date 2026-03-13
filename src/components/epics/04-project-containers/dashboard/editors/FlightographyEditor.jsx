import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Rocket, ShieldCheck, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const brandColors = {
    navyDeep: '#1e3a5a',
    goldPrestige: '#c9a87c',
};

export default function FlightographyEditor({ user }) {
    const [credits, setCredits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        program_id: '',
        role: '',
        year: new Date().getFullYear().toString(),
        evidence_url: '',
    });

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [userCredits, allPrograms] = await Promise.all([
                base44.entities.ProgramCredit.filter({ user_id: user.id }),
                base44.entities.AerospaceProgram.list()
            ]);
            setCredits(userCredits);
            setPrograms(allPrograms);
        } catch (error) {
            console.error('Error fetching flightography data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await base44.functions.invoke('programService', {
                action: 'claim_credit',
                data: formData
            });
            toast.success('Credit claim submitted for verification');
            setShowForm(false);
            fetchData(); // Refresh list
        } catch (error) {
            toast.error('Failed to submit credit claim');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>Verified Flightography</h3>
                    <p className="text-sm text-slate-500">Document your contributions to the world's most significant aerospace programs.</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-full"
                    style={{ background: brandColors.navyDeep }}
                >
                    {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Claim Credit</>}
                </Button>
            </div>

            {showForm && (
                <Card className="bg-slate-50 border-dashed border-2">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Aerospace Program</label>
                                    <select
                                        className="w-full p-2 rounded-md border text-sm"
                                        value={formData.program_id}
                                        onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a Program...</option>
                                        {programs.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Role</label>
                                    <Input
                                        placeholder="e.g. Propulsion Engineer"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Year of Contribution</label>
                                    <Input
                                        placeholder="2024"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Evidence URL (Optional)</label>
                                    <Input
                                        placeholder="https://linkedin.com/in/..."
                                        value={formData.evidence_url}
                                        onChange={(e) => setFormData({ ...formData, evidence_url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full"
                                style={{ background: brandColors.goldPrestige }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-3">
                {credits.map(credit => (
                    <div key={credit.id} className="p-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                <Rocket className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-800">{programs.find(p => p.id === credit.program_id)?.name || 'Unknown Program'}</h4>
                                    {credit.status === 'verified' ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Pending Verification</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">{credit.role} • {credit.year}</p>
                            </div>
                        </div>
                        {credit.evidence_url && (
                            <a href={credit.evidence_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm">
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </a>
                        )}
                    </div>
                ))}
                {credits.length === 0 && !showForm && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed">
                        <Rocket className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-400">No Program Credits Yet</h4>
                        <p className="text-xs text-slate-400">Start building your aerospace legacy.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
