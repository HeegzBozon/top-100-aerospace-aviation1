import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Award, Crown, GraduationCap, Briefcase, Rocket, Building2,
  Building, Star, BarChart3, Shield, Handshake, FileText,
  Target, Users, TrendingUp, DollarSign, Lightbulb, Megaphone,
  Calendar, CheckCircle, Camera, Share2, Mic, Heart, Trophy,
  ExternalLink, ArrowRight,
} from 'lucide-react';

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const B = {
  navy:  '#1e3a5a',
  sky:   '#4a90b8',
  gold:  '#c9a87c',
  rose:  '#d4a574',
  cream: '#faf8f5',
};

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'nominee',    label: 'Nominee',    emoji: '🏅', icon: Award         },
  { id: 'honoree',   label: 'Honoree',    emoji: '🏆', icon: Crown         },
  { id: 'student',   label: 'Student',    emoji: '🎓', icon: GraduationCap },
  { id: 'career',    label: 'Career',     emoji: '💼', icon: Briefcase     },
  { id: 'founder',   label: 'Founder',    emoji: '🚀', icon: Rocket        },
  { id: 'business',  label: 'Business',   emoji: '🏢', icon: Building2     },
  { id: 'enterprise',label: 'Enterprise', emoji: '🏛️', icon: Building      },
  { id: 'sponsor',   label: 'Sponsor',    emoji: '⭐', icon: Star          },
];

// ─── Content data ─────────────────────────────────────────────────────────────
// Each entry: hero{title, subtitle, badge}, resources[], extras{}, cta{}
// resources item: { title, description, icon }
//   + either links:[{label, url?, href?, internal?}]  (link-list card)
//   + or     action, href                             (action-button card)

