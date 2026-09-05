import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useMyTop100 } from '@/components/fellow-home/useMyTop100';
import ProfileDeck from '@/components/profile-deck/ProfileDeck';
import IdentitySlide from '@/components/profile-deck/slides/IdentitySlide';
import VerificationSlide from '@/components/profile-deck/slides/VerificationSlide';
import BlurbSlide from '@/components/profile-deck/slides/BlurbSlide';
import DocumentsSlide from '@/components/profile-deck/slides/DocumentsSlide';
import EightSlide from '@/components/profile-deck/slides/EightSlide';
import FlightographySlide from '@/components/profile-deck/slides/FlightographySlide';
import { resolveSlideOrder } from '@/components/profile-deck/slideDeckConfig';
import SlideErrorBoundary from '@/components/profile-deck/SlideErrorBoundary';
import NomineeClaimPanel from '@/components/claim/NomineeClaimPanel';
import useProfileSeo from '@/components/profile/useProfileSeo';

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
    const queryClient = useQueryClient();
    const refetchProfile = () => queryClient.invalidateQueries({ queryKey: ['unified-profile'] });

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

    // Inject dynamic <title>, meta, canonical, OG/Twitter, and Person +
    // BreadcrumbList JSON-LD for the canonical public profile route.
    useProfileSeo(profiles);

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
    const top100 = useMyTop100(wallEmail);

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
                    ownerAccent={ownerAccent}
                    ownerSettings={ownerSettings}
                    top100={top100}
                    viewer={viewer}
                    onResolved={refetchProfile}
                />
            )}

            <HomeDock />
        </div>
    );
}

function ProfileBody({ profiles, ownerAccent, ownerSettings, top100, viewer, onResolved }) {
    const { user, nominee } = profiles;

    // Resolve the Fellow's configured slide order. Locked positions 1 and 2
    // (identity, verification) are always present; hidden slides are excluded.
    const slideOrder = resolveSlideOrder(ownerSettings);

    const slides = slideOrder.map((key) => {
        let entry = null;
        switch (key) {
            case 'identity':
                entry = { key, label: 'Identity', content: (
                    <IdentitySlide user={user} nominee={nominee} accent={ownerAccent} coverKey={ownerSettings?.cover_asset_id} />
                )};
                break;
            case 'verification':
                entry = { key, label: 'Credential', content: <VerificationSlide nominee={nominee} accent={ownerAccent} /> };
                break;
            case 'blurb':
                entry = { key, label: 'Editorial', content: (
                    <BlurbSlide user={user} settings={ownerSettings} accent={ownerAccent} readOnly />
                )};
                break;
            case 'documents':
                entry = { key, label: 'Documents', content: <DocumentsSlide user={user} accent={ownerAccent} /> };
                break;
            case 'eight':
                // Respect the Fellow's visibility toggle — hidden lists never render publicly.
                // Gate on ownerSettings having resolved so a hidden Eight never flashes
                // during the settings-loading window (undefined === false is false).
                if (ownerSettings && ownerSettings.eight_public !== false) {
                    entry = { key, label: 'The Eight', content: (
                        <EightSlide rankings={top100.rankings} isOwner={false} accent={ownerAccent} isPublic loading={top100.loading} />
                    )};
                }
                break;
            case 'flightography':
                entry = { key, label: 'Flightography', content: (
                    <FlightographySlide nominee={nominee} user={user} accent={ownerAccent} />
                )};
                break;
            default:
                break;
        }
        if (!entry) return null;
        return { ...entry, content: <SlideErrorBoundary label={entry.label}>{entry.content}</SlideErrorBoundary> };
    }).filter(Boolean);

    return (
        <div className="min-h-screen" style={{ background: B.navyDeep }}>
            {nominee && (
                <NomineeClaimPanel
                    nominee={nominee}
                    viewer={viewer}
                    onResolved={onResolved}
                />
            )}
            <ProfileDeck slides={slides} settings={ownerSettings} accent={ownerAccent} />
        </div>
    );
}