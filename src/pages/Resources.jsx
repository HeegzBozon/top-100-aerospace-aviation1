import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Crown, Award, Star, Building, Briefcase, Building2,
  GraduationCap, Rocket, Trophy, Share2, Mic, Calendar,
  Users, Heart, FileText, Camera, TrendingUp, CheckCircle,
  BarChart3, Shield, Handshake, DollarSign, Lightbulb,
  BookOpen, Megaphone, ArrowRight, ExternalLink,
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

// ─── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { key: 'honoree',    label: 'Honoree',    icon: Crown },
  { key: 'nominee',    label: 'Nominee',    icon: Award },
  { key: 'sponsor',    label: 'Sponsor',    icon: Star },
  { key: 'enterprise', label: 'Enterprise', icon: Building },
  { key: 'career',     label: 'Career',     icon: Briefcase },
  { key: 'business',   label: 'Business',   icon: Building2 },
  { key: 'student',    label: 'Student',    icon: GraduationCap },
  { key: 'founder',    label: 'Founder',    icon: Rocket },
];

// ─── Resource data ──────────────────────────────────────────────────────────

const HONOREE_BENEFITS = [
  { icon: Trophy,   title: 'Digital Badge & Certificate',   description: 'Download your official TOP 100 badge and certificate for your profiles and signature.', action: 'Download Assets', href: 'Passport', internal: true },
  { icon: Share2,   title: 'Shareable Card',                description: 'Get a custom shareable card to announce your recognition on social media.',               action: 'Create Card',     href: 'Passport', internal: true },
  { icon: Calendar, title: 'Exclusive Events',              description: 'Access to honoree-only networking events, panels, and celebrations.',                       action: 'View Events',     href: 'Calendar', internal: true },
  { icon: Mic,      title: 'Speaking Opportunities',        description: 'Be featured in podcasts, webinars, and industry panels.',                                   action: 'Express Interest',href: 'Comms',    internal: true },
  { icon: Users,    title: 'Honoree Network',               description: 'Connect with fellow honorees across seasons in our exclusive community.',                   action: 'Join Network',    href: 'TalentExchange', internal: true },
  { icon: FileText, title: 'Publication Feature',           description: 'Be featured in the official TOP 100 publication and archive.',                              action: 'View Publication',href: 'Top100Women2025', internal: true },
];

const HONOREE_RESPONSIBILITIES = [
  { icon: Heart,  title: 'Mentor Future Leaders', description: 'Pay it forward by mentoring nominees and emerging talent in aerospace.' },
  { icon: Award,  title: 'Nominate Others',        description: 'Help identify the next generation of leaders by submitting nominations.' },
  { icon: Star,   title: 'Share Your Story',       description: 'Inspire others by sharing your journey and achievements.' },
];

const NOMINEE_RESOURCES = [
  { icon: CheckCircle, title: 'Complete Your Profile',  description: 'Maximize your visibility by completing your profile with achievements, metrics, and media.', action: 'Edit Profile',       href: 'EditProfile', internal: true },
  { icon: Camera,      title: 'Professional Headshot',  description: 'Upload a professional headshot to make a strong first impression.',                           action: 'Upload Photo',       href: 'EditProfile', internal: true },
  { icon: FileText,    title: 'Submit Your Metrics',    description: 'Add patents, publications, missions, leadership roles, and ecosystem contributions.',          action: 'Add Metrics',        href: 'EditProfile', internal: true },
  { icon: Share2,      title: 'Share Your Nomination',  description: 'Spread the word and ask colleagues to endorse your nomination.',                              action: 'Get Share Link',     href: 'Passport', internal: true },
  { icon: Users,       title: 'Engage the Community',   description: 'Participate in voting, endorse peers, and build your network.',                               action: 'Explore Community',  href: 'TalentExchange', internal: true },
  { icon: TrendingUp,  title: 'Track Your Standing',    description: 'Monitor your ranking and see how you compare in the Arena.',                                  action: 'View Standings',     href: 'Arena', internal: true },
];

const NOMINEE_TIPS = [
  'Keep your LinkedIn profile synced for automatic follower updates',
  'Add specific, quantifiable achievements (e.g., "50+ patents filed")',
  'Include mentorship and ecosystem-building contributions',
  'Respond to endorsement requests promptly',
  'Share your nomination on social media to increase visibility',
];

