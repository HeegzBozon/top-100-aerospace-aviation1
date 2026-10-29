import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useProfileResolution } from '@/hooks/useProfileResolution';
import { Trophy, ArrowUpRight } from 'lucide-react';

import NomineeClaimPanel from '@/components/claim/NomineeClaimPanel';
import ProfileNeighborsRail from '@/components/profile/ProfileNeighborsRail';
import useProfileSeo from '@/components/profile/useProfileSeo';
import { useMyTop100 } from '@/components/fellow-home/useMyTop100';
import { accentValue, accentForDiscipline } from '@/components/fellow-home/fellowHomeConfig';
import { enabledModes, MODES } from '@/components/profile/intent/intentConfig';
import InquirySheet from '@/components/profile/intent/InquirySheet';
import { exportProfileDossier } from '@/lib/profileDossier';
import PublicProfileHero from '@/components/profile/public/PublicProfileHero';
import CredentialBand from '@/components/profile/public/CredentialBand';
import PublicProfileBody from '@/components/profile/public/PublicProfileBody';

const NAVY_DEEP = '#16293f';

// The page opens as the console does: a navy plate, held for a beat, then handed
// over to the record.
function ProfileLoader() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center" style={{ background: NAVY_DEEP }}>
            <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: '#b87333' }} />
            </div>
            <span className="mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-editorial-gold/80">
                Opening the record
            </span>
        </div>
    );
}

function NotFound() {
    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = 'prerender-status-code';
        meta.content = '404';
        document.head.appendChild(meta);
        return () => document.head.removeChild(meta);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: NAVY_DEEP }}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-editorial-copper/40">
                <Trophy className="h-8 w-8 text-editorial-gold/80" strokeWidth={1.6} />
            </div>
            <h1 className="mt-6 font-heading text-[28px] text-editorial-cream">Profile not found</h1>
            <p className="mt-2 max-w-sm text-center font-body text-[12.5px] leading-relaxed text-editorial-cream/55">
                We could not locate this record in the ecosystem. It may have been merged into a canonical profile.
            </p>
            <Link
                to="/Top100Women2025"
                className="mt-6 inline-flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-gold"
            >
                Open the directory <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
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

    // The door a visitor is writing through: null is closed, an object is the sheet.
    const [inquiry, setInquiry] = useState(null);
    const openEnquiry = (mode, requestType) => setInquiry({ mode, requestType });

    // Cinematic entrance — fades the navy veil out on mount.
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

    // Dynamic <title>, meta, canonical, and Person + BreadcrumbList JSON-LD for
    // the canonical public profile route.
    useProfileSeo(profiles);

    const fellowEmail = profiles?.user?.email || profiles?.nominee?.nominee_email;

    // Visitors see the Fellow's governed accent. No edit affordance is derived from it.
    const { data: ownerSettings } = useQuery({
        queryKey: ['fellowProfileSettings', fellowEmail],
        enabled: !!fellowEmail,
        queryFn: () =>
            base44.entities.FellowProfileSettings.filter({ fellow_email: fellowEmail })
                .then((r) => r?.[0] || null)
                .catch(() => null),
    });
    const accent = accentValue(
        ownerSettings?.domain_accent || accentForDiscipline(profiles?.nominee?.discipline)
    );

    const top100 = useMyTop100(fellowEmail);

    // Featured Top Viral Post — public read through a backend function so signed-out
    // visitors can see it; only the public viral-post fields are surfaced.
    const nomineeId = profiles?.nominee?.id;
    const { data: publicViralPost } = useQuery({
        queryKey: ['publicViralPost', nomineeId],
        enabled: !!nomineeId,
        queryFn: async () => {
            try {
                const r = await base44.functions.invoke('getPublicViralPost', { nominee_id: nomineeId });
                return r && typeof r === 'object' && 'data' in r ? r.data : r;
            } catch {
                return null;
            }
        },
    });
    const featuredViral = publicViralPost?.featured ? publicViralPost : null;

    const primaryMode = enabledModes(ownerSettings)[0];
    const hasRecord = !!profiles && (profiles.user || profiles.nominee || profiles.startup || profiles.provider);

    // Profile view counts are deliberately absent: they sit on the never-implement
    // list, so this surface neither counts a visit nor stores one.

    return (
        <div className="relative min-h-screen bg-editorial-cream">
            <div
                className="pointer-events-none fixed inset-0 z-[300] transition-opacity duration-700 ease-in-out"
                style={{ background: NAVY_DEEP, opacity: entered ? 0 : 1 }}
            />

            {isLoading ? (
                <ProfileLoader />
            ) : !hasRecord ? (
                <NotFound />
            ) : (
                <>
                    {profiles.nominee && (
                        <NomineeClaimPanel nominee={profiles.nominee} viewer={viewer} onResolved={refetchProfile} />
                    )}

                    <PublicProfileHero
                        user={profiles.user}
                        nominee={profiles.nominee}
                        settings={ownerSettings}
                        accent={accent}
                        enquiryLabel={primaryMode ? MODES[primaryMode].cta : ''}
                        onEnquire={
                            primaryMode
                                ? () =>
                                      openEnquiry(
                                          primaryMode,
                                          primaryMode === 'hire' ? 'role_conversation' : 'introduction'
                                      )
                                : null
                        }
                    />

                    <CredentialBand nominee={profiles.nominee} />

                    <PublicProfileBody
                        profiles={profiles}
                        settings={ownerSettings}
                        accent={accent}
                        viewer={viewer}
                        top100={top100}
                        featuredViral={featuredViral}
                        onEnquire={openEnquiry}
                        onDossier={() => exportProfileDossier({ nominee: profiles.nominee, settings: ownerSettings })}
                    />

                    {profiles.nominee && <ProfileNeighborsRail nominee={profiles.nominee} />}
                </>
            )}

            {inquiry && profiles?.nominee && (
                <InquirySheet
                    nominee={profiles.nominee}
                    mode={inquiry.mode}
                    requestType={inquiry.requestType}
                    onClose={() => setInquiry(null)}
                />
            )}
        </div>
    );
}