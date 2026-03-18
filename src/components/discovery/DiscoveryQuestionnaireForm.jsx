import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const QUESTIONS = {
  1: [
    { id: 'q1', question: 'What is your business name and tagline (if you have one)?', type: 'text', required: true },
    { id: 'q2', question: 'How would you describe your brand in three words?', type: 'text', required: true },
    { id: 'q3', question: 'What feeling should someone have when they land on your website?', type: 'textarea', required: true },
    { id: 'q4', question: 'Do you have existing brand guidelines, colors, or fonts? If yes, please describe or attach.', type: 'textarea-file', required: true },
    { id: 'q5', question: 'Who or what inspires your brand aesthetic? (Other businesses, designers, magazines, etc.)', type: 'textarea', required: true },
  ],
  2: [
    { id: 'q6', question: 'Who is your ideal client? Describe them as specifically as you can. (Age, income, lifestyle, location, mindset)', type: 'textarea', required: true },
    { id: 'q7', question: 'What problem are they trying to solve when they find you?', type: 'textarea', required: true },
    { id: 'q8', question: 'What type of client do you *not* want? (Optional but useful)', type: 'textarea', required: false },
    { id: 'q9', question: 'Where does your best work tend to come from? (Referrals, Google, social, word of mouth, etc.)', type: 'textarea', required: false },
  ],
  3: [
    { id: 'q10', question: 'List your core services. Which is your highest priority to promote?', type: 'textarea', required: true },
    { id: 'q11', question: 'What is your typical project size or price range? (This helps us write copy that attracts the right clients)', type: 'text', required: true },
    { id: 'q12', question: 'What makes you different from other providers in your space?', type: 'textarea', required: true },
    { id: 'q13', question: 'What\'s the one thing you want every visitor to know about working with you?', type: 'textarea', required: true },
  ],
  4: [
    { id: 'q14', question: 'Name 2–3 competitors or businesses in your space you respect. (Links if possible)', type: 'textarea-file', required: false },
    { id: 'q15', question: 'Share 2–3 websites you love the look and feel of — they don\'t have to be in your industry.', type: 'textarea-file', required: false },
    { id: 'q16', question: 'What do you want your site to do better than your competitors\'?', type: 'textarea', required: false },
  ],
  5: [
    { id: 'q17', question: 'What is the single most important action you want visitors to take on your site? (Book a call, fill out a form, view portfolio, etc.)', type: 'textarea', required: false },
    { id: 'q18', question: 'What pages do you know you need? (e.g. Home, About, Services, Portfolio, Contact)', type: 'textarea', required: false },
    { id: 'q19', question: 'Are there any features you specifically want? (Contact form, gallery, testimonials, blog, booking widget, etc.)', type: 'textarea', required: false },
    { id: 'q20', question: 'Is there anything on your current site you want to keep, or anything you definitely want to leave behind?', type: 'textarea', required: false },
  ],
  6: [
    { id: 'q21', question: 'If a potential client were Googling for someone like you, what would they type?', type: 'text', required: false },
    { id: 'q22', question: 'What city or region(s) do you primarily serve?', type: 'text', required: false },
    { id: 'q23', question: 'Are there specific neighborhoods, zip codes, or communities you want to target?', type: 'text', required: false },
    { id: 'q24', question: 'Do you have a Google Business Profile set up? If yes, do you have login access?', type: 'text', required: false },
  ],
  7: [
    { id: 'q25', question: 'Which platforms are you currently active on?', type: 'text', required: false },
    { id: 'q26', question: 'What\'s working on social right now, if anything?', type: 'textarea', required: false },
    { id: 'q27', question: 'What\'s your biggest challenge with social media?', type: 'textarea', required: false },
    { id: 'q28', question: 'Should your website link to your social profiles? Which ones?', type: 'text', required: false },
  ],
  8: [
    { id: 'q29', question: 'Do you have a logo? What file formats do you have? (PNG, SVG, AI, etc.)', type: 'file', required: false },
    { id: 'q30', question: 'Do you have professional photos of your work, your space, or yourself?', type: 'file', required: false },
    { id: 'q31', question: 'Do you have written content already — bios, service descriptions, testimonials?', type: 'textarea-file', required: false },
    { id: 'q32', question: 'Is there anything else you want us to know before we start building?', type: 'textarea', required: false },
  ],
};

export default function DiscoveryQuestionnaireForm({ sectionId, formData, setFormData }) {
  const questions = QUESTIONS[sectionId] || [];
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileUpload = (id, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [id]: file,
    }));
    setFormData(prev => ({
      ...prev,
      [id]: file.name,
    }));
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    handleChange(id, '');
  };

  return (
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
          className="relative group"
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-[#c9a87c]/10 to-[#d4a090]/10 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-[#1e3a5a]/50 backdrop-blur border border-[#2a4f7c]/50 rounded-lg p-5 hover:border-[#2a4f7c]/70 transition-colors">
            <label className="block mb-3">
              <span className="flex items-start gap-2 mb-2">
                <span className="text-[#faf8f5] font-medium text-sm leading-snug">
                  {q.question}
                </span>
                {q.required && <span className="text-[#d4a090] text-xs font-bold mt-0.5">*</span>}
              </span>
            </label>

            {q.type === 'text' && (
              <Input
                type="text"
                value={formData[q.id] || ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
                placeholder="Type your answer..."
                className="bg-[#0f1f35]/50 border-[#2a4f7c]/50 text-[#faf8f5] placeholder:text-[#c9a87c]/50 focus:border-[#c9a87c]/50 focus:ring-[#c9a87c]/20"
              />
            )}

            {q.type === 'textarea' && (
              <Textarea
                value={formData[q.id] || ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
                placeholder="Type your answer..."
                className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 min-h-24"
              />
            )}

            {(q.type === 'textarea-file' || q.type === 'file') && (
              <div className="space-y-3">
                {q.type === 'textarea-file' && (
                  <Textarea
                    value={formData[q.id]?.text || formData[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    placeholder="Type your answer or upload files..."
                    className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 min-h-20"
                  />
                )}

                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-[#2a4f7c]/50 rounded-lg cursor-pointer hover:border-[#c9a87c]/50 transition-colors group/upload">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-4 h-4 text-[#c9a87c]/50 group-hover/upload:text-[#c9a87c]" />
                    <span className="text-xs text-[#c9a87c]/40 group-hover/upload:text-[#c9a87c]">Click to upload or drag & drop</span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(file => {
                          handleFileUpload(q.id, file);
                        });
                      }
                    }}
                  />
                </label>

                {uploadedFiles[q.id] && (
                  <div className="flex items-center justify-between px-3 py-2 bg-[#4a90b8]/10 border border-[#4a90b8]/30 rounded-lg">
                    <span className="text-xs text-[#e8d4b8]">{uploadedFiles[q.id].name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(q.id)}
                      className="text-[#4a90b8] hover:text-[#d4a090] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}