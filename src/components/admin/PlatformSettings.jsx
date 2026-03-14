import React, { useState, useEffect } from 'react';
import KeybindingManager from './KeybindingManager';
import { Switch } from '@/components/ui/switch';
import { Settings, MoveRight, DatabaseBackup } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function PlatformSettings() {
    const [enablePostMoving, setEnablePostMoving] = useState(false);

    useEffect(() => {
        const val = localStorage.getItem('admin_post_moving_enabled');
        if (val !== 'false') {
            setEnablePostMoving(true);
        }
    }, []);

    const [isMigrating, setIsMigrating] = useState(false);

    const migrateAnnouncementsToGeneral = async () => {
        try {
            setIsMigrating(true);
            const conversations = await base44.entities.Conversation.filter({});
            const general = conversations.find(c => c.name?.toLowerCase() === 'general');
            const announcements = conversations.find(c => c.name?.toLowerCase() === 'announcements');

            if (!general || !announcements) {
                toast.error("Could not find General or Announcements channels.");
                return;
            }

            const legacyMsgs = await base44.entities.Message.filter({ conversation_id: announcements.id }, "created_date", 200);
            const legacyPosts = legacyMsgs.filter(m => m.is_post || (!m.parent_id && !m.is_post && !m.depth));

            if (legacyPosts.length === 0) {
                toast("No legacy announcement posts found entirely.");
                setIsMigrating(false);
                return;
            }

            // Create them in Post collection mapped to General channel
            let migratedCount = 0;
            for (const msg of legacyPosts) {
                await base44.entities.Post.create({
                    title: msg.post_title || "Legacy Announcement",
                    content: msg.content,
                    post_type: "announcement",
                    channel_id: general.id,
                    author_email: msg.sender_email,
                    author_name: msg.sender_name,
                    published_date: msg.created_date,
                    upvoted_by: msg.upvoted_by || [],
                    upvotes: (msg.upvoted_by || []).length,
                    reply_count: msg.reply_count || 0,
                    view_count: 0,
                });
                // Soft delete the old message so it doesn't clutter other feeds
                await base44.entities.Message.update(msg.id, { content: "[migrated]", post_title: "[migrated]" });
                migratedCount++;
            }

            toast.success(`Successfully migrated ${migratedCount} posts to General!`);
        } catch (e) {
            console.error(e);
            toast.error("Migration failed: " + e.message);
        } finally {
            setIsMigrating(false);
        }
    };

    const handleToggle = (checked) => {
        setEnablePostMoving(checked);
        localStorage.setItem('admin_post_moving_enabled', checked.toString());
    };

    return (
        <div className="space-y-8">
            <div className="p-6 pb-0">
                <h2 className="text-xl font-bold text-[var(--text)] mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[var(--accent)]" />
                    Platform Features
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--card)]/50 border border-[var(--border)] transition-colors">
                        <div>
                            <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
                                <MoveRight className="w-4 h-4 text-orange-500" /> Administrative Post Moving
                            </h3>
                            <p className="text-sm text-[var(--muted)] mt-1">
                                Allows admins to move posts between channels and bulk-move content.
                            </p>
                        </div>
                        <Switch
                            checked={enablePostMoving}
                            onCheckedChange={handleToggle}
                            className={`${enablePostMoving ? "bg-[#1e3a5a]" : "bg-gray-200"}`}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50/50 border border-orange-200 transition-colors">
                        <div>
                            <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                                <DatabaseBackup className="w-4 h-4 text-orange-600" /> Migrate Announcements
                            </h3>
                            <p className="text-sm text-orange-600/80 mt-1">
                                One-time operation to recover legacy announcement messages and move them into the General channel as posts.
                            </p>
                        </div>
                        <Button
                            variant="default"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={migrateAnnouncementsToGeneral}
                            disabled={isMigrating}
                        >
                            {isMigrating ? "Migrating..." : "Run Database Migration"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border-t border-[var(--border)] pt-2">
                <KeybindingManager />
            </div>
        </div>
    );
}
