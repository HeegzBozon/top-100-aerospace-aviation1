import React, { useState, useEffect } from 'react';
import { Keybinding } from '@/entities/Keybinding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Keyboard, Edit, X } from 'lucide-react';

export default function KeybindingManager() {
    const [keybindings, setKeybindings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBinding, setEditingBinding] = useState(null);
    const [newKey, setNewKey] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadKeybindings();
    }, []);

    const loadKeybindings = async () => {
        setLoading(true);
        try {
            const data = await Keybinding.list();
            // Group by category
            const grouped = data.reduce((acc, curr) => {
                (acc[curr.category] = acc[curr.category] || []).push(curr);
                return acc;
            }, {});
            setKeybindings(grouped);
        } catch (error) {
            console.error("Failed to load keybindings:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load keybindings." });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (binding) => {
        setEditingBinding(binding);
        setNewKey(binding.key);
    };

    const handleSave = async () => {
        if (!editingBinding || !newKey) return;

        try {
            await Keybinding.update(editingBinding.id, { key: newKey });
            toast({ title: "Keybinding Updated", description: `Action '${editingBinding.action}' is now mapped to '${newKey}'.` });
            setEditingBinding(null);
            setNewKey('');
            loadKeybindings();
        } catch (error) {
            console.error("Failed to update keybinding:", error);
            toast({ variant: "destructive", title: "Update Failed", description: "Could not save the new keybinding." });
        }
    };

    if (loading) {
        return <div className="p-6 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-[var(--text)] mb-6">Master Keyboard Shortcuts</h2>
            <div className="space-y-6">
                {Object.entries(keybindings).map(([category, bindings]) => (
                    <div key={category}>
                        <h3 className="text-lg font-semibold text-[var(--muted)] mb-3 border-b border-[var(--border)] pb-2">{category}</h3>
                        <div className="space-y-2">
                            {bindings.map((binding) => (
                                <div key={binding.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--card)]/50 hover:bg-[var(--card)]">
                                    <div>
                                        <p className="font-medium text-[var(--text)]">{binding.description}</p>
                                        <p className="text-xs text-[var(--muted)]">Action: <code className="text-xs">{binding.action}</code></p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {editingBinding?.id === binding.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={newKey}
                                                    onChange={(e) => setNewKey(e.target.value)}
                                                    className="w-24 h-8 text-center"
                                                />
                                                <Button size="icon" className="h-8 w-8" onClick={handleSave}><Save className="w-4 h-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingBinding(null)}><X className="w-4 h-4" /></Button>
                                            </div>
                                        ) : (
                                            <>
                                                <kbd className="h-8 px-3 py-1.5 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
                                                    {binding.key}
                                                </kbd>
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleEdit(binding)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}