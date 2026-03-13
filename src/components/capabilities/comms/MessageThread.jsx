import React, { useEffect, useRef, useState, useCallback } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { Send, Smile, MoreHorizontal, Pencil, Trash2, MessageSquare, X, Check, BarChart3, Bold, Italic, Underline, Strikethrough, Link2, List, ListOrdered, Code, AtSign, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ReactQuill from "react-quill";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PollCard from "./PollCard";
import CreatePollModal from "./CreatePollModal";
import MentionPopover from "./MentionPopover";
import RRFStageSelector from "@/components/epics/05-rapid-response-cells/rrf/RRFStageSelector";
import RRFQuickActions from "@/components/epics/05-rapid-response-cells/rrf/RRFQuickActions";
import RRFMessageTag from "@/components/epics/05-rapid-response-cells/rrf/RRFMessageTag";
import CrpStepPickerButton from "./CrpStepPickerButton";

import { brandColors } from "@/components/core/brandColors";

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
       <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201, 168, 124, 0.2), transparent)' }} />
       <div
         className="px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 mx-4 border"
         style={{ background: 'rgba(201, 168, 124, 0.08)', borderColor: 'rgba(201, 168, 124, 0.2)', color: 'rgba(201, 168, 124, 0.6)' }}
       >
         {label}
       </div>
       <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201, 168, 124, 0.2), transparent)' }} />
     </div>
   );
}

