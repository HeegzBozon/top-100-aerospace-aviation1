import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User, Hash, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { User as UserEntity } from "@/entities/User";

export default function NewConversationModal({ 
  open, 
  onClose, 
  onCreateDM, 
  onCreateChannel,
  currentUserEmail 
}) {
  const [tab, setTab] = useState("dm");
  const [search, setSearch] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-for-comms"],
    queryFn: () => UserEntity.list(),
  });

  const filteredUsers = users.filter(u => 
    u.email !== currentUserEmail &&
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelectUser = async (user) => {
    setCreating(true);
    await onCreateDM(user.email);
    setCreating(false);
    onClose();
  };

  const handleCreateChannel = async () => {
    if (!channelName.trim()) return;
    setCreating(true);
    await onCreateChannel({
      name: channelName.trim(),
      description: channelDescription.trim(),
      is_private: isPrivate
    });
    setCreating(false);
    setChannelName("");
    setChannelDescription("");
    setIsPrivate(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--card)] border-[var(--border)] text-[var(--text)] max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-2 bg-[var(--border)]">
            <TabsTrigger value="dm" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" /> Direct Message
            </TabsTrigger>
            <TabsTrigger value="channel" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white">
              <Hash className="w-4 h-4 mr-2" /> Channel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dm" className="mt-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="pl-10 bg-[var(--bg)] border-[var(--border)]"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
                </div>
              )}
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  disabled={creating}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--border)] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-[var(--accent)]">
                        {user.full_name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{user.full_name || user.email}</div>
                    {user.full_name && <div className="text-xs text-[var(--muted)]">{user.email}</div>}
                  </div>
                </button>
              ))}
              {!isLoading && filteredUsers.length === 0 && (
                <div className="text-center py-8 text-[var(--muted)] text-sm">
                  No members found
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="channel" className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Channel Name</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <Input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="general"
                  className="pl-10 bg-[var(--bg)] border-[var(--border)]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description (optional)</label>
              <Input
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                placeholder="What's this channel about?"
                className="bg-[var(--bg)] border-[var(--border)]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Private Channel</div>
                <div className="text-xs text-[var(--muted)]">Only invited members can see</div>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>
            <Button 
              onClick={handleCreateChannel} 
              disabled={!channelName.trim() || creating}
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Channel
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}