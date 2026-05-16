import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

// ── Question banks per track ──────────────────────────────────────────────────
// Each track has sections (array of question arrays).
// Section index maps to the step counter in the overlay.

export const TRACKS = {
  consulting: {
    label: 'Consulting',
    color: '#c9a87c',
    sections: [
      {
        title: 'About You & Your Work',
        questions: [
          { id: 'c_name',    label: 'Your name & title',                    type: 'text',     required: true },
          { id: 'c_org',     label: 'Organization / company (if applicable)', type: 'text',   required: false },
          { id: 'c_domain',  label: 'Primary domain or discipline',           type: 'text',   required: true, placeholder: 'e.g. Systems engineering, propulsion, policy, BD…' },
          { id: 'c_years',   label: 'Years of experience',                    type: 'text',   required: false },
        ],
      },
      {
        title: 'The Challenge',
        questions: [
          { id: 'c_problem', label: 'What specific challenge or opportunity are you trying to address?', type: 'textarea', required: true },
          { id: 'c_tried',   label: 'What have you already tried or explored?',                          type: 'textarea', required: false },
          { id: 'c_success', label: 'What does success look like in 90 days?',                           type: 'textarea', required: true },
        ],
      },
      {
        title: 'Engagement Fit',
        questions: [
          { id: 'c_scope',    label: 'Are you looking for strategy, execution support, or both?',         type: 'textarea', required: true },
          { id: 'c_timeline', label: "What's your timeline or urgency?",                                  type: 'text',     required: false },
          { id: 'c_budget',   label: 'Do you have an approximate budget range in mind?',                  type: 'text',     required: false, placeholder: 'Ballpark is fine — helps us scope correctly' },
          { id: 'c_other',    label: 'Anything else we should know before we talk?',                      type: 'textarea', required: false },
        ],
      },
    ],
  },

  coaching: {
    label: 'Coaching',
    color: '#d4a090',
    sections: [
      {
        title: 'Where You Are',
        questions: [
          { id: 'co_name',    label: 'Your name',                                       type: 'text',     required: true },
          { id: 'co_role',    label: 'Current role or career stage',                    type: 'text',     required: true, placeholder: 'e.g. Mid-level engineer, founder, transitioning veteran…' },
          { id: 'co_domain',  label: 'Industry or discipline',                          type: 'text',     required: false },
          { id: 'co_context', label: 'Give us a quick snapshot of where you are right now', type: 'textarea', required: true },
        ],
      },
      {
        title: 'Where You Want to Go',
        questions: [
          { id: 'co_goal',    label: "What's the goal you're working toward?",          type: 'textarea', required: true },
          { id: 'co_stuck',   label: "What's holding you back or creating friction?",  type: 'textarea', required: true },
          { id: 'co_tried',   label: 'What have you already tried?',                   type: 'textarea', required: false },
        ],
      },
      {
        title: 'Working Together',
        questions: [
          { id: 'co_style',   label: 'What kind of support do you need most?',         type: 'textarea', required: true, placeholder: 'Accountability, sounding board, strategy, skill-building, navigation…' },
          { id: 'co_wins',    label: "What's a recent win you're proud of?",           type: 'textarea', required: false },
          { id: 'co_other',   label: 'Anything else you want us to know?',             type: 'textarea', required: false },
        ],
      },
    ],
  },

  partner: {
    label: 'Partnership',
    color: '#a8c9d4',
    sections: [
      {
        title: 'Your Organization',
        questions: [
          { id: 'p_name',     label: 'Your name & title',                               type: 'text',     required: true },
          { id: 'p_org',      label: 'Organization name',                               type: 'text',     required: true },
          { id: 'p_website',  label: 'Website',                                         type: 'text',     required: false },
          { id: 'p_mission',  label: 'What does your organization do, and for whom?',  type: 'textarea', required: true },
        ],
      },
      {
        title: 'The Opportunity',
        questions: [
          { id: 'p_type',     label: 'What kind of partnership are you exploring?',    type: 'textarea', required: true, placeholder: 'Sponsorship, content, co-branding, data, events, talent pipeline…' },
          { id: 'p_why',      label: 'Why TOP 100? What alignment do you see?',         type: 'textarea', required: true },
          { id: 'p_offer',    label: 'What are you bringing to the table?',            type: 'textarea', required: true },
        ],
      },
      {
        title: 'Next Steps',
        questions: [
          { id: 'p_timeline', label: 'Ideal timeline to get something moving',          type: 'text',     required: false },
          { id: 'p_contact',  label: 'Best contact email for follow-up',               type: 'text',     required: true },
          { id: 'p_other',    label: 'Anything else to set context?',                  type: 'textarea', required: false },
        ],
      },
    ],
  },

  general: {
    label: 'General Inquiry',
    color: '#c9a87c',
    sections: [
      {
        title: 'Tell Us About Yourself',
        questions: [
          { id: 'g_name',     label: 'Your name',                                       type: 'text',     required: true },
          { id: 'g_role',     label: "Role or how you'd describe yourself",             type: 'text',     required: false },
          { id: 'g_email',    label: 'Best email for us to reach you',                  type: 'text',     required: true },
        ],
      },
      {
        title: 'Your Message',
        questions: [
          { id: 'g_context',  label: 'How did you find TOP 100?',                       type: 'text',     required: false },
          { id: 'g_message',  label: "What's on your mind? What brought you here?",    type: 'textarea', required: true },
          { id: 'g_ask',      label: 'Is there a specific question, request, or thing you need?', type: 'textarea', required: false },
        ],
      },
    ],
  },
};

// ── Field renderer ────────────────────────────────────────────────────────────
function Field({ q, value, onChange }) {
  const baseInput = 'bg-[#07111f]/60 border border-white/10 text-white placeholder:text-white/30 focus:border-[#c9a87c]/50 focus:ring-0 rounded-xl text-sm transition-colors';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label className="flex items-start gap-1.5">
        <span className="text-white/80 text-sm font-medium leading-snug">{q.label}</span>
        {q.required && <span className="text-[#d4a090] text-xs mt-0.5">*</span>}
      </label>
      {q.type === 'text' ? (
        <Input
          value={value || ''}
          onChange={e => onChange(q.id, e.target.value)}
          placeholder={q.placeholder || 'Your answer…'}
          className={baseInput}
        />
      ) : (
        <Textarea
          value={value || ''}
          onChange={e => onChange(q.id, e.target.value)}
          placeholder={q.placeholder || 'Your answer…'}
          className={`${baseInput} min-h-[90px] resize-none`}
        />
      )}
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DiscoveryQuestionnaireForm({ track, sectionIndex, formData, setFormData }) {
  const trackData = TRACKS[track];
  if (!trackData) return null;

  const section = trackData.sections[sectionIndex];
  if (!section) return null;

  const handleChange = (id, value) => setFormData(prev => ({ ...prev, [id]: value }));

  return (
    <div className="space-y-5">
      {section.questions.map((q, i) => (
        <motion.div key={q.id} transition={{ delay: i * 0.06 }}>
          <Field q={q} value={formData[q.id]} onChange={handleChange} />
        </motion.div>
      ))}
    </div>
  );
}