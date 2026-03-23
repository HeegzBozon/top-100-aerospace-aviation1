import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award, BookOpen, Users, TrendingUp, Archive,
  CheckCircle, ArrowRight, Calendar, Globe, Star,
  Download, Phone
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

const PILLARS = [
  { icon: Award, label: 'Authority', desc: 'Industry Recognition' },
  { icon: BookOpen, label: 'Historical Record', desc: 'Documented Legacy' },
  { icon: Users, label: 'Human Stories', desc: 'Inspiring Journeys' },
  { icon: TrendingUp, label: 'Performance', desc: 'Data-Driven Insights' },
  { icon: Archive, label: 'Archive', desc: 'Permanent Record' },
];

const VALUE_PROPS = [
  { title: 'Recognition', subtitle: 'Annual Lists & Badges' },
  { title: 'Visibility', subtitle: 'Profiles & Press Kits' },
  { title: 'Ecosystem', subtitle: 'Mentorship & Partnerships' },
];

const PARTNER_TIERS = [
  { name: 'Platinum', color: '#E5E4E2', benefits: 4 },
  { name: 'Gold', color: brandColors.goldPrestige, benefits: 3 },
  { name: 'Silver', color: '#C0C0C0', benefits: 2 },
  { name: 'Bronze', color: '#CD7F32', benefits: 1 },
];

const PROGRAMS = ['Strategy', 'Builds', 'Workshops', 'Residency'];

const TRUSTED_LOGOS = [
  'NASA', 'Boeing', 'USAF', 'SpaceX', 'Lockheed'
];

