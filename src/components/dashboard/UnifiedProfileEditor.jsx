import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Nominee } from '@/entities/Nominee';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, User as UserIcon, Star, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import UserProfileEditor from './editors/UserProfileEditor';
import NomineeProfileEditor from './editors/NomineeProfileEditor';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

function ProfileTypeCard({ type, exists, isActive, onClick, completeness }) {
  const Icon = type.icon;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all w-full ${isActive
        ? 'bg-white shadow-md border-2'
        : 'bg-white/50 border border-slate-200 hover:bg-white hover:shadow-sm'
        }`}
      style={isActive ? { borderColor: brandColors.navyDeep } : {}}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${exists ? 'bg-slate-100' : 'bg-slate-50'
          }`}
        style={isActive ? { background: brandColors.navyDeep, color: 'white' } : {}}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800 text-sm truncate">{type.label}</span>
          {exists ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          ) : !type.alwaysExists ? (
            <Plus className="w-4 h-4 text-slate-400 shrink-0" />
          ) : null}
        </div>
        <p className="text-xs text-slate-500 truncate">{type.description}</p>
      </div>
      {exists && completeness !== undefined && (
        <Badge
          variant="secondary"
          className={`text-[10px] shrink-0 ${completeness >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
        >
          {completeness}%
        </Badge>
      )}
    </button>
  );
}

export default function UnifiedProfileEditor({ user }) {
  const [activeType, setActiveType] = useState('user');
  const [loading, setLoading] = useState(true);
  const [nominee, setNominee] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Nominee.filter({ claimed_by_user_email: user.email })
      .then(nominees => setNominee(nominees[0] || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const visibleTabs = [
    { id: 'user', label: 'User Profile', icon: UserIcon, description: 'Basic account info' },
    ...(nominee ? [{ id: 'nominee', label: 'Flightography', icon: Star, description: 'TOP 100 competition' }] : []),
  ];

  const calculateCompleteness = (type) => {
    if (type === 'user') {
      const fields = ['full_name', 'avatar_url'];
      const filled = fields.filter(f => user?.[f]).length;
      return Math.round((filled / fields.length) * 100);
    }
    if (type === 'nominee' && nominee) {
      const fields = ['name', 'bio', 'avatar_url', 'linkedin_profile_url', 'six_word_story'];
      const filled = fields.filter(f => nominee[f]).length;
      return Math.round((filled / fields.length) * 100);
    }
    return undefined;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.navyDeep }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="sm" className="mb-4 text-slate-600 hover:text-slate-900 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="text-center">
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
          >
            Edit Profile
          </h1>
          <p className="text-slate-600 text-sm">
            Manage your profile
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className={`grid grid-cols-${visibleTabs.length} gap-2 mb-6`}>
        {visibleTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;
          const completeness = calculateCompleteness(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all w-full ${
                isActive ? 'bg-white shadow-md border-2' : 'bg-white/50 border border-slate-200 hover:bg-white hover:shadow-sm'
              }`}
              style={isActive ? { borderColor: brandColors.navyDeep } : {}}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-100"
                style={isActive ? { background: brandColors.navyDeep, color: 'white' } : {}}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 text-sm truncate">{tab.label}</span>
                  {completeness !== undefined && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{tab.description}</p>
              </div>
              {completeness !== undefined && (
                <Badge
                  variant="secondary"
                  className={`text-[10px] shrink-0 ${completeness >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                >
                  {completeness}%
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Editor */}
      <motion.div
        key={activeType}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-4 md:p-6 bg-white border-slate-200">
          {activeType === 'user' && (
            <UserProfileEditor user={user} />
          )}
          {activeType === 'nominee' && nominee && (
            <NomineeProfileEditor
              user={user}
              nominee={nominee}
              onUpdate={(n) => setNominee(n)}
            />
          )}
        </Card>
      </motion.div>
    </div>
  );
}