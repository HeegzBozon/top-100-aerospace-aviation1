import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Clock, AlertCircle, TrendingUp, 
  FileText, Users, Award, Briefcase, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import VotingModal from '@/components/epics/06-nomination-engine/voting/VotingModal';
import NominationModal from '@/components/epics/06-nomination-engine/nominations/NominationModal';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
};

// Role-specific status displays
function NominatorStatus({ user }) {
  const stats = user?.nominator_stats || { submitted: 0, approved: 0, pending: 0 };
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
        <Users className="w-5 h-5" />
        Your Nominations
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
          <div className="text-xs text-blue-600/70">Submitted</div>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-amber-600/70">Pending</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs text-green-600/70">Approved</div>
        </div>
      </div>
      <Link 
        to={createPageUrl('Submit')}
        className="block text-center py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{ background: brandColors.goldPrestige, color: 'white' }}
      >
        + Submit New Nomination
      </Link>
    </div>
  );
}

function NomineeStatus({ user }) {
  const status = user?.nomination_status || 'under_review';
  const statusConfig = {
    under_review: { label: 'Under Review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    finalist: { label: 'Finalist', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
    rejected: { label: 'Not Selected', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
  };
  const config = statusConfig[status] || statusConfig.under_review;
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
        <FileText className="w-5 h-5" />
        Nomination Status
      </h3>
      <div className={`p-4 rounded-xl ${config.bg} flex items-center gap-3`}>
        <Icon className={`w-8 h-8 ${config.color}`} />
        <div>
          <div className={`font-bold ${config.color}`}>{config.label}</div>
          <div className="text-sm text-gray-600">Keep your profile updated for best results</div>
        </div>
      </div>
      <div className="flex gap-2">
        <Link 
          to={createPageUrl('EditProfile')}
          className="flex-1 text-center py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50"
          style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
        >
          Update Profile
        </Link>
        <Link 
          to={createPageUrl('TalentExchange')}
          className="flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: brandColors.goldPrestige, color: 'white' }}
        >
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}

function HonoreeStatus({ user }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
        <Award className="w-5 h-5" />
        Honoree Dashboard
      </h3>
      <div 
        className="p-4 rounded-xl flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}20, ${brandColors.goldLight}20)` }}
      >
        <Award className="w-10 h-10" style={{ color: brandColors.goldPrestige }} />
        <div>
          <div className="font-bold" style={{ color: brandColors.navyDeep }}>
            Welcome to the TOP 100
          </div>
          <div className="text-sm text-gray-600">
            {user?.class_year || '2024'} Honoree · {user?.category || 'Aerospace'}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link 
          to={createPageUrl('EditProfile')}
          className="text-center py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50"
          style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
        >
          Edit Profile
        </Link>
        <Link 
          to={createPageUrl('Arena')}
          className="text-center py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: brandColors.goldPrestige, color: 'white' }}
        >
          View Class
        </Link>
      </div>
    </div>
  );
}

function EmployerStatus({ user }) {
  const stats = user?.employer_stats || { activeJobs: 0, applications: 0, matches: 0 };
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
        <Briefcase className="w-5 h-5" />
        Recruitment Dashboard
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-600">{stats.activeJobs}</div>
          <div className="text-xs text-blue-600/70">Active Jobs</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600">{stats.applications}</div>
          <div className="text-xs text-green-600/70">Applications</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-xl">
          <div className="text-2xl font-bold text-purple-600">{stats.matches}</div>
          <div className="text-xs text-purple-600/70">AI Matches</div>
        </div>
      </div>
      <Link 
        to={createPageUrl('MissionControl') + '?module=employer'}
        className="block text-center py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{ background: brandColors.goldPrestige, color: 'white' }}
      >
        Go to Employer Dashboard
      </Link>
    </div>
  );
}

function DefaultStatus({ user }) {
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showNominationModal, setShowNominationModal] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
        <TrendingUp className="w-5 h-5" />
        Your Impact
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-600">{user?.votes_cast || 0}</div>
          <div className="text-xs text-blue-600/70">Votes Cast</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600">{user?.nominations_made || 0}</div>
          <div className="text-xs text-green-600/70">Nominations</div>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl">
          <div className="text-2xl font-bold" style={{ color: brandColors.goldPrestige }}>{user?.aura_score || 0}</div>
          <div className="text-xs" style={{ color: `${brandColors.goldPrestige}99` }}>Aura</div>
        </div>
      </div>
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Season 3 voting concluded Dec 24</p>
      </div>

      {showVotingModal && (
        <VotingModal
          isOpen={showVotingModal}
          onClose={() => setShowVotingModal(false)}
        />
      )}

      {showNominationModal && (
        <NominationModal
          isOpen={showNominationModal}
          onClose={() => setShowNominationModal(false)}
        />
      )}
    </div>
  );
}

export default function StatusModule({ user }) {
  const userRole = user?.platform_role || user?.role || 'user';

  const renderContent = () => {
    switch (userRole) {
      case 'nominator':
        return <NominatorStatus user={user} />;
      case 'nominee':
        return <NomineeStatus user={user} />;
      case 'honoree':
        return <HonoreeStatus user={user} />;
      case 'employer':
        return <EmployerStatus user={user} />;
      default:
        return <DefaultStatus user={user} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border shadow-sm"
      style={{ borderColor: `${brandColors.navyDeep}10` }}
    >
      {renderContent()}
    </motion.div>
  );
}