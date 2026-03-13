import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { chessManageChallenge } from '@/functions/chessManageChallenge';
import { createPageUrl } from '@/utils';
import { Chess } from 'chess.js';
import { Swords, CheckCircle2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChallengeModal from '@/components/epics/03-mission-rooms/games/ChallengeModal';
import BotSelectModal from '@/components/epics/03-mission-rooms/games/BotSelectModal';
import LeaderboardTable from '@/components/epics/03-mission-rooms/games/LeaderboardTable';
import { toast } from 'sonner';

// ─── Theme tokens (works in both light and dark mode) ──────────
// Dark surfaces  → bg-[#0d0d0d] / bg-[#161616] / border-white/15
// Light surfaces → bg-white / bg-gray-50 / border-black/10
// We detect dark mode via the .dark class on <html> using Tailwind dark: variants.

// ─── Sub-components ────────────────────────────────────────────

function OnlineNowPanel({ profiles }) {
  const sorted = useMemo(() => [...profiles].sort((a, b) => (b.elo_rating || 1200) - (a.elo_rating || 1200)).slice(0, 8), [profiles]);
  return (
    <div className="border border-black/10 dark:border-white/15 bg-white dark:bg-[#161616]">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/8 dark:border-white/10">
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-black/50 dark:text-white/50">Online Now</span>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{sorted.length} active</span>
      </div>
      <div className="divide-y divide-black/[0.05] dark:divide-white/[0.07]">
        {sorted.map(p => (
          <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center text-xs font-bold shrink-0 text-black dark:text-white">
                {(p.display_name || p.user_email || '?')[0].toUpperCase()}
              </div>
              <span className="font-medium text-sm truncate text-black/85 dark:text-white/90">{p.display_name || p.user_email}</span>
            </div>
            <span className="font-bold tabular-nums text-sm text-black dark:text-white shrink-0 ml-3">{p.elo_rating || 1200}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="border border-black/10 dark:border-white/15 bg-white dark:bg-[#161616] px-6 py-5">
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-black/50 dark:text-white/50 mb-3">{label}</p>
      <p className="text-4xl font-bold tracking-tight leading-none text-black dark:text-white">{value}</p>
      {sub && <p className="text-xs text-black/40 dark:text-white/40 mt-2 italic">{sub}</p>}
    </div>
  );
}

function RecentGameRow({ game }) {
  const result = game.winner_email
    ? game.player_white_email === game.winner_email ? '1–0' : '0–1'
    : game.status === 'draw' || game.status === 'stalemate' ? '½–½' : '—';
  const wName = game.player_white_name || game.player_white_email?.split('@')[0];
  const bName = game.player_black_name || game.player_black_email?.split('@')[0];
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] last:border-0">
      <div>
        <p className="text-sm font-semibold text-black/85 dark:text-white/90">
          <span>{wName}</span>
          <span className="text-black/35 dark:text-white/40 font-normal mx-1.5">vs</span>
          <span>{bName}</span>
        </p>
        <p className="text-[11px] text-black/40 dark:text-white/40 mt-0.5">{game.move_count || 0} moves · {game.time_control}</p>
      </div>
      <span className="font-bold text-sm tabular-nums text-black/65 dark:text-white/75 shrink-0 ml-4">{result}</span>
    </div>
  );
}

function ChallengeRow({ challenge, onAccept, onDecline, onWithdraw, isIncoming }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] last:border-0">
      <div>
        <p className="text-sm font-semibold text-black/85 dark:text-white/90">
          {isIncoming ? (challenge.challenger_name || challenge.challenger_email) : (challenge.challenged_name || challenge.challenged_email)}
        </p>
        <p className="text-[11px] text-black/45 dark:text-white/45 mt-0.5">
          {challenge.game_type === 'real_time' ? 'Real-Time' : 'Turn-Based'} · {challenge.time_control}
        </p>
      </div>
      <div className="flex gap-2 shrink-0 ml-3">
        {isIncoming ? (
          <>
            <Button size="sm" className="h-8 px-3 text-xs bg-black text-white dark:bg-white dark:text-black hover:opacity-80 font-semibold" onClick={() => onAccept(challenge.id)}>
              Accept
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-black/15 dark:border-white/15 text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white" onClick={() => onDecline(challenge.id)}>
              Decline
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-black/15 dark:border-white/15 text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white" onClick={() => onWithdraw(challenge.id)}>
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────

const NAV_TABS = ['lobby', 'play', 'members', 'rankings'];

function ClubNav({ active, onChange, incomingCount }) {
  return (
    <nav className="border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#0d0d0d] sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-0 h-12">
        <div className="flex items-baseline gap-2 mr-8 shrink-0">
          <span className="text-sm font-black tracking-tight uppercase text-black dark:text-white">TOP 100</span>
          <span className="text-xs text-black/40 dark:text-white/40 font-medium">Chess Club</span>
        </div>
        {NAV_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative h-12 px-4 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors ${
              active === tab ? 'text-black dark:text-white' : 'text-black/35 dark:text-white/35 hover:text-black/70 dark:hover:text-white/70'
            }`}
          >
            {tab === 'lobby' ? 'Lobby' : tab === 'play' ? 'Play' : tab === 'members' ? 'Members' : 'Rankings'}
            {tab === 'play' && incomingCount > 0 && (
              <span className="absolute top-2.5 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent,#c9a84c)]" />
            )}
            {active === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function ChessClub() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('lobby');
  const [challengeTarget, setChallengeTarget] = useState(null);
  const [showBotModal, setShowBotModal] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.entities.ChessClubProfile.filter({ user_email: user.email }).then(profiles => {
      if (!profiles?.length) {
        base44.entities.ChessClubProfile.create({
          user_id: user.id,
          user_email: user.email,
          display_name: user.full_name || user.email,
          avatar_url: user.avatar_url || '',
          elo_rating: 1200
        });
      }
    });
  }, [user]);

  const { data: games = [] } = useQuery({
    queryKey: ['chess-games', user?.email],
    queryFn: () => Promise.all([
      base44.entities.ChessGame.filter({ player_white_email: user.email }),
      base44.entities.ChessGame.filter({ player_black_email: user.email })
    ]).then(([w, b]) => {
      const seen = new Set();
      return [...w, ...b]
        .filter(g => { if (seen.has(g.id)) return false; seen.add(g.id); return true; })
        .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
    }),
    enabled: !!user,
    refetchInterval: 10000
  });

  const { data: challenges = { incoming: [], outgoing: [] } } = useQuery({
    queryKey: ['chess-challenges', user?.email],
    queryFn: () => Promise.all([
      base44.entities.ChessChallenge.filter({ challenged_email: user.email, status: 'pending' }),
      base44.entities.ChessChallenge.filter({ challenger_email: user.email, status: 'pending' })
    ]).then(([inc, out]) => ({ incoming: inc || [], outgoing: out || [] })),
    enabled: !!user,
    refetchInterval: 15000
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['chess-leaderboard'],
    queryFn: () => base44.entities.ChessClubProfile.list('-elo_rating', 50),
    refetchInterval: 30000
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['chess-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user
  });

  const handleChallengeAction = useCallback(async (challengeId, action) => {
    await chessManageChallenge({ action, challenge_id: challengeId });
    qc.invalidateQueries({ queryKey: ['chess-challenges'] });
    qc.invalidateQueries({ queryKey: ['chess-games'] });
    if (action === 'accept') { toast.success('Challenge accepted!'); setActiveTab('play'); }
    if (action === 'decline') toast.info('Challenge declined.');
  }, [qc]);

  const myProfile = useMemo(() => leaderboard.find(p => p.user_email === user?.email), [leaderboard, user]);
  const activeGames = useMemo(() => games.filter(g => g.status === 'active'), [games]);
  const completedGames = useMemo(() => games.filter(g => g.status !== 'active'), [games]);
  const incomingCount = challenges.incoming?.length || 0;

  const myTurnGames = useMemo(() => activeGames.filter(g => {
    try {
      const chess = new Chess(g.current_fen);
      return chess.turn() === (g.player_white_email === user?.email ? 'w' : 'b');
    } catch { return false; }
  }), [activeGames, user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] text-gray-900 dark:text-[#f0f0f0]">
      <ClubNav active={activeTab} onChange={setActiveTab} incomingCount={incomingCount} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── LOBBY ── */}
        {activeTab === 'lobby' && (
          <div className="space-y-6">
            {/* Hero + Online Now */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
              {/* Hero */}
              <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/15 p-8 sm:p-10 flex flex-col justify-between min-h-[280px]">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-black/50 dark:text-white/60 mb-4">Welcome Back</p>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-4 text-black dark:text-white">
                    {user.full_name || user.email.split('@')[0]}
                  </h1>
                  <p className="text-sm text-black/50 dark:text-white/55 italic leading-relaxed max-w-xs">
                    The private chess club for TOP 100 Women in Aerospace. Play, practice, and connect.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  <button
                    onClick={() => setActiveTab('members')}
                    className="px-6 py-3 border border-black dark:border-white text-black dark:text-white text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors min-h-[44px]"
                  >
                    New Game ♟
                  </button>
                  <button
                    onClick={() => setShowBotModal(true)}
                    className="px-6 py-3 border border-black dark:border-white text-black dark:text-white text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors min-h-[44px]"
                  >
                    Play Bots 🤖
                  </button>
                  <button
                    onClick={() => setActiveTab('play')}
                    className="px-6 py-3 border border-black/25 dark:border-white/25 text-black/50 dark:text-white/50 text-[11px] font-bold tracking-[0.15em] uppercase hover:border-black/60 dark:hover:border-white/60 hover:text-black dark:hover:text-white transition-colors min-h-[44px]"
                  >
                    My Games {activeGames.length > 0 && `(${activeGames.length})`}
                  </button>
                </div>
              </div>

              {/* Online Now */}
              <OnlineNowPanel profiles={leaderboard} />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Total Members"
                value={allUsers.length || '—'}
                sub="Verified Honorees"
              />
              <StatCard
                label="Your Rating"
                value={myProfile?.elo_rating || 1200}
                sub={myProfile?.games_played ? null : 'Provisional'}
              />
              <StatCard
                label="Games Played"
                value={myProfile?.games_played || 0}
                sub="All time"
              />
            </div>

            {/* Recent Games */}
            {completedGames.length > 0 && (
              <div className="border border-black/10 dark:border-white/15 bg-white dark:bg-[#161616]">
                <div className="px-5 py-3.5 border-b border-black/8 dark:border-white/10">
                  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-black/50 dark:text-white/50">Recent Games</span>
                </div>
                <div className="px-5 py-1">
                  {completedGames.slice(0, 6).map(g => <RecentGameRow key={g.id} game={g} />)}
                </div>
              </div>
            )}

            {/* Incoming Challenges Banner */}
            {incomingCount > 0 && (
              <button
                onClick={() => setActiveTab('play')}
                className="w-full flex items-center justify-between px-5 py-4 border border-[var(--accent,#c9a84c)]/50 bg-[var(--accent,#c9a84c)]/8 hover:bg-[var(--accent,#c9a84c)]/12 transition-colors min-h-[44px]"
              >
                <span className="text-sm font-semibold text-[var(--accent,#c9a84c)]">
                  {incomingCount} incoming challenge{incomingCount > 1 ? 's' : ''} waiting
                </span>
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--accent,#c9a84c)]">View →</span>
              </button>
            )}
          </div>
        )}

        {/* ── PLAY ── */}
        {activeTab === 'play' && (
          <div className="space-y-8">
            {/* Incoming Challenges */}
            {incomingCount > 0 && (
              <section>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--accent,#c9a84c)] mb-3">Incoming Challenges</p>
                <div className="border border-[var(--accent,#c9a84c)]/30 bg-[var(--accent,#c9a84c)]/5 px-5 py-1">
                  {challenges.incoming.map(c => (
                    <ChallengeRow
                      key={c.id}
                      challenge={c}
                      isIncoming
                      onAccept={id => handleChallengeAction(id, 'accept')}
                      onDecline={id => handleChallengeAction(id, 'decline')}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Outgoing Challenges */}
            {challenges.outgoing?.length > 0 && (
              <section>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-black/50 dark:text-white/50 mb-3">Sent Challenges</p>
                <div className="border border-black/10 dark:border-white/15 bg-white dark:bg-[#161616] px-5 py-1">
                  {challenges.outgoing.map(c => (
                    <ChallengeRow
                      key={c.id}
                      challenge={c}
                      isIncoming={false}
                      onWithdraw={id => handleChallengeAction(id, 'withdraw')}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Active Games */}
            {activeGames.length > 0 && (
              <section>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-black/50 dark:text-white/50 mb-3">
                  Active Games
                  {myTurnGames.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-[var(--accent,#c9a84c)] text-black text-[9px] font-black">{myTurnGames.length} your turn</span>
                  )}
                </p>
                <div className="border border-black/10 dark:border-white/15 bg-white dark:bg-[#161616]">
                  {activeGames.map(g => (
                    <a
                      key={g.id}
                      href={createPageUrl(`ChessGame?id=${g.id}`)}
                      className={`flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors ${
                        (() => { try { const c = new Chess(g.current_fen); return c.turn() === (g.player_white_email === user.email ? 'w' : 'b'); } catch { return false; } })()
                          ? 'border-l-2 border-l-[var(--accent,#c9a84c)] pl-4' : ''
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-black/85 dark:text-white/90">
                          vs {g.player_white_email === user.email
                            ? (g.player_black_name || g.player_black_email?.split('@')[0])
                            : (g.player_white_name || g.player_white_email?.split('@')[0])}
                        </p>
                        <p className="text-[11px] text-black/45 dark:text-white/45 mt-0.5 uppercase tracking-wide">
                          {g.player_white_email === user.email ? 'White' : 'Black'} · {g.time_control} · {g.move_count || 0} moves
                        </p>
                      </div>
                      <span className={`text-[10px] font-black tracking-[0.1em] uppercase ${
                        (() => { try { const c = new Chess(g.current_fen); return c.turn() === (g.player_white_email === user.email ? 'w' : 'b'); } catch { return false; } })()
                          ? 'text-[var(--accent,#c9a84c)]' : 'text-black/40 dark:text-white/40'
                      }`}>
                        {(() => { try { const c = new Chess(g.current_fen); return c.turn() === (g.player_white_email === user.email ? 'w' : 'b') ? 'Your turn' : 'Waiting'; } catch { return '—'; } })()}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Completed */}
            {completedGames.length > 0 && (
              <section>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-black/50 dark:text-white/50 mb-3">Completed</p>
                <div className="border border-black/10 dark:border-white/15 bg-white dark:bg-[#161616] px-5 py-1">
                  {completedGames.slice(0, 10).map(g => <RecentGameRow key={g.id} game={g} />)}
                </div>
              </section>
            )}

            {activeGames.length === 0 && completedGames.length === 0 && incomingCount === 0 && !challenges.outgoing?.length && (
              <div className="text-center py-24">
                <Swords className="w-10 h-10 mx-auto mb-4 opacity-10" />
                <p className="text-sm text-black/30 dark:text-white/30">No games yet — challenge a member to begin</p>
                <button
                  onClick={() => setActiveTab('members')}
                  className="mt-6 px-6 py-3 border border-black/20 dark:border-white/20 text-[11px] font-bold tracking-[0.15em] uppercase text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:border-black/50 dark:hover:border-white/50 transition-colors"
                >
                  Find an Opponent
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERS ── */}
        {activeTab === 'members' && (
          <div className="border border-black/10 dark:border-white/15 bg-white dark:bg-[#161616]">
            {allUsers.filter(u => u.email !== user?.email).map(u => {
              const profile = leaderboard.find(p => p.user_email === u.email);
              return (
                <div key={u.id} className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.06] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {u.avatar_url
                      ? <img src={u.avatar_url} alt={u.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      : <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center text-xs font-bold shrink-0 text-black dark:text-white">{(u.full_name || u.email || '?')[0].toUpperCase()}</div>
                    }
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate text-black/85 dark:text-white/90">{u.full_name || u.email}</p>
                      {profile && <p className="text-[11px] text-black/45 dark:text-white/45">{profile.elo_rating || 1200} rating · {profile.games_played || 0} games</p>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-9 min-w-[44px] bg-black dark:bg-white text-white dark:text-black hover:opacity-80 text-xs font-bold shrink-0"
                    onClick={() => setChallengeTarget(u)}
                    aria-label={`Challenge ${u.full_name}`}
                  >
                    <Swords className="w-3.5 h-3.5 mr-1.5" /> Challenge
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── RANKINGS ── */}
        {activeTab === 'rankings' && (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-black/50 dark:text-white/50 mb-5">Club Leaderboard</p>
            <div className="border border-black/10 dark:border-white/15 bg-white dark:bg-[#161616] px-5 py-4">
              <LeaderboardTable profiles={leaderboard} />
            </div>
          </div>
        )}
      </div>

      <BotSelectModal open={showBotModal} onClose={() => setShowBotModal(false)} />

      {challengeTarget && (
        <ChallengeModal
          open={!!challengeTarget}
          onClose={() => { setChallengeTarget(null); qc.invalidateQueries({ queryKey: ['chess-challenges'] }); }}
          targetUser={challengeTarget}
        />
      )}
    </div>
  );
}