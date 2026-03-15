import React, { useEffect, useRef, useState, useCallback } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { Send, Smile, MoreHorizontal, Pencil, Trash2, MessageSquare, X, Check, BarChart3, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Code, AtSign, CheckSquare, Plus, AudioLines, CalendarPlus, Hand, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactQuill from "react-quill";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PollCard from "./PollCard";
import CreatePollModal from "./CreatePollModal";
import MentionPopover from "./MentionPopover";
import CrpStepPickerButton from "./CrpStepPickerButton";
import ConstellationBackground from "./ConstellationBackground";
import { useCommsTheme } from "@/components/contexts/CommsThemeContext";
import { useTodos } from "./ConversationTodoPanel";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👀"];



// Date chip component
function DateChip({ date }) {
  const d = new Date(date);
  let label;
  if (isToday(d)) {
    label = "Today";
  } else if (isYesterday(d)) {
    label = "Yesterday";
  } else {
    label = format(d, "EEEE, MMMM do");
  }

  return (
    <div className="flex items-center justify-center my-6" role="presentation" aria-label={`Messages from ${label}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c9a87c]/20 to-transparent" />
      <div className="px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 mx-4 border border-[#c9a87c]/20 bg-[#c9a87c]/8 text-[#c9a87c]/60">
        {label}
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c9a87c]/20 to-transparent" />
    </div>
  );
}

function MessageBubble({ message, isOwn, showAvatar, currentUserEmail, onReact, onEdit, onDelete, onReply, replies = [], isThread = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReplies, setShowReplies] = useState(false);
  const [isReacted, setIsReacted] = useState(false);

  const initials = message.sender_name?.slice(0, 2).toUpperCase() ||
    message.sender_email?.slice(0, 2).toUpperCase() || "??";

  const reactions = message.reactions || {};
  const reactionEntries = Object.entries(reactions).filter(([, users]) => users?.length > 0);
  const rrf_stage = message.rrf_stage;
  const rrf_message_type = message.rrf_message_type;
  const crp_step = message.crp_step;

  // RRF Stage color mapping (aligned with brand palette)
   const stageColors = {
     FORM: { bg: 'bg-indigo-600/20', border: 'border-indigo-600/40', text: 'text-indigo-300', dot: 'bg-indigo-500' },
     STORM: { bg: 'bg-amber-600/20', border: 'border-amber-600/40', text: 'text-amber-300', dot: 'bg-amber-500' },
     NORM: { bg: 'bg-rose-600/20', border: 'border-rose-600/40', text: 'text-rose-300', dot: 'bg-rose-500' },
     PERFORM: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-200', dot: 'bg-amber-400' },
   };
  const stageStyle = stageColors[rrf_stage] || stageColors.FORM;

  const toggleReaction = (emoji) => {
    const current = reactions[emoji] || [];
    const hasReacted = current.includes(currentUserEmail);
    const updated = hasReacted
      ? current.filter(e => e !== currentUserEmail)
      : [...current, currentUserEmail];
    onReact(message.id, { ...reactions, [emoji]: updated });
  };

  const handleSaveEdit = () => {
    if (editContent.replace(/<[^>]*>/g, '').trim()) {
      onEdit(message.id, editContent);
      setIsEditing(false);
    }
  };

  return (
    <div className={cn("flex gap-3 group", isOwn && "flex-row-reverse", isThread && "ml-12", "animate-in fade-in duration-300")}>
      {showAvatar ? (
        <div 
          className={cn(
            "rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border transition-all duration-300",
            isThread ? "w-7 h-7" : "w-10 h-10",
            rrf_stage && `${stageStyle.bg} ${stageStyle.border}`
          )}
          aria-label={`${message.sender_name || message.sender_email}'s avatar`}
        >
          {message.sender_avatar ? (
            <img src={message.sender_avatar} className={cn("rounded-lg object-cover", isThread ? "w-7 h-7" : "w-10 h-10")} alt={message.sender_name || message.sender_email} />
          ) : (
            <span className={cn("transition-colors", rrf_stage ? stageStyle.text : "text-gray-300")}>{initials}</span>
          )}
        </div>
      ) : (
        <div className={cn("shrink-0", isThread ? "w-7" : "w-10")} aria-hidden="true" />
      )}
      <div className={cn("flex flex-col max-w-[75%]", isOwn && "items-end")}>
        {showAvatar && (
          <div className={cn("flex items-center gap-2 mb-2 text-xs truncate", isOwn && "flex-row-reverse")}>
            {rrf_stage && (
              <span className={cn("font-bold uppercase tracking-wider shrink-0", stageStyle.text)}>
                • {rrf_stage}
              </span>
            )}
            {rrf_message_type && (
              <span className="text-gray-500 text-[11px] shrink-0">• {rrf_message_type}</span>
            )}
            {crp_step && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/15 border border-amber-400/30 text-amber-300 shrink-0">
                &#9670; {crp_step}
              </span>
            )}
            <span className="text-gray-500 shrink-0">
              {format(new Date(message.created_date), "h:mm a")}
            </span>
            {message.is_edited && (
              <span className="text-gray-600 italic shrink-0">(edited)</span>
            )}
          </div>
        )}
        <div className="relative">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <ReactQuill
                value={editContent}
                onChange={setEditContent}
                modules={{ toolbar: [['bold', 'italic'], ['link']] }}
                className="bg-white rounded-lg border border-[var(--border)] [&_.ql-toolbar]:border-b [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[40px]"
              />
              <div className="flex gap-1 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="w-3 h-3" />
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className={cn(
                "rounded-lg px-4 py-2.5 text-sm shadow-sm transition-all duration-300 group-hover:shadow-lg",
                isOwn
                  ? "bg-gray-800/60 border border-gray-700/40 text-gray-100 rounded-tr-none"
                  : rrf_stage 
                    ? `${stageStyle.bg} ${stageStyle.border} border text-gray-100 rounded-bl-none`
                    : "bg-gray-800/60 border border-gray-700/40 text-gray-100 rounded-bl-none"
              )}>
                {message.message_type === "image" && message.file_url && (
                  <img src={message.file_url} className="max-w-full rounded-lg mb-2" alt="Message image" />
                )}
                <div
                  className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0"
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>

              {/* Actions bar on hover - Apple-style */}
              <div className={cn(
                "absolute -top-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-95 origin-bottom",
                "bg-gradient-to-r from-gray-900/95 to-gray-800/95 border border-gray-700/80 rounded-lg shadow-xl backdrop-blur-md p-1",
                isOwn ? "left-0" : "right-0"
              )}>
                <Popover>
                   <PopoverTrigger asChild>
                     <button 
                       className="p-1.5 rounded transition-all duration-200 hover:bg-gray-700/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 hover:scale-110 active:scale-95"
                       aria-label="Add reaction"
                     >
                       <Smile className="w-3 h-3 text-gray-400 hover:text-amber-300 transition-colors" />
                     </button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-2 bg-gradient-to-br from-gray-900 to-gray-950 border-gray-700/50 backdrop-blur-md shadow-xl" side="top">
                     <div className="flex gap-1">
                       {REACTION_EMOJIS.map(emoji => (
                         <button
                           key={emoji}
                           onClick={() => toggleReaction(emoji)}
                           className="hover:bg-gray-800 rounded p-1 text-lg transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                           aria-label={`React with ${emoji}`}
                         >
                           {emoji}
                         </button>
                       ))}
                     </div>
                   </PopoverContent>
                 </Popover>

                 {!isThread && (
                   <button
                     className="p-1.5 rounded transition-all duration-200 hover:bg-gray-700/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 hover:scale-110 active:scale-95"
                     onClick={() => onReply?.(message)}
                     aria-label="Reply to message"
                   >
                     <MessageSquare className="w-3 h-3 text-gray-400 hover:text-amber-300" />
                   </button>
                 )}

                 {isOwn && (
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <button 
                         className="p-1.5 hover:bg-gray-800/80 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                         aria-label="Message options"
                       >
                         <MoreHorizontal className="w-3 h-3 text-gray-400 hover:text-amber-300" />
                       </button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                       <DropdownMenuItem 
                         onClick={() => { setEditContent(message.content); setIsEditing(true); }}
                         className="text-gray-100 focus:bg-gray-800"
                       >
                         <Pencil className="w-3 h-3 mr-2" /> Edit
                       </DropdownMenuItem>
                       <DropdownMenuItem
                         className="text-red-400 focus:bg-red-900/30"
                         onClick={() => confirm("Delete this message?") && onDelete?.(message.id)}
                       >
                         <Trash2 className="w-3 h-3 mr-2" /> Delete
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 )}
               </div>
             </>
            )}
        </div>

        {/* Reactions display */}
        {reactionEntries.length > 0 && (
           <div className={cn("flex flex-wrap gap-1 mt-1 animate-in fade-in duration-200", isOwn && "justify-end")}>
             {reactionEntries.map(([emoji, users]) => (
               <button
                 key={emoji}
                 onClick={() => {
                   toggleReaction(emoji);
                   setIsReacted(true);
                   setTimeout(() => setIsReacted(false), 200);
                 }}
                 className={cn(
                   "flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 hover:scale-110 active:scale-95",
                   users.includes(currentUserEmail)
                     ? "bg-gradient-to-r from-amber-500/30 to-amber-600/20 border-amber-500/60 text-amber-100 shadow-lg shadow-amber-500/10"
                     : "bg-gray-900/50 border-gray-700/50 text-gray-300 hover:bg-gray-800/70 hover:border-gray-600"
                 )}
                 aria-label={`${users.length} reaction${users.length !== 1 ? 's' : ''} with ${emoji}`}
               >
                 <span aria-hidden="true" className={cn("transition-transform duration-200", isReacted && "scale-125")}>
                   {emoji}
                 </span>
                 <span>{users.length}</span>
               </button>
             ))}
           </div>
         )}

        {/* Replies section */}
        {!isThread && replies.length > 0 && (
           <button
             onClick={() => setShowReplies(!showReplies)}
             className="text-xs text-amber-300 mt-1 hover:text-amber-200 flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded px-2 py-1 transition-all duration-200 hover:bg-gray-800/40 hover:scale-105 active:scale-95"
             aria-expanded={showReplies}
             aria-label={`${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
           >
             <MessageSquare className={cn("w-3 h-3 transition-transform duration-300", showReplies && "rotate-180")} aria-hidden="true" />
             {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
           </button>
         )}
        {showReplies && replies.map((reply, idx) => (
          <MessageBubble
            key={reply.id}
            message={reply}
            isOwn={reply.sender_email === currentUserEmail}
            showAvatar={idx === 0 || replies[idx - 1]?.sender_email !== reply.sender_email}
            currentUserEmail={currentUserEmail}
            onReact={onReact}
            onEdit={onEdit}
            onDelete={onDelete}
            isThread
          />
        ))}
      </div>
    </div>
  );
}

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ]
};

const quillFormats = ['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'code-block', 'color'];

export default function MessageThread({
  messages,
  currentUserEmail,
  currentUserRole,
  isReadonly,
  onSendMessage,
  onReactToMessage,
  onEditMessage,
  onDeleteMessage,
  polls = [],
  onCreatePoll,
  onVotePoll,
  onClosePoll,
  isPollChannel = false,
  isLoading,
  conversationId,
  isPerry = false,
  defaultCrpStep = null,
}) {
  const { mode, theme } = useCommsTheme();
  const canPost = !isReadonly || currentUserRole === 'admin';
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [activeCrpStep, setActiveCrpStep] = useState(defaultCrpStep);
  const [showTodos, setShowTodos] = useState(false);
  const { todos, addTodo, toggleTodo, deleteTodo, pendingCount } = useTodos(conversationId);
  const [todoDraft, setTodoDraft] = useState("");
  const [isComposerCollapsed, setIsComposerCollapsed] = useState(false);
  const [textareaActive, setTextareaActive] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const quillRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const lastScrollTop = useRef(0);



  // Handle mention insertion
  const handleMentionSelect = (user) => {
    const mention = `@${user.full_name || user.email?.split('@')[0]} `;
    setNewMessage(prev => {
      const lastAt = prev.lastIndexOf('@');
      return lastAt >= 0 ? prev.slice(0, lastAt) + mention : prev + mention;
    });
    setShowMentionPopover(false);
    setMentionQuery("");
    quillRef.current?.focus();
  };

  // Handle @ detection for textarea
  const handleTextChange = useCallback((text) => {
    setNewMessage(text);
    const lastAt = text.lastIndexOf('@');
    const lastSpace = text.lastIndexOf(' ');
    if (lastAt > lastSpace && lastAt >= 0) {
      const query = text.slice(lastAt + 1);
      if (!query.includes('\n')) {
        setMentionQuery(query);
        setShowMentionPopover(true);
        return;
      }
    }
    setShowMentionPopover(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Collapse composer on scroll and blur textarea to dismiss iOS keyboard
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const st = el.scrollTop;
      if (Math.abs(st - lastScrollTop.current) > 10) {
        setIsComposerCollapsed(true);
        quillRef.current?.blur();
      }
      lastScrollTop.current = st;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Blur textarea when composer collapses to prevent iOS keyboard from staying open
  useEffect(() => {
    if (isComposerCollapsed) {
      quillRef.current?.blur();
      setTextareaActive(false);
    }
  }, [isComposerCollapsed]);

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text) return;
    onSendMessage(text, replyingTo?.id, null, activeCrpStep);
    setNewMessage("");
    setReplyingTo(null);
    setActiveCrpStep(null);
  };

  const stageTemplates = {
    FORM: [
      { label: 'Note to Self', template: 'Note to self: ' },
      { label: 'Save Insight', template: 'Insight: ' },
      { label: 'Flag for Follow-up', template: 'Follow-up: ' }
    ],
    STORM: [
      { label: 'Re-engage', template: 'Re-engaging: ' },
      { label: 'Ask Question', template: 'Question: ' },
      { label: 'Research Note', template: 'Research: ' }
    ],
    NORM: [
      { label: 'Propose', template: 'Proposal: ' },
      { label: 'Collaborate', template: 'Let\'s collaborate on: ' },
      { label: 'Draft Agreement', template: 'Draft: ' }
    ],
    PERFORM: [
      { label: 'Send Pitch', template: 'Pitch: ' },
      { label: 'Request Commitment', template: 'Commitment: ' },
      { label: 'Close Loop', template: 'Closing: ' }
    ]
  };

  const handleQuickAction = (template) => {
    setNewMessage(prev => prev + template);
    setTimeout(() => quillRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendDirectMessage = (type) => {
    const messages = { wave: '👋', nudge: '💬 nudge', poke: '🚀 poke' };
    onSendMessage(messages[type]);
  };

  // Separate root messages and replies
  const rootMessages = messages.filter(m => !m.parent_id);
  const repliesMap = messages.reduce((acc, m) => {
    if (m.parent_id) {
      acc[m.parent_id] = acc[m.parent_id] || [];
      acc[m.parent_id].push(m);
    }
    return acc;
  }, {});

  // Group messages by sender for avatar display
  const shouldShowAvatar = (msg, idx, list) => {
    if (idx === 0) return true;
    const prevMsg = list[idx - 1];
    return prevMsg.sender_email !== msg.sender_email;
  };

  return (
    <form className="relative flex flex-col h-full overflow-hidden" style={{ background: theme.bg }} onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
      {theme.constellations && <ConstellationBackground />}
      {/* Skip to main content link */}
      <a href="#message-input" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-amber-600 focus:text-white focus:px-4 focus:py-2">
        Skip to message input
      </a>

      {/* Messages - flex-1 so it fills remaining space; composer is below in normal flow */}
      <div ref={scrollContainerRef} className="relative z-10 flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4" role="log" aria-live="polite" aria-label="Message feed" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gray-900/50 border border-gray-700">
              <MessageSquare className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-gray-300 text-sm font-medium">No messages yet</p>
            <p className="text-gray-500 text-xs mt-1">Start the conversation!</p>
          </div>
        )}
        {/* Render polls for poll channels */}
        {isPollChannel && polls.map(poll => (
          <PollCard
            key={poll.id}
            poll={poll}
            currentUserEmail={currentUserEmail}
            onVote={onVotePoll}
            onClose={onClosePoll}
          />
        ))}

        {rootMessages.map((msg, idx) => {
          if (typeof document !== 'undefined') {
            const style = document.createElement('style');
            style.textContent = '.no-scrollbar::-webkit-scrollbar { display: none; }';
            if (!document.head.querySelector('[data-scrollbar-hidden]')) {
              style.setAttribute('data-scrollbar-hidden', 'true');
              document.head.appendChild(style);
            }
          }
          // Check if we need to show a date chip
          const msgDate = new Date(msg.created_date);
          const prevMsg = rootMessages[idx - 1];
          const showDateChip = idx === 0 || (prevMsg && !isSameDay(new Date(prevMsg.created_date), msgDate));

          return (
            <React.Fragment key={msg.id}>
              {showDateChip && <DateChip date={msg.created_date} />}
              <MessageBubble
                message={msg}
                isOwn={msg.sender_email === currentUserEmail}
                showAvatar={shouldShowAvatar(msg, idx, rootMessages)}
                currentUserEmail={currentUserEmail}
                onReact={onReactToMessage}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
                onReply={setReplyingTo}
                replies={repliesMap[msg.id] || []}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>



      {/* Message Composer */}
      <div className="relative z-10 shrink-0 mx-2 mb-[calc(env(safe-area-inset-bottom,0px)+30px)] sm:mx-4 sm:mb-4">

        {/* ── iMessage-style composer row — + pill always visible ── */}
        {canPost && isComposerCollapsed && (
          <div className="flex items-center gap-2 pb-3">
            {/* + button — iMessage-style popover */}
            <Popover open={showPlusMenu} onOpenChange={setShowPlusMenu}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="More options"
                  aria-expanded={showPlusMenu}
                  className="w-11 h-11 shrink-0 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center hover:bg-gray-700 active:scale-95 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
                >
                  <Plus className={cn("w-5 h-5 text-white/80 transition-transform duration-200", showPlusMenu && "rotate-45")} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-64 p-0 bg-gray-900/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
                sideOffset={10}
              >
                <div className="py-2" role="menu" aria-label="Composer options">
                  {/* Action Items */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setShowPlusMenu(false); setIsComposerCollapsed(false); setShowTodos(true); }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/8 active:bg-white/12 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                      <CheckSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Action Items</p>
                      <p className="text-xs text-white/40">Manage todos for this chat</p>
                    </div>
                    {pendingCount > 0 && (
                      <span className="ml-auto text-xs font-bold bg-emerald-500 text-white rounded-full px-2 py-0.5 tabular-nums">{pendingCount}</span>
                    )}
                  </button>

                  <div className="mx-4 h-px bg-white/8" />

                  {/* Schedule */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setShowPlusMenu(false); setIsComposerCollapsed(false); }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/8 active:bg-white/12 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <CalendarPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Schedule</p>
                      <p className="text-xs text-white/40">Set a reminder or meeting</p>
                    </div>
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Pill input */}
            <button
              type="button"
              aria-label="Tap to compose message"
              onClick={() => setIsComposerCollapsed(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsComposerCollapsed(false); }}
              className="flex-1 flex items-center justify-between h-11 px-4 rounded-full bg-gray-800 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 cursor-text"
            >
              <span className="text-sm text-gray-500 select-none">Message…</span>
              <AudioLines className="w-4 h-4 text-gray-500 shrink-0" />
            </button>
          </div>
        )}

        {/* ── Expanded Slack-style composer ── */}
        {canPost && !isComposerCollapsed && (
          <div className="rounded-2xl bg-[#1a1d21] border border-white/10 overflow-hidden">
            {/* Reply banner */}
            {replyingTo && (
              <div className="flex items-center gap-2 text-xs px-3 py-2 border-b border-white/8 bg-white/5 text-gray-400">
                <MessageSquare className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>Replying to <strong className="text-gray-200">{replyingTo.sender_name || replyingTo.sender_email?.split("@")[0]}</strong></span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="ml-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-white/10 transition-colors active:scale-95"
                  aria-label="Cancel reply"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Inline Todo Panel */}
            {showTodos && (
              <div className="border-b border-white/8">
                <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-500/15">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300/70">Action Items</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 tabular-nums">{pendingCount}</span>
                    )}
                  </div>
                  <button type="button" onClick={() => setShowTodos(false)} className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded hover:bg-white/10 transition-colors" aria-label="Close action items">
                    <X className="w-3.5 h-3.5 text-white/40" />
                  </button>
                </div>
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={todoDraft}
                      onChange={e => setTodoDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTodo(todoDraft); setTodoDraft(""); } }}
                      placeholder="Add an action item…"
                      className="flex-1 min-h-[40px] px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                    <button type="button" onClick={() => { addTodo(todoDraft); setTodoDraft(""); }} disabled={!todoDraft.trim()} className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-30 transition-all active:scale-95">
                      <CheckSquare className="w-4 h-4 text-emerald-300" />
                    </button>
                  </div>
                  {todos.length > 0 && (
                    <ul className="space-y-1 max-h-36 overflow-y-auto scrollbar-hide">
                      {todos.map(todo => (
                        <li key={todo.id} className="flex items-center gap-2 group/item">
                          <button type="button" onClick={() => toggleTodo(todo.id)} className="shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center rounded hover:bg-white/5 active:scale-95">
                            {todo.done ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-3.5 h-3.5 rounded border border-white/25 block" />}
                          </button>
                          <span className={cn("flex-1 text-xs leading-snug", todo.done ? "line-through text-white/25" : "text-white/65")}>{todo.text}</span>
                          <button type="button" onClick={() => deleteTodo(todo.id)} className="shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center rounded opacity-0 group-hover/item:opacity-100 hover:bg-red-500/15 transition-all active:scale-95">
                            <Trash2 className="w-3 h-3 text-red-400/60" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Text input area — native textarea to suppress iOS accessory bar */}
            <div className="relative">
              <label htmlFor="message-input" className="sr-only">
                Message input. {replyingTo ? `Replying to ${replyingTo.sender_name || replyingTo.sender_email?.split('@')[0]}. P` : 'P'}ress Enter to send, Shift+Enter for new line.
              </label>
              <textarea
                ref={quillRef}
                id="message-input"
                value={newMessage}
                onChange={e => handleTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={() => setTextareaActive(true)}
                readOnly={!textareaActive}
                placeholder={replyingTo ? "Write a reply..." : "Message…"}
                rows={1}
                inputMode={textareaActive ? "text" : "none"}
                enterKeyHint="send"
                autoCorrect="off"
                autoCapitalize="sentences"
                autoComplete="off"
                spellCheck={false}
                className="w-full min-h-[52px] max-h-[160px] resize-none overflow-auto bg-transparent px-4 py-3.5 text-base text-gray-100 placeholder-gray-500 focus:outline-none cursor-text"
              />
              <MentionPopover
                isOpen={showMentionPopover}
                searchQuery={mentionQuery}
                onSelect={handleMentionSelect}
                currentUserEmail={currentUserEmail}
              />
            </div>

            {/* Bottom toolbar — Slack style */}
            <div className="flex items-center px-2 py-1.5 gap-1" role="toolbar" aria-label="Message actions">
              {/* + button */}
              <Popover open={showPlusMenu} onOpenChange={setShowPlusMenu}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="More options"
                    aria-expanded={showPlusMenu}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
                  >
                    <Plus className={cn("w-5 h-5 transition-transform duration-200", showPlusMenu && "rotate-45")} />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  className="w-64 p-0 bg-gray-900/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
                  sideOffset={8}
                >
                  <div className="py-2" role="menu" aria-label="Composer options">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setShowPlusMenu(false); setShowTodos(true); }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/8 active:bg-white/12 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                        <CheckSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Action Items</p>
                        <p className="text-xs text-white/40">Manage todos for this chat</p>
                      </div>
                      {pendingCount > 0 && (
                        <span className="ml-auto text-xs font-bold bg-emerald-500 text-white rounded-full px-2 py-0.5 tabular-nums">{pendingCount}</span>
                      )}
                    </button>
                    <div className="mx-4 h-px bg-white/8" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => setShowPlusMenu(false)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/8 active:bg-white/12 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <CalendarPlus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Schedule</p>
                        <p className="text-xs text-white/40">Set a reminder or meeting</p>
                      </div>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Formatting toggle */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Text formatting"
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30 text-sm font-semibold"
                  >
                    Aa
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-auto p-2 bg-gray-900 border border-white/10 rounded-xl shadow-xl">
                  <div className="flex items-center gap-0.5">
                    {[
                      { format: 'bold', Icon: Bold, label: 'Bold' },
                      { format: 'italic', Icon: Italic, label: 'Italic' },
                      { format: 'underline', Icon: Underline, label: 'Underline' },
                      { format: 'strike', Icon: Strikethrough, label: 'Strikethrough' },
                    ].map(({ format, Icon, label }) => (
                      <button
                        key={format}
                        type="button"
                        aria-label={label}
                        aria-pressed={!!activeFormats[format]}
                        onClick={() => { quillRef.current?.getEditor().format(format, !activeFormats[format]); updateActiveFormats(); }}
                        className={cn("min-w-[36px] min-h-[36px] flex items-center justify-center rounded transition-all active:scale-95", activeFormats[format] ? "bg-white/20 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white")}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </button>
                    ))}
                    <div className="w-px h-5 mx-1 bg-white/10" />
                    {[
                      { format: 'list', value: 'ordered', Icon: ListOrdered, label: 'Ordered list' },
                      { format: 'list', value: 'bullet', Icon: List, label: 'Bullet list' },
                      { format: 'code-block', value: true, Icon: Code, label: 'Code block' },
                    ].map(({ format, value, Icon, label }) => (
                      <button
                        key={label}
                        type="button"
                        aria-label={label}
                        onClick={() => { quillRef.current?.getEditor().format(format, activeFormats[format] === value ? false : value); updateActiveFormats(); }}
                        className={cn("min-w-[36px] min-h-[36px] flex items-center justify-center rounded transition-all active:scale-95", activeFormats[format] === value ? "bg-white/20 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white")}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* @ mention */}
              <button
                type="button"
                aria-label="Mention someone"
                onClick={() => {
                  setTextareaActive(true);
                  setNewMessage(prev => prev + '@');
                  setShowMentionPopover(true);
                  setMentionQuery("");
                  setTimeout(() => quillRef.current?.focus(), 0);
                }}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
              >
                <AtSign className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Poll button (poll channels only) */}
              {isPollChannel && (
                <button
                  type="button"
                  aria-label="Create poll"
                  onClick={() => setShowPollModal(true)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
                >
                  <BarChart3 className="w-5 h-5" aria-hidden="true" />
                </button>
              )}

              {/* Wave / Nudge / Poke */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Send a wave, nudge, or poke"
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
                  >
                    <Hand className="w-5 h-5" aria-hidden="true" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-auto p-1.5 bg-gray-900 border border-white/10 rounded-xl shadow-xl">
                  <div className="flex items-center gap-1">
                    {[
                      { type: 'wave', label: 'Wave 👋', icon: Hand },
                      { type: 'nudge', label: 'Nudge 💬', icon: Zap },
                      { type: 'poke', label: 'Poke 🚀', icon: Rocket },
                    ].map(({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => sendDirectMessage(type)}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 text-xs font-medium"
                        aria-label={label}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Send button — right-aligned */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!newMessage.trim() || isLoading}
                aria-label="Send message"
                className="ml-auto min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
              >
                <Send className={cn("w-5 h-5 transition-transform duration-200", newMessage.trim() ? "text-white" : "", isLoading && "animate-spin")} aria-hidden="true" />
              </button>
            </div>

            {/* Poll Creation Modal */}
            <CreatePollModal
              open={showPollModal}
              onClose={() => setShowPollModal(false)}
              onCreate={onCreatePoll}
            />
          </div>
        )}

                {!canPost && (
                <div
                className="text-center py-3 text-sm rounded-lg bg-amber-600/20 border border-amber-600/40 text-amber-100"
                role="status"
                aria-label="Read-only channel"
                >
                📢 This is a read-only announcements channel
                </div>
                )}
                </div>
                </form>
                );
                }