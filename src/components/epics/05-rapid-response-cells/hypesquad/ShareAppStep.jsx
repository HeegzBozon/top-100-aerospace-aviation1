import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Mail, MessageCircle, CheckCircle, Sparkles, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ShareAppStep({ onComplete, onBack, user }) {
  const [shareMethod, setShareMethod] = useState(null);
  const [email, setEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const { toast } = useToast();

  const shareOptions = [
    {
      id: 'link',
      title: 'Copy Link',
      description: 'Share a direct link to join',
      icon: Copy,
      color: 'from-blue-400 to-blue-500',
      action: handleCopyLink
    },
    {
      id: 'email',
      title: 'Send Email',
      description: 'Invite via email',
      icon: Mail,
      color: 'from-green-400 to-green-500',
      action: () => setShareMethod('email')
    },
    {
      id: 'message',
      title: 'Share Message',
      description: 'Copy a personal message',
      icon: MessageCircle,
      color: 'from-purple-400 to-purple-500',
      action: () => setShareMethod('message')
    }
  ];

  async function handleCopyLink() {
    try {
      const appUrl = window.location.origin;
      const shareText = `Hey! I'm using this amazing app to vote on the TOP 100 and wanted to invite you to join. Check it out: ${appUrl}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Join the TOP 100 Community',
          text: shareText,
          url: appUrl
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Link copied!",
          description: "The invitation message has been copied to your clipboard.",
        });
      }
      
      markAsShared();
    } catch (error) {
      console.error('Failed to share:', error);
      toast({
        variant: "destructive",
        title: "Share failed",
        description: "Unable to share the link. Please try again.",
      });
    }
  }

  const handleEmailInvite = async () => {
    if (!email.trim()) return;
    
    setIsSharing(true);
    try {
      // In a real app, this would send an email via a backend function
      // For now, we'll simulate the action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Invitation sent!",
        description: `An invite has been sent to ${email}`,
      });
      
      markAsShared();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Send failed",
        description: "Unable to send the invitation. Please try again.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyMessage = async () => {
    const message = customMessage || `Hey! I've been using this incredible TOP 100 app to discover and vote for amazing people in our industry. Your voice would make a real difference in shaping who gets recognized. Want to join me? ${window.location.origin}`;
    
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Message copied!",
        description: "Your personalized message is ready to share.",
      });
      markAsShared();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Unable to copy the message. Please try again.",
      });
    }
  };

  const markAsShared = () => {
    setHasShared(true);
    
    // Haptic feedback for successful share
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  };

  if (hasShared) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl relative"
        >
          <CheckCircle className="w-16 h-16 text-white" />
          
          {/* Celebration sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
        
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Thank You! 🎉
        </h2>
        <p className="text-[var(--muted)] mb-6 max-w-md">
          You've completed your daily journey and helped spread the word. Your voice is making a difference in the community!
        </p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <span className="font-semibold text-yellow-800 dark:text-yellow-200">
              Daily Ritual Complete
            </span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Come back tomorrow to continue building your Aura and shaping the future!
          </p>
        </motion.div>
        
        <Button 
          size="lg" 
          onClick={onComplete}
          className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white px-8 py-3 text-lg shadow-xl"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    );
  }

  if (shareMethod === 'email') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl">
            <Mail className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Send Email Invitation
          </h2>
          <p className="text-[var(--muted)] mb-6">
            Invite someone to join the community and make their voice heard.
          </p>
          
          <div className="space-y-4 mb-6">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-base"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShareMethod(null)}
            >
              Back
            </Button>
            <Button
              onClick={handleEmailInvite}
              disabled={!email.trim() || isSharing}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isSharing ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (shareMethod === 'message') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Custom Message
          </h2>
          <p className="text-[var(--muted)] mb-6">
            Personalize your invitation message or use our suggested text.
          </p>
          
          <div className="space-y-4 mb-6">
            <textarea
              placeholder="Write your personal invitation message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg bg-[var(--card)] border-[var(--border)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <p className="text-xs text-[var(--muted)] text-left">
              Leave empty to use our suggested message
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShareMethod(null)}
            >
              Back
            </Button>
            <Button
              onClick={handleCopyMessage}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500"
            >
              Copy Message
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-2xl">
          <Share2 className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
          Spread the Word
        </h2>
        <p className="text-[var(--muted)] mb-8 leading-relaxed">
          You've made your voice heard. Now help others do the same! Every new person strengthens our community.
        </p>
        
        <div className="grid gap-4 mb-8">
          {shareOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={option.action}
              className="bg-[var(--card)] p-4 rounded-xl border-2 border-transparent hover:border-[var(--accent)] hover:shadow-lg transition-all duration-300 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {option.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          onClick={onComplete}
          className="w-full"
        >
          Skip Sharing for Now
        </Button>
      </motion.div>
    </div>
  );
}