import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Rocket, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StartupProfileEditor({ user, startup, onUpdate }) {
    const [formData, setFormData] = useState({
        company_name: startup?.company_name || '',
        tagline: startup?.tagline || '',
        description: startup?.description || '',
        website_url: startup?.website_url || '',
        investment_stage: startup?.investment_stage || '',
        industry_vertical: startup?.industry_vertical || '',
        pitch_deck_url: startup?.pitch_deck_url || '',
        funding_goal: startup?.funding_goal || '',
    });
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);
    const { toast } = useToast();

    const handleCreate = async () => {
        setCreating(true);
        try {
            const newStartup = await base44.entities.StartupProfile.create({
                founder_email: user.email,
                ...formData,
                status: 'pending_review'
            });
            onUpdate?.(newStartup);
            toast({ title: 'Startup profile created!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Creation failed', description: error.message });
        } finally {
            setCreating(false);
        }
    };

    const handleSave = async () => {
        if (!startup) {
            handleCreate();
            return;
        }

        setSaving(true);
        try {
            await base44.entities.StartupProfile.update(startup.id, formData);
            onUpdate?.({ ...startup, ...formData });
            toast({ title: 'Startup profile saved!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Save failed', description: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (!startup) {
        return (
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <Rocket className="w-6 h-6 text-[#c9a87c] mt-1" />
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Startup Profile</h2>
                        <p className="text-sm text-slate-500">Add your startup to connect with investors and partners</p>
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
                    <Plus className="w-8 h-8 text-[#c9a87c] mx-auto mb-2" />
                    <h3 className="font-medium text-slate-800 mb-1">Create Startup Profile</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Showcase your company to our network of investors
                    </p>
                    <Button onClick={handleCreate} disabled={creating} className="gap-2" style={{ background: '#c9a87c' }}>
                        {creating ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> : <Plus className="w-4 h-4 flex-shrink-0" />}
                        Create Profile
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <Rocket className="w-6 h-6 text-[#c9a87c] mt-1 flex-shrink-0" />
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Startup Profile</h2>
                    <p className="text-sm text-slate-500">Your startup details and pitch</p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                            id="company_name"
                            value={formData.company_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                            placeholder="e.g. AeroSpace Inc."
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="website_url">Website URL</Label>
                        <Input
                            id="website_url"
                            value={formData.website_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                            placeholder="https://..."
                            className="mt-1"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                        id="tagline"
                        value={formData.tagline}
                        onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                        placeholder="A short, catchy description of what you do"
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your product, market, and traction..."
                        className="mt-1 min-h-[120px]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="investment_stage">Investment Stage</Label>
                        <Input
                            id="investment_stage"
                            value={formData.investment_stage}
                            onChange={(e) => setFormData(prev => ({ ...prev, investment_stage: e.target.value }))}
                            placeholder="e.g. Pre-Seed, Seed, Series A"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="industry_vertical">Industry Vertical</Label>
                        <Input
                            id="industry_vertical"
                            value={formData.industry_vertical}
                            onChange={(e) => setFormData(prev => ({ ...prev, industry_vertical: e.target.value }))}
                            placeholder="e.g. Propulsion, Satellites, AI"
                            className="mt-1"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="funding_goal">Funding Goal</Label>
                        <Input
                            id="funding_goal"
                            value={formData.funding_goal}
                            onChange={(e) => setFormData(prev => ({ ...prev, funding_goal: e.target.value }))}
                            placeholder="e.g. $1.5M"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="pitch_deck_url">Pitch Deck URL</Label>
                        <Input
                            id="pitch_deck_url"
                            value={formData.pitch_deck_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, pitch_deck_url: e.target.value }))}
                            placeholder="https://..."
                            className="mt-1"
                        />
                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Link
                    to={createPageUrl('MissionControl') + '?module=founder'}
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                    <ExternalLink className="w-3 h-3" />
                    Founder Dashboard
                </Link>
                <Button onClick={handleSave} disabled={saving} className="gap-2" style={{ background: '#1e3a5a' }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> : <Save className="w-4 h-4 flex-shrink-0" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
