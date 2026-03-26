import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export default function DynamicProfilePage() {
  const { nomineeId } = useParams();
  const navigate = useNavigate();
  const [nominee, setNominee] = useState(null);
  const [adjacentIds, setAdjacentIds] = useState({ prev: null, next: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNominee = async () => {
      try {
        const data = await base44.entities.Nominee.get(nomineeId);
        setNominee(data);

        // Pre-fetch adjacent nominees for pagination
        const allNominees = await base44.entities.Nominee.list('-created_date', 1000);
        const idx = allNominees.findIndex(n => n.id === nomineeId);
        setAdjacentIds({
          prev: idx > 0 ? allNominees[idx - 1].id : null,
          next: idx < allNominees.length - 1 ? allNominees[idx + 1].id : null,
        });
      } catch (err) {
        console.error('Failed to load nominee:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNominee();
  }, [nomineeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!nominee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Profile not found</p>
          <Button onClick={() => navigate('/')}>Back to Directory</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <img
            src={nominee.avatar_url || nominee.photo_url || 'https://via.placeholder.com/64'}
            alt={nominee.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{nominee.name}</h1>
            <p className="text-slate-300">{nominee.title} at {nominee.company}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4 text-slate-800">About</h2>
          <p className="text-slate-700 leading-relaxed mb-4">{nominee.description}</p>
          {nominee.bio && (
            <p className="text-slate-600 leading-relaxed">{nominee.bio}</p>
          )}
        </motion.section>

        {/* Editorial Article */}
        {nominee.editorial_article && nominee.article_status === 'published' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 border-t pt-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Spotlight Article</h2>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{nominee.editorial_article}</ReactMarkdown>
            </div>
          </motion.section>
        )}

        {/* Career History */}
        {nominee.career_history && nominee.career_history.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 border-t pt-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Career History</h2>
            <div className="space-y-6">
              {nominee.career_history.map((role, idx) => (
                <div key={idx} className="border-l-2 border-slate-300 pl-4">
                  <h3 className="font-semibold text-slate-800">{role.role_title}</h3>
                  <p className="text-slate-600">{role.company_name}</p>
                  {role.start_date && (
                    <p className="text-sm text-slate-500">
                      {role.start_date} – {role.end_date || 'Present'}
                    </p>
                  )}
                  {role.description && <p className="mt-2 text-slate-700">{role.description}</p>}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Skills */}
        {nominee.skills && nominee.skills.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 border-t pt-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {nominee.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate(`/profiles/${adjacentIds.prev}`)}
            disabled={!adjacentIds.prev}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <Button onClick={() => navigate('/')} variant="ghost">
            View Directory
          </Button>
          <Button
            onClick={() => navigate(`/profiles/${adjacentIds.next}`)}
            disabled={!adjacentIds.next}
            className="gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}