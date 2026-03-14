import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function SponsorManagement() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState(null);

    const { data: sponsors, isLoading } = useQuery({
        queryKey: ['admin-sponsors'],
        queryFn: () => base44.entities.Sponsor.list({ sort: { created_date: -1 } }),
        initialData: []
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Sponsor.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-sponsors']);
            setIsDialogOpen(false);
            toast.success('Sponsor added successfully');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({id, data}) => base44.entities.Sponsor.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-sponsors']);
            setIsDialogOpen(false);
            setEditingSponsor(null);
            toast.success('Sponsor updated successfully');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Sponsor.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-sponsors']);
            toast.success('Sponsor deleted');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            organization_name: formData.get('organization_name'),
            tier: formData.get('tier'),
            logo_url: formData.get('logo_url'),
            contact_email: formData.get('contact_email'),
            // is_active is handled separately or defaults to true
            is_active: true 
        };

        if (editingSponsor) {
            updateMutation.mutate({ id: editingSponsor.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const toggleActive = (sponsor) => {
        updateMutation.mutate({ 
            id: sponsor.id, 
            data: { is_active: !sponsor.is_active } 
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Sponsor Management</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingSponsor(null)}>
                            <Plus className="w-4 h-4 mr-2" /> Add Sponsor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Organization Name</label>
                                <Input name="organization_name" defaultValue={editingSponsor?.organization_name} required placeholder="Company Name" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tier</label>
                                    <Select name="tier" defaultValue={editingSponsor?.tier || "bronze"}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="platinum">Platinum</SelectItem>
                                            <SelectItem value="gold">Gold</SelectItem>
                                            <SelectItem value="silver">Silver</SelectItem>
                                            <SelectItem value="bronze">Bronze</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Logo URL</label>
                                    <Input name="logo_url" defaultValue={editingSponsor?.logo_url} placeholder="https://..." />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact Email</label>
                                <Input name="contact_email" defaultValue={editingSponsor?.contact_email} placeholder="contact@company.com" />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingSponsor ? 'Update' : 'Add Sponsor'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b font-medium grid grid-cols-12 gap-4 text-sm text-slate-500">
                    <div className="col-span-4">Organization</div>
                    <div className="col-span-3">Tier</div>
                    <div className="col-span-3">Active</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y">
                    {sponsors.map(sponsor => (
                        <div key={sponsor.id} className="p-4 grid grid-cols-12 gap-4 items-center text-sm hover:bg-slate-50 transition-colors">
                            <div className="col-span-4 font-medium flex items-center gap-3">
                                {sponsor.logo_url && <img src={sponsor.logo_url} alt="" className="w-6 h-6 object-contain rounded" />}
                                {sponsor.organization_name}
                            </div>
                            <div className="col-span-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                                    sponsor.tier === 'platinum' ? 'bg-slate-800 text-white' :
                                    sponsor.tier === 'gold' ? 'bg-amber-100 text-amber-800' :
                                    sponsor.tier === 'silver' ? 'bg-slate-100 text-slate-700' :
                                    'bg-orange-50 text-orange-800'
                                }`}>
                                    {sponsor.tier}
                                </span>
                            </div>
                            <div className="col-span-3 flex items-center gap-2">
                                <Switch 
                                    checked={sponsor.is_active} 
                                    onCheckedChange={() => toggleActive(sponsor)} 
                                />
                                <span className="text-xs text-slate-500">{sponsor.is_active ? 'Visible' : 'Hidden'}</span>
                            </div>
                            <div className="col-span-2 flex justify-end gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                    setEditingSponsor(sponsor);
                                    setIsDialogOpen(true);
                                }}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                                    if(confirm('Delete this sponsor?')) deleteMutation.mutate(sponsor.id);
                                }}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {sponsors.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No sponsors found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}