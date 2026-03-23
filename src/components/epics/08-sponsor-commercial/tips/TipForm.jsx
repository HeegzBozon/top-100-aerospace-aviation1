import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2, Lightbulb } from 'lucide-react';
import { TipEntry } from '@/entities/TipEntry';
import { User } from '@/entities/User';
import { useToast } from "@/components/ui/use-toast";
import { awardStardust } from '@/functions/awardStardust';

export default function TipForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    difficulty: 'Beginner',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.category) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all required fields.",
      });
      return;
    }

    setLoading(true);
    try {
      const currentUser = await User.me();
      
      await TipEntry.create({
        ...formData,
        author_email: currentUser.email,
        author_name: currentUser.full_name || currentUser.email,
      });

      await awardStardust({
        user_email: currentUser.email,
        action_type: 'tip_shared'
      });

      toast({
        title: "Tip Shared!",
        description: "Thank you for your contribution. You've earned 8 Stardust!",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Failed to share tip:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not share your tip. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-500"/>
            <h2 className="text-xl font-bold">Share Your Wisdom</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-grow">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tip Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., How to Ace a Technical Interview"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Explain your tip in detail. Use markdown for formatting."
              rows={8}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
              <Select value={formData.category} onValueChange={(v) => setFormData(p => ({...p, category: v}))}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                  <SelectItem value="Process">Process</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Innovation">Innovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty *</label>
              <Select value={formData.difficulty} onValueChange={(v) => setFormData(p => ({...p, difficulty: v}))}>
                <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <div className="flex-shrink-0 flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Share & Earn Stardust'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}