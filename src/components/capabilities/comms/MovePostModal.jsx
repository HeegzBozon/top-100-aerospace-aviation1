import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MoveRight, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MovePostModal({ open, onClose, onConfirm, postCount }) {
    const [selectedChannelId, setSelectedChannelId] = useState("");

    const { data: channels = [], isLoading } = useQuery({
        queryKey: ["all-channels"],
        queryFn: () => base44.entities.Conversation.filter({ type: 'channel' }, 'order', 500),
        enabled: open,
    });

    const handleConfirm = () => {
        if (selectedChannelId) {
            onConfirm(selectedChannelId);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MoveRight className="w-5 h-5 text-orange-500" />
                        Move {postCount > 1 ? `${postCount} Posts` : "Post"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-gray-500 mb-4">
                        Select the destination channel to move the {postCount > 1 ? "selected posts" : "content"} to.
                    </p>
                    {isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                    ) : (
                        <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a channel..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {channels.map(ch => (
                                    <SelectItem key={ch.id} value={ch.id}>
                                        {ch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!selectedChannelId || isLoading} className="bg-[#1e3a5a] text-white hover:bg-[#2d5075]">
                        Confirm Move
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
