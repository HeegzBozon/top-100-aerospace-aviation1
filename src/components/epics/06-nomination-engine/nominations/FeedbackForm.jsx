import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, CheckCircle, Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Feedback } from '@/entities/Feedback';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';

const typeConfig = {
  idea: {
    title: 'Feature Request',
    placeholder: 'Describe your feature idea...',
    submitText: 'Submit Feature Request'
  },
  bug_report: {
    title: 'Bug Report',
    placeholder: 'Describe the bug you encountered...',
    submitText: 'Submit Bug Report'
  },
  feedback: {
    title: 'General Feedback',
    placeholder: 'Share your thoughts...',
    submitText: 'Submit Feedback'
  }
};

export default function FeedbackForm({ type, onBack }) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    screenshot_url: '',
    loom_link: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const { toast } = useToast();

  const config = typeConfig[type] || typeConfig.feedback;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to load user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load user data.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScreenshotUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        variant: "destructive", 
        title: "File too large", 
        description: "Please choose an image under 10MB" 
      });
      return;
    }

    setUploadingScreenshot(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, screenshot_url: file_url }));
      toast({ title: "Screenshot uploaded!" });
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: "Failed to upload screenshot." 
      });
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !currentUser) return;

    if (!formData.subject || !formData.description) {
      toast({ 
        variant: "destructive", 
        title: "Missing Fields", 
        description: "Please fill out the subject and description." 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await Feedback.create({
        ...formData,
        type: type,
        user_email: currentUser.email,
        status: 'new'
      });

      toast({
        title: "Submission Successful! 🎉",
        description: `Your ${config.title.toLowerCase()} has been submitted.`,
        action: <CheckCircle className="text-green-500" />,
      });

      // Reset form
      setFormData({
        subject: '',
        description: '',
        screenshot_url: '',
        loom_link: ''
      });
      
      // Go back to hub after successful submission
      setTimeout(() => {
        onBack?.();
      }, 2000);

    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-[var(--muted)] mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder={`Brief summary of your ${type === 'idea' ? 'feature request' : type === 'bug_report' ? 'bug report' : 'feedback'}`}
            required
            className="bg-white/5 border-[var(--border)] focus:border-[var(--accent)]"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--muted)] mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={config.placeholder}
            required
            rows={6}
            className="bg-white/5 border-[var(--border)] focus:border-[var(--accent)]"
          />
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-2">
            Screenshot (Optional)
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('screenshot-upload').click()}
                disabled={uploadingScreenshot}
                className="border-[var(--border)]"
              >
                {uploadingScreenshot ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Screenshot
              </Button>
              <span className="text-xs text-[var(--muted)]">PNG, JPG up to 10MB</span>
            </div>
            
            {formData.screenshot_url && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Screenshot uploaded</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, screenshot_url: '' }))}
                  className="ml-auto p-1 h-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            <input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Loom Link */}
        <div>
          <label htmlFor="loom_link" className="block text-sm font-medium text-[var(--muted)] mb-2">
            Video Link (Optional)
          </label>
          <Input
            id="loom_link"
            name="loom_link"
            value={formData.loom_link}
            onChange={handleChange}
            placeholder="Loom, YouTube, or other video URL"
            className="bg-white/5 border-[var(--border)] focus:border-[var(--accent)]"
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full text-lg py-6 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            ) : (
              <Send className="w-5 h-5 mr-3" />
            )}
            {config.submitText}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}