import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useProfileResolution } from '@/components/hooks/useProfileResolution';
import { Loader2, Crown, Briefcase, Building, MapPin, Linkedin, Link as LinkIcon, Trophy, Sparkles, Star, Globe, Award, Quote, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

import NomineeCareerHistorySection from '@/components/profile/NomineeCareerHistorySection';
import NomineeContributionsSection from '@/components/profile/NomineeContributionsSection';
import NomineeNewsSection from '@/components/profile/NomineeNewsSection';
import StartupPitch from '@/components/profile/StartupPitch';
import ProviderServicesList from '@/components/profile/ProviderServicesList';

const brandColors = {
    navyDeep: '#1e3a5a',
    skyBlue: '#4a90b8',
    goldPrestige: '#c9a87c',
    cream: '#faf8f5',
};

// Material-style info row
const InfoRow = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${brandColors.goldPrestige}15` }}>
            <Icon className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{label}</div>
            <div className="text-sm md:text-base text-gray-800 sf-pro">{children}</div>
        </div>
    </div>
);

// Apple-style link button
const LinkButton = ({ href, icon: Icon, children }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-xl glass-card hover:bg-white/90 transition-all group sf-pro"
    >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${brandColors.skyBlue}15` }}>
            <Icon className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
        </div>
        <span className="flex-1 text-sm font-medium" style={{ color: brandColors.navyDeep }}>{children}</span>
    </a>
);

