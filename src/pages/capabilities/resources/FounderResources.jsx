import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Rocket, DollarSign, Users, Lightbulb, ExternalLink, ArrowRight } from 'lucide-react';

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
    title: 'Funding & Investment',
    description: 'Venture capital, grants, and funding opportunities for aerospace startups.',
    icon: DollarSign,
    links: [
      { label: 'Space Angels', url: 'https://www.spaceangels.com/' },
      { label: 'Seraphim Capital', url: 'https://seraphim.vc/' },
      { label: 'NASA SBIR/STTR', url: 'https://sbir.nasa.gov/' },
    ]
  },
  {
    title: 'Accelerators & Incubators',
    description: 'Programs to help you build and scale your aerospace venture.',
    icon: Rocket,
    links: [
      { label: 'Techstars Space', url: 'https://www.techstars.com/accelerators/space' },
      { label: 'Starburst Accelerator', url: 'https://starburst.aero/' },
      { label: 'MassChallenge', url: 'https://masschallenge.org/' },
    ]
  },
  {
    title: 'Founder Communities',
    description: 'Connect with fellow aerospace founders and entrepreneurs.',
    icon: Users,
    links: [
      { label: 'NewSpace Global', url: 'https://www.newspaceglobal.com/' },
      { label: 'Space Frontier Foundation', url: 'https://spacefrontier.org/' },
      { label: 'Founders Forum', url: 'https://foundersforum.eu/' },
    ]
  },
  {
    title: 'Startup Resources',
    description: 'Tools, guides, and resources for building your aerospace company.',
    icon: Lightbulb,
    links: [
      { label: 'Y Combinator Library', url: 'https://www.ycombinator.com/library' },
      { label: 'First Round Review', url: 'https://review.firstround.com/' },
      { label: 'Startup School', url: 'https://www.startupschool.org/' },
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FounderResources() {
  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero */}
      <div 
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Founder Resources
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Everything you need to launch and scale your aerospace or aviation startup
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {RESOURCES.map((resource, idx) => (
            <ResourceCard key={idx} resource={resource} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <Card 
          className="p-8 text-center"
          style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}15, ${brandColors.roseAccent}15)`, border: `1px solid ${brandColors.goldPrestige}40` }}
        >
          <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
            Join Our Startup Directory
          </h3>
          <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7 }}>
            Get visibility and connect with investors in the aerospace ecosystem
          </p>
          <Link to={createPageUrl('StartupDirectory')}>
            <Button className="text-white" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}>
              Explore Directory <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}