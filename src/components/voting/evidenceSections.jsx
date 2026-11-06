import {
  Award, BookOpen, Briefcase, Compass, FileText, GraduationCap, Lightbulb,
  Link2, Quote, Rocket, ShieldCheck, TrendingUp, Users,
} from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import {
  careerTrajectory, disciplineLabel, metricCounts, orgScaleLabel, regionLabel,
} from '@/components/voting/anonymize';
import HonoreeChip from '@/components/voting/HonoreeChip';
import { buildArtifacts } from '@/components/voting/evidenceArtifacts';
import {
  ArtifactKey, ChipList, Empty, FactGrid, Prose, StatGrid, SubHead, Timeline,
} from '@/components/voting/evidenceBlocks';

// The candidate's file, composed from the record itself.
//
// This is the same record the public profile reads — the story, the standing, the
// flightography, the credentials, the counted signals, the ecosystem — laid out as a
// short read rather than as a dossier. Every section is built only when the record
// actually holds something: a sparse profile reads as a short file, never as a page of
// empty headings. A new field on the record becomes a section by adding one builder
// below; nothing in the panel has to know about it.

const STAGE = {
  early: 'Early career',
  mid: 'Mid-career',
  senior: 'Senior',
  executive: 'Executive',
};

const VERIFICATION = {
  unverified: 'Unverified',
  self_verified: 'Self verified',
  partially_verified: 'Partially verified',
  fully_verified: 'Fully verified',
};

const CHECKS = [
  ['LinkedIn', 'linkedin_verified'],
  ['Employer', 'employer_verified'],
  ['Fellow review', 'sme_reviewed'],
  ['Metrics', 'metrics_validated'],
];

const text = (v) => (typeof v === 'string' ? v.trim() : '');
const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : []);
const count = (v) => (typeof v === 'number' && v > 0 ? v : 0);

