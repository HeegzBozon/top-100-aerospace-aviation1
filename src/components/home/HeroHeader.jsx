import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Crown, Award, Briefcase, Users, Star, Building, Edit, CheckCircle2, Linkedin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
};

const roleConfig = {
  admin: { label: 'Platform Admin', icon: Crown, gradient: 'from-purple-600 to-indigo-600' },
  honoree: { label: 'Honoree', icon: Award, gradient: 'from-amber-500 to-yellow-400' },
  nominee: { label: 'Nominee', icon: Star, gradient: 'from-blue-500 to-cyan-400' },
  nominator: { label: 'Nominator', icon: Users, gradient: 'from-green-500 to-emerald-400' },
  employer: { label: 'Employer', icon: Building, gradient: 'from-slate-600 to-slate-500' },
  sponsor: { label: 'Sponsor', icon: Briefcase, gradient: 'from-rose-500 to-pink-400' },
  user: { label: 'Member', icon: Users, gradient: 'from-sky-500 to-blue-400' },
};

export default function HeroHeader({ user, onUpdate }) {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkedinLoading, setLinkedinLoading] = useState(false);

  const linkedinConnected = user?.linkedin_connected;

  const userRole = user?.platform_role || user?.role || 'user';
  const config = roleConfig[userRole] || roleConfig.user;
  const Icon = config.icon;

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Champion';
  const greeting = getGreeting();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  useEffect(() => {
    const loadNominees = async () => {
      if (!user?.email) return;
      try {
        const userNominees = await base44.entities.Nominee.filter({ 
          claimed_by_user_email: user.email 
        });
        setNominees(userNominees);
      } catch (error) {
        console.error('Failed to load nominees:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNominees();
  }, [user?.email]);

  const hasClaimed = nominees.length > 0;

  const connectLinkedIn = async () => {
    setLinkedinLoading(true);
    try {
      const { linkedinProfile } = await import('@/functions/linkedinProfile');
      const response = await linkedinProfile();
      if (response.data?.profile) {
        await base44.auth.updateMe({
          linkedin_connected: true,
          linkedin_picture: response.data.profile.picture,
          linkedin_name: response.data.profile.name,
        });
        toast.success('LinkedIn connected!');
        onUpdate?.();
      } else if (response.data?.error) {
        toast.error(response.data.error);
      }
    } catch (err) {
      console.error('LinkedIn error:', err);
      toast.error('Failed to connect LinkedIn');
    } finally {
      setLinkedinLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-8"
      style={{ 
        background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 100%)`,
      }}
    >
      {/* Decorative elements - desktop only */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 hidden md:block"
        style={{ background: brandColors.goldPrestige }}
      />
      <div 
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-10 hidden md:block"
        style={{ background: brandColors.goldLight }}
      />

      <div className="relative z-10 flex items-center gap-3 md:gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div 
            className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2"
            style={{ borderColor: brandColors.goldPrestige }}
          >
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1e3a5a&color=c9a87c&size=128`}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Role badge */}
          <div 
            className={`absolute -bottom-1 -right-1 w-5 h-5 md:w-7 md:h-7 rounded-md md:rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className="text-white/60 text-[10px] md:text-sm font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {greeting}
          </p>
          <h1 
            className="text-base md:text-3xl font-bold text-white mb-0.5 md:mb-1 truncate"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {displayName}
          </h1>
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            <span 
              className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-gradient-to-r ${config.gradient} text-white`}
            >
              <Icon className="w-2.5 h-2.5 md:w-3 md:h-3" />
              {config.label}
            </span>
            {user?.aura_rank_name && (
              <span 
                className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold"
                style={{ 
                  background: `${brandColors.goldPrestige}20`,
                  color: brandColors.goldLight,
                  border: `1px solid ${brandColors.goldPrestige}40`
                }}
              >
                {user.aura_rank_name}
              </span>
            )}
            {hasClaimed && (
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all cursor-pointer"
                    style={{ 
                      color: brandColors.navyDeep,
                      border: `1px solid ${brandColors.goldPrestige}40`
                    }}
                  >
                    <Crown className="w-3 h-3" style={{ color: brandColors.goldPrestige }} />
                    Nominee
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                      <h3 className="font-bold text-base" style={{ color: brandColors.navyDeep }}>
                        Nominee Profile Management
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-center py-4">
                      <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>

                    <div className="text-center">
                      <h4 className="font-semibold text-sm mb-2" style={{ color: brandColors.navyDeep }}>
                        Profile Claimed Successfully
                      </h4>
                      <p className="text-xs text-gray-600">
                        You've claimed your nominee profile. Visit the Profile tab to manage it.
                      </p>
                    </div>

                    <Link to={createPageUrl('Profile')}>
                      <Button 
                        className="w-full text-white font-semibold"
                        style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.goldLight})` }}
                      >
                        Manage Profile
                      </Button>
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Connected Accounts - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={connectLinkedIn}
            disabled={linkedinLoading || linkedinConnected}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{ 
              background: linkedinConnected ? 'rgba(255,255,255,0.1)' : '#0A66C2',
              color: 'white',
              opacity: linkedinConnected ? 0.8 : 1
            }}
          >
            {linkedinLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : linkedinConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Linkedin className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{linkedinConnected ? 'LinkedIn' : 'Connect'}</span>
          </button>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <Link to={createPageUrl('EditProfile')}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-white/10 w-8 h-8 md:w-10 md:h-10"
              style={{ color: 'white' }}
            >
              <Edit className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}