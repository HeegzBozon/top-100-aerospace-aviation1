import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  // Nominee
  Award, CheckCircle, Camera, FileText, Share2, Users, TrendingUp, Star,
  // Honoree
  Trophy, Crown, Mic, Calendar, Heart,
  // Student
  GraduationCap, BookOpen, Rocket,
  // Career
  Briefcase, Target,
  // Founder
  DollarSign, Lightbulb,
  // Business
  Building2, BarChart3, Shield, Handshake,
  // Enterprise
  Building,
  // Sponsor
  Megaphone,
  // Shared
  ExternalLink, ArrowRight,
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

// ─── Role selector data ────────────────────────────────────────────────────────

const ROLE_CARDS = [
  { role: 'nominee',    label: 'Nominee Resources',    emoji: '🏅', description: 'Maximize your nomination and strengthen your profile.' },
  { role: 'honoree',   label: 'Honoree Resources',    emoji: '🏆', description: 'Benefits, events, and responsibilities for recognized leaders.' },
  { role: 'student',   label: 'Student Resources',    emoji: '🎓', description: 'Internships, scholarships, and learning opportunities.' },
  { role: 'career',    label: 'Career Resources',     emoji: '💼', description: 'Job boards, certifications, and professional development.' },
  { role: 'founder',   label: 'Founder Resources',    emoji: '🚀', description: 'Funding, accelerators, and startup communities.' },
  { role: 'business',  label: 'Business Resources',   emoji: '🏢', description: 'Industry reports, compliance, and business development.' },
  { role: 'enterprise',label: 'Enterprise Resources', emoji: '🏛️', description: 'Talent acquisition, brand visibility, and enterprise solutions.' },
  { role: 'sponsor',   label: 'Sponsor Resources',    emoji: '⭐', description: 'Sponsorship tiers, marketing assets, and event activations.' },
];

// ─── Per-role content definitions ─────────────────────────────────────────────

