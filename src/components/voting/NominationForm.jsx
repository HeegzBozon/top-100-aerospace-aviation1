import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Category } from '@/entities/Category';
import { base44 } from '@/api/base44Client';

const formFields = [
  { name: 'nominee_email', label: 'Nominee Email', placeholder: 'e.g., evelyn.reed@aero.com', type: 'email', required: true },
  { name: 'justification', label: 'Reason for Nomination', placeholder: 'Tell us why this person deserves to be in the TOP 100.', as: 'textarea', required: true },
];

export default function NominationForm() {
  const [formData, setFormData] = useState({
    nominee_email: '',
    category_id: '',
    justification: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await Category.list();
        setCategories(cats.filter(c => c.is_active));
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the backend service for secure/validated creation
      const response = await base44.functions.invoke('nominationService', {
        action: 'create',
        data: formData
      });

      if (response.data.success) {
        toast({
          title: "Nomination Submitted!",
          description: "We have received your nomination.",
          action: <CheckCircle className="text-green-500" />,
        });
        setFormData({ nominee_email: '', category_id: '', justification: '' });
      } else {
        throw new Error(response.data.error || 'Submission failed');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader2 className="w-8 h-8 animate-spin mx-auto" />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto bg-white/5 p-8 rounded-xl border border-white/10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label className="block text-sm font-medium mb-2">Category <span className="text-red-500">*</span></label>
            <Select 
                value={formData.category_id} 
                onValueChange={(val) => setFormData(prev => ({...prev, category_id: val}))}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {formFields.map((field) => {
          const InputComponent = field.as === 'textarea' ? Textarea : Input;
          return (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <InputComponent
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                type={field.type || 'text'}
                rows={field.as === 'textarea' ? 4 : undefined}
              />
            </div>
          );
        })}

        <Button type="submit" disabled={isSubmitting || !formData.category_id} className="w-full bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90">
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 w-4 h-4" />}
          Submit Nomination
        </Button>
      </form>
    </motion.div>
  );
}