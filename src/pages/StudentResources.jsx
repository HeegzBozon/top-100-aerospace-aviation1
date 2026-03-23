import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, BookOpen, Users, Rocket, ExternalLink, ArrowRight } from 'lucide-react';

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
    title: 'Internship Programs',
    description: 'Connect with leading aerospace companies offering internship opportunities for students.',
    icon: Rocket,
    links: [
      { label: 'NASA Internships', url: 'https://intern.nasa.gov/' },
      { label: 'Boeing Internships', url: 'https://jobs.boeing.com/internships' },
      { label: 'Lockheed Martin', url: 'https://www.lockheedmartinjobs.com/students' },
    ]
  },
  {
    title: 'Scholarships & Grants',
    description: 'Financial aid opportunities specifically for aerospace and aviation students.',
    icon: GraduationCap,
    links: [
      { label: 'AIAA Scholarships', url: 'https://www.aiaa.org/get-involved/students-educators/scholarships' },
      { label: 'Women in Aviation', url: 'https://www.wai.org/scholarships' },
      { label: 'Aviation Scholarships', url: 'https://www.aopa.org/training-and-safety/learn-to-fly/aviation-scholarships' },
    ]
  },
  {
    title: 'Student Organizations',
    description: 'Join professional organizations to network and build your career early.',
    icon: Users,
    links: [
      { label: 'AIAA Student Membership', url: 'https://www.aiaa.org/membership/student' },
      { label: 'Society of Women Engineers', url: 'https://swe.org/' },
      { label: 'NSBE Aerospace', url: 'https://www.nsbe.org/' },
    ]
  },
  {
    title: 'Learning Resources',
    description: 'Free courses, tutorials, and educational content for aspiring aerospace professionals.',
    icon: BookOpen,
    links: [
      { label: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/aeronautics-and-astronautics/' },
      { label: 'Coursera Aerospace', url: 'https://www.coursera.org/browse/physical-science-and-engineering/mechanical-engineering' },
      { label: 'edX Aviation', url: 'https://www.edx.org/learn/aviation' },
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

export default function StudentResources() {
  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero */}
      <div 
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <GraduationCap className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Student Resources
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Launch your aerospace and aviation career with internships, scholarships, and learning opportunities
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
            Connect with TOP 100 Honorees
          </h3>
          <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7 }}>
            Get mentorship and career guidance from industry leaders
          </p>
          <Link to={createPageUrl('TalentExchange')}>
            <Button className="text-white" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}>
              Explore Mentorship <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}