const SPONSOR_RESOURCES = [
  { icon: Star,     title: 'Sponsorship Tiers',     description: 'Explore our sponsorship packages and benefits.',                  links: [{ label: 'View Sponsorship Packages', href: 'Sponsors', internal: true }, { label: 'Compare Tiers', href: 'Sponsors', internal: true }, { label: 'Request Custom Package', href: 'SponsorPitch', internal: true }] },
  { icon: Megaphone,title: 'Marketing Assets',       description: 'Logos, brand guidelines, and promotional materials for sponsors.', links: [{ label: 'Brand Guidelines', href: 'About', internal: true }, { label: 'Press Kit', href: 'About', internal: true }, { label: 'Social Media Assets', href: 'About', internal: true }] },
  { icon: Calendar, title: 'Events & Activations',   description: 'Sponsorship opportunities at TOP 100 events.',                    links: [{ label: 'Upcoming Events', href: 'Calendar', internal: true }, { label: 'Event Sponsorship', href: 'SponsorPitch', internal: true }, { label: 'Speaking Opportunities', href: 'SponsorPitch', internal: true }] },
  { icon: FileText, title: 'Sponsor Portal',          description: 'Access your sponsor dashboard and analytics.',                     links: [{ label: 'Sponsor Dashboard', href: 'Sponsors', internal: true }, { label: 'ROI Reports', href: 'Sponsors', internal: true }, { label: 'Audience Demographics', href: 'Demographics', internal: true }] },
];

const ENTERPRISE_RESOURCES = [
  { icon: Users,      title: 'Talent Acquisition',   description: 'Recruit top aerospace talent through our platform and network.',              links: [{ label: 'Post a Job', href: 'TalentLanding', internal: true }, { label: 'Employer Dashboard', href: 'EmployerDashboard', internal: true }, { label: 'Talent Exchange', href: 'TalentExchange', internal: true }] },
  { icon: TrendingUp, title: 'Brand Visibility',      description: "Increase your company's visibility among aerospace professionals.",            links: [{ label: 'Sponsorship Opportunities', href: 'Sponsors', internal: true }, { label: 'Partnership Inquiry', href: 'SponsorPitch', internal: true }, { label: 'Advertising Options', href: 'Sponsors', internal: true }] },
  { icon: Award,      title: 'Industry Recognition',  description: 'Nominate your team members for TOP 100 recognition.',                         links: [{ label: 'Nominate a Leader', href: 'Season4', internal: true }, { label: 'View Current Nominees', href: 'Top100Nominees2025', internal: true }, { label: 'Past Honorees', href: 'Top100Women2025', internal: true }] },
  { icon: Building,   title: 'Enterprise Solutions',  description: 'Custom solutions for large aerospace organizations.',                          links: [{ label: 'Contact Sales', url: 'mailto:enterprise@top100aerospace.com' }, { label: 'Schedule Demo', href: 'SponsorPitch', internal: true }, { label: 'Case Studies', href: 'About', internal: true }] },
];

const CAREER_RESOURCES = [
  { icon: Briefcase, title: 'Job Boards',               description: 'Top aerospace and aviation job boards to find your next opportunity.',           links: [{ label: 'Aviation Job Search', url: 'https://www.aviationjobsearch.com/' }, { label: 'Space Careers', url: 'https://www.space-careers.com/' }, { label: 'AIA Careers', url: 'https://www.aia-aerospace.org/careers/' }] },
  { icon: FileText,  title: 'Resume & Interview',       description: 'Resources to help you craft the perfect resume and ace your interviews.',        links: [{ label: 'Aerospace Resume Tips', url: 'https://www.aiaa.org/careers' }, { label: 'Technical Interview Prep', url: 'https://www.glassdoor.com/Interview/aerospace-interview-questions-SRCH_KO0,9.htm' }, { label: 'LinkedIn Optimization', url: 'https://www.linkedin.com/learning/topics/job-search' }] },
  { icon: TrendingUp,title: 'Career Development',       description: 'Certifications, training, and professional development opportunities.',           links: [{ label: 'PMI Certifications', url: 'https://www.pmi.org/' }, { label: 'Six Sigma Aerospace', url: 'https://www.asq.org/cert/six-sigma' }, { label: 'FAA Certifications', url: 'https://www.faa.gov/mechanics/become' }] },
  { icon: Users,     title: 'Professional Associations',description: 'Join industry associations to network and advance your career.',                 links: [{ label: 'AIAA Professional', url: 'https://www.aiaa.org/membership' }, { label: 'SAE International', url: 'https://www.sae.org/' }, { label: 'Royal Aeronautical Society', url: 'https://www.aerosociety.com/' }] },
];