export function buildEvidenceSections({ nominee = {}, volumes = [] } = {}) {
  const sections = [];
  const say = (key, label, icon, body) => sections.push({ key, label, icon, body });

  const im = nominee.impact_metrics || {};
  const lm = nominee.leadership_metrics || {};
  const innov = nominee.innovation_metrics || {};
  const community = nominee.community_metrics || {};
  const ecosystem = nominee.ecosystem_metrics || {};
  const counts = metricCounts(nominee);
  const artifacts = buildArtifacts({ nominee, volumes });

  // ── The story ───────────────────────────────────────────────────────────────
  const story = text(nominee.six_word_story);
  say('story', 'Six word story', Quote, story ? (
    <p className="font-heading text-base italic leading-relaxed" style={{ color: brand.navy }}>
      <span style={{ color: brand.gold }}>&ldquo;</span>{story}<span style={{ color: brand.gold }}>&rdquo;</span>
    </p>
  ) : <Empty note="Not yet written — pending backfill." />);

  // ── The record: what they actually did ──────────────────────────────────────
  const lead = text(nominee.description) || text(nominee.impact_summary);
  const extended = text(nominee.bio_extended) || text(nominee.bio);
  const pitch = text(nominee.elevator_pitch);
  if (lead || extended || pitch) {
    say('record', 'The record', FileText, (
      <div className="space-y-2">
        {pitch && <p className="text-sm italic leading-relaxed" style={{ color: brand.navy }}>{pitch}</p>}
        {lead && <Prose>{lead}</Prose>}
        {extended && extended !== lead && <Prose>{extended}</Prose>}
      </div>
    ));
  }

  // ── Field and standing: the frame the work stands in ────────────────────────
  const facts = [
    { label: 'Field', value: disciplineLabel(nominee) },
    { label: 'Career stage', value: STAGE[nominee.trajectory_metrics?.career_stage] || '' },
    { label: 'Scale', value: orgScaleLabel(nominee) },
    { label: 'Region', value: regionLabel(nominee) },
    { label: 'Practice', value: list(nominee.skills).slice(0, 4).join(' · ') },
  ].filter((f) => f.value);
  if (facts.length) say('standing', 'Field & standing', Compass, <FactGrid facts={facts} />);

  // ── Flightography: the career, with employers left unnamed ──────────────────
  const trajectory = careerTrajectory(nominee);
  if (trajectory.length) say('flight', 'Flightography', Briefcase, <Timeline entries={trajectory} />);

  // ── Education ───────────────────────────────────────────────────────────────
  const education = (Array.isArray(nominee.education) ? nominee.education : [])
    .map((e) => ({
      role: text(e.institution_name) || text(e.degree),
      period: text(e.graduation_date).slice(0, 4),
      description: [text(e.degree), text(e.field_of_study)].filter(Boolean).join(' · '),
    }))
    .filter((e) => e.role || e.description);
  if (education.length) say('education', 'Education', GraduationCap, <Timeline entries={education} />);

  // ── Recognition: what the field has already said ────────────────────────────
  const awards = list(lm.awards);
  const roles = list(lm.leadership_roles);
  const affiliations = list(nominee.affiliations);
  const achievements = text(nominee.achievements);
  if (awards.length || roles.length || affiliations.length || achievements) {
    say('recognition', 'Recognition', Award, (
      <div className="space-y-3">
        {awards.length > 0 && <div><SubHead>Awards</SubHead><ChipList items={awards} /></div>}
        {roles.length > 0 && <div><SubHead>Leadership</SubHead><ChipList items={roles} /></div>}
        {affiliations.length > 0 && <div><SubHead>Affiliations</SubHead><ChipList items={affiliations} /></div>}
        {achievements && <Prose>{achievements}</Prose>}
      </div>
    ));
  }

  // ── The counted signals ─────────────────────────────────────────────────────
  const signals = [
    { label: 'Team led', value: counts.teamSize, icon: Users },
    { label: 'Patents', value: counts.patents, icon: FileText },
    { label: 'Startups', value: counts.startups, icon: Lightbulb },
    { label: 'Publications', value: counts.publications, icon: BookOpen },
    { label: 'Citations', value: count(im.citations_count), icon: TrendingUp },
    { label: 'Missions', value: counts.missions, icon: Rocket },
    { label: 'Flight hours', value: count(im.flight_hours), icon: Compass },
    { label: 'Awards', value: counts.awards, icon: Award },
  ].filter((s) => s.value > 0);
  if (signals.length) {
    const programs = list(im.programs_led);
    const deployed = list(im.tech_deployed);
    say('signals', 'Signals', TrendingUp, (
      <div className="space-y-3">
        <StatGrid stats={signals} />
        {programs.length > 0 && <div><SubHead>Programmes led</SubHead><ChipList items={programs} /></div>}
        {deployed.length > 0 && <div><SubHead>Technology fielded</SubHead><ChipList items={deployed} /></div>}
      </div>
    ));
  }

  // ── Innovation ──────────────────────────────────────────────────────────────
  const commercial = list(innov.tech_commercialized);
  const breakthrough = list(innov.breakthrough_classifications);
  const trl = text(innov.trl_advancement);
  if (count(innov.patents_filed) || count(innov.startups_founded) || trl || commercial.length || breakthrough.length) {
    const innovation = [
      { label: 'Patents filed', value: count(innov.patents_filed), icon: FileText },
      { label: 'Startups founded', value: count(innov.startups_founded), icon: Lightbulb },
    ].filter((s) => s.value > 0);
    say('innovation', 'Innovation', Lightbulb, (
      <div className="space-y-3">
        {innovation.length > 0 && <StatGrid stats={innovation} />}
        {trl && <div><SubHead>Readiness</SubHead><Prose>{trl}</Prose></div>}
        {commercial.length > 0 && <div><SubHead>Commercialised</SubHead><ChipList items={commercial} /></div>}
        {breakthrough.length > 0 && <div><SubHead>Breakthroughs</SubHead><ChipList items={breakthrough} /></div>}
      </div>
    ));
  }

  // ── Ecosystem: who they brought with them ───────────────────────────────────
  const reach = [
    { label: 'Women mentored', value: count(ecosystem.women_mentored), icon: Users },
    { label: 'Mentees in aerospace', value: count(ecosystem.mentees_in_aerospace), icon: Users },
    { label: 'Under-represented mentees', value: count(ecosystem.urm_mentored), icon: Users },
    { label: 'Mentorship hours', value: count(community.mentorship_hours), icon: TrendingUp },
    { label: 'STEM outreach', value: count(ecosystem.stem_outreach_events), icon: Rocket },
    { label: 'Speaking', value: count(community.speaking_engagements), icon: BookOpen },
    { label: 'Hiring pipeline', value: count(ecosystem.hiring_pipeline_impact), icon: Briefcase },
    { label: 'Educational reach', value: count(ecosystem.educational_content_reach), icon: BookOpen },
  ].filter((s) => s.value > 0);
  const programmes = list(ecosystem.programs_founded);
  const advocacy = list(ecosystem.advocacy_initiatives);
  const boards = list(community.board_memberships);
  if (reach.length || programmes.length || advocacy.length || boards.length) {
    say('ecosystem', 'Ecosystem', Users, (
      <div className="space-y-3">
        {reach.length > 0 && <StatGrid stats={reach} />}
        {programmes.length > 0 && <div><SubHead>Programmes founded</SubHead><ChipList items={programmes} /></div>}
        {advocacy.length > 0 && <div><SubHead>Advocacy</SubHead><ChipList items={advocacy} /></div>}
        {boards.length > 0 && <div><SubHead>Boards</SubHead><ChipList items={boards} /></div>}
      </div>
    ));
  }

  // ── The credential ──────────────────────────────────────────────────────────
  const verified = nominee.verified_status || 'unverified';
  const checks = nominee.verification_status || {};
  const confirmed = CHECKS.filter(([, key]) => checks[key]);
  say('credential', 'Credential', ShieldCheck, (
    <div className="space-y-2">
      <p className="text-sm font-semibold" style={{ color: brand.navy }}>
        {VERIFICATION[verified] || VERIFICATION.unverified}
      </p>
      {confirmed.length > 0 ? (
        <ChipList items={confirmed.map(([label]) => label)} />
      ) : (
        <Empty note="No checkpoints confirmed yet." />
      )}
    </div>
  ));

  // ── The honoree record: the volumes they stood in ───────────────────────────
  if (volumes.length) {
    say('honoree', 'Honoree record', Award, (
      <div className="flex flex-wrap gap-1.5">
        {volumes.map((volume) => (
          <HonoreeChip key={volume.seasonId} volume={volume} size="lg" />
        ))}
      </div>
    ));
  }

  // ── Artifacts: the keys out to the record's own objects ─────────────────────
  if (artifacts.length) {
    say('artifacts', 'Artifacts', Link2, (
      <div className="space-y-1.5">
        {artifacts.map((artifact) => (
          <ArtifactKey key={artifact.key} to={artifact.to} label={artifact.label} detail={artifact.detail} />
        ))}
      </div>
    ));
  }

  return sections;
}