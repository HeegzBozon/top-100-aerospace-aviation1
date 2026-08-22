import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useProfileResolution } from '@/hooks/useProfileResolution';
import { Crown, Briefcase, Building, Linkedin, Trophy, Globe, Award, Quote, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

import NomineeCareerHistorySection from '@/components/profile/NomineeCareerHistorySection';
import NomineeContributionsSection from '@/components/profile/NomineeContributionsSection';
import NomineeNewsSection from '@/components/profile/NomineeNewsSection';
import StartupPitch from '@/components/profile/StartupPitch';
import ProviderServicesList from '@/components/profile/ProviderServicesList';
import ShareableProfileCard from '@/components/profile/ShareableProfileCard';
import ProfileSocialLinks from '@/components/profile/ProfileSocialLinks';
import ProfileExpertiseTags from '@/components/profile/ProfileExpertiseTags';
import LaurelAvatar from '@/components/profile/LaurelAvatar';
import EndorsementWall from '@/components/fellow-home/EndorsementWall';
import useEndorsementWall from '@/components/fellow-home/useEndorsementWall';
import ConnectButton from '@/components/fellow-home/ConnectButton';
import FollowButton from '@/components/fellow-home/FollowButton';
import HomeDock from '@/components/home-v3/HomeDock';
import { accentValue, accentForDiscipline } from '@/components/fellow-home/fellowHomeConfig';
import { statusByKey } from '@/components/fellow-home/fellowStatuses';

const B = {
    navyDeep: '#16293f',
    navy: '#1e3a5a',
    skyBlue: '#4a90b8',
    gold: '#c9a87c',
    cream: '#faf8f5',
    sand: '#efe7dc',
};

// Material-style info row
function InfoRow({ icon: Icon, label, children }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${B.gold}15` }}>
                <Icon className="w-4 h-4" style={{ color: B.gold }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{label}</div>
                <div className="text-sm md:text-base text-gray-800 sf-pro">{children}</div>
            </div>
        </div>
    );
}

// Cinematic loading surface — navy, gold spinner, on-brand. Seamless under the entrance fade.
function CinematicLoader() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: B.navyDeep }}>
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: B.gold }} />
            </div>
            <span className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${B.gold}cc` }}>
                Loading Profile
            </span>
        </div>
    );
}

function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: B.navyDeep }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ border: `1px solid ${B.gold}33` }}>
                <Trophy className="w-9 h-9" style={{ color: `${B.gold}99` }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>Profile Not Found</h1>
            <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>We couldn't locate this footprint in the ecosystem.</p>
            <Link to="/" className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: B.gold }}>Return Home</Link>
        </div>
    );
}

export default function ProfileView({ userId: propUserId = null }) {
    const { id: pathId } = useParams();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const targetId = propUserId || pathId || params.get('id');
    const targetEmail = params.get('user') || params.get('email');

    // Cinematic entrance — fades the navy veil out on mount, bridging "See full profile" → page.
    const [entered, setEntered] = useState(false);
    useEffect(() => {
        const r = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
        return () => cancelAnimationFrame(r);
    }, []);

    const { data: viewer } = useQuery({
        queryKey: ['me'],
        queryFn: () => base44.auth.me().catch(() => null),
    });

    const { data: profiles, isLoading } = useProfileResolution(targetId, targetEmail);

    const wallEmail = profiles?.user?.email || profiles?.nominee?.nominee_email;
    const { entries: wallEntries, submit: submitWallEntry, approve: approveWallEntry } = useEndorsementWall(wallEmail, profiles?.nominee?.id);

    // Visitors see the owner's governed accent. No edit affordance is derived from it.
    const { data: ownerSettings } = useQuery({
        queryKey: ['fellowProfileSettings', wallEmail],
        enabled: !!wallEmail,
        queryFn: () => base44.entities.FellowProfileSettings.filter({ fellow_email: wallEmail }).then((r) => r?.[0] || null).catch(() => null),
    });
    const ownerAccent = accentValue(ownerSettings?.domain_accent || accentForDiscipline(profiles?.nominee?.discipline));
    const ownerStatus = statusByKey(ownerSettings?.status_key);

    // Count a visit once per mount, and only from another member. Owner-visible only.
    const counted = useRef(false);
    useEffect(() => {
        if (counted.current) return;
        if (!viewer?.email || !wallEmail || viewer.email === wallEmail) return;
        if (!ownerSettings?.id) return;
        counted.current = true;
        base44.entities.FellowProfileSettings.update(ownerSettings.id, {
            profile_view_count: (ownerSettings.profile_view_count || 0) + 1,
        }).catch(() => {});
    }, [viewer?.email, wallEmail, ownerSettings]);

    return (
        <div className="min-h-screen relative sf-pro" style={{ background: B.cream }}>
            {/* Cinematic entrance veil — navy, fades out to reveal the page */}
            <div
                className="fixed inset-0 z-[300] pointer-events-none transition-opacity duration-[800ms] ease-in-out"
                style={{ background: B.navyDeep, opacity: entered ? 0 : 1 }}
            />

            {isLoading ? (
                <CinematicLoader />
            ) : !profiles || (!profiles.user && !profiles.nominee && !profiles.startup && !profiles.provider) ? (
                <NotFound />
            ) : null}

            {profiles && (profiles.user || profiles.nominee || profiles.startup || profiles.provider) && !isLoading && (
                <ProfileBody
                    profiles={profiles}
                    viewer={viewer}
                    wallEmail={wallEmail}
                    wallEntries={wallEntries}
                    submitWallEntry={submitWallEntry}
                    approveWallEntry={approveWallEntry}
                    ownerAccent={ownerAccent}
                    ownerStatus={ownerStatus}
                    entered={entered}
                />
            )}

            <HomeDock />
        </div>
    );
}

