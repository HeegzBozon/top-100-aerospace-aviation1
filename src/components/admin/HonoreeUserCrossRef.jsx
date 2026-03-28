import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Award, Users, CheckCircle2, XCircle, Loader2,
  ChevronDown, ChevronUp, Mail, Link2, UserCheck
} from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8' };

function normalize(str) {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function extractLinkedInSlug(url) {
  if (!url) return null;
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match ? match[1].toLowerCase() : null;
}

function fuzzyNameMatch(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // Check if one contains the other (handles middle names, suffixes)
  if (na.includes(nb) || nb.includes(na)) return true;
  // Token overlap: if 2+ tokens match
  const tokensA = na.split(' ');
  const tokensB = nb.split(' ');
  const overlap = tokensA.filter(t => t.length > 1 && tokensB.includes(t)).length;
  return overlap >= 2;
}

export default function HonoreeUserCrossRef({ users = [] }) {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Get all nominees sorted by aura_score to find the Top 100
        const all = await base44.entities.Nominee.list('-aura_score', 1000);
        // Take top 100 by aura_score (the 2025 honorees)
        setNominees(all.slice(0, 100));
      } catch (err) {
        console.error('Error loading nominees for cross-ref:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const results = useMemo(() => {
    if (!nominees.length || !users.length) return null;

    // Build user lookup indices
    const userEmailSet = new Set(users.map(u => normalize(u.email)));
    const userLinkedInSlugs = new Map();
    const userNameMap = new Map();

    users.forEach(u => {
      // LinkedIn from user record
      const slug = extractLinkedInSlug(u.linkedin_url);
      if (slug) userLinkedInSlugs.set(slug, u);
      // Name
      const name = normalize(u.full_name);
      if (name) {
        if (!userNameMap.has(name)) userNameMap.set(name, []);
        userNameMap.get(name).push(u);
      }
    });

    const matches = [];
    const noMatch = [];

    nominees.forEach((nominee, idx) => {
      const rank = idx + 1;
      const matchReasons = [];
      let matchedUser = null;

      // 1. Email exact match
      const nEmail = normalize(nominee.nominee_email);
      if (nEmail && userEmailSet.has(nEmail)) {
        matchReasons.push('email');
        matchedUser = users.find(u => normalize(u.email) === nEmail);
      }

      // 2. Secondary emails
      if (!matchedUser && nominee.secondary_emails?.length) {
        for (const se of nominee.secondary_emails) {
          const se_norm = normalize(se);
          if (se_norm && userEmailSet.has(se_norm)) {
            matchReasons.push('secondary_email');
            matchedUser = users.find(u => normalize(u.email) === se_norm);
            break;
          }
        }
      }

      // 3. claimed_by_user_email
      if (!matchedUser && nominee.claimed_by_user_email) {
        const ce = normalize(nominee.claimed_by_user_email);
        if (ce && userEmailSet.has(ce)) {
          matchReasons.push('claimed_email');
          matchedUser = users.find(u => normalize(u.email) === ce);
        }
      }

      // 4. LinkedIn URL match
      if (!matchedUser && nominee.linkedin_profile_url) {
        const nomineeSlug = extractLinkedInSlug(nominee.linkedin_profile_url);
        if (nomineeSlug && userLinkedInSlugs.has(nomineeSlug)) {
          matchReasons.push('linkedin');
          matchedUser = userLinkedInSlugs.get(nomineeSlug);
        }
      }

      // 5. Fuzzy name match (lower confidence)
      if (!matchedUser) {
        for (const [name, nameUsers] of userNameMap) {
          if (fuzzyNameMatch(nominee.name, name)) {
            matchReasons.push('name_fuzzy');
            matchedUser = nameUsers[0];
            break;
          }
        }
      }

      if (matchedUser) {
        matches.push({ nominee, rank, matchedUser, reasons: matchReasons });
      } else {
        noMatch.push({ nominee, rank });
      }
    });

    return { matches, noMatch, total: nominees.length };
  }, [nominees, users]);

  if (loading) {
    return (
      <Card className="border-2" style={{ borderColor: `${brand.gold}40` }}>
        <CardContent className="py-8 flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading cross-reference…
        </CardContent>
      </Card>
    );
  }

  if (!results) return null;

  const pct = Math.round((results.matches.length / results.total) * 100);
  const emailMatches = results.matches.filter(m => m.reasons.includes('email') || m.reasons.includes('secondary_email') || m.reasons.includes('claimed_email')).length;
  const linkedinMatches = results.matches.filter(m => m.reasons.includes('linkedin') && !m.reasons.some(r => r.includes('email'))).length;
  const fuzzyOnly = results.matches.filter(m => m.reasons.length === 1 && m.reasons[0] === 'name_fuzzy').length;

  return (
    <Card className="border-2" style={{ borderColor: `${brand.gold}40` }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
            <Award className="w-5 h-5" style={{ color: brand.gold }} />
            TOP 100 Women 2025 → User Cross-Reference
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
            <div className="text-2xl font-bold text-green-700">{results.matches.length}</div>
            <div className="text-xs text-green-600">Signed Up</div>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
            <div className="text-2xl font-bold text-red-600">{results.noMatch.length}</div>
            <div className="text-xs text-red-500">Not Found</div>
          </div>
          <div className="p-3 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold" style={{ color: brand.gold }}>{pct}%</div>
            <div className="text-xs text-gray-500">Coverage</div>
          </div>
          <div className="p-3 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold" style={{ color: brand.navy }}>{results.total}</div>
            <div className="text-xs text-gray-500">Total Honorees</div>
          </div>
        </div>

        <Progress value={pct} className="h-2" />

        {/* Match breakdown */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="text-green-700 border-green-300">
            <Mail className="w-3 h-3 mr-1" /> {emailMatches} email matches
          </Badge>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            <Link2 className="w-3 h-3 mr-1" /> {linkedinMatches} LinkedIn matches
          </Badge>
          <Badge variant="outline" className="text-amber-700 border-amber-300">
            <UserCheck className="w-3 h-3 mr-1" /> {fuzzyOnly} fuzzy name only
          </Badge>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className="space-y-4 pt-2">
            {/* Matched */}
            <div>
              <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Matched ({results.matches.length})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {results.matches.map(({ nominee, rank, matchedUser, reasons }) => (
                  <div key={nominee.id} className="flex items-center gap-3 p-2 rounded bg-green-50/60 text-sm">
                    <span className="text-xs font-mono text-gray-400 w-6">#{rank}</span>
                    <span className="font-medium flex-1 min-w-0 truncate" style={{ color: brand.navy }}>
                      {nominee.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[180px]">{matchedUser.email}</span>
                    <div className="flex gap-1 shrink-0">
                      {reasons.map(r => (
                        <Badge key={r} variant="outline" className="text-[10px] px-1.5 py-0">
                          {r === 'email' ? '✉️' : r === 'linkedin' ? '🔗' : r === 'name_fuzzy' ? '~' : r === 'claimed_email' ? '✋' : '✉️'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Not matched */}
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Not Found ({results.noMatch.length})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {results.noMatch.map(({ nominee, rank }) => (
                  <div key={nominee.id} className="flex items-center gap-3 p-2 rounded bg-red-50/40 text-sm">
                    <span className="text-xs font-mono text-gray-400 w-6">#{rank}</span>
                    <span className="font-medium flex-1 min-w-0 truncate">{nominee.name}</span>
                    <span className="text-xs text-gray-400 truncate max-w-[200px]">
                      {nominee.nominee_email || 'no email'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}