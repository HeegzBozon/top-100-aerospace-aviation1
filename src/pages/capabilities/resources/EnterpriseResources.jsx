import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Building, Users, Award, TrendingUp, ExternalLink, ArrowRight } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

const RESOURCES = [
  {
    title: 'Talent Acquisition',
    description: 'Recruit top aerospace talent through our platform and network.',
    icon: Users,
    links: [
      { label: 'Post a Job', href: 'TalentLanding', internal: true },
      { label: 'Employer Dashboard', href: 'EmployerDashboard', internal: true },
      { label: 'Talent Exchange', href: 'TalentExchange', internal: true },
    ]
  },
  {
    title: 'Brand Visibility',
    description: 'Increase your company\'s visibility among aerospace professionals.',
    icon: TrendingUp,
    links: [
      { label: 'Sponsorship Opportunities', href: 'Sponsors', internal: true },
      { label: 'Partnership Inquiry', href: 'SponsorPitch', internal: true },
      { label: 'Advertising Options', href: 'Sponsors', internal: true },
    ]
  },
  {
    title: 'Industry Recognition',
    description: 'Nominate your team members for TOP 100 recognition.',
    icon: Award,
    links: [
      { label: 'Nominate a Leader', href: 'Season4', internal: true },
      { label: 'View Current Nominees', href: 'Top100Nominees2025', internal: true },
      { label: 'Past Honorees', href: 'Top100Women2025', internal: true },
    ]
  },
  {
    title: 'Enterprise Solutions',
    description: 'Custom solutions for large aerospace organizations.',
    icon: Building,
    links: [
      { label: 'Contact Sales', url: 'mailto:enterprise@top100aerospace.com' },
      { label: 'Schedule Demo', href: 'SponsorPitch', internal: true },
      { label: 'Case Studies', href: 'About', internal: true },
    ]
  },
];

function ResourceCard({ resource }) {
  return (
    <Card className="bg-white h-full" style={{ border: `1px solid ${brandColors.navyDeep}10` }}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${brandColors.goldPrestige}20` }}>
            <resource.icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
          </div>
          <CardTitle className="text-lg" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
            {resource.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>
          {resource.description}
        </p>
        <div className="space-y-2">
          {resource.links.map((link, idx) => (
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

export default function EnterpriseResources() {
  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      <div 
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <Building className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Enterprise Resources
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Solutions for aerospace organizations to recruit, engage, and grow
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {RESOURCES.map((resource, idx) => (
            <ResourceCard key={idx} resource={resource} />
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <Card 
          className="p-8 text-center"
          style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}15, ${brandColors.roseAccent}15)`, border: `1px solid ${brandColors.goldPrestige}40` }}
        >
          <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
            Ready to Partner?
          </h3>
          <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7 }}>
            Connect with our enterprise team to discuss custom solutions
          </p>
          <Link to={createPageUrl('SponsorPitch')}>
            <Button className="text-white" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}>
              Contact Enterprise Team <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}