import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function PartnershipChatModal({ isOpen, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversation) {
      initializeConversation();
    }
  }, [isOpen]);

  const initializeConversation = async () => {
    setIsInitializing(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'partnership_advisor',
        metadata: {
          name: 'Partnership Inquiry',
          source: 'sponsors_page'
        }
      });
      setConversation(conv);
      
      // Subscribe to updates
      base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });

      // Send initial greeting
      await base44.agents.addMessage(conv, {
        role: 'user',
        content: 'Hello, I\'m interested in partnership opportunities.'
      });
      
      setIsInitializing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setIsInitializing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setConversation(null);
    setMessages([]);
    setInput('');
    setIsInitializing(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)' }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-3xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: 'white' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: brandColors.cream }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: brandColors.goldPrestige + '20' }}>
                <Sparkles className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>
                  Partnership Advisor
                </h3>
                <p className="text-sm" style={{ color: brandColors.navyDeep + '60' }}>
                  Let's explore how we can collaborate
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5"
            >
              <X className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ background: brandColors.cream }}>
            {isInitializing ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'rounded-br-sm'
                          : 'rounded-bl-sm'
                      }`}
                      style={{
                        background: msg.role === 'user' ? brandColors.goldPrestige : 'white',
                        color: msg.role === 'user' ? 'white' : brandColors.navyDeep,
                      }}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-base leading-relaxed">{msg.content}</p>
                      ) : (
                        <ReactMarkdown
                          className="text-base prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            ul: ({ children }) => <ul className="ml-4 mb-2 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="ml-4 mb-2 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'white' }}>
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: brandColors.goldPrestige }}
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: brandColors.goldPrestige }}
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: brandColors.goldPrestige }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: brandColors.cream }}>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading || isInitializing}
                className="flex-1 text-base px-4 py-6 rounded-xl border-2"
                style={{ borderColor: brandColors.navyDeep + '20' }}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isInitializing}
                size="lg"
                className="px-6 rounded-xl"
                style={{
                  background: input.trim() && !isLoading ? brandColors.goldPrestige : brandColors.navyDeep + '20',
                  color: input.trim() && !isLoading ? 'white' : brandColors.navyDeep + '60'
                }}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: brandColors.navyDeep + '60' }}>
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}