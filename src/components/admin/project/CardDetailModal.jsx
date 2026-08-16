import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Plus, MessageSquare, FileText, Paperclip, ArrowUp, ArrowDown,
    Pencil, Send, Loader2, GitBranch,
} from 'lucide-react';
import InitiativeFormModal from './InitiativeFormModal';
import RoadmapItemFormModal from './RoadmapItemFormModal';
import StoryFormModal from './StoryFormModal';
import { TRACEABILITY } from './levelConfig';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8', green: '#7ec8a8', copper: '#c87e9d',
    surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#334155', muted: '#64748b', dim: '#94a3b8',
    rowBg: '#f8fafc', rowBorder: '#e2e8f0', inputBg: '#f1f5f9',
};

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

const ACTIVITY_ICONS = {
    comment: MessageSquare,
    note: FileText,
    update: GitBranch,
    attachment: Paperclip,
    child_created: Plus,
};

const ACTIVITY_LABELS = {
    comment: 'Commented',
    note: 'Noted',
    update: 'Updated',
    attachment: 'Attached',
    child_created: 'Created',
};

export default function CardDetailModal({ item, level, levelConfig, focusInput, onClose, onEdit }) {
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [newContent, setNewContent] = useState('');
    const [activityType, setActivityType] = useState('comment');
    const [submitting, setSubmitting] = useState(false);
    const [parentItem, setParentItem] = useState(null);
    const [childItems, setChildItems] = useState([]);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [childModalOpen, setChildModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const trace = TRACEABILITY[level];
    const entityName = levelConfig.entity;
    const labelKey = levelConfig.labelKey;

    const loadActivities = useCallback(async () => {
        try {
            const data = await base44.entities.PlanningActivity.filter(
                { item_entity: entityName, item_id: item.id },
                '-created_date',
                100
            );
            setActivities(data);
        } catch (err) {
            console.error('Failed to load activities:', err);
        } finally {
            setLoadingActivities(false);
        }
    }, [entityName, item.id]);

    const loadChildren = useCallback(async () => {
        if (!trace?.childEntity) return;
        setLoadingChildren(true);
        try {
            const data = await base44.entities[trace.childEntity].filter(
                { [trace.childLinkField]: item.id },
                '-created_date',
                50
            );
            setChildItems(data);
        } catch (err) {
            console.error('Failed to load children:', err);
        } finally {
            setLoadingChildren(false);
        }
    }, [trace, item.id]);

    const loadParent = useCallback(async () => {
        if (!trace?.parentEntity || !item[trace.parentLinkField]) return;
        try {
            const parent = await base44.entities[trace.parentEntity].get(item[trace.parentLinkField]);
            setParentItem(parent);
        } catch (err) {
            console.error('Failed to load parent:', err);
        }
    }, [trace, item]);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
        loadActivities();
        loadChildren();
        loadParent();
    }, []);

    useEffect(() => {
        if (focusInput) {
            const timer = setTimeout(() => inputRef.current?.focus(), 200);
            return () => clearTimeout(timer);
        }
    }, [focusInput]);

    const handleSubmitActivity = async () => {
        if (!newContent.trim()) return;
        setSubmitting(true);
        try {
            await base44.entities.PlanningActivity.create({
                item_entity: entityName,
                item_id: item.id,
                activity_type: activityType,
                content: newContent,
                author_email: user?.email || '',
                author_name: user?.full_name || user?.email || '',
            });
            setNewContent('');
            await loadActivities();
        } catch (err) {
            console.error('Failed to post activity:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUploadAttachment = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            await base44.entities.PlanningActivity.create({
                item_entity: entityName,
                item_id: item.id,
                activity_type: 'attachment',
                content: file.name,
                attachment_url: file_url,
                author_email: user?.email || '',
                author_name: user?.full_name || user?.email || '',
            });
            await loadActivities();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleCreateChild = async (formData) => {
        const child = await base44.entities[trace.childEntity].create(formData);
        await base44.entities.PlanningActivity.create({
            item_entity: entityName,
            item_id: item.id,
            activity_type: 'child_created',
            child_entity: trace.childEntity,
            child_id: child.id,
            child_title: child[trace.childLabelKey] || child.title || child.name || '',
            author_email: user?.email || '',
            author_name: user?.full_name || user?.email || '',
        });
        setChildModalOpen(false);
        await Promise.all([loadChildren(), loadActivities()]);
    };

    const renderChildModal = () => {
        if (!childModalOpen || !trace?.childEntity) return null;
        const commonProps = {
            onClose: () => setChildModalOpen(false),
            onSave: handleCreateChild,
        };
        switch (trace.childEntity) {
            case 'Initiative':
                return <InitiativeFormModal {...commonProps} objectiveId={item.id} />;
            case 'RoadmapItem':
                return <RoadmapItemFormModal {...commonProps} defaultInitiativeId={item.id} />;
            case 'Story':
                return <StoryFormModal {...commonProps} roadmapItemId={item.id} />;
            default:
                return null;
        }
    };

    const itemTitle = item[labelKey] || item.title || item.name || '';
    const wsjf = Number(item.wsjf_score) || 0;
    const cod = (Number(item.business_value) || 0) + (Number(item.time_criticality) || 0) + (Number(item.risk_reduction) || 0);

    return (
        <>
            <Dialog open onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    {/* Header */}
                    <DialogHeader>
                        <DialogTitle style={{ color: C.navy }}>{itemTitle}</DialogTitle>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: `${C.navy}12`, color: C.navy }}>
                                {levelConfig.singular}
                            </span>
                            {wsjf > 0 && (
                                <span className="text-sm font-bold px-2 py-0.5 rounded-md" style={{ background: C.gold, color: C.surface }}>
                                    WSJF {wsjf.toFixed(1)}
                                </span>
                            )}
                            {cod > 0 && (
                                <span className="text-xs" style={{ color: C.muted }}>
                                    CoD {cod} · Size {item.job_size || '—'}
                                </span>
                            )}
                        </div>
                    </DialogHeader>

                    {/* Activity Feed */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
                            Activity Feed
                        </span>
                        <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                            {loadingActivities ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.muted }} />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-center py-6">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: C.muted }} />
                                    <p className="text-sm" style={{ color: C.dim }}>No activity yet. Start the conversation below.</p>
                                </div>
                            ) : (
                                activities.map(a => {
                                    const Icon = ACTIVITY_ICONS[a.activity_type] || MessageSquare;
                                    return (
                                        <div key={a.id} className="flex gap-3 p-3 rounded-lg" style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}` }}>
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.navy }}>
                                                <Icon className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-semibold" style={{ color: C.navy }}>{a.author_name || 'Anonymous'}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${C.navy}08`, color: C.muted }}>
                                                        {ACTIVITY_LABELS[a.activity_type] || a.activity_type}
                                                    </span>
                                                    <span className="text-[10px]" style={{ color: C.muted }}>{timeAgo(a.created_date)}</span>
                                                </div>
                                                {a.activity_type === 'child_created' ? (
                                                    <p className="text-sm" style={{ color: C.text }}>
                                                        Created <span className="font-semibold">{a.child_entity}</span>: <span className="font-medium">{a.child_title}</span>
                                                    </p>
                                                ) : a.activity_type === 'attachment' ? (
                                                    <a href={a.attachment_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                                                        <Paperclip className="w-3 h-3" /> {a.content}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm" style={{ color: C.text }}>{a.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Input Bar */}
                    <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: C.inputBg, border: `1px solid ${C.rowBorder}` }}>
                        <Select value={activityType} onValueChange={setActivityType}>
                            <SelectTrigger className="w-[110px] h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="comment">Comment</SelectItem>
                                <SelectItem value="note">Note</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            ref={inputRef}
                            value={newContent}
                            onChange={e => setNewContent(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitActivity(); } }}
                            placeholder={activityType === 'comment' ? 'Write a comment...' : 'Add a note...'}
                            className="flex-1 h-9"
                        />
                        <label className="cursor-pointer flex-shrink-0">
                            <input type="file" className="hidden" onChange={handleUploadAttachment} />
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-200" style={{ background: C.rowBorder }}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: C.muted }} /> : <Paperclip className="w-4 h-4" style={{ color: C.muted }} />}
                            </div>
                        </label>
                        <Button onClick={handleSubmitActivity} disabled={submitting || !newContent.trim()} size="sm" style={{ background: C.navy, color: 'white' }} className="flex-shrink-0">
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </Button>
                    </div>

                    {/* Traceability */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
                            Traceability
                        </span>
                        {trace?.parentEntity && (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}` }}>
                                <ArrowUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.sky }} />
                                <span className="text-[10px] uppercase tracking-wider font-bold flex-shrink-0" style={{ color: C.muted }}>Upstream</span>
                                {parentItem ? (
                                    <span className="text-sm font-medium truncate" style={{ color: C.navy }}>
                                        {parentItem[trace.parentLabelKey] || parentItem.title || parentItem.name || '—'}
                                    </span>
                                ) : (
                                    <span className="text-xs" style={{ color: C.dim }}>Not linked</span>
                                )}
                            </div>
                        )}
                        {trace?.childEntity && (
                            <div className="p-2.5 rounded-lg" style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}` }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.green }} />
                                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: C.muted }}>
                                        Downstream ({childItems.length})
                                    </span>
                                    <button
                                        onClick={() => setChildModalOpen(true)}
                                        className="ml-auto flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md transition-colors hover:opacity-90"
                                        style={{ background: C.navy, color: 'white' }}
                                    >
                                        <Plus className="w-3 h-3" /> Add {trace.childEntity}
                                    </button>
                                </div>
                                {loadingChildren ? (
                                    <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin" style={{ color: C.muted }} /></div>
                                ) : childItems.length === 0 ? (
                                    <p className="text-xs py-1" style={{ color: C.dim }}>No downstream items yet.</p>
                                ) : (
                                    <div className="space-y-1">
                                        {childItems.map(c => (
                                            <div key={c.id} className="flex items-center gap-2 text-sm py-1.5 px-2 rounded" style={{ background: '#ffffff', border: `1px solid ${C.rowBorder}` }}>
                                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.green }} />
                                                <span className="truncate" style={{ color: C.text }}>{c[trace.childLabelKey] || c.title || c.name || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {!trace?.parentEntity && !trace?.childEntity && (
                            <p className="text-xs py-2" style={{ color: C.dim }}>No traceability links at this level.</p>
                        )}
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button
                            onClick={() => { onClose(); onEdit(item); }}
                            variant="outline"
                            className="mr-auto"
                        >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Item
                        </Button>
                        <Button onClick={onClose} variant="ghost">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {renderChildModal()}
        </>
    );
}