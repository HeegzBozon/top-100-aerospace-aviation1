import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Loader2, CheckCircle2, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { shareToLinkedIn } from "@/functions/shareToLinkedIn";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const brandColors = {
  linkedin: '#0A66C2',
  navyDeep: '#1e3a5a',
};

export default function ShareToLinkedIn({ 
  defaultText = '', 
  url = '', 
  title = '', 
  description = '',
  trigger,
  onSuccess 
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(defaultText);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleShare = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to share');
      return;
    }

    setLoading(true);
    
    try {
      const response = await shareToLinkedIn({ 
        text, 
        url: url || undefined, 
        title: title || undefined, 
        description: description || undefined 
      });
      
      if (response.data?.success) {
        setSuccess(true);
        toast.success('Posted to LinkedIn!');
        onSuccess?.();
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setText(defaultText);
        }, 1500);
      } else {
        toast.error(response.data?.error || 'Failed to share');
      }
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Failed to share to LinkedIn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            className="gap-2"
            style={{ borderColor: brandColors.linkedin, color: brandColors.linkedin }}
          >
            <Linkedin className="w-4 h-4" />
            Share to LinkedIn
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="w-5 h-5" style={{ color: brandColors.linkedin }} />
            Share to LinkedIn
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium" style={{ color: brandColors.navyDeep }}>
              Successfully posted!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What would you like to share?"
              rows={4}
              maxLength={3000}
              className="resize-none"
            />
            
            <p className="text-xs text-gray-400 text-right">
              {text.length}/3000
            </p>

            {url && (
              <div className="p-3 rounded-lg bg-gray-50 border">
                <p className="text-xs text-gray-500 mb-1">Link preview</p>
                <p className="text-sm font-medium truncate" style={{ color: brandColors.navyDeep }}>
                  {title || url}
                </p>
                {description && (
                  <p className="text-xs text-gray-500 truncate mt-1">{description}</p>
                )}
              </div>
            )}

            <Button
              onClick={handleShare}
              disabled={loading || !text.trim()}
              className="w-full gap-2"
              style={{ background: brandColors.linkedin }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post to LinkedIn
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}