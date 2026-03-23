import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Send, Shield, CheckCircle2, Briefcase,
  Globe, Linkedin, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProviderApplication() {
  const [formData, setFormData] = useState({
    experience_summary: "",
    portfolio_link: "",
    linkedin_profile: "",
    primary_category: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    "Consulting", "Coaching", "Engineering", "Design",
    "Marketing", "Project Management", "Data Science", "Other"
  ];

  const mutation = useMutation({
    mutationFn: async (/** @type {any} */ data) => {
      const user = await base44.auth.me();
      if (!user) throw new Error("Must be logged in");

      return base44.entities.ProviderApplication.create({
        applicant_email: user.email,
        status: "pending",
        service_categories: [data.primary_category],
        experience_summary: data.experience_summary,
        portfolio_link: data.portfolio_link,
        linkedin_profile: data.linkedin_profile
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit application: " + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.primary_category || !formData.experience_summary) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center border border-slate-100"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received</h2>
          <p className="text-slate-600 mb-8">
            Thank you for applying to the Pineapple Empire provider network. Our team will review your profile and get back to you shortly.
          </p>
          <Link to="/ServicesLanding">
            <Button className="w-full bg-[#1e3a5a]">Return to Marketplace</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link to="/ServicesLanding" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-playfair">
            Join the Empire Network
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Share your expertise with the aerospace community. We're looking for high-impact consultants, coaches, and technical experts.
          </p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  Professional Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Primary Expertise *</label>
                    <Select
                      value={formData.primary_category}
                      onValueChange={(val) => setFormData({ ...formData, primary_category: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">LinkedIn Profile</label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="https://linkedin.com/in/..."
                        className="pl-9"
                        value={formData.linkedin_profile}
                        onChange={(e) => setFormData({ ...formData, linkedin_profile: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Portfolio / Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="https://your-portfolio.com"
                      className="pl-9"
                      value={formData.portfolio_link}
                      onChange={(e) => setFormData({ ...formData, portfolio_link: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  Experience & Offering
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Tell us about your expertise and what you plan to offer *
                  </label>
                  <Textarea
                    placeholder="I specialize in..."
                    className="h-32 resize-none"
                    value={formData.experience_summary}
                    onChange={(e) => setFormData({ ...formData, experience_summary: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">
                    Briefly describe your background and the types of services you'd like to list on the marketplace.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium mb-1">Vetting Process</p>
                  <p className="opacity-90">
                    All provider applications are reviewed by our team. We maintain high standards to ensure quality for our clients. You'll hear from us within 2-3 business days.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1e3a5a] hover:bg-[#2c4a6e] h-12 text-lg"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Application <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}