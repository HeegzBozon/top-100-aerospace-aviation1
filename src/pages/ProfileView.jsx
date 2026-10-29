import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useProfileResolution } from '@/hooks/useProfileResolution';
import { Trophy, ArrowUpRight, BookMarked, BookOpen, Download } from 'lucide-react';

import NomineeClaimPanel from '@/components/claim/NomineeClaimPanel';
import ProfileNeighborsRail from '@/components/profile/ProfileNeighborsRail';
import useProfileSeo from '@/components/profile/useProfileSeo';
import { useMyTop100 } from '@/components/fellow-home/useMyTop100';
import { accentValue, accentForDiscipline } from '@/components/fellow-home/fellowHomeConfig';
import { enabledModes, MODES } from '@/components/profile/intent/intentConfig';
import InquirySheet from '@/components/profile/intent/InquirySheet';
import { exportProfileDossier } from '@/lib/profileDossier';
import ProfileBook from '@/components/profile/book/ProfileBook';
import useProfileEditMenu from '@/components/profile/book/useProfileEditMenu';
import ProfileReader from '@/components/profile/book/ProfileReader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDeskDockSlot } from '@/components/desktop/deskDockSlots';
import { buildProfileBook } from '@/components/profile/book/profileBookPages';
import useEpisodeIntake from '@/components/episode/useEpisodeIntake';
import EpisodeSheet from '@/components/episode/EpisodeSheet';

const NAVY_DEEP = '#16293f';

