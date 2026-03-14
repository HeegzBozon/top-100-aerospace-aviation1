import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Briefcase, FileText, Target, Award, ExternalLink, ArrowRight } from 'lucide-react';

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
    title: 'Job Boards',
    description: 'Top aerospace and aviation job boards to find your next opportunity.',
    icon: Briefcase,
    links: [
      { label: 'Aviation Job Search', url: 'https://www.aviationjobsearch.com/' },
      { label: 'Space Careers', url: 'https://www.space-careers.com/' },
      { label: 'Aerospace Industries Association', url: 'https://www.aia-aerospace.org/careers/' },
    ]
  },
  {
    title: 'Resume & Interview',
    description: 'Resources to help you craft the perfect resume and ace your interviews.',
    icon: FileText,
    links: [
      { label: 'Aerospace Resume Tips', url: 'https://www.aiaa.org/careers' },
      { label: 'Technical Interview Prep', url: 'https://www.glassdoor.com/Interview/aerospace-interview-questions-SRCH_KO0,9.htm' },
      { label: 'LinkedIn Optimization', url: 'https://www.linkedin.com/learning/topics/job-search' },
    ]
  },
  {
    title: 'Career Development',
    description: 'Certifications, training, and professional development opportunities.',
    icon: Target,
    links: [
      { label: 'PMI Certifications', url: 'https://www.pmi.org/' },
      { label: 'Six Sigma Aerospace', url: 'https://www.asq.org/cert/six-sigma' },
      { label: 'FAA Certifications', url: 'https://www.faa.gov/mechanics/become' },
    ]
  },
  {
    title: 'Professional Associations',
    description: 'Join industry associations to network and advance your career.',
    icon: Award,
    links: [
      { label: 'AIAA Professional', url: 'https://www.aiaa.org/membership' },
      { label: 'SAE International', url: 'https://www.sae.org/' },
      { label: 'Royal Aeronautical Society', url: 'https://www.aerosociety.com/' },
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

export default function CareerResources() {
  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero */}
      <div 
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Career Resources
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Advance your aerospace and aviation career with job opportunities and professional development
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
            Browse Open Positions
          </h3>
          <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7 }}>
            Explore job opportunities from top aerospace employers
          </p>
          <Link to={createPageUrl('TalentLanding')}>
            <Button className="text-white" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}>
              View Jobs <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}