import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, Megaphone, Calendar, FileText, ArrowRight } from 'lucide-react';

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
    title: 'Sponsorship Tiers',
    description: 'Explore our sponsorship packages and benefits.',
    icon: Star,
    links: [
      { label: 'View Sponsorship Packages', href: 'Sponsors', internal: true },
      { label: 'Compare Tiers', href: 'Sponsors', internal: true },
      { label: 'Request Custom Package', href: 'SponsorPitch', internal: true },
    ]
  },
  {
    title: 'Marketing Assets',
    description: 'Logos, brand guidelines, and promotional materials for sponsors.',
    icon: Megaphone,
    links: [
      { label: 'Brand Guidelines', href: 'About', internal: true },
      { label: 'Press Kit', href: 'About', internal: true },
      { label: 'Social Media Assets', href: 'About', internal: true },
    ]
  },
  {
    title: 'Events & Activations',
    description: 'Sponsorship opportunities at TOP 100 events.',
    icon: Calendar,
    links: [
      { label: 'Upcoming Events', href: 'Calendar', internal: true },
      { label: 'Event Sponsorship', href: 'SponsorPitch', internal: true },
      { label: 'Speaking Opportunities', href: 'SponsorPitch', internal: true },
    ]
  },
  {
    title: 'Sponsor Portal',
    description: 'Access your sponsor dashboard and analytics.',
    icon: FileText,
    links: [
      { label: 'Sponsor Dashboard', href: 'Sponsors', internal: true },
      { label: 'ROI Reports', href: 'Sponsors', internal: true },
      { label: 'Audience Demographics', href: 'Demographics', internal: true },
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
            <Link 
              key={idx}
              to={createPageUrl(link.href)}
              className="flex items-center gap-2 text-sm hover:underline"
              style={{ color: brandColors.skyBlue }}
            >
              <ArrowRight className="w-3 h-3" />
              {link.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SponsorResources() {
  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      <div 
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <Star className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sponsor Resources
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Everything you need to maximize your TOP 100 sponsorship
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
            Become a Sponsor
          </h3>
          <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7 }}>
            Join leading aerospace companies supporting industry excellence
          </p>
          <Link to={createPageUrl('SponsorPitch')}>
            <Button className="text-white" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}>
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}