// Two presentations of one record: the book (which plays) and the plain reader.
const RECORD_MODES = [
    { key: 'book', label: 'Book', Icon: BookMarked },
    { key: 'read', label: 'Read', Icon: BookOpen },
];

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

    // The record opens as a book, and the book plays: the film is absorbed into the
    // pages it was cut from. Read is the plain page reader. Deep-linked with ?mode=.
    const [mode, setMode] = useState(() => {
        const requested = params.get('mode');
        // Watch is absorbed into the book: the record plays where it is read.
        if (requested === 'watch') return 'book';
        return ['book', 'read'].includes(requested) ? requested : 'book';
    });

    // The Fellow's own episode, and the sheet they open it from.
    const [episodeOpen, setEpisodeOpen] = useState(false);

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

    const episode = useEpisodeIntake(fellowEmail);

    // Mission Rooms declarations, read as one small page of the record rather than
    // by mounting the whole room surface inside a page.
    const { data: conferences } = useQuery({
        queryKey: ['fellowConferences', fellowEmail],
        enabled: !!fellowEmail,
        queryFn: () =>
            base44.entities.ConferenceRsvp
                .filter({ fellow_email: fellowEmail }, { sort: '-declared_at', limit: 6 })
                .then((r) => r?.items || (Array.isArray(r) ? r : []))
                .catch(() => []),
    });

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

    // The book is composed from the same record the film is cut from: identity first,
    // the credential second, then the Fellow's own order, and the episode last. A
    // page with nothing in it is never printed.
    const book = useMemo(
        () =>
            buildProfileBook({
                user: profiles?.user,
                nominee: profiles?.nominee,
                settings: ownerSettings,
                rankings: top100.rankings,
                featuredViral,
                conferences,
                episode: episode.intake,
                accent,
            }),
        [profiles, ownerSettings, top100.rankings, featuredViral, conferences, episode.intake, accent]
    );

    const isOwner = !!viewer?.email && !!fellowEmail && viewer.email === fellowEmail;
    const openEpisode = isOwner ? () => setEpisodeOpen(true) : null;
    const enquire = primaryMode
        ? () => openEnquiry(primaryMode, primaryMode === 'hire' ? 'role_conversation' : 'introduction')
        : null;

    // The standardized one-page dossier, composed from the public record.
    const dossier =
        ownerSettings?.dossier_enabled !== false && profiles?.nominee
            ? () =>
                  exportProfileDossier({
                      nominee: profiles.nominee,
                      settings: ownerSettings,
                  })
            : null;

    // The claim band is seated in the book, so "claim this record" walks the reader
    // to it rather than opening a second surface for the same decision.
    const revealClaim = () =>
        document.getElementById('record-claim')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // How the record is presented, and the way out of it as a document. One group of
    // keys: on a desk it stands on the machine's shelf with the transport, on the glass
    // in the record's own frame — there is no second bar above the page.
    const isMobile = useIsMobile();
    const recordViewKeys = useMemo(
        () => (
            <div className="flex items-center gap-1">
                <div
                    role="group"
                    aria-label="How to view this record"
                    className="flex items-center gap-0.5 rounded-full p-0.5"
                    style={{ border: '1px solid rgb(var(--hh-metal-rgb) / 0.4)' }}
                >
                    {RECORD_MODES.map(({ key, label, Icon }) => {
                        const active = mode === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setMode(key)}
                                aria-pressed={active}
                                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors"
                                style={
                                    active
                                        ? { background: '#B87333', color: '#FAF8F5' }
                                        : { color: 'var(--mb-ink)' }
                                }
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="font-body text-[9px] font-bold uppercase tracking-[0.2em]">
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {dossier ? (
                    <button
                        type="button"
                        onClick={dossier}
                        aria-label="Download the dossier"
                        title="Dossier"
                        className="ds-tile flex h-9 w-9 items-center justify-center rounded-full"
                        style={{ color: '#C9A87C' }}
                    >
                        <Download className="h-3.5 w-3.5" />
                    </button>
                ) : null}
            </div>
        ),
        [mode, dossier]
    );
    useDeskDockSlot('record-view', isMobile ? null : recordViewKeys, 1);

    // The record's own Edit menu: the way back into the editor for the Fellow, and
    // the two things a record is for — writing to the person, claiming it — for
    // everyone else.
    useProfileEditMenu({
        enabled: hasRecord,
        isOwner,
        onOpenEpisode: openEpisode,
        onDossier: dossier,
        onEnquire: enquire,
        onRevealClaim: revealClaim,
        claimable: !!profiles?.nominee && !isOwner,
    });

    // Profile view counts are deliberately absent: they sit on the never-implement
    // list, so this surface neither counts a visit nor stores one.

    return (
        <div className="relative min-h-screen bg-editorial-cream md:min-h-full">
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
                    {/* On the glass there is no shelf to carry the view keys, so they ride
                        in the record's own frame. On a desk they are on the shelf. */}
                    {isMobile && (
                        <div
                            className="flex items-center justify-end px-4 py-1.5"
                            style={{ background: '#132539', borderBottom: '1px solid rgba(201,168,124,0.25)' }}
                        >
                            {recordViewKeys}
                        </div>
                    )}

                    {/* Who may take this record, seated in the book's own frame rather
                        than floating over the page being read. The owner needs no band:
                        their way back into the editor is the machine's own Edit menu. */}
                    {profiles.nominee && !isOwner ? (
                        <div id="record-claim">
                            <NomineeClaimPanel
                                nominee={profiles.nominee}
                                viewer={viewer}
                                onResolved={refetchProfile}
                                variant="seated"
                            />
                        </div>
                    ) : null}

                    {mode === 'read' ? (
                        <ProfileReader
                            pages={book.pages}
                            isOwner={isOwner}
                            onEnquire={enquire}
                            onOpenEpisode={openEpisode}
                        />
                    ) : (
                        <ProfileBook
                            pages={book.pages}
                            isOwner={isOwner}
                            onEnquire={enquire}
                            onOpenEpisode={openEpisode}
                            autoplayMode={ownerSettings?.autoplay_mode || 'loop'}
                            dwellSeconds={ownerSettings?.dwell_seconds || 7}
                        />
                    )}

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

            {episodeOpen && (
                <EpisodeSheet
                    open={episodeOpen}
                    onClose={() => setEpisodeOpen(false)}
                    intake={episode.intake}
                    fellowEmail={fellowEmail}
                    fellowId={profiles?.nominee?.id}
                    profileName={profiles?.nominee?.name || profiles?.user?.full_name}
                    onSaved={episode.reload}
                />
            )}
        </div>
    );
}