function ProfileBody({ profiles, viewer, wallEmail, wallEntries, submitWallEntry, approveWallEntry, ownerAccent, ownerStatus, entered }) {
    const { user, nominee, startup, provider, employer } = profiles;

    const displayName = user?.full_name || nominee?.name || provider?.full_name || startup?.company_name || 'Anonymous';
    const displayAvatar = user?.avatar_url || nominee?.avatar_url || nominee?.photo_url || provider?.avatar_url || startup?.logo_url;
    const displayBio = user?.bio || user?.professional_bio || nominee?.bio || nominee?.description || provider?.biography;
    const displayBioExtended = nominee?.bio_extended;
    const displayRole = user?.headline || user?.job_title || nominee?.title || nominee?.professional_role || provider?.headline;
    const displayCompany = user?.company || nominee?.company || nominee?.organization || employer?.company_name;
    const sixWordStory = nominee?.six_word_story;
    const displayCountry = user?.location || nominee?.country;

    const rise = {
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)',
    };

    return (
        <div className="pb-24" style={{ background: B.cream }}>
            {/* Cinematic hero */}
            <div className="relative">
                <div className="relative h-[42vh] md:h-[56vh] overflow-hidden" style={{ background: B.navyDeep }}>
                    {displayAvatar ? (
                        <>
                            <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover opacity-40 scale-110" style={{ filter: 'blur(5px)' }} />
                            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${B.navyDeep}66 0%, ${B.navyDeep}99 45%, ${B.cream} 100%)` }} />
                        </>
                    ) : (
                        <div className="w-full h-full" style={{ background: `linear-gradient(150deg, ${B.navyDeep}, #0c1830 70%, ${B.cream})` }} />
                    )}

                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.34em]" style={{ color: B.gold }}>
                        TOP 100 · Public Profile
                    </div>

                    {nominee?.rank && (
                        <div className="absolute top-6 right-6 z-10">
                            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-md text-[11px] font-bold text-white shadow-lg" style={{ background: `${B.gold}ee` }}>
                                <Crown className="w-3.5 h-3.5" />
                                RANK #{nominee.rank}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-24 md:-mt-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Core Identity */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="relative glass-card rounded-3xl p-6 text-center material-shadow-lg bg-white/90 backdrop-blur-xl"
                        >
                            {viewer && (
                                nominee?.nominee_email === viewer.email ||
                                nominee?.claimed_by_user_email === viewer.email ||
                                user?.email === viewer.email
                            ) && (
                                <Link to="/Profile" className="absolute top-4 right-4">
                                    <button
                                        aria-label="Edit your profile"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white transition-all shadow-sm"
                                        style={{ color: B.navy }}
                                    >
                                        <Pencil className="w-3 h-3" />
                                        Edit Profile
                                    </button>
                                </Link>
                            )}
                            <LaurelAvatar
                                src={displayAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128&background=random`}
                                alt={displayName}
                                size={128}
                                designation={nominee ? (['winner', 'finalist'].includes(nominee.status) ? 'alumni' : 'nominee') : null}
                            />
                            <h1 className="text-2xl font-bold mb-1 mt-3" style={{ color: B.navy, fontFamily: "'Playfair Display', serif" }}>{displayName}</h1>
                            {(user?.handle || nominee?.handle) && (
                                <p className="text-sm font-medium mb-3 text-slate-500">@{user?.handle || nominee?.handle || 'user'}</p>
                            )}

                            {ownerStatus && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: `${ownerAccent}14`, color: B.navy }}>
                                    <span className="text-sm leading-none">{ownerStatus.glyph}</span>
                                    {ownerStatus.label}
                                </div>
                            )}

                            {sixWordStory && (
                                <p className="text-base italic mb-3 leading-snug" style={{ color: B.gold, fontFamily: "'Playfair Display', serif" }}>
                                    “{sixWordStory}”
                                </p>
                            )}

                            <div className="flex flex-col gap-2 mb-4">
                                {displayRole && (
                                    <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100" style={{ color: B.navy }}>
                                        <Briefcase className="w-3 h-3" /> {displayRole}
                                    </span>
                                )}
                                {displayCompany && (
                                    <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: `${B.skyBlue}15`, color: B.skyBlue }}>
                                        <Building className="w-3 h-3" /> {displayCompany}
                                    </span>
                                )}
                                {displayCountry && (
                                    <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: `${B.gold}12`, color: B.gold }}>
                                        📍 {displayCountry}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2 border-t pt-4">
                                {nominee && <Badge variant="default" style={{ background: B.gold }}>Nominee</Badge>}
                                {startup && <Badge variant="default" style={{ background: B.skyBlue }}>Startup Founder</Badge>}
                                {provider && provider.is_active && <Badge variant="outline">Service Provider</Badge>}
                            </div>

                            {wallEmail && (
                                <ConnectButton viewer={viewer} targetEmail={wallEmail} targetName={displayName} targetAvatar={displayAvatar} accent={ownerAccent} />
                            )}
                            {wallEmail && (
                                <FollowButton viewer={viewer} targetEmail={wallEmail} targetName={displayName} targetAvatar={displayAvatar} accent={ownerAccent} />
                            )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={rise}>
                            <ProfileSocialLinks user={user} nominee={nominee} viewer={viewer} />
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={rise}>
                            <ProfileExpertiseTags skills={nominee?.skills} expertise_tags={user?.expertise_tags} />
                        </motion.div>
                    </div>

                    {/* Right Column: Composite Detailed Content */}
                    <div className="lg:col-span-2 space-y-6 mt-8 lg:mt-0 pt-16 lg:pt-0">

                        {(displayBio || displayBioExtended) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 material-shadow bg-white" style={rise}>
                                <h3 className="text-lg font-bold mb-3" style={{ color: B.navy, fontFamily: "'Playfair Display', serif" }}>Overview</h3>
                                <div className="h-px w-12 mb-4" style={{ background: B.gold }} />
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">{displayBio}</p>
                                {displayBioExtended && displayBioExtended !== displayBio && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{displayBioExtended}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {nominee && (nominee.industry || nominee.achievements || nominee.linkedin_follow_reason || nominee.nomination_reason) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 material-shadow bg-white" style={rise}>
                                <h3 className="text-lg font-bold mb-4" style={{ color: B.navy, fontFamily: "'Playfair Display', serif" }}>Nominee Highlights</h3>
                                <div className="space-y-2">
                                    {nominee.industry && <InfoRow icon={Globe} label="Industry">{nominee.industry}</InfoRow>}
                                    {nominee.achievements && <InfoRow icon={Award} label="Achievements">{nominee.achievements}</InfoRow>}
                                    {nominee.linkedin_follow_reason && <InfoRow icon={Linkedin} label="Why Follow">{nominee.linkedin_follow_reason}</InfoRow>}
                                    {nominee.nomination_reason && <InfoRow icon={Quote} label="Nominated For">{nominee.nomination_reason}</InfoRow>}
                                </div>
                            </motion.div>
                        )}

                        {startup && (viewer?.is_investor || viewer?.is_admin || viewer?.tier === 'premium' || viewer?.email === startup.founder_email) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={rise}>
                                <StartupPitch startup={startup} user={viewer} mySignal={null} signals={[]} />
                            </motion.div>
                        )}

                        {provider && provider.is_active && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={rise}>
                                <ProviderServicesList providerEmail={provider.user_email} userName={displayName} />
                            </motion.div>
                        )}

                        {(nominee || (user?.custom_card_stats?.length > 0)) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={rise}>
                                <ShareableProfileCard user={user} nominee={nominee} readOnly />
                            </motion.div>
                        )}

                        {wallEmail && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={rise}>
                                <EndorsementWall
                                    entries={wallEntries}
                                    isOwner={!!viewer && viewer.email === wallEmail}
                                    canWrite={!!viewer && viewer.email !== wallEmail}
                                    isAdmin={viewer?.role === 'admin'}
                                    accent={ownerAccent}
                                    onSubmit={(body) => submitWallEntry(body, viewer)}
                                    onApprove={approveWallEntry}
                                />
                            </motion.div>
                        )}

                        {nominee && (
                            <div className="space-y-6">
                                <NomineeCareerHistorySection nominee={nominee} />
                                <NomineeContributionsSection nomineeId={nominee.id} />
                                <NomineeNewsSection nomineeId={nominee.id} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}