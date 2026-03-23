import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Nominee } from '@/entities/Nominee';
import { Profile } from '@/entities/Profile';
import { Employer } from '@/entities/Employer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, User as UserIcon, Star, Briefcase, Building2, CheckCircle2, Plus, ArrowLeft, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

import UserProfileEditor from './editors/UserProfileEditor';
import NomineeProfileEditor from './editors/NomineeProfileEditor';
import ServiceProviderEditor from './editors/ServiceProviderEditor';
import EmployerProfileEditor from './editors/EmployerProfileEditor';
import FlightographyEditor from './editors/FlightographyEditor';
import StartupProfileEditor from './editors/StartupProfileEditor';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const PROFILE_TYPES = [
  {
    id: 'user',
    label: 'User Profile',
    icon: UserIcon,
    description: 'Basic account info',
    alwaysExists: true,
  },
  {
    id: 'nominee',
    label: 'Nominee Profile',
    icon: Star,
    description: 'TOP 100 competition',
    alwaysExists: false,
  },
  {
    id: 'provider',
    label: 'Service Provider',
    icon: Briefcase,
    description: 'Marketplace services',
    alwaysExists: false,
  },
  {
    id: 'startup',
    label: 'Startup Profile',
    icon: Rocket,
    description: 'Pitch & Stats',
    alwaysExists: false,
  },
  {
    id: 'employer',
    label: 'Employer',
    icon: Building2,
    description: 'Company & job postings',
    alwaysExists: false,
  },
  {
    id: 'flightography',
    label: 'Flightography',
    icon: Rocket,
    description: 'Program credits',
    alwaysExists: false,
  },
];

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
  const [profiles, setProfiles] = useState({
    nominee: null,
    provider: null,
    employer: null,
    startup: null,
  });

  useEffect(() => {
    loadAllProfiles();
  }, [user]);

  const loadAllProfiles = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [nominees, providerProfiles, employers, startups] = await Promise.all([
        Nominee.filter({ claimed_by_user_email: user.email }),
        Profile.filter({ user_email: user.email }),
        Employer.filter({ owner_email: user.email }),
        base44.entities.StartupProfile.filter({ founder_email: user.email }),
      ]);

      setProfiles({
        nominee: nominees[0] || null,
        provider: providerProfiles[0] || null,
        employer: employers[0] || null,
        startup: startups[0] || null,
      });
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (type, updatedProfile) => {
    setProfiles(prev => ({ ...prev, [type]: updatedProfile }));
  };

  const calculateCompleteness = (type) => {
    if (type === 'user') {
      const fields = ['full_name', 'avatar_url'];
      const filled = fields.filter(f => user?.[f]).length;
      return Math.round((filled / fields.length) * 100);
    }
    if (type === 'nominee' && profiles.nominee) {
      const fields = ['name', 'bio', 'avatar_url', 'linkedin_profile_url', 'six_word_story'];
      const filled = fields.filter(f => profiles.nominee[f]).length;
      return Math.round((filled / fields.length) * 100);
    }
    if (type === 'provider' && profiles.provider) {
      const fields = ['headline', 'biography', 'service_bio', 'avatar_url'];
      const filled = fields.filter(f => profiles.provider[f]).length;
      return Math.round((filled / fields.length) * 100);
    }
    if (type === 'employer' && profiles.employer) {
      const fields = ['company_name', 'overview_short', 'logo_url', 'website_url', 'headquarters_location'];
      const filled = fields.filter(f => profiles.employer[f]).length;
      return Math.round((filled / fields.length) * 100);
    }
    if (type === 'startup' && profiles.startup) {
      const fields = ['company_name', 'tagline', 'description', 'website_url', 'pitch_deck_url'];
      const filled = fields.filter(f => profiles.startup[f]).length;
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
            Edit Profiles
          </h1>
          <p className="text-slate-600 text-sm">
            Manage all your profiles in one place
          </p>
        </div>
      </div>

      {/* Profile Type Selector - Grid on mobile, horizontal on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {PROFILE_TYPES.map(type => (
          <ProfileTypeCard
            key={type.id}
            type={type}
            exists={type.alwaysExists || profiles[type.id] !== null}
            isActive={activeType === type.id}
            onClick={() => setActiveType(type.id)}
            completeness={calculateCompleteness(type.id)}
          />
        ))}
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
          {activeType === 'nominee' && (
            <NomineeProfileEditor
              user={user}
              nominee={profiles.nominee}
              onUpdate={(n) => handleProfileUpdate('nominee', n)}
            />
          )}
          {activeType === 'provider' && (
            <ServiceProviderEditor
              user={user}
              profile={profiles.provider}
              onUpdate={(p) => handleProfileUpdate('provider', p)}
            />
          )}
          {activeType === 'employer' && (
            <EmployerProfileEditor
              user={user}
              employer={profiles.employer}
              onUpdate={(e) => handleProfileUpdate('employer', e)}
            />
          )}
          {activeType === 'startup' && (
            <StartupProfileEditor
              user={user}
              startup={profiles.startup}
              onUpdate={(s) => handleProfileUpdate('startup', s)}
            />
          )}
          {activeType === 'flightography' && (
            <FlightographyEditor user={user} />
          )}
        </Card>
      </motion.div>
    </div>
  );
}