export default function ProfileView({ userId: propUserId = null }) {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const targetId = propUserId || params.get('id');
    const targetEmail = params.get('user') || params.get('email');

    const { data: viewer } = useQuery({
        queryKey: ['me'],
        queryFn: () => base44.auth.me().catch(() => null),
    });

    const { data: profiles, isLoading } = useProfileResolution(targetId, targetEmail);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: brandColors.goldPrestige }} />
            </div>
        );
    }

    if (!profiles || (!profiles.user && !profiles.nominee && !profiles.startup && !profiles.provider)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: brandColors.cream }}>
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mb-6">
                    <Trophy className="w-10 h-10 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2 sf-pro" style={{ color: brandColors.navyDeep }}>Profile Not Found</h1>
                <p className="text-slate-500 mb-6">We couldn't locate this footprint in the ecosystem.</p>
            </div>
        );
    }

    const { user, nominee, startup, provider, employer } = profiles;

    // Synthesize top-level attributes based on what's available
    // Priority: User > Nominee > Provider > Startup
    const displayName = user?.full_name || nominee?.name || provider?.full_name || startup?.company_name || 'Anonymous';
    const displayAvatar = user?.avatar_url || nominee?.avatar_url || nominee?.photo_url || provider?.avatar_url || startup?.logo_url;
    const displayBio = user?.professional_bio || nominee?.bio || nominee?.description || provider?.biography;
    const displayRole = user?.job_title || nominee?.title || nominee?.professional_role || provider?.headline;
    const displayCompany = user?.company || nominee?.company || nominee?.organization || employer?.company_name;

    return (
        <div className="min-h-screen sf-pro pb-20" style={{ background: brandColors.cream }}>
            {/* Hero Section */}
            <div className="relative">
                <div className="relative h-[30vh] md:h-[40vh] overflow-hidden bg-slate-900">
                    {displayAvatar ? (
                        <>
                            <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover opacity-60 blur-sm scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5a] to-transparent mix-blend-multiply" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-80" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }} />
                    )}
                </div>

                {/* Floating Rank Badge (If Nominee) */}
                {nominee?.rank && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-bold text-white shadow-lg" style={{ background: `${brandColors.goldPrestige}ee` }}>
                            <Crown className="w-4 h-4" />
                            RANK #{nominee.rank}
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Core Identity */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-6 text-center material-shadow-lg bg-white/90 backdrop-blur-xl">
                            <img
                                src={displayAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128&background=random`}
                                className="w-32 h-32 rounded-full border-4 mx-auto mb-4 object-cover"
                                style={{ borderColor: brandColors.cream }}
                                alt={displayName}
                            />
                            <h1 className="text-2xl font-bold mb-1" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>{displayName}</h1>
                            {(user?.handle || nominee?.handle) && (
                                <p className="text-sm font-medium mb-3 text-slate-500">@{user?.handle || nominee?.handle || 'user'}</p>
                            )}

                            <div className="flex flex-col gap-2 mb-4">
                                {displayRole && (
                                    <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100" style={{ color: brandColors.navyDeep }}>
                                        <Briefcase className="w-3 h-3" /> {displayRole}
                                    </span>
                                )}
                                {displayCompany && (
                                    <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: `${brandColors.skyBlue}15`, color: brandColors.skyBlue }}>
                                        <Building className="w-3 h-3" /> {displayCompany}
                                    </span>
                                )}
                            </div>

                            {/* Badges mapped from entities */}
                            <div className="flex flex-wrap items-center justify-center gap-2 border-t pt-4">
                                {nominee && <Badge className="" variant="default" style={{ background: brandColors.goldPrestige }}>Nominee</Badge>}
                                {startup && <Badge className="" variant="default" style={{ background: brandColors.skyBlue }}>Startup Founder</Badge>}
                                {provider && provider.is_active && <Badge className="" variant="outline">Service Provider</Badge>}
                            </div>
                        </motion.div>



                        {/* General Info / Links */}
                         {(user?.linkedin_url || nominee?.linkedin_profile_url || user?.personal_website_url || nominee?.website_url) && (
                             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-4 material-shadow bg-white/70 space-y-2">
                                 <h3 className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: brandColors.goldPrestige }}>Connect</h3>
                                 {(user?.linkedin_url || nominee?.linkedin_profile_url) && (
                                     <LinkButton href={user?.linkedin_url || nominee?.linkedin_profile_url} icon={Linkedin}>LinkedIn Profile</LinkButton>
                                 )}
                                 {(user?.personal_website_url || nominee?.website_url) && (
                                     <LinkButton href={user?.personal_website_url || nominee?.website_url} icon={ExternalLink}>Website</LinkButton>
                                 )}
                                 {viewer?.email === (user?.email || nominee?.nominee_email) && (user?.email || nominee?.nominee_email) && (
                                     <LinkButton href={`mailto:${user?.email || nominee?.nominee_email}`} icon={Mail}>Email</LinkButton>
                                 )}
                             </motion.div>
                         )}
                    </div>

                    {/* Right Column: Composite Detailed Content */}
                    <div className="lg:col-span-2 space-y-6 mt-8 lg:mt-0 pt-16 lg:pt-0">

                        {displayBio && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 material-shadow bg-white">
                                <h3 className="text-lg font-bold mb-3" style={{ color: brandColors.navyDeep }}>Overview</h3>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{displayBio}</p>
                            </motion.div>
                        )}

                        {/* Nominee Extracted Details (If Nominee exists) */}
                        {nominee && (nominee.industry || nominee.achievements || nominee.linkedin_follow_reason || nominee.nomination_reason) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 material-shadow bg-white">
                                <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>Nominee Highlights</h3>
                                <div className="space-y-2">
                                    {nominee.industry && <InfoRow icon={Globe} label="Industry">{nominee.industry}</InfoRow>}
                                    {nominee.achievements && <InfoRow icon={Award} label="Achievements">{nominee.achievements}</InfoRow>}
                                    {nominee.linkedin_follow_reason && <InfoRow icon={Linkedin} label="Why Follow">{nominee.linkedin_follow_reason}</InfoRow>}
                                    {nominee.nomination_reason && <InfoRow icon={Quote} label="Nominated For">{nominee.nomination_reason}</InfoRow>}
                                </div>
                            </motion.div>
                        )}

                        {/* Startup Sub-profile */}
                        {startup && (viewer?.is_investor || viewer?.is_admin || viewer?.tier === 'premium' || viewer?.email === startup.founder_email) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <StartupPitch startup={startup} user={viewer} mySignal={null} signals={[]} />
                            </motion.div>
                        )}

                        {/* Service Provider Profile */}
                        {provider && provider.is_active && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <ProviderServicesList providerEmail={provider.user_email} userName={displayName} />
                            </motion.div>
                        )}

                        {/* Nominee Ecosystem Records */}
                        {nominee && (
                            <div className="space-y-6">
                                <NomineeCareerHistorySection nominee={nominee} />
                                <NomineeContributionsSection nomineeId={nominee.id} />
                                <NomineeNewsSection nomineeId={nominee.id} />
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}