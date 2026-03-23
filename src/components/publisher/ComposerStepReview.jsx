import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RefreshCw, Check, Send, Wand2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { PLATFORM_CONFIG } from "./publisherConfig";

const JJJH_COLORS = {
  Jab:  "bg-blue-50 text-blue-600 border border-blue-100",
  Hook: "bg-amber-50 text-amber-700 border border-amber-200",
};

const AIDA_COLORS = {
  Attention: "bg-rose-50 text-rose-600",
  Interest:  "bg-sky-50 text-sky-600",
  Desire:    "bg-violet-50 text-violet-600",
  Action:    "bg-emerald-50 text-emerald-700",
};

export default function ComposerStepReview({ posts: initialPosts, context, userEmail, onBack, onDone }) {
  const [posts, setPosts] = useState(initialPosts.map(p => ({ ...p, approved: false })));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [regenerating, setRegenerating] = useState(false);

  const currentPost = posts[currentIdx];
  const approvedCount = posts.filter(p => p.approved).length;
  const charLimit = PLATFORM_CONFIG[context.platform]?.maxChars || 3000;
  const isOverLimit = (currentPost?.content?.length || 0) > charLimit;

  const updateContent = (val) => {
    setPosts(prev => prev.map((p, i) => i === currentIdx ? { ...p, content: val } : p));
  };

  const toggleApprove = () => {
    setPosts(prev => prev.map((p, i) => i === currentIdx ? { ...p, approved: !p.approved } : p));
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    const post = posts[currentIdx];
    const prompt = `Rewrite this social media post for ${context.platform}.

Current version:
${post.content}

Strategic role: ${post.hero_step} | ${post.jjjh} | AIDA: ${post.aida}
Objective: ${context.objective || 'Build authority'}
Title: ${context.title}

Write a fresh version. Keep the same strategic intent. Max ${charLimit} characters. Return ONLY the post text, no explanation.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({ prompt, model: 'claude_sonnet_4_6' });
      setPosts(prev => prev.map((p, i) =>
        i === currentIdx ? { ...p, content: typeof result === 'string' ? result : result?.text || result?.content || post.content, approved: false } : p
      ));
    } catch (e) {
      console.error("Regenerate failed", e);
    } finally {
      setRegenerating(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const approved = posts.filter(p => p.approved);
      return Promise.all(approved.map(p =>
        base44.entities.ScheduledPost.create({
          user_email: userEmail,
          content: p.content,
          channel_ids: context.selectedChannelIds,
          media_urls: [],
          media_type: "text",
          status: "draft",
          scheduled_at: null,
          notes: `[Script Builder] Slot ${p.slot}: ${p.hero_step} | ${p.jjjh} | AIDA: ${p.aida}\n\nObjective: ${context.objective || ''}\n\nSource: ${context.title}\n\nStrategic intent: ${p.notes || ''}`,
          tags: ["script-builder", p.jjjh.toLowerCase(), p.aida.toLowerCase()],
        })
      ));
    },
    onSuccess: (results) => onDone(results),
  });

  if (!currentPost) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Post {currentIdx + 1} of {posts.length}</span>
          <span className="font-medium text-indigo-600">{approvedCount} approved</span>
        </div>
        <div className="flex gap-1">
          {posts.map((p, i) => (
            <div key={i} onClick={() => setCurrentIdx(i)}
              className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${p.approved ? "bg-emerald-400" : i === currentIdx ? "bg-indigo-500" : "bg-slate-200"}`}
              title={`Post ${i + 1}: ${p.hero_step}`} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`text-xs ${JJJH_COLORS[currentPost.jjjh] || ""}`}>{currentPost.jjjh}</Badge>
        <Badge className={`text-xs ${AIDA_COLORS[currentPost.aida] || ""}`}>{currentPost.aida}</Badge>
        <span className="text-xs text-slate-500 font-medium">{currentPost.hero_step}</span>
        <span className={`ml-auto text-xs font-mono ${isOverLimit ? "text-red-500 font-bold" : "text-slate-400"}`}>
          {currentPost.content.length} / {charLimit}{isOverLimit && <span className="ml-1">⚠ over limit</span>}
        </span>
      </div>

      {currentPost.hook_line && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-amber-700 mb-0.5">Hook line (scroll-stopper)</p>
          <p className="text-sm text-amber-800 italic">{currentPost.hook_line}</p>
        </div>
      )}

      <Textarea value={currentPost.content} onChange={e => updateContent(e.target.value)}
        className={`min-h-[180px] resize-none text-sm ${isOverLimit ? "border-red-300 focus:ring-red-400" : ""}`}
        aria-label="Post content" />

      {currentPost.notes && (
        <p className="text-xs text-slate-400 italic border-l-2 border-slate-200 pl-3">{currentPost.notes}</p>
      )}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={regenerating} className="gap-1.5 min-h-[44px]" aria-label="Regenerate post with AI">
          {regenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
          Rewrite
        </Button>
        <Button variant={currentPost.approved ? "default" : "outline"} size="sm" onClick={toggleApprove} disabled={isOverLimit}
          className={`gap-1.5 min-h-[44px] ml-auto ${currentPost.approved ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}>
          <Check className="w-3.5 h-3.5" />
          {currentPost.approved ? "Approved" : "Approve"}
        </Button>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button variant="ghost" size="sm" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} className="gap-1 min-h-[44px]">
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>
        <span className="text-xs text-slate-400">{currentPost.hero_step}</span>
        <Button variant="ghost" size="sm" onClick={() => setCurrentIdx(i => Math.min(posts.length - 1, i + 1))} disabled={currentIdx === posts.length - 1} className="gap-1 min-h-[44px]">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
        <Button variant="outline" onClick={onBack} className="min-h-[44px]">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button onClick={() => saveMutation.mutate()} disabled={approvedCount === 0 || saveMutation.isPending}
          className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 min-h-[44px]">
          <Send className="w-4 h-4" />
          {saveMutation.isPending ? "Saving…" : `Save ${approvedCount} Post${approvedCount !== 1 ? "s" : ""} as Drafts`}
        </Button>
      </div>

      {approvedCount === 0 && <p className="text-xs text-slate-400 text-center">Approve at least one post to save.</p>}
    </div>
  );
}