const BUSINESS_RESOURCES = [
  { icon: BarChart3, title: 'Industry Reports',      description: 'Market research, trends, and analysis for aerospace and aviation.',              links: [{ label: 'AIA Research Center', url: 'https://www.aia-aerospace.org/research-center/' }, { label: 'FAA Aerospace Forecast', url: 'https://www.faa.gov/data_research/aviation' }, { label: 'Deloitte Aerospace', url: 'https://www2.deloitte.com/us/en/industries/aerospace-defense.html' }] },
  { icon: Shield,    title: 'Compliance & Regulations', description: 'Stay compliant with aerospace industry standards and regulations.',             links: [{ label: 'FAA Regulations', url: 'https://www.faa.gov/regulations_policies' }, { label: 'EASA Standards', url: 'https://www.easa.europa.eu/en/regulations' }, { label: 'AS9100 Certification', url: 'https://www.sae.org/standards/aerospace' }] },
  { icon: Handshake, title: 'Supplier Networks',     description: 'Find and connect with aerospace suppliers and partners.',                         links: [{ label: 'SAE Supplier Directory', url: 'https://www.sae.org/' }, { label: 'Aviation Suppliers Assoc.', url: 'https://www.aviationsuppliers.org/' }, { label: 'A&D Directory', url: 'https://www.thomasnet.com/products/aerospace-products-86005104-1.html' }] },
  { icon: Building2, title: 'Business Development',  description: 'Resources for growing your aerospace business.',                                  links: [{ label: 'Government Contracting', url: 'https://www.sba.gov/federal-contracting' }, { label: 'Export.gov Aerospace', url: 'https://www.trade.gov/aerospace' }, { label: 'Defense Contracts', url: 'https://www.defense.gov/contracts/' }] },
];