const CONTENT = {

  nominee: {
    hero: {
      badge: 'NOMINEE RESOURCES',
      title: 'Maximize Your Nomination',
      subtitle: 'Congratulations on being nominated! Here\'s everything you need to strengthen your profile and increase your chances of being recognized.',
    },
    resources: [
      { icon: CheckCircle, title: 'Complete Your Profile',   description: 'Maximize your visibility by completing your profile with achievements, metrics, and media.',      action: 'Edit Profile',      href: 'EditProfile'     },
      { icon: Camera,      title: 'Professional Headshot',   description: 'Upload a professional headshot to make a strong first impression.',                                action: 'Upload Photo',      href: 'EditProfile'     },
      { icon: FileText,    title: 'Submit Your Metrics',     description: 'Add patents, publications, missions, leadership roles, and ecosystem contributions.',              action: 'Add Metrics',       href: 'EditProfile'     },
      { icon: Share2,      title: 'Share Your Nomination',   description: 'Spread the word and ask colleagues to endorse your nomination.',                                   action: 'Get Share Link',    href: 'Passport'        },
      { icon: Users,       title: 'Engage the Community',    description: 'Participate in voting, endorse peers, and build your network.',                                    action: 'Explore Community', href: 'TalentExchange'  },
      { icon: TrendingUp,  title: 'Track Your Standing',     description: 'Monitor your ranking and see how you compare in the Arena.',                                       action: 'View Standings',    href: 'Arena'           },
    ],
    extras: {
      type: 'tips',
      heading: 'Pro Tips for Nominees',
      items: [
        'Keep your LinkedIn profile synced for automatic follower updates',
        'Add specific, quantifiable achievements (e.g., "50+ patents filed")',
        'Include mentorship and ecosystem-building contributions',
        'Respond to endorsement requests promptly',
        'Share your nomination on social media to increase visibility',
      ],
    },
    cta: { title: 'Questions About Your Nomination?', description: 'Check out our help center or reach out to the community.', primary: { label: 'Help Center', href: 'HelpCenter' }, secondary: { label: 'Community Chat', href: 'Comms' } },
  },

  honoree: {
    hero: {
      badge: 'HONOREE RESOURCES',
      title: 'Welcome, TOP 100 Honoree',
      subtitle: 'Congratulations on your recognition! Here are the benefits, resources, and opportunities available to you as a TOP 100 honoree.',
    },
    resources: [
      { icon: Trophy,   title: 'Digital Badge & Certificate', description: 'Download your official TOP 100 badge and certificate for your profiles and signature.',       action: 'Download Assets',    href: 'Passport'        },
      { icon: Share2,   title: 'Shareable Card',              description: 'Get a custom shareable card to announce your recognition on social media.',                    action: 'Create Card',        href: 'Passport'        },
      { icon: Calendar, title: 'Exclusive Events',            description: 'Access to honoree-only networking events, panels, and celebrations.',                          action: 'View Events',        href: 'Calendar'        },
      { icon: Mic,      title: 'Speaking Opportunities',      description: 'Be featured in podcasts, webinars, and industry panels.',                                      action: 'Express Interest',   href: 'Comms'           },
      { icon: Users,    title: 'Honoree Network',             description: 'Connect with fellow honorees across seasons in our exclusive community.',                      action: 'Join Network',       href: 'TalentExchange'  },
      { icon: FileText, title: 'Publication Feature',         description: 'Be featured in the official TOP 100 publication and archive.',                                 action: 'View Publication',   href: 'Top100Women2025' },
    ],
    extras: {
      type: 'responsibilities',
      heading: 'As an Honoree, You Can...',
      subheading: 'Help build the future of the female aerospace ecosystem',
      items: [
        { icon: Heart, title: 'Mentor Future Leaders', description: 'Pay it forward by mentoring nominees and emerging talent in aerospace.' },
        { icon: Award, title: 'Nominate Others',        description: 'Help identify the next generation of leaders by submitting nominations.' },
        { icon: Star,  title: 'Share Your Story',       description: 'Inspire others by sharing your journey and achievements.' },
      ],
    },
    cta: { title: 'Your Legacy Continues', description: 'As a TOP 100 honoree, your recognition is permanent. You\'ll be featured in our historical archive and can continue to engage with future seasons.', primary: { label: 'Nominate Someone', href: 'Season4' }, secondary: { label: 'View Archive', href: 'ArchiveLanding' } },
  },

  student: {
    hero: {
      title: 'Student Resources',
      subtitle: 'Launch your aerospace and aviation career with internships, scholarships, and learning opportunities',
    },
    resources: [
      {
        icon: Rocket, title: 'Internship Programs',
        description: 'Connect with leading aerospace companies offering internship opportunities.',
        links: [
          { label: 'NASA Internships',  url: 'https://intern.nasa.gov/' },
          { label: 'Boeing Internships', url: 'https://jobs.boeing.com/internships' },
          { label: 'Lockheed Martin',    url: 'https://www.lockheedmartinjobs.com/students' },
        ],
      },
      {
        icon: GraduationCap, title: 'Scholarships & Grants',
        description: 'Financial aid opportunities specifically for aerospace and aviation students.',
        links: [
          { label: 'AIAA Scholarships',    url: 'https://www.aiaa.org/get-involved/students-educators/scholarships' },
          { label: 'Women in Aviation',    url: 'https://www.wai.org/scholarships' },
          { label: 'Aviation Scholarships', url: 'https://www.aopa.org/training-and-safety/learn-to-fly/aviation-scholarships' },
        ],
      },
      {
        icon: Users, title: 'Student Organizations',
        description: 'Join professional organizations to network and build your career early.',
        links: [
          { label: 'AIAA Student Membership', url: 'https://www.aiaa.org/membership/student' },
          { label: 'Society of Women Engineers', url: 'https://swe.org/' },
          { label: 'NSBE Aerospace',            url: 'https://www.nsbe.org/' },
        ],
      },
      {
        icon: FileText, title: 'Learning Resources',
        description: 'Free courses, tutorials, and educational content for aspiring aerospace professionals.',
        links: [
          { label: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/aeronautics-and-astronautics/' },
          { label: 'Coursera Aerospace', url: 'https://www.coursera.org/browse/physical-science-and-engineering/mechanical-engineering' },
          { label: 'edX Aviation',       url: 'https://www.edx.org/learn/aviation' },
        ],
      },
    ],
    cta: { title: 'Connect with TOP 100 Honorees', description: 'Get mentorship and career guidance from industry leaders.', primary: { label: 'Explore Mentorship', href: 'TalentExchange' } },
  },

  career: {
    hero: {
      title: 'Career Resources',
      subtitle: 'Advance your aerospace and aviation career with job opportunities and professional development',
    },
    resources: [
      {
        icon: Briefcase, title: 'Job Boards',
        description: 'Top aerospace and aviation job boards to find your next opportunity.',
        links: [
          { label: 'Aviation Job Search', url: 'https://www.aviationjobsearch.com/' },
          { label: 'Space Careers',       url: 'https://www.space-careers.com/' },
          { label: 'AIA Careers',         url: 'https://www.aia-aerospace.org/careers/' },
        ],
      },
      {
        icon: FileText, title: 'Resume & Interview',
        description: 'Resources to help you craft the perfect resume and ace your interviews.',
        links: [
          { label: 'Aerospace Resume Tips', url: 'https://www.aiaa.org/careers' },
          { label: 'Technical Interview Prep', url: 'https://www.glassdoor.com/Interview/aerospace-interview-questions-SRCH_KO0,9.htm' },
          { label: 'LinkedIn Optimization',   url: 'https://www.linkedin.com/learning/topics/job-search' },
        ],
      },
      {
        icon: Target, title: 'Career Development',
        description: 'Certifications, training, and professional development opportunities.',
        links: [
          { label: 'PMI Certifications',   url: 'https://www.pmi.org/' },
          { label: 'Six Sigma Aerospace',  url: 'https://www.asq.org/cert/six-sigma' },
          { label: 'FAA Certifications',   url: 'https://www.faa.gov/mechanics/become' },
        ],
      },
      {
        icon: Award, title: 'Professional Associations',
        description: 'Join industry associations to network and advance your career.',
        links: [
          { label: 'AIAA Professional',         url: 'https://www.aiaa.org/membership' },
          { label: 'SAE International',         url: 'https://www.sae.org/' },
          { label: 'Royal Aeronautical Society', url: 'https://www.aerosociety.com/' },
        ],
      },
    ],
    cta: { title: 'Browse Open Positions', description: 'Explore job opportunities from top aerospace employers.', primary: { label: 'View Jobs', href: 'TalentLanding' } },
  },

  founder: {
    hero: {
      title: 'Founder Resources',
      subtitle: 'Everything you need to launch and scale your aerospace or aviation startup',
    },
    resources: [
      {
        icon: DollarSign, title: 'Funding & Investment',
        description: 'Venture capital, grants, and funding opportunities for aerospace startups.',
        links: [
          { label: 'Space Angels',    url: 'https://www.spaceangels.com/' },
          { label: 'Seraphim Capital', url: 'https://seraphim.vc/' },
          { label: 'NASA SBIR/STTR',  url: 'https://sbir.nasa.gov/' },
        ],
      },
      {
        icon: Rocket, title: 'Accelerators & Incubators',
        description: 'Programs to help you build and scale your aerospace venture.',
        links: [
          { label: 'Techstars Space',     url: 'https://www.techstars.com/accelerators/space' },
          { label: 'Starburst Accelerator', url: 'https://starburst.aero/' },
          { label: 'MassChallenge',       url: 'https://masschallenge.org/' },
        ],
      },
      {
        icon: Users, title: 'Founder Communities',
        description: 'Connect with fellow aerospace founders and entrepreneurs.',
        links: [
          { label: 'NewSpace Global',        url: 'https://www.newspaceglobal.com/' },
          { label: 'Space Frontier Foundation', url: 'https://spacefrontier.org/' },
          { label: 'Founders Forum',         url: 'https://foundersforum.eu/' },
        ],
      },
      {
        icon: Lightbulb, title: 'Startup Resources',
        description: 'Tools, guides, and resources for building your aerospace company.',
        links: [
          { label: 'Y Combinator Library', url: 'https://www.ycombinator.com/library' },
          { label: 'First Round Review',   url: 'https://review.firstround.com/' },
          { label: 'Startup School',       url: 'https://www.startupschool.org/' },
        ],
      },
    ],
    cta: { title: 'Join Our Startup Directory', description: 'Get visibility and connect with investors in the aerospace ecosystem.', primary: { label: 'Explore Directory', href: 'StartupDirectory' } },
  },

  business: {
    hero: {
      title: 'Business Resources',
      subtitle: 'Tools and resources to help your aerospace business thrive',
    },
    resources: [
      {
        icon: BarChart3, title: 'Industry Reports',
        description: 'Market research, trends, and analysis for aerospace and aviation.',
        links: [
          { label: 'Aerospace Industries Association', url: 'https://www.aia-aerospace.org/research-center/' },
          { label: 'FAA Aerospace Forecast',           url: 'https://www.faa.gov/data_research/aviation' },
          { label: 'Deloitte Aerospace',               url: 'https://www2.deloitte.com/us/en/industries/aerospace-defense.html' },
        ],
      },
      {
        icon: Shield, title: 'Compliance & Regulations',
        description: 'Stay compliant with aerospace industry standards and regulations.',
        links: [
          { label: 'FAA Regulations', url: 'https://www.faa.gov/regulations_policies' },
          { label: 'EASA Standards',  url: 'https://www.easa.europa.eu/en/regulations' },
          { label: 'AS9100 Certification', url: 'https://www.sae.org/standards/aerospace' },
        ],
      },
      {
        icon: Handshake, title: 'Supplier Networks',
        description: 'Find and connect with aerospace suppliers and partners.',
        links: [
          { label: 'SAE Supplier Directory',        url: 'https://www.sae.org/' },
          { label: 'Aviation Suppliers Association', url: 'https://www.aviationsuppliers.org/' },
          { label: 'A&D Directory',                 url: 'https://www.thomasnet.com/products/aerospace-products-86005104-1.html' },
        ],
      },
      {
        icon: Building2, title: 'Business Development',
        description: 'Resources for growing your aerospace business.',
        links: [
          { label: 'Government Contracting', url: 'https://www.sba.gov/federal-contracting' },
          { label: 'Export.gov Aerospace',   url: 'https://www.trade.gov/aerospace' },
          { label: 'Defense Contracts',      url: 'https://www.defense.gov/contracts/' },
        ],
      },
    ],
    cta: { title: 'Partner with TOP 100', description: 'Reach decision-makers across the aerospace and aviation industry.', primary: { label: 'Become a Sponsor', href: 'Sponsors' } },
  },

  enterprise: {
    hero: {
      title: 'Enterprise Resources',
      subtitle: 'Solutions for aerospace organizations to recruit, engage, and grow',
    },
    resources: [
      {
        icon: Users, title: 'Talent Acquisition',
        description: 'Recruit top aerospace talent through our platform and network.',
        links: [
          { label: 'Post a Job',          href: 'TalentLanding',      internal: true },
          { label: 'Employer Dashboard',  href: 'EmployerDashboard',  internal: true },
          { label: 'Talent Exchange',     href: 'TalentExchange',     internal: true },
        ],
      },
      {
        icon: TrendingUp, title: 'Brand Visibility',
        description: 'Increase your company\'s visibility among aerospace professionals.',
        links: [
          { label: 'Sponsorship Opportunities', href: 'Sponsors',     internal: true },
          { label: 'Partnership Inquiry',       href: 'SponsorPitch', internal: true },
          { label: 'Advertising Options',       href: 'Sponsors',     internal: true },
        ],
      },
      {
        icon: Award, title: 'Industry Recognition',
        description: 'Nominate your team members for TOP 100 recognition.',
        links: [
          { label: 'Nominate a Leader',    href: 'Season4',           internal: true },
          { label: 'View Current Nominees', href: 'Top100Nominees2025', internal: true },
          { label: 'Past Honorees',        href: 'Top100Women2025',   internal: true },
        ],
      },
      {
        icon: Building, title: 'Enterprise Solutions',
        description: 'Custom solutions for large aerospace organizations.',
        links: [
          { label: 'Contact Sales',   url: 'mailto:enterprise@top100aerospace.com' },
          { label: 'Schedule Demo',   href: 'SponsorPitch', internal: true },
          { label: 'Case Studies',    href: 'About',        internal: true },
        ],
      },
    ],
    cta: { title: 'Ready to Partner?', description: 'Connect with our enterprise team to discuss custom solutions.', primary: { label: 'Contact Enterprise Team', href: 'SponsorPitch' } },
  },

  sponsor: {
    hero: {
      title: 'Sponsor Resources',
      subtitle: 'Everything you need to maximize your TOP 100 sponsorship',
    },
    resources: [
      {
        icon: Star, title: 'Sponsorship Tiers',
        description: 'Explore our sponsorship packages and benefits.',
        links: [
          { label: 'View Packages',       href: 'Sponsors',     internal: true },
          { label: 'Compare Tiers',       href: 'Sponsors',     internal: true },
          { label: 'Request Custom Package', href: 'SponsorPitch', internal: true },
        ],
      },
      {
        icon: Megaphone, title: 'Marketing Assets',
        description: 'Logos, brand guidelines, and promotional materials for sponsors.',
        links: [
          { label: 'Brand Guidelines', href: 'About', internal: true },
          { label: 'Press Kit',        href: 'About', internal: true },
          { label: 'Social Media Assets', href: 'About', internal: true },
        ],
      },
      {
        icon: Calendar, title: 'Events & Activations',
        description: 'Sponsorship opportunities at TOP 100 events.',
        links: [
          { label: 'Upcoming Events',     href: 'Calendar',     internal: true },
          { label: 'Event Sponsorship',   href: 'SponsorPitch', internal: true },
          { label: 'Speaking Opportunities', href: 'SponsorPitch', internal: true },
        ],
      },
      {
        icon: FileText, title: 'Sponsor Portal',
        description: 'Access your sponsor dashboard and analytics.',
        links: [
          { label: 'Sponsor Dashboard',    href: 'Sponsors',     internal: true },
          { label: 'ROI Reports',          href: 'Sponsors',     internal: true },
          { label: 'Audience Demographics', href: 'Demographics', internal: true },
        ],
      },
    ],
    cta: { title: 'Become a Sponsor', description: 'Join leading aerospace companies supporting industry excellence.', primary: { label: 'Get Started', href: 'SponsorPitch' } },
  },
};

// ─── Shared components ────────────────────────────────────────────────────────

function ResourceCard({ resource, idx = 0 }) {
  const hasLinks = Boolean(resource.links);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07 }}
      className="h-full"
    >
      <Card
        className="h-full hover:shadow-lg transition-shadow"
        style={{ border: `1px solid ${B.navy}12` }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: `${B.gold}20` }}>
              <resource.icon className="w-5 h-5" style={{ color: B.gold }} />
            </div>
            <CardTitle
              className="text-base"
              style={{ color: B.navy, fontFamily: "'Playfair Display', serif" }}
            >
              {resource.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4" style={{ color: B.navy, opacity: 0.7 }}>
            {resource.description}
          </p>

          {hasLinks ? (
            <div className="space-y-2">
              {resource.links.map((link, i) =>
                link.internal ? (
                  <Link
                    key={i}
                    to={createPageUrl(link.href)}
                    className="flex items-center gap-2 text-sm hover:underline"
                    style={{ color: B.sky }}
                  >
                    <ArrowRight className="w-3 h-3" />
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={i}
                    href={link.url || `mailto:${link.href}`}
                    target={link.url ? '_blank' : undefined}
                    rel={link.url ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 text-sm hover:underline"
                    style={{ color: B.sky }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.label}
                  </a>
                )
              )}
            </div>
          ) : (
            <Link to={createPageUrl(resource.href)}>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                style={{ borderColor: B.gold, color: B.navy }}
              >
                {resource.action}
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TabBar({ active, onChange }) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b" style={{ borderColor: `${B.navy}15` }}>
      <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
        <div className="flex gap-1 py-2 min-w-max">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  background: isActive ? B.navy : 'transparent',
                  color:      isActive ? '#fff' : B.navy,
                  opacity:    isActive ? 1 : 0.6,
                }}
              >
                {tab.emoji} {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Resources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabId = TABS.find(t => t.id === searchParams.get('tab'))?.id ?? 'nominee';
  const tab   = TABS.find(t => t.id === tabId);
  const data  = CONTENT[tabId];

  function handleTabChange(id) {
    setSearchParams({ tab: id }, { replace: true });
  }

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>

      {/* Hero */}
      <div
        className="py-14 px-4"
        style={{ background: `linear-gradient(135deg, ${B.navy} 0%, ${B.sky} 100%)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            key={tabId + '-hero'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.hero.badge && (
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: `${B.gold}25`, color: B.gold }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {data.hero.badge}
              </div>
            )}
            {!data.hero.badge && (
              <tab.icon className="w-12 h-12 mx-auto mb-4" style={{ color: B.gold }} />
            )}
            <h1
              className="text-3xl md:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {data.hero.title}
            </h1>
            <p
              className="text-white/80 max-w-2xl mx-auto text-sm md:text-base"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {data.hero.subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tab bar */}
      <TabBar active={tabId} onChange={handleTabChange} />

      {/* Resources grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.resources.map((resource, idx) => (
            <ResourceCard key={idx} resource={resource} idx={idx} />
          ))}
        </div>
      </div>

      {/* Extras (tips or responsibilities) */}
      {data.extras && (
        <section className="py-10 px-4" style={{ background: `${B.navy}05` }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: B.navy }}>
                {data.extras.heading}
              </h2>
              {data.extras.subheading && (
                <p className="text-sm mt-1" style={{ color: `${B.navy}60` }}>
                  {data.extras.subheading}
                </p>
              )}
            </div>

            {data.extras.type === 'tips' && (
              <div className="space-y-3">
                {data.extras.items.map((tip, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-start gap-3 bg-white p-4 rounded-xl"
                  >
                    <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: B.gold }} />
                    <p className="text-sm" style={{ color: B.navy }}>{tip}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {data.extras.type === 'responsibilities' && (
              <div className="space-y-4">
                {data.extras.items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-start gap-4 bg-white p-5 rounded-xl"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${B.sky}15` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: B.sky }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1" style={{ color: B.navy }}>
                        {item.title}
                      </h3>
                      <p className="text-sm" style={{ color: `${B.navy}70` }}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Card
          className="p-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${B.gold}15, ${B.rose}15)`,
            border: `1px solid ${B.gold}40`,
          }}
        >
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: B.navy, fontFamily: "'Playfair Display', serif" }}
          >
            {data.cta.title}
          </h3>
          <p className="text-sm mb-5" style={{ color: B.navy, opacity: 0.7 }}>
            {data.cta.description}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to={createPageUrl(data.cta.primary.href)}>
              <Button
                className="text-white"
                style={{ background: `linear-gradient(135deg, ${B.gold}, ${B.rose})` }}
              >
                {data.cta.primary.label} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            {data.cta.secondary && (
              <Link to={createPageUrl(data.cta.secondary.href)}>
                <Button
                  variant="outline"
                  style={{ borderColor: B.gold, color: B.navy }}
                >
                  {data.cta.secondary.label}
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
