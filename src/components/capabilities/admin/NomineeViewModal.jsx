import { X, Mail, Linkedin, Globe, User, Users, Calendar, Award, Star, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function NomineeViewModal({ nominee, onClose }) {
  if (!nominee) return null;

  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved': return { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Approved' };
      case 'active': return { icon: Star, color: 'text-blue-600 bg-blue-100', text: 'Active' };
      case 'rejected': return { icon: XCircle, color: 'text-red-600 bg-red-100', text: 'Rejected' };
      case 'winner': return { icon: Award, color: 'text-amber-600 bg-amber-100', text: 'Winner' };
      case 'finalist': return { icon: Award, color: 'text-purple-600 bg-purple-100', text: 'Finalist' };
      default: return { icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-100', text: 'Pending' };
    }
  };

  const StatusBadge = ({ status }) => {
    const { icon: Icon, color, text } = getStatusInfo(status);
    return (
      <Badge className={`flex items-center gap-2 py-1 px-3 text-sm ${color}`}>
        <Icon className="w-4 h-4" />
        <span>{text}</span>
      </Badge>
    );
  };

  const InfoField = ({ icon, label, value, isLink = false }) => {
    const Icon = icon;
    return (
      <div className="flex items-start gap-4">
        <div className="mt-1 flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
              {value}
            </a>
          ) : (
            <p className="text-gray-800 break-words">{value || 'N/A'}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <img
              src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=random&size=128`}
              alt={nominee.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{nominee.name}</h2>
              <StatusBadge status={nominee.status} />
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-8 space-y-8">
          {/* Main Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Nominee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField icon={Mail} label="Primary Email" value={nominee.nominee_email} />
              <InfoField icon={User} label="Professional Role" value={nominee.professional_role} />
              <InfoField icon={Users} label="Industry" value={nominee.industry} />
              <InfoField icon={Globe} label="Country" value={nominee.country} />
              {nominee.linkedin_profile_url && <InfoField icon={Linkedin} label="LinkedIn Profile" value={nominee.linkedin_profile_url} isLink={true} />}
              {nominee.website_url && <InfoField icon={Globe} label="Website" value={nominee.website_url} isLink={true} />}
            </div>
          </section>

          {/* Description & Achievements */}
          <section>
             <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">One-Sentence Summary</h4>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-md border">{nominee.description || 'Not provided'}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Proudest Achievement</h4>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-md border">{nominee.linkedin_proudest_achievement || 'Not provided'}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Why Follow on LinkedIn</h4>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-md border">{nominee.linkedin_follow_reason || 'Not provided'}</p>
                </div>
             </div>
          </section>
          
          {/* Scores */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Scoring & Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-indigo-700">ELO Rating</p>
                    <p className="text-2xl font-bold text-indigo-900">{nominee.elo_rating || 1200}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-700">Borda Score</p>
                    <p className="text-2xl font-bold text-purple-900">{nominee.borda_score || 0}</p>
                </div>
                 <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">Direct Votes</p>
                    <p className="text-2xl font-bold text-green-900">{nominee.direct_vote_count || 0}</p>
                </div>
                 <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-700">Spotlights</p>
                    <p className="text-2xl font-bold text-amber-900">{nominee.total_spotlights || 0}</p>
                </div>
            </div>
          </section>

          {/* Nomination Info */}
          <section className="pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <InfoField icon={Mail} label="Nominated By" value={nominee.nominated_by} />
                <InfoField icon={Calendar} label="Nomination Date" value={format(new Date(nominee.created_date), 'PPP p')} />
              </div>
          </section>
        </div>
      </div>
    </div>
  );
}