const STUDENT_RESOURCES = [
  { icon: Rocket,        title: 'Internship Programs',     description: 'Connect with leading aerospace companies offering internship opportunities.',     links: [{ label: 'NASA Internships', url: 'https://intern.nasa.gov/' }, { label: 'Boeing Internships', url: 'https://jobs.boeing.com/internships' }, { label: 'Lockheed Martin', url: 'https://www.lockheedmartinjobs.com/students' }] },
  { icon: GraduationCap, title: 'Scholarships & Grants',   description: 'Financial aid opportunities specifically for aerospace and aviation students.',     links: [{ label: 'AIAA Scholarships', url: 'https://www.aiaa.org/get-involved/students-educators/scholarships' }, { label: 'Women in Aviation', url: 'https://www.wai.org/scholarships' }, { label: 'AOPA Scholarships', url: 'https://www.aopa.org/training-and-safety/learn-to-fly/aviation-scholarships' }] },
  { icon: Users,         title: 'Student Organizations',   description: 'Join professional organizations to network and build your career early.',           links: [{ label: 'AIAA Student Membership', url: 'https://www.aiaa.org/membership/student' }, { label: 'Society of Women Engineers', url: 'https://swe.org/' }, { label: 'NSBE Aerospace', url: 'https://www.nsbe.org/' }] },
  { icon: BookOpen,      title: 'Learning Resources',      description: 'Free courses, tutorials, and educational content for aspiring professionals.',      links: [{ label: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/aeronautics-and-astronautics/' }, { label: 'Coursera Aerospace', url: 'https://www.coursera.org/browse/physical-science-and-engineering/mechanical-engineering' }, { label: 'edX Aviation', url: 'https://www.edx.org/learn/aviation' }] },
];

const FOUNDER_RESOURCES = [
  { icon: DollarSign, title: 'Funding & Investment',    description: 'Venture capital, grants, and funding opportunities for aerospace startups.',   links: [{ label: 'Space Angels', url: 'https://www.spaceangels.com/' }, { label: 'Seraphim Capital', url: 'https://seraphim.vc/' }, { label: 'NASA SBIR/STTR', url: 'https://sbir.nasa.gov/' }] },
  { icon: Rocket,     title: 'Accelerators & Incubators',description: 'Programs to help you build and scale your aerospace venture.',                 links: [{ label: 'Techstars Space', url: 'https://www.techstars.com/accelerators/space' }, { label: 'Starburst Accelerator', url: 'https://starburst.aero/' }, { label: 'MassChallenge', url: 'https://masschallenge.org/' }] },
  { icon: Users,      title: 'Founder Communities',     description: 'Connect with fellow aerospace founders and entrepreneurs.',                     links: [{ label: 'NewSpace Global', url: 'https://www.newspaceglobal.com/' }, { label: 'Space Frontier Foundation', url: 'https://spacefrontier.org/' }, { label: 'Founders Forum', url: 'https://foundersforum.eu/' }] },
  { icon: Lightbulb,  title: 'Startup Resources',       description: 'Tools, guides, and resources for building your aerospace company.',            links: [{ label: 'Y Combinator Library', url: 'https://www.ycombinator.com/library' }, { label: 'First Round Review', url: 'https://review.firstround.com/' }, { label: 'Startup School', url: 'https://www.startupschool.org/' }] },
];

// ─── Shared components ─────────────────────────────────────────────────────────

function LinkCard({ resource }) {
  return (
    <Card className="bg-white h-full" style={{ border: `1px solid ${brandColors.navyDeep}10` }}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${brandColors.goldPrestige}20` }}>
            <resource.icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
          </div>
          <CardTitle className="text-base" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
            {resource.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>
          {resource.description}
        </p>
        <div className="space-y-2">
          {resource.links.map((link, idx) =>
            link.internal ? (
              <Link key={idx} to={createPageUrl(link.href)} className="flex items-center gap-2 text-sm hover:underline" style={{ color: brandColors.skyBlue }}>
                <ArrowRight className="w-3 h-3" />
                {link.label}
              </Link>
            ) : (
              <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline" style={{ color: brandColors.skyBlue }}>
                <ExternalLink className="w-3 h-3" />
                {link.label}
              </a>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({ item }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow border-2" style={{ borderColor: `${brandColors.goldPrestige}30` }}>
      <CardHeader className="pb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: `${brandColors.goldPrestige}20` }}>
          <item.icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
        </div>
        <CardTitle className="text-base" style={{ color: brandColors.navyDeep }}>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4" style={{ color: `${brandColors.navyDeep}70` }}>{item.description}</p>
        <Link to={createPageUrl(item.href)}>
          <Button variant="outline" size="sm" className="gap-1" style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}>
            {item.action}
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function CtaBanner({ children }) {
  return (
    <Card className="p-8 text-center mt-8" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}15, ${brandColors.roseAccent}15)`, border: `1px solid ${brandColors.goldPrestige}40` }}>
      {children}
    </Card>
  );
}

// ─── Tab content ───────────────────────────────────────────────────────────────

function HonoreeContent() {
  return (
    <>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: brandColors.navyDeep }}>Your Honoree Benefits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {HONOREE_BENEFITS.map((item, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
            <ActionCard item={item} />
          </motion.div>
        ))}
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-6" style={{ color: brandColors.navyDeep }}>As an Honoree, You Can…</h2>
        <div className="space-y-4">
          {HONOREE_RESPONSIBILITIES.map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-start gap-4 bg-white p-5 rounded-xl">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${brandColors.skyBlue}15` }}>
                <item.icon className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: brandColors.navyDeep }}>{item.title}</h3>
                <p className="text-sm" style={{ color: `${brandColors.navyDeep}70` }}>{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <CtaBanner>
        <Trophy className="w-10 h-10 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>Your Legacy Continues</h3>
        <p className="text-sm mb-6" style={{ color: `${brandColors.navyDeep}70` }}>Your recognition is permanent. You'll be featured in our historical archive and can continue to engage with future seasons.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={createPageUrl('Season4')}><Button style={{ background: brandColors.navyDeep }}>Nominate Someone</Button></Link>
          <Link to={createPageUrl('ArchiveLanding')}><Button variant="outline" style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}>View Archive</Button></Link>
        </div>
      </CtaBanner>
    </>
  );
}

function NomineeContent() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {NOMINEE_RESOURCES.map((item, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
            <ActionCard item={item} />
          </motion.div>
        ))}
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-6" style={{ color: brandColors.navyDeep }}>Pro Tips for Nominees</h2>
        <div className="space-y-3">
          {NOMINEE_TIPS.map((tip, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-start gap-3 bg-white p-4 rounded-xl">
              <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: brandColors.goldPrestige }} />
              <p className="text-sm" style={{ color: brandColors.navyDeep }}>{tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <CtaBanner>
        <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>Questions About Your Nomination?</h3>
        <p className="text-sm mb-6" style={{ color: `${brandColors.navyDeep}70` }}>Check out our help center or reach out to the community.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={createPageUrl('HelpCenter')}><Button style={{ background: brandColors.navyDeep }}>Help Center</Button></Link>
          <Link to={createPageUrl('Comms')}><Button variant="outline" style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}>Community Chat</Button></Link>
        </div>
      </CtaBanner>
    </>
  );
}