const ROLE_CONFIG = {

  nominee: {
    heroIcon: Award,
    badge: 'NOMINEE RESOURCES',
    badgeIcon: Award,
    title: 'Maximize Your Nomination',
    subtitle: 'Congratulations on being nominated! Here\'s everything you need to strengthen your profile and increase your chances of being recognized.',
    sections: [
      {
        type: 'cards',
        items: [
          { icon: CheckCircle, title: 'Complete Your Profile', description: 'Maximize your visibility by completing your profile with achievements, metrics, and media.', action: 'Edit Profile', href: 'EditProfile', internal: true },
          { icon: Camera, title: 'Professional Headshot', description: 'Upload a professional headshot to make a strong first impression.', action: 'Upload Photo', href: 'EditProfile', internal: true },
          { icon: FileText, title: 'Submit Your Metrics', description: 'Add patents, publications, missions, leadership roles, and ecosystem contributions.', action: 'Add Metrics', href: 'EditProfile', internal: true },
          { icon: Share2, title: 'Share Your Nomination', description: 'Spread the word and ask colleagues to endorse your nomination.', action: 'Get Share Link', href: 'Passport', internal: true },
          { icon: Users, title: 'Engage the Community', description: 'Participate in voting, endorse peers, and build your network.', action: 'Explore Community', href: 'TalentExchange', internal: true },
          { icon: TrendingUp, title: 'Track Your Standing', description: 'Monitor your ranking and see how you compare in the Arena.', action: 'View Standings', href: 'Arena', internal: true },
        ],
        cardStyle: 'skyBlue',
      },
      {
        type: 'tips',
        heading: 'Pro Tips for Nominees',
        items: [
          'Keep your LinkedIn profile synced for automatic follower updates',
          'Add specific, quantifiable achievements (e.g., \'50+ patents filed\')',
          'Include mentorship and ecosystem-building contributions',
          'Respond to endorsement requests promptly',
          'Share your nomination on social media to increase visibility',
        ],
      },
    ],
    cta: {
      title: 'Questions About Your Nomination?',
      body: 'Check out our help center or reach out to the community.',
      buttons: [
        { label: 'Help Center', href: 'HelpCenter', primary: true },
        { label: 'Community Chat', href: 'Comms', primary: false },
      ],
    },
  },

  honoree: {
    heroIcon: Crown,
    badge: 'HONOREE RESOURCES',
    badgeIcon: Crown,
    title: 'Welcome, TOP 100 Honoree',
    subtitle: 'Congratulations on your recognition! Here are the benefits, resources, and opportunities available to you as a TOP 100 honoree.',
    sections: [
      {
        type: 'cards',
        heading: 'Your Honoree Benefits',
        items: [
          { icon: Trophy, title: 'Digital Badge & Certificate', description: 'Download your official TOP 100 badge and certificate for your profiles and signature.', action: 'Download Assets', href: 'Passport', internal: true },
          { icon: Share2, title: 'Shareable Card', description: 'Get a custom shareable card to announce your recognition on social media.', action: 'Create Card', href: 'Passport', internal: true },
          { icon: Calendar, title: 'Exclusive Events', description: 'Access to honoree-only networking events, panels, and celebrations.', action: 'View Events', href: 'Calendar', internal: true },
          { icon: Mic, title: 'Speaking Opportunities', description: 'Be featured in podcasts, webinars, and industry panels.', action: 'Express Interest', href: 'Comms', internal: true },
          { icon: Users, title: 'Honoree Network', description: 'Connect with fellow honorees across seasons in our exclusive community.', action: 'Join Network', href: 'TalentExchange', internal: true },
          { icon: FileText, title: 'Publication Feature', description: 'Be featured in the official TOP 100 publication and archive.', action: 'View Publication', href: 'Top100Women2025', internal: true },
        ],
        cardStyle: 'gold',
      },
      {
        type: 'responsibilities',
        heading: 'As an Honoree, You Can...',
        subheading: 'Help build the future of the female aerospace ecosystem',
        items: [
          { icon: Heart, title: 'Mentor Future Leaders', description: 'Pay it forward by mentoring nominees and emerging talent in aerospace.' },
          { icon: Award, title: 'Nominate Others', description: 'Help identify the next generation of leaders by submitting nominations.' },
          { icon: Star, title: 'Share Your Story', description: 'Inspire others by sharing your journey and achievements.' },
        ],
      },
    ],
    cta: {
      title: 'Your Legacy Continues',
      body: 'As a TOP 100 honoree, your recognition is permanent. You\'ll be featured in our historical archive and can continue to engage with future seasons.',
      icon: Trophy,
      buttons: [
        { label: 'Nominate Someone', href: 'Season4', primary: true },
        { label: 'View Archive', href: 'ArchiveLanding', primary: false },
      ],
    },
  },

  student: {
    heroIcon: GraduationCap,
    badge: null,
    title: 'Student Resources',
    subtitle: 'Launch your aerospace and aviation career with internships, scholarships, and learning opportunities',
    sections: [
      {
        type: 'resource-grid',
        items: [
          {
            title: 'Internship Programs',
            description: 'Connect with leading aerospace companies offering internship opportunities for students.',
            icon: Rocket,
            links: [
              { label: 'NASA Internships', url: 'https://intern.nasa.gov/' },
              { label: 'Boeing Internships', url: 'https://jobs.boeing.com/internships' },
              { label: 'Lockheed Martin', url: 'https://www.lockheedmartinjobs.com/students' },
            ],
          },
          {
            title: 'Scholarships & Grants',
            description: 'Financial aid opportunities specifically for aerospace and aviation students.',
            icon: GraduationCap,
            links: [
              { label: 'AIAA Scholarships', url: 'https://www.aiaa.org/get-involved/students-educators/scholarships' },
              { label: 'Women in Aviation', url: 'https://www.wai.org/scholarships' },
              { label: 'Aviation Scholarships', url: 'https://www.aopa.org/training-and-safety/learn-to-fly/aviation-scholarships' },
            ],
          },
          {
            title: 'Student Organizations',
            description: 'Join professional organizations to network and build your career early.',
            icon: Users,
            links: [
              { label: 'AIAA Student Membership', url: 'https://www.aiaa.org/membership/student' },
              { label: 'Society of Women Engineers', url: 'https://swe.org/' },
              { label: 'NSBE Aerospace', url: 'https://www.nsbe.org/' },
            ],
          },
          {
            title: 'Learning Resources',
            description: 'Free courses, tutorials, and educational content for aspiring aerospace professionals.',
            icon: BookOpen,
            links: [
              { label: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/aeronautics-and-astronautics/' },
              { label: 'Coursera Aerospace', url: 'https://www.coursera.org/browse/physical-science-and-engineering/mechanical-engineering' },
              { label: 'edX Aviation', url: 'https://www.edx.org/learn/aviation' },
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Connect with TOP 100 Honorees',
      body: 'Get mentorship and career guidance from industry leaders',
      buttons: [{ label: 'Explore Mentorship', href: 'TalentExchange', primary: true }],
    },
  },

  career: {
    heroIcon: Briefcase,
    badge: null,
    title: 'Career Resources',
    subtitle: 'Advance your aerospace and aviation career with job opportunities and professional development',
    sections: [
      {
        type: 'resource-grid',
        items: [
          {
            title: 'Job Boards',
            description: 'Top aerospace and aviation job boards to find your next opportunity.',
            icon: Briefcase,
            links: [
              { label: 'Aviation Job Search', url: 'https://www.aviationjobsearch.com/' },
              { label: 'Space Careers', url: 'https://www.space-careers.com/' },
              { label: 'Aerospace Industries Association', url: 'https://www.aia-aerospace.org/careers/' },
            ],
          },
          {
            title: 'Resume & Interview',
            description: 'Resources to help you craft the perfect resume and ace your interviews.',
            icon: FileText,
            links: [
              { label: 'Aerospace Resume Tips', url: 'https://www.aiaa.org/careers' },
              { label: 'Technical Interview Prep', url: 'https://www.glassdoor.com/Interview/aerospace-interview-questions-SRCH_KO0,9.htm' },
              { label: 'LinkedIn Optimization', url: 'https://www.linkedin.com/learning/topics/job-search' },
            ],
          },
          {
            title: 'Career Development',
            description: 'Certifications, training, and professional development opportunities.',
            icon: Target,
            links: [
              { label: 'PMI Certifications', url: 'https://www.pmi.org/' },
              { label: 'Six Sigma Aerospace', url: 'https://www.asq.org/cert/six-sigma' },
              { label: 'FAA Certifications', url: 'https://www.faa.gov/mechanics/become' },
            ],
          },
          {
            title: 'Professional Associations',
            description: 'Join industry associations to network and advance your career.',
            icon: Award,
            links: [
              { label: 'AIAA Professional', url: 'https://www.aiaa.org/membership' },
              { label: 'SAE International', url: 'https://www.sae.org/' },
              { label: 'Royal Aeronautical Society', url: 'https://www.aerosociety.com/' },
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Browse Open Positions',
      body: 'Explore job opportunities from top aerospace employers',
      buttons: [{ label: 'View Jobs', href: 'TalentLanding', primary: true }],
    },
  },

  founder: {
    heroIcon: Rocket,
    badge: null,
    title: 'Founder Resources',
    subtitle: 'Everything you need to launch and scale your aerospace or aviation startup',
    sections: [
      {
        type: 'resource-grid',
        items: [
          {
            title: 'Funding & Investment',
            description: 'Venture capital, grants, and funding opportunities for aerospace startups.',
            icon: DollarSign,
            links: [
              { label: 'Space Angels', url: 'https://www.spaceangels.com/' },
              { label: 'Seraphim Capital', url: 'https://seraphim.vc/' },
              { label: 'NASA SBIR/STTR', url: 'https://sbir.nasa.gov/' },
            ],
          },
          {
            title: 'Accelerators & Incubators',
            description: 'Programs to help you build and scale your aerospace venture.',
            icon: Rocket,
            links: [
              { label: 'Techstars Space', url: 'https://www.techstars.com/accelerators/space' },
              { label: 'Starburst Accelerator', url: 'https://starburst.aero/' },
              { label: 'MassChallenge', url: 'https://masschallenge.org/' },
            ],
          },
          {
            title: 'Founder Communities',
            description: 'Connect with fellow aerospace founders and entrepreneurs.',
            icon: Users,
            links: [
              { label: 'NewSpace Global', url: 'https://www.newspaceglobal.com/' },
              { label: 'Space Frontier Foundation', url: 'https://spacefrontier.org/' },
              { label: 'Founders Forum', url: 'https://foundersforum.eu/' },
            ],
          },
          {
            title: 'Startup Resources',
            description: 'Tools, guides, and resources for building your aerospace company.',
            icon: Lightbulb,
            links: [
              { label: 'Y Combinator Library', url: 'https://www.ycombinator.com/library' },
              { label: 'First Round Review', url: 'https://review.firstround.com/' },
              { label: 'Startup School', url: 'https://www.startupschool.org/' },
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Join Our Startup Directory',
      body: 'Get visibility and connect with investors in the aerospace ecosystem',
      buttons: [{ label: 'Explore Directory', href: 'StartupDirectory', primary: true }],
    },
  },

  business: {
    heroIcon: Building2,
    badge: null,
    title: 'Business Resources',
    subtitle: 'Tools and resources to help your aerospace business thrive',
    sections: [
      {
        type: 'resource-grid',
        items: [
          {
            title: 'Industry Reports',
            description: 'Market research, trends, and analysis for aerospace and aviation.',
            icon: BarChart3,
            links: [
              { label: 'Aerospace Industries Association', url: 'https://www.aia-aerospace.org/research-center/' },
              { label: 'FAA Aerospace Forecast', url: 'https://www.faa.gov/data_research/aviation' },
              { label: 'Deloitte Aerospace', url: 'https://www2.deloitte.com/us/en/industries/aerospace-defense.html' },
            ],
          },
          {
            title: 'Compliance & Regulations',
            description: 'Stay compliant with aerospace industry standards and regulations.',
            icon: Shield,
            links: [
              { label: 'FAA Regulations', url: 'https://www.faa.gov/regulations_policies' },
              { label: 'EASA Standards', url: 'https://www.easa.europa.eu/en/regulations' },
              { label: 'AS9100 Certification', url: 'https://www.sae.org/standards/aerospace' },
            ],
          },
          {
            title: 'Supplier Networks',
            description: 'Find and connect with aerospace suppliers and partners.',
            icon: Handshake,
            links: [
              { label: 'SAE Supplier Directory', url: 'https://www.sae.org/' },
              { label: 'Aviation Suppliers Association', url: 'https://www.aviationsuppliers.org/' },
              { label: 'Aerospace & Defense Directory', url: 'https://www.thomasnet.com/products/aerospace-products-86005104-1.html' },
            ],
          },
          {
            title: 'Business Development',
            description: 'Resources for growing your aerospace business.',
            icon: Building2,
            links: [
              { label: 'Government Contracting', url: 'https://www.sba.gov/federal-contracting' },
              { label: 'Export.gov Aerospace', url: 'https://www.trade.gov/aerospace' },
              { label: 'Defense Contracts', url: 'https://www.defense.gov/contracts/' },
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Partner with TOP 100',
      body: 'Reach decision-makers across the aerospace and aviation industry',
      buttons: [{ label: 'Become a Sponsor', href: 'Sponsors', primary: true }],
    },
  },

  enterprise: {
    heroIcon: Building,
    badge: null,
    title: 'Enterprise Resources',
    subtitle: 'Solutions for aerospace organizations to recruit, engage, and grow',
    sections: [
      {
        type: 'resource-grid',
        items: [
          {
            title: 'Talent Acquisition',
            description: 'Recruit top aerospace talent through our platform and network.',
            icon: Users,
            links: [
              { label: 'Post a Job', href: 'TalentLanding', internal: true },
              { label: 'Employer Dashboard', href: 'EmployerDashboard', internal: true },
              { label: 'Talent Exchange', href: 'TalentExchange', internal: true },
            ],
          },
          {
            title: 'Brand Visibility',
            description: 'Increase your company\'s visibility among aerospace professionals.',
            icon: TrendingUp,
            links: [
              { label: 'Sponsorship Opportunities', href: 'Sponsors', internal: true },
              { label: 'Partnership Inquiry', href: 'SponsorPitch', internal: true },
              { label: 'Advertising Options', href: 'Sponsors', internal: true },
            ],
          },
          {
            title: 'Industry Recognition',
            description: 'Nominate your team members for TOP 100 recognition.',
            icon: Award,
            links: [
              { label: 'Nominate a Leader', href: 'Season4', internal: true },
              { label: 'View Current Nominees', href: 'Top100Nominees2025', internal: true },
              { label: 'Past Honorees', href: 'Top100Women2025', internal: true },
            ],
          },
          {
            title: 'Enterprise Solutions',
            description: 'Custom solutions for large aerospace organizations.',
            icon: Building,
            links: [
              { label: 'Contact Sales', url: 'mailto:enterprise@top100aerospace.com' },
              { label: 'Schedule Demo', href: 'SponsorPitch', internal: true },
              { label: 'Case Studies', href: 'About', internal: true },
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Ready to Partner?',
      body: 'Connect with our enterprise team to discuss custom solutions',
      buttons: [{ label: 'Contact Enterprise Team', href: 'SponsorPitch', primary: true }],
    },
  },

  sponsor: {
    heroIcon: Star,
    badge: null,
    title: 'Sponsor Resources',
    subtitle: 'Everything you need to maximize your TOP 100 sponsorship',
    sections: [
      {
        type: 'resource-grid',
        items: [
          {
            title: 'Sponsorship Tiers',
            description: 'Explore our sponsorship packages and benefits.',
            icon: Star,
            links: [
              { label: 'View Sponsorship Packages', href: 'Sponsors', internal: true },
              { label: 'Compare Tiers', href: 'Sponsors', internal: true },
              { label: 'Request Custom Package', href: 'SponsorPitch', internal: true },
            ],
          },
          {
            title: 'Marketing Assets',
            description: 'Logos, brand guidelines, and promotional materials for sponsors.',
            icon: Megaphone,
            links: [
              { label: 'Brand Guidelines', href: 'About', internal: true },
              { label: 'Press Kit', href: 'About', internal: true },
              { label: 'Social Media Assets', href: 'About', internal: true },
            ],
          },
          {
            title: 'Events & Activations',
            description: 'Sponsorship opportunities at TOP 100 events.',
            icon: Calendar,
            links: [
              { label: 'Upcoming Events', href: 'Calendar', internal: true },
              { label: 'Event Sponsorship', href: 'SponsorPitch', internal: true },
              { label: 'Speaking Opportunities', href: 'SponsorPitch', internal: true },
            ],
          },
          {
            title: 'Sponsor Portal',
            description: 'Access your sponsor dashboard and analytics.',
            icon: FileText,
            links: [
              { label: 'Sponsor Dashboard', href: 'Sponsors', internal: true },
              { label: 'ROI Reports', href: 'Sponsors', internal: true },
              { label: 'Audience Demographics', href: 'Demographics', internal: true },
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Become a Sponsor',
      body: 'Join leading aerospace companies supporting industry excellence',
      buttons: [{ label: 'Get Started', href: 'SponsorPitch', primary: true }],
    },
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function ResourceGridCard({ item }) {
  return (
    <Card className="bg-white h-full" style={{ border: `1px solid ${brandColors.navyDeep}10` }}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${brandColors.goldPrestige}20` }}>
            <item.icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
          </div>
          <CardTitle className="text-lg" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
            {item.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>
          {item.description}
        </p>
        <div className="space-y-2">
          {item.links.map((link, idx) => (
            link.internal ? (
              <Link
                key={idx}
                to={createPageUrl(link.href)}
                className="flex items-center gap-2 text-sm hover:underline"
                style={{ color: brandColors.skyBlue }}
              >
                <ArrowRight className="w-3 h-3" />
                {link.label}
              </Link>
            ) : (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:underline"
                style={{ color: brandColors.skyBlue }}
              >
                <ExternalLink className="w-3 h-3" />
                {link.label}
              </a>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({ item, cardStyle, idx }) {
  const iconBg = cardStyle === 'gold' ? `${brandColors.goldPrestige}20` : `${brandColors.skyBlue}15`;
  const iconColor = cardStyle === 'gold' ? brandColors.goldPrestige : brandColors.skyBlue;
  const borderStyle = cardStyle === 'gold' ? { borderColor: `${brandColors.goldPrestige}30` } : {};
  const borderClass = cardStyle === 'gold' ? 'border-2' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
    >
      <Card className={`h-full hover:shadow-lg transition-shadow ${borderClass}`} style={borderStyle}>
        <CardHeader className="pb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
            style={{ background: iconBg }}
          >
            <item.icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <CardTitle className="text-base" style={{ color: brandColors.navyDeep }}>
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4" style={{ color: `${brandColors.navyDeep}70` }}>
            {item.description}
          </p>
          <Link to={createPageUrl(item.href)}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}
            >
              {item.action}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Role selector ─────────────────────────────────────────────────────────────

function RoleSelector() {
  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      <div
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Resources
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Select your role to find the resources most relevant to you
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {ROLE_CARDS.map((card, idx) => (
            <motion.div
              key={card.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Link to={`${createPageUrl('Resources')}?role=${card.role}`}>
                <Card
                  className="h-full hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
                  style={{ border: `1px solid ${brandColors.navyDeep}15` }}
                >
                  <CardContent className="pt-6 text-center">
                    <span className="text-3xl block mb-3">{card.emoji}</span>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}>
                      {card.label}
                    </h3>
                    <p className="text-xs" style={{ color: `${brandColors.navyDeep}70`, fontFamily: "'Montserrat', sans-serif" }}>
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Role view ─────────────────────────────────────────────────────────────────

function RoleView({ config, roleLabel }) {
  const HeroIcon = config.heroIcon;
  const BadgeIcon = config.badgeIcon;

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link
          to={createPageUrl('Resources')}
          className="inline-flex items-center gap-1 text-sm hover:underline"
          style={{ color: brandColors.skyBlue, fontFamily: "'Montserrat', sans-serif" }}
        >
          ← All Resources
        </Link>
      </div>

      {/* Hero */}
      {config.badge ? (
        // Honoree / Nominee style: no gradient hero, inline badge
        <section className="py-12 md:py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
              >
                {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
                {config.badge}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
                {config.title}
              </h1>
              <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: `${brandColors.navyDeep}80` }}>
                {config.subtitle}
              </p>
            </motion.div>
          </div>
        </section>
      ) : (
        // Other roles: gradient hero
        <div
          className="py-16 px-4"
          style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }}
        >
          <div className="max-w-5xl mx-auto text-center">
            <HeroIcon className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {config.title}
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {config.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Sections */}
      {config.sections.map((section, sIdx) => {
        if (section.type === 'resource-grid') {
          return (
            <div key={sIdx} className="max-w-5xl mx-auto px-4 py-12">
              <div className="grid md:grid-cols-2 gap-6">
                {section.items.map((item, idx) => (
                  <ResourceGridCard key={idx} item={item} />
                ))}
              </div>
            </div>
          );
        }

        if (section.type === 'cards') {
          return (
            <section key={sIdx} className="py-8 px-6">
              <div className="max-w-5xl mx-auto">
                {section.heading && (
                  <h2 className="text-xl font-bold mb-6 text-center" style={{ color: brandColors.navyDeep }}>
                    {section.heading}
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item, idx) => (
                    <ActionCard key={idx} item={item} cardStyle={section.cardStyle} idx={idx} />
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === 'tips') {
          return (
            <section key={sIdx} className="py-12 px-6" style={{ background: `${brandColors.navyDeep}05` }}>
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                    {section.heading}
                  </h2>
                </div>
                <div className="space-y-3">
                  {section.items.map((tip, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 bg-white p-4 rounded-xl"
                    >
                      <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: brandColors.goldPrestige }} />
                      <p className="text-sm" style={{ color: brandColors.navyDeep }}>{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === 'responsibilities') {
          return (
            <section key={sIdx} className="py-12 px-6" style={{ background: `${brandColors.navyDeep}05` }}>
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                    {section.heading}
                  </h2>
                  {section.subheading && (
                    <p className="text-sm mt-2" style={{ color: `${brandColors.navyDeep}60` }}>
                      {section.subheading}
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  {section.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 bg-white p-5 rounded-xl"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${brandColors.skyBlue}15` }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1" style={{ color: brandColors.navyDeep }}>
                          {item.title}
                        </h3>
                        <p className="text-sm" style={{ color: `${brandColors.navyDeep}70` }}>
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* CTA */}
      {config.cta && (
        config.cta.icon ? (
          // Honoree-style CTA with icon
          <section className="py-12 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div
                className="p-6 rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}20, ${brandColors.navyDeep}10)` }}
              >
                <config.cta.icon className="w-10 h-10 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
                <h2 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
                  {config.cta.title}
                </h2>
                <p className="text-sm mb-6" style={{ color: `${brandColors.navyDeep}70` }}>
                  {config.cta.body}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {config.cta.buttons.map((btn, idx) => (
                    <Link key={idx} to={createPageUrl(btn.href)}>
                      {btn.primary ? (
                        <Button style={{ background: brandColors.navyDeep }}>
                          {btn.label}
                        </Button>
                      ) : (
                        <Button variant="outline" style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}>
                          {btn.label}
                        </Button>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : config.cta.buttons.length > 1 ? (
          // Multi-button CTA (Nominee style)
          <section className="py-12 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
                {config.cta.title}
              </h2>
              <p className="text-sm mb-6" style={{ color: `${brandColors.navyDeep}70` }}>
                {config.cta.body}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {config.cta.buttons.map((btn, idx) => (
                  <Link key={idx} to={createPageUrl(btn.href)}>
                    {btn.primary ? (
                      <Button style={{ background: brandColors.navyDeep }}>{btn.label}</Button>
                    ) : (
                      <Button variant="outline" style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}>{btn.label}</Button>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : (
          // Single-button gradient card CTA
          <div className="max-w-5xl mx-auto px-4 pb-12">
            <Card
              className="p-8 text-center"
              style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}15, ${brandColors.roseAccent}15)`, border: `1px solid ${brandColors.goldPrestige}40` }}
            >
              <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
                {config.cta.title}
              </h3>
              <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7 }}>
                {config.cta.body}
              </p>
              {config.cta.buttons.map((btn, idx) => (
                <Link key={idx} to={createPageUrl(btn.href)}>
                  <Button className="text-white" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}>
                    {btn.label} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ))}
            </Card>
          </div>
        )
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function Resources() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const config = ROLE_CONFIG[role];

  if (!role || !config) {
    return <RoleSelector />;
  }

  const roleCard = ROLE_CARDS.find(c => c.role === role);
  const roleLabel = roleCard ? roleCard.label : role;

  return <RoleView config={config} roleLabel={roleLabel} />;
}
