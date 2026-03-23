import { useState, useEffect } from 'react';
import { Quest } from '@/entities/Quest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Plus } from 'lucide-react';

const questTypes = ["daily", "weekly", "seasonal", "epic", "milestone"];
const questCategories = ["people", "ideas", "bugs", "cross_cutting", "community"];
const questDifficulties = ["common", "skillful", "epic"];

export default function QuestForm({ quest, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'daily',
        category: 'people',
        difficulty: 'common',
        stardust_reward: 0,
        clout_reward: 0,
        requirements: [{ action: '', target: 1, context: '' }],
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        if (quest) {
            setFormData({
                ...quest,
                start_date: quest.start_date ? new Date(quest.start_date).toISOString().substring(0, 16) : '',
                end_date: quest.end_date ? new Date(quest.end_date).toISOString().substring(0, 16) : '',
            });
        }
    }, [quest]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRequirementChange = (index, field, value) => {
        const newRequirements = [...formData.requirements];
        newRequirements[index][field] = value;
        setFormData(prev => ({ ...prev, requirements: newRequirements }));
    };

    const addRequirement = () => {
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, { action: '', target: 1, context: '' }]
        }));
    };

    const removeRequirement = (index) => {
        const newRequirements = formData.requirements.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, requirements: newRequirements }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                stardust_reward: Number(formData.stardust_reward),
                clout_reward: Number(formData.clout_reward),
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            };

            if (quest?.id) {
                await Quest.update(quest.id, dataToSubmit);
            } else {
                await Quest.create(dataToSubmit);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save quest:', error);
            alert('Error saving quest. Check console for details.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{quest?.id ? 'Edit Quest' : 'Create New Quest'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Type</Label>
                            <Select name="type" value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{questTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Category</Label>
                            <Select name="category" value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{questCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Difficulty</Label>
                            <Select name="difficulty" value={formData.difficulty} onValueChange={(v) => handleSelectChange('difficulty', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{questDifficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="stardust_reward">Stardust Reward</Label>
                            <Input id="stardust_reward" name="stardust_reward" type="number" value={formData.stardust_reward} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="clout_reward">Clout Reward</Label>
                            <Input id="clout_reward" name="clout_reward" type="number" value={formData.clout_reward} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <Label>Requirements</Label>
                        <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                            {formData.requirements.map((req, index) => (
                                <div key={index} className="grid grid-cols-[1fr,1fr,80px,auto] gap-2 items-center">
                                    <Input placeholder="Action (e.g. pairwise_vote)" value={req.action} onChange={(e) => handleRequirementChange(index, 'action', e.target.value)} />
                                    <Input placeholder="Context (optional)" value={req.context} onChange={(e) => handleRequirementChange(index, 'context', e.target.value)} />
                                    <Input type="number" placeholder="Target" value={req.target} onChange={(e) => handleRequirementChange(index, 'target', Number(e.target.value))} />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeRequirement(index)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                                <Plus className="w-4 h-4 mr-2" /> Add Requirement
                            </Button>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input id="start_date" name="start_date" type="datetime-local" value={formData.start_date} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="end_date">End Date</Label>
                            <Input id="end_date" name="end_date" type="datetime-local" value={formData.end_date} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="is_active" name="is_active" checked={formData.is_active} onCheckedChange={(c) => handleSelectChange('is_active', c)} />
                        <Label htmlFor="is_active">Quest is Active</Label>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Quest</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}