export default function Home2() {
  const { data: nominees = [] } = useQuery({
    queryKey: ['home2-top-nominees'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }, '-aura_score', 5),
  });

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border border-current rounded-full" />
          <div className="absolute top-40 right-20 w-48 h-48 border border-current rounded-full" />
          <div className="absolute bottom-20 left-1/3 w-24 h-24 border border-current rounded-full" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
          >
            The Recognition Engine of<br />the Aerospace Era
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg mb-6 max-w-2xl mx-auto"
            style={{ color: `${brandColors.navyDeep}99` }}
          >
            A global authority honoring the leaders shaping the future of flight.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm mb-8"
            style={{ color: `${brandColors.navyDeep}80` }}
          >
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 11,000+ Community</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4" /> 1,000+ Nominees</span>
            <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 30+ Countries</span>
            <span className="flex items-center gap-1"><Award className="w-4 h-4" /> 6 Global Categories</span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Link to={createPageUrl('Nominations')}>
              <Button 
                size="lg"
                className="gap-2 font-semibold"
                style={{ background: brandColors.goldPrestige, color: 'white' }}
              >
                Nominate for Season 4
              </Button>
            </Link>
            <Link to={createPageUrl('Top100Women2025')}>
              <Button 
                variant="outline" 
                size="lg"
                className="gap-2"
                style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
              >
                Explore the Live Index
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-12 px-4 border-t border-b" style={{ borderColor: `${brandColors.navyDeep}10` }}>
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-xl md:text-2xl font-bold text-center mb-8"
            style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
          >
            Not a List. An Authority.
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {PILLARS.map((pillar, idx) => (
              <motion.div
                key={pillar.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-4"
              >
                <div 
                  className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-xl flex items-center justify-center"
                  style={{ background: `${brandColors.skyBlue}15` }}
                >
                  <pillar.icon className="w-7 h-7 md:w-8 md:h-8" style={{ color: brandColors.skyBlue }} />
                </div>
                <h3 className="font-semibold text-sm md:text-base" style={{ color: brandColors.navyDeep }}>
                  {pillar.label}
                </h3>
                <p className="text-xs mt-1" style={{ color: `${brandColors.navyDeep}60` }}>
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Season 4 Announcement */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div 
            className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center"
            style={{ background: 'white', border: `1px solid ${brandColors.navyDeep}10` }}
          >
            <div className="flex-1">
              <h3 
                className="text-xl md:text-2xl font-bold mb-4"
                style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
              >
                Season 4 is Now Open
              </h3>
              <ul className="space-y-2 mb-6">
                {[
                  'Returning honorees auto-rollover',
                  'Nominations impact Index score',
                  'Institutional Expansion Roadmap'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm" style={{ color: `${brandColors.navyDeep}80` }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: brandColors.goldPrestige }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl('Nominations')}>
                <Button style={{ background: brandColors.navyDeep }} className="gap-2">
                  Nominate Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="flex-shrink-0">
              <div 
                className="w-40 h-40 md:w-48 md:h-48 rounded-xl flex flex-col items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}20, ${brandColors.goldLight}20)`, border: `2px solid ${brandColors.goldPrestige}40` }}
              >
                <Badge className="mb-2 text-xs" style={{ background: brandColors.goldPrestige, color: 'white' }}>
                  SEASON 4
                </Badge>
                <div className="flex gap-1 mb-4">
                  <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                  <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                  <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                </div>
                <div className="flex gap-4 text-xs font-medium" style={{ color: brandColors.navyDeep }}>
                  <span>2021</span>
                  <span className="opacity-40">|</span>
                  <span style={{ color: brandColors.goldPrestige }}>2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
            {VALUE_PROPS.map((prop, idx) => (
              <div key={idx} className="py-4 border-r last:border-r-0" style={{ borderColor: `${brandColors.navyDeep}15` }}>
                <h4 className="font-bold text-sm md:text-lg" style={{ color: brandColors.navyDeep }}>{prop.title}</h4>
                <p className="text-xs md:text-sm mt-1" style={{ color: `${brandColors.navyDeep}60` }}>{prop.subtitle}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to={createPageUrl('GetStarted')}>
              <Button variant="outline" style={{ borderColor: brandColors.skyBlue, color: brandColors.skyBlue }}>
                Explore the Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Nominees Index + Partner Preview */}
      <section className="py-12 px-4" style={{ background: `${brandColors.navyDeep}05` }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Partner Tiers */}
            <div 
              className="rounded-xl p-5"
              style={{ background: 'white', border: `1px solid ${brandColors.navyDeep}10` }}
            >
              <h4 className="font-bold text-sm mb-4" style={{ color: brandColors.navyDeep }}>
                Partner With the Future of<br />Aerospace Influence
              </h4>
              <div className="space-y-2">
                {PARTNER_TIERS.map((tier) => (
                  <div key={tier.name} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: tier.color }} />
                    <span className="text-xs font-medium" style={{ color: brandColors.navyDeep }}>{tier.name}</span>
                    <div className="flex-1 flex gap-1 justify-end">
                      {[...Array(tier.benefits)].map((_, i) => (
                        <div key={i} className="w-4 h-2 rounded-sm" style={{ background: tier.color }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Index */}
            <div 
              className="rounded-xl p-5"
              style={{ background: 'white', border: `1px solid ${brandColors.navyDeep}10` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="grid grid-cols-3 gap-4 text-xs font-semibold w-full" style={{ color: `${brandColors.navyDeep}60` }}>
                  <span>Rank</span>
                  <span>Name</span>
                  <span>Category</span>
                </div>
              </div>
              <div className="space-y-2">
                {(nominees.length ? nominees : [...Array(5)]).slice(0, 5).map((nominee, idx) => (
                  <div key={nominee?.id || idx} className="grid grid-cols-3 gap-4 text-xs py-1.5 border-t" style={{ borderColor: `${brandColors.navyDeep}08` }}>
                    <span className="font-bold" style={{ color: brandColors.goldPrestige }}>#{idx + 1}</span>
                    <span className="truncate" style={{ color: brandColors.navyDeep }}>{nominee?.name || '—'}</span>
                    <span className="truncate" style={{ color: `${brandColors.navyDeep}60` }}>{nominee?.industry || '—'}</span>
                  </div>
                ))}
              </div>
              <Link to={createPageUrl('Top100Women2025')} className="block mt-4">
                <Button size="sm" variant="outline" className="w-full text-xs" style={{ borderColor: brandColors.skyBlue, color: brandColors.skyBlue }}>
                  View Full Index
                </Button>
              </Link>
            </div>

            {/* Featured Image Placeholder */}
            <div 
              className="rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}10, ${brandColors.skyBlue}10)` }}
            >
              <img 
                src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format"
                alt="Aerospace Leaders"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div 
            className="rounded-2xl p-6 md:p-8"
            style={{ background: 'white', border: `1px solid ${brandColors.navyDeep}10` }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="md:w-1/3">
                <h3 className="font-bold text-base mb-3" style={{ color: brandColors.navyDeep }}>
                  Partner With the<br />Future of Aerospace Influence
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Platinum', 'Gold', 'Bronze'].map((tier) => (
                    <Badge key={tier} variant="outline" className="text-xs" style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}>
                      {tier}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <Link to={createPageUrl('SponsorPitch')}>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs" style={{ borderColor: `${brandColors.navyDeep}20` }}>
                      <Download className="w-3.5 h-3.5" /> Download Partner Deck
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Sponsors')}>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs" style={{ borderColor: `${brandColors.navyDeep}20` }}>
                      <Phone className="w-3.5 h-3.5" /> Schedule Strategy Call
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="md:w-1/3 flex flex-wrap gap-2 justify-center">
                {PROGRAMS.map((prog) => (
                  <Badge key={prog} className="text-xs px-3 py-1" style={{ background: `${brandColors.skyBlue}15`, color: brandColors.navyDeep }}>
                    {prog}
                  </Badge>
                ))}
              </div>

              <div 
                className="md:w-1/3 h-32 md:h-40 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${brandColors.roseAccent}30, ${brandColors.goldPrestige}30)` }}
              >
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: brandColors.navyDeep }} />
                  <span className="text-sm font-bold" style={{ color: brandColors.navyDeep }}>EVENT</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link to={createPageUrl('ServicesLanding')}>
                <Button style={{ background: brandColors.skyBlue }} className="gap-2">
                  Explore Programs <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Industry */}
      <section className="py-12 px-4" style={{ background: `${brandColors.navyDeep}05` }}>
        <div className="max-w-5xl mx-auto">
          <h3 className="text-sm font-semibold mb-6" style={{ color: `${brandColors.navyDeep}60` }}>
            Trusted by the Industry
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Logo Grid */}
            <div className="flex flex-wrap gap-3 items-center">
              {TRUSTED_LOGOS.map((logo) => (
                <div 
                  key={logo}
                  className="px-4 py-2 rounded-lg text-xs font-bold tracking-wider"
                  style={{ background: `${brandColors.navyDeep}10`, color: brandColors.navyDeep }}
                >
                  {logo}
                </div>
              ))}
            </div>

            {/* World Map Placeholder */}
            <div className="flex items-center justify-center">
              <Globe className="w-24 h-24 opacity-20" style={{ color: brandColors.navyDeep }} />
            </div>

            {/* Testimonial Placeholder */}
            <div 
              className="p-4 rounded-xl"
              style={{ background: 'white', border: `1px solid ${brandColors.navyDeep}10` }}
            >
              <div className="text-4xl mb-2" style={{ color: brandColors.goldPrestige }}>"</div>
              <p className="text-xs italic mb-3" style={{ color: `${brandColors.navyDeep}70` }}>
                The TOP 100 platform has transformed how we identify and engage aerospace talent.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="text-xs">
                  <div className="font-semibold" style={{ color: brandColors.navyDeep }}>Industry Leader</div>
                  <div style={{ color: `${brandColors.navyDeep}60` }}>Fortune 500 Aerospace</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to={createPageUrl('ServicesLanding')}>
              <Button variant="outline" style={{ borderColor: brandColors.skyBlue, color: brandColors.skyBlue }}>
                Explore Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Founder Quote */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p 
            className="text-lg md:text-xl italic mb-6"
            style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
          >
            "This was never about building a list. It was about building a movement."
          </p>
          
          <Link to={createPageUrl('MissionVisionValues')}>
            <Button style={{ background: brandColors.roseAccent }} className="gap-2">
              Read the Founder Letter <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="h-16 md:h-12" />
    </div>
  );
}