function MessageBubble({ message, isOwn, showAvatar, currentUserEmail, onReact, onEdit, onDelete, onReply, replies = [], isThread = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReplies, setShowReplies] = useState(false);
  const [isReacted, setIsReacted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
                ◆ {crp_step}
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
                         onClick={() => setShowDeleteDialog(true)}
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

      {/* Accessible delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete message?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => onDelete?.(message.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  const canPost = !isReadonly || currentUserRole === 'admin';
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [activeFormats, setActiveFormats] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [rrfStage, setRRFStage] = useState('FORM');
  const [activeCrpStep, setActiveCrpStep] = useState(defaultCrpStep);
  const messagesEndRef = useRef(null);
  const quillRef = useRef(null);

  // Track formatting state
  const updateActiveFormats = useCallback(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const format = editor.getFormat();
      setActiveFormats(format);
    }
  }, []);

  // Handle mention insertion
  const handleMentionSelect = (user) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      // Find and delete the @ and any text after it
      const text = editor.getText();
      const beforeCursor = text.slice(0, range.index);
      const lastAtIndex = beforeCursor.lastIndexOf('@');
      if (lastAtIndex >= 0) {
        editor.deleteText(lastAtIndex, range.index - lastAtIndex);
        editor.insertText(lastAtIndex, `@${user.full_name || user.email?.split('@')[0]} `, { bold: true, color: brandColors.skyBlue });
      }
    }
    setShowMentionPopover(false);
    setMentionQuery("");
  };

  // Handle @ detection
  const handleTextChange = (content, delta, source, editor) => {
    setNewMessage(content);
    updateActiveFormats();

    // Check for @ mentions
    const text = editor.getText();
    const selection = editor.getSelection();
    if (selection) {
      const beforeCursor = text.slice(0, selection.index);
      const lastAtIndex = beforeCursor.lastIndexOf('@');
      const lastSpaceIndex = beforeCursor.lastIndexOf(' ');

      if (lastAtIndex > lastSpaceIndex && lastAtIndex >= 0) {
        const query = beforeCursor.slice(lastAtIndex + 1);
        if (!query.includes('\n')) {
          setMentionQuery(query);
          setShowMentionPopover(true);
          return;
        }
      }
    }
    setShowMentionPopover(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = newMessage.replace(/<[^>]*>/g, '').trim();
    if (!text) return;
    onSendMessage(newMessage, replyingTo?.id, rrfStage, activeCrpStep);
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
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true) || { index: 0 };
      editor.insertText(range.index, template);
      editor.setSelection(range.index + template.length);
      editor.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <form className="flex flex-col h-full overflow-x-hidden" style={{ background: 'linear-gradient(180deg, rgba(15, 31, 51, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%)' }} onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
      {/* Skip to main content link */}
      <a href="#message-input" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-amber-600 focus:text-white focus:px-4 focus:py-2">
        Skip to message input
      </a>

      {/* Messages - with bottom padding to prevent keyboard overlap */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 space-y-4" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 280px))' }} role="log" aria-live="polite" aria-label="Message feed">
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

      {/* RRF Stage Navigator */}
      {!isReadonly && !isPerry && (
        <div className="px-4 py-3 border-t border-gray-700/20 bg-gradient-to-r from-black/60 via-black/50 to-black/60 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { stage: 'FORM', subtitle: 'Plant presence; No ask.' },
              { stage: 'STORM', subtitle: 'Probe. Reopen. Research.' },
              { stage: 'NORM', subtitle: 'Propose shared outcome.' },
              { stage: 'PERFORM', subtitle: 'Execute. Close. Transact.' }
            ].map(({ stage, subtitle }) => (
              <button
                key={stage}
                onClick={() => setRRFStage(stage)}
                className={cn(
                    "px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider border-2 transition-all duration-300 group",
                    rrfStage === stage
                      ? stage === 'FORM'
                        ? "border-indigo-500/80 bg-gradient-to-br from-indigo-600/30 to-indigo-700/10 text-indigo-300 shadow-lg shadow-indigo-500/10"
                        : stage === 'STORM'
                        ? "border-amber-500/80 bg-gradient-to-br from-amber-600/30 to-amber-700/10 text-amber-300 shadow-lg shadow-amber-500/10"
                        : stage === 'NORM'
                        ? "border-rose-500/80 bg-gradient-to-br from-rose-600/30 to-rose-700/10 text-rose-300 shadow-lg shadow-rose-500/10"
                        : "border-amber-400/80 bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-200 shadow-lg shadow-amber-400/10"
                      : "border-gray-700/40 bg-transparent text-gray-600 hover:border-gray-600/60 hover:text-gray-400 hover:bg-gray-900/20"
                  )}
              >
                <div className="leading-tight">{stage}</div>
                {rrfStage === stage && (
                  <div className="text-[10px] opacity-80 leading-tight mt-1 text-current">{subtitle}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Composer */}
      <div className={cn(
        "md:relative md:p-4 fixed bottom-0 left-0 right-0 p-4 shadow-2xl shadow-black/60 border-t transition-all duration-300",
        rrfStage === 'FORM'
          ? "border-lime-600/40 bg-gradient-to-t from-black/95 via-lime-950/30 to-transparent backdrop-blur-xl"
          : rrfStage === 'STORM'
          ? "border-orange-600/40 bg-gradient-to-t from-black/95 via-orange-950/30 to-transparent backdrop-blur-xl"
          : rrfStage === 'NORM'
          ? "border-blue-600/40 bg-gradient-to-t from-black/95 via-blue-950/30 to-transparent backdrop-blur-xl"
          : "border-cyan-600/40 bg-gradient-to-t from-black/95 via-cyan-950/30 to-transparent backdrop-blur-xl"
      )} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {canPost ? (
          <div className="flex flex-col">
            {replyingTo && (
              <div className="flex items-center gap-2 text-xs mb-2 px-3 py-2 rounded-t-xl bg-gradient-to-r from-amber-600/10 to-orange-600/5 border border-amber-500/20 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300" style={{ color: '#fbbf24' }}>
                <MessageSquare className="w-3 h-3" />
                <span>Replying to <strong>{replyingTo.sender_name || replyingTo.sender_email?.split("@")[0]}</strong></span>
                <button onClick={() => setReplyingTo(null)} className="ml-auto hover:opacity-70 transition-opacity hover:scale-110 active:scale-95">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Message Editor */}
            <fieldset
              className={cn(
                "rounded-xl overflow-hidden border-2 transition-all duration-300 w-full",
                rrfStage === 'FORM'
                  ? "focus-within:ring-2 focus-within:ring-lime-500/40 focus-within:shadow-xl focus-within:shadow-lime-500/20 border-lime-600/40 bg-gradient-to-br from-lime-950/10 via-gray-950 to-gray-950"
                  : rrfStage === 'STORM'
                  ? "focus-within:ring-2 focus-within:ring-orange-500/40 focus-within:shadow-xl focus-within:shadow-orange-500/20 border-orange-600/40 bg-gradient-to-br from-orange-950/10 via-gray-950 to-gray-950"
                  : rrfStage === 'NORM'
                  ? "focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:shadow-xl focus-within:shadow-blue-500/20 border-blue-600/40 bg-gradient-to-br from-blue-950/10 via-gray-950 to-gray-950"
                  : "focus-within:ring-2 focus-within:ring-cyan-500/40 focus-within:shadow-xl focus-within:shadow-cyan-500/20 border-cyan-600/40 bg-gradient-to-br from-cyan-950/10 via-gray-950 to-gray-950"
              )}
              aria-label="Message formatting and input"
            >
              {/* Formatting Toolbar with Active States */}
              <div
                className="flex items-center gap-1 px-3 py-2 border-b"
                style={{ borderColor: 'rgba(100, 100, 100, 0.2)' }}
              >
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    className={cn(
                       "p-1.5 rounded transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-500 hover:scale-110 active:scale-95",
                       activeFormats.bold ? "bg-gradient-to-r from-amber-600/50 to-amber-500/30 shadow-lg shadow-amber-500/20" : "hover:bg-gray-700/50"
                     )}
                     title="Bold (⌘B)"
                     onClick={() => {
                       quillRef.current?.getEditor().format('bold', !activeFormats.bold);
                       updateActiveFormats();
                     }}
                    >
                     <Bold className={cn("w-4 h-4 transition-all duration-200", activeFormats.bold ? "text-amber-200 scale-110" : "text-gray-400")} />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "p-1.5 rounded transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-500 hover:scale-110 active:scale-95",
                      activeFormats.italic ? "bg-gradient-to-r from-amber-600/50 to-amber-500/30 shadow-lg shadow-amber-500/20" : "hover:bg-gray-700/50"
                    )}
                    title="Italic (⌘I)"
                    onClick={() => {
                      quillRef.current?.getEditor().format('italic', !activeFormats.italic);
                      updateActiveFormats();
                    }}
                  >
                    <Italic className={cn("w-4 h-4 transition-all duration-200", activeFormats.italic ? "text-amber-200 scale-110" : "text-gray-400")} />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "p-1.5 rounded transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-500 hover:scale-110 active:scale-95",
                      activeFormats.underline ? "bg-gradient-to-r from-amber-600/50 to-amber-500/30 shadow-lg shadow-amber-500/20" : "hover:bg-gray-700/50"
                    )}
                    title="Underline (⌘U)"
                    onClick={() => {
                      quillRef.current?.getEditor().format('underline', !activeFormats.underline);
                      updateActiveFormats();
                    }}
                  >
                    <Underline className={cn("w-4 h-4 transition-all duration-200", activeFormats.underline ? "text-amber-200 scale-110" : "text-gray-400")} />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "p-1.5 rounded transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-500 hover:scale-110 active:scale-95",
                      activeFormats.strike ? "bg-gradient-to-r from-amber-600/50 to-amber-500/30 shadow-lg shadow-amber-500/20" : "hover:bg-gray-700/50"
                    )}
                    title="Strikethrough"
                    onClick={() => {
                      quillRef.current?.getEditor().format('strike', !activeFormats.strike);
                      updateActiveFormats();
                    }}
                  >
                    <Strikethrough className={cn("w-4 h-4 transition-all duration-200", activeFormats.strike ? "text-amber-200 scale-110" : "text-gray-400")} />
                  </button>
                </div>
                <div className="w-px h-5 mx-1" style={{ background: 'rgba(100, 100, 100, 0.2)' }} />
                <div className="flex items-center gap-0.5">
                   <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
                     <PopoverTrigger asChild>
                       <button
                         type="button"
                         className={cn(
                           "p-1.5 rounded transition-colors",
                           activeFormats.link ? "bg-amber-500/40" : "hover:bg-gray-700/50"
                         )}
                         title="Link (⌘K)"
                         onClick={() => {
                           if (activeFormats.link) {
                             quillRef.current?.getEditor().format('link', false);
                             updateActiveFormats();
                           } else {
                             setLinkUrl("");
                             setShowLinkPopover(true);
                           }
                         }}
                       >
                         <Link2 className={cn("w-4 h-4", activeFormats.link ? "text-amber-300" : "text-gray-400")} />
                       </button>
                     </PopoverTrigger>
                     <PopoverContent className="w-72 p-2 bg-gray-900 border-gray-700" side="top" align="start">
                       <div className="flex gap-2">
                         <Input
                           autoFocus
                           type="url"
                           placeholder="https://..."
                           value={linkUrl}
                           onChange={(e) => setLinkUrl(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' && linkUrl.trim()) {
                               quillRef.current?.getEditor().format('link', linkUrl.trim());
                               updateActiveFormats();
                               setShowLinkPopover(false);
                             }
                             if (e.key === 'Escape') setShowLinkPopover(false);
                           }}
                           className="h-8 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 text-sm"
                         />
                         <Button
                           size="sm"
                           className="h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white"
                           onClick={() => {
                             if (linkUrl.trim()) {
                               quillRef.current?.getEditor().format('link', linkUrl.trim());
                               updateActiveFormats();
                             }
                             setShowLinkPopover(false);
                           }}
                         >
                           <Check className="w-3 h-3" />
                         </Button>
                       </div>
                     </PopoverContent>
                   </Popover>
                   <button
                     type="button"
                     className={cn(
                       "p-1.5 rounded transition-colors",
                       activeFormats.list === 'ordered' ? "bg-amber-500/40" : "hover:bg-gray-700/50"
                     )}
                     title="Numbered List"
                     onClick={() => {
                       quillRef.current?.getEditor().format('list', activeFormats.list === 'ordered' ? false : 'ordered');
                       updateActiveFormats();
                     }}
                   >
                     <ListOrdered className="w-4 h-4" style={{ color: activeFormats.list === 'ordered' ? '#fbbf24' : '#9ca3af' }} />
                   </button>
                   <button
                     type="button"
                     className={cn(
                       "p-1.5 rounded transition-colors",
                       activeFormats.list === 'bullet' ? "bg-amber-500/40" : "hover:bg-gray-700/50"
                     )}
                     title="Bullet List"
                     onClick={() => {
                       quillRef.current?.getEditor().format('list', activeFormats.list === 'bullet' ? false : 'bullet');
                       updateActiveFormats();
                     }}
                   >
                     <List className="w-4 h-4" style={{ color: activeFormats.list === 'bullet' ? '#fbbf24' : '#9ca3af' }} />
                   </button>
                </div>
                <div className="w-px h-5 mx-1" style={{ background: 'rgba(100, 100, 100, 0.2)' }} />
                <button
                   type="button"
                   className={cn(
                     "p-1.5 rounded transition-colors",
                     activeFormats['code-block'] ? "bg-amber-500/40" : "hover:bg-gray-700/50"
                   )}
                   title="Code Block"
                   onClick={() => {
                     quillRef.current?.getEditor().format('code-block', !activeFormats['code-block']);
                     updateActiveFormats();
                   }}
                 >
                   <Code className="w-4 h-4" style={{ color: activeFormats['code-block'] ? '#fbbf24' : '#9ca3af' }} />
                 </button>
              </div>

              {/* Text Input Area */}
              <div className="relative" onKeyDown={handleKeyDown}>
                <label htmlFor="message-input" className="sr-only">
                    Message input. {replyingTo ? `Replying to ${replyingTo.sender_name || replyingTo.sender_email?.split('@')[0]}. P` : 'P'}ress Enter to send, Shift+Enter for new line.
                  </label>
                  <ReactQuill
                   ref={quillRef}
                   id="message-input"
                   value={newMessage}
                   onChange={handleTextChange}
                   onChangeSelection={updateActiveFormats}
                   onFocus={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                   modules={{ toolbar: false }}
                   formats={quillFormats}
                   placeholder={replyingTo ? "Write a reply..." : "Message #channel"}
                   className="[&_.ql-container]:border-0 [&_.ql-editor]:min-h-[60px] [&_.ql-editor]:max-h-[150px] [&_.ql-editor]:overflow-auto [&_.ql-editor]:px-3 [&_.ql-editor]:py-2 [&_.ql-editor.ql-blank::before]:text-gray-600 [&_.ql-editor.ql-blank::before]:not-italic [&_.ql-editor]:text-gray-100 [&_.ql-editor]:bg-transparent"
                    style={{ fontSize: '15px' }}
                 />

                {/* Mention Popover */}
                <MentionPopover
                  isOpen={showMentionPopover}
                  searchQuery={mentionQuery}
                  onSelect={handleMentionSelect}
                  currentUserEmail={currentUserEmail}
                />
              </div>

              {/* Bottom Action Bar */}
              <div
                className="flex items-center justify-between px-3 py-2 border-t"
                style={{ borderColor: 'rgba(100, 100, 100, 0.2)' }}
                role="toolbar"
                aria-label="Message formatting options"
              >
                <div className="flex items-center gap-1 flex-wrap">
                   {!isPerry && activeCrpStep && (
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 border border-amber-400/30 text-amber-300">
                       ◆ Step {activeCrpStep}
                       <button
                         type="button"
                         onClick={() => setActiveCrpStep(null)}
                         className="hover:text-white transition-colors ml-0.5"
                         aria-label="Remove step tag"
                       >
                         <X className="w-2.5 h-2.5" />
                       </button>
                     </span>
                   )}
                   {!isPerry && (
                     <>
                       {stageTemplates[rrfStage].map((action, idx) => (
                         <button
                           key={`${rrfStage}-${idx}`}
                           type="button"
                           onClick={() => handleQuickAction(action.template)}
                           className={cn(
                             "px-2.5 py-1 text-xs font-medium rounded border transition-all duration-200",
                             rrfStage === 'FORM'
                               ? "border-lime-600/40 text-lime-300 hover:bg-lime-600/20"
                               : rrfStage === 'STORM'
                               ? "border-orange-600/40 text-orange-300 hover:bg-orange-600/20"
                               : rrfStage === 'NORM'
                               ? "border-blue-600/40 text-blue-300 hover:bg-blue-600/20"
                               : "border-cyan-600/40 text-cyan-300 hover:bg-cyan-600/20"
                           )}
                         >
                           {action.label}
                         </button>
                       ))}
                       <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.3)' }} />
                     </>
                   )}
                   <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                     <PopoverTrigger asChild>
                       <button 
                         type="button" 
                         className="p-1.5 rounded hover:bg-gray-700/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                         aria-label="Open emoji picker"
                       >
                         <Smile className="w-4 h-4 text-gray-400" aria-hidden="true" />
                       </button>
                     </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" side="top" align="start">
                      <div className="flex gap-1">
                        {REACTION_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              const editor = quillRef.current?.getEditor();
                              const range = editor?.getSelection(true);
                              if (editor && range) {
                                editor.insertText(range.index, emoji);
                                editor.setSelection(range.index + emoji.length);
                              }
                              setShowEmojiPicker(false);
                            }}
                            className="hover:bg-gray-100 rounded p-1 text-lg transition-transform hover:scale-125"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <button
                    type="button"
                    className="p-1.5 rounded transition-all duration-200 hover:bg-gray-700/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 hover:scale-110 active:scale-95"
                    aria-label="Mention someone (@ symbol)"
                    onClick={() => {
                      const editor = quillRef.current?.getEditor();
                      const range = editor?.getSelection(true);
                      if (editor && range) {
                        editor.insertText(range.index, '@');
                        editor.setSelection(range.index + 1);
                      }
                      setShowMentionPopover(true);
                      setMentionQuery("");
                    }}
                  >
                    <AtSign className="w-4 h-4 text-gray-400 transition-colors hover:text-amber-300" aria-hidden="true" />
                  </button>
                  {isPollChannel && (
                    <>
                      <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.3)' }} />
                      <button
                        type="button"
                        className="p-1.5 rounded transition-all duration-200 hover:bg-gray-700/50 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                        title="Create poll"
                        onClick={() => setShowPollModal(true)}
                      >
                        <BarChart3 className="w-4 h-4 text-gray-400 transition-colors hover:text-amber-300" />
                      </button>
                    </>
                  )}
                  {!isPerry && (
                    <>
                      <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
                      <CrpStepPickerButton
                        activeCrpStep={activeCrpStep}
                        onSelect={setActiveCrpStep}
                      />
                    </>
                  )}
                  </div>

                <div className="flex items-center gap-1">
                  <Button
                      onClick={handleSend}
                      disabled={!newMessage.replace(/<[^>]*>/g, '').trim() || isLoading}
                      size="sm"
                      className="rounded-lg px-3 h-8 border-0 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/40 active:scale-95 hover:scale-105"
                      aria-label="Send message"
                    >
                      <Send className={cn("w-4 h-4 transition-transform duration-300", isLoading && "animate-spin")} aria-hidden="true" />
                    </Button>
                </div>
                </div>
                </fieldset>

                {/* Poll Creation Modal */}
                <CreatePollModal
                open={showPollModal}
                onClose={() => setShowPollModal(false)}
                onCreate={onCreatePoll}
                />
                </div>
            ) : (
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