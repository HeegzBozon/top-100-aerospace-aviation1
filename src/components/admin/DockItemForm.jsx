
import { useState, useEffect } from 'react';
import { DockItem } from '@/entities/DockItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { availableIcons } from '@/components/icons'; // Updated import
import { AnimatePresence, motion } from 'framer-motion';

export default function DockItemForm({ item, onClose, onSuccess, existingItemsCount }) {
    const [formData, setFormData] = useState({
        label: '',
        pageName: '',
        icon: 'Home',
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const isEditing = !!item;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                label: item.label,
                pageName: item.pageName,
                icon: item.icon,
            });
        }
    }, [item, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                order: isEditing ? item.order : existingItemsCount,
            };

            if (isEditing) {
                await DockItem.update(item.id, dataToSave);
                toast({ title: "Success", description: "Dock item updated successfully." });
            } else {
                await DockItem.create(dataToSave);
                toast({ title: "Success", description: "Dock item created successfully." });
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save dock item:", error);
            toast({ variant: "destructive", title: "Error", description: `Could not save item: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
                >
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold">{isEditing ? 'Edit' : 'Create'} Dock Item</h3>

                        <div>
                            <Label htmlFor="label">Label</Label>
                            <Input
                                id="label"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                placeholder="e.g., Home"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="pageName">Page Name</Label>
                            <Input
                                id="pageName"
                                value={formData.pageName}
                                onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                                placeholder="e.g., Home (case sensitive)"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="icon">Icon</Label>
                            <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an icon" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableIcons.map(iconName => (
                                        <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Item'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