function GridContent({ items, ctaTitle, ctaDesc, ctaLabel, ctaHref }) {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        {items.map((item, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
            <LinkCard resource={item} />
          </motion.div>
        ))}
      </div>
      <CtaBanner>
        <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>{ctaTitle}</h3>
        <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7 }}>{ctaDesc}</p>
        {ctaHref.startsWith('mailto') ? (
          <a href={ctaHref}><Button className="text-white" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}>{ctaLabel} <ArrowRight className="w-4 h-4 ml-2" /></Button></a>
        ) : (
          <Link to={createPageUrl(ctaHref)}><Button className="text-white" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}>{ctaLabel} <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        )}
      </CtaBanner>
    </>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

const TAB_META = {
  honoree:    { title: 'Honoree Resources',    subtitle: 'Congratulations on your recognition — your benefits, assets, and opportunities are here.', icon: Crown },
  nominee:    { title: 'Nominee Resources',    subtitle: 'Everything you need to strengthen your profile and maximize your nomination.',              icon: Award },
  sponsor:    { title: 'Sponsor Resources',    subtitle: 'Everything you need to maximize your TOP 100 sponsorship.',                                 icon: Star },
  enterprise: { title: 'Enterprise Resources', subtitle: 'Solutions for aerospace organizations to recruit, engage, and grow.',                        icon: Building },
  career:     { title: 'Career Resources',     subtitle: 'Advance your aerospace and aviation career with jobs and professional development.',         icon: Briefcase },
  business:   { title: 'Business Resources',   subtitle: 'Tools and resources to help your aerospace business thrive.',                               icon: Building2 },
  student:    { title: 'Student Resources',    subtitle: 'Launch your career with internships, scholarships, and learning opportunities.',             icon: GraduationCap },
  founder:    { title: 'Founder Resources',    subtitle: 'Everything you need to launch and scale your aerospace or aviation startup.',                icon: Rocket },
};

export default function Resources() {
  const [activeTab, setActiveTab] = useState('honoree');
  const meta = TAB_META[activeTab];
  const HeroIcon = meta.icon;

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero */}
      <div className="py-12 px-4" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }}>
        <div className="max-w-5xl mx-auto text-center">
          <HeroIcon className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {meta.title}
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm" style={{ borderColor: `${brandColors.navyDeep}15` }}>
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 py-2 min-w-max">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                style={
                  activeTab === key
                    ? { background: brandColors.navyDeep, color: 'white' }
                    : { color: brandColors.navyDeep, opacity: 0.65 }
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {activeTab === 'honoree'    && <HonoreeContent />}
        {activeTab === 'nominee'    && <NomineeContent />}
        {activeTab === 'sponsor'    && <GridContent items={SPONSOR_RESOURCES}    ctaTitle="Become a Sponsor"        ctaDesc="Join leading aerospace companies supporting industry excellence."             ctaLabel="Get Started"               ctaHref="SponsorPitch" />}
        {activeTab === 'enterprise' && <GridContent items={ENTERPRISE_RESOURCES} ctaTitle="Ready to Partner?"       ctaDesc="Connect with our enterprise team to discuss custom solutions."               ctaLabel="Contact Enterprise Team"   ctaHref="SponsorPitch" />}
        {activeTab === 'career'     && <GridContent items={CAREER_RESOURCES}     ctaTitle="Browse Open Positions"   ctaDesc="Explore job opportunities from top aerospace employers."                     ctaLabel="View Jobs"                 ctaHref="TalentLanding" />}
        {activeTab === 'business'   && <GridContent items={BUSINESS_RESOURCES}   ctaTitle="Partner with TOP 100"    ctaDesc="Reach decision-makers across the aerospace and aviation industry."           ctaLabel="Become a Sponsor"          ctaHref="Sponsors" />}
        {activeTab === 'student'    && <GridContent items={STUDENT_RESOURCES}    ctaTitle="Connect with Honorees"   ctaDesc="Get mentorship and career guidance from industry leaders."                   ctaLabel="Explore Mentorship"        ctaHref="TalentExchange" />}
        {activeTab === 'founder'    && <GridContent items={FOUNDER_RESOURCES}    ctaTitle="Join Our Startup Directory" ctaDesc="Get visibility and connect with investors in the aerospace ecosystem."  ctaLabel="Explore Directory"         ctaHref="StartupDirectory" />}
      </div>
    </div>
  );
}
