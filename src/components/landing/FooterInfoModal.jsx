import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

const modalContent = {
  about: {
    title: 'About TOP 100 Aerospace & Aviation',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <p>
          TOP 100 Aerospace & Aviation is an institutional recognition platform built around a verified directory of 100 women leaders shaping the future of flight.
        </p>
        <p>
          Founded in 2021, TOP 100 OS (Operating System) serves as the authoritative infrastructure for the aerospace community — providing visibility, credibility, and permanent institutional records for the engineers, executives, scientists, and leaders who built it.
        </p>
        <p>
          With 13,000+ community followers and 6,000+ newsletter subscribers, TOP 100 OS has become a trusted signal within the industry, connecting aerospace professionals across 49 countries and 70+ disciplines.
        </p>
        <p className="font-semibold mt-4">Our Mission</p>
        <p>
          Aerospace has a $440B industry with no authoritative record of who built it. TOP 100 OS is building that permanent, credible, reputation-weighted institutional record.
        </p>
      </div>
    )
  },
  methodology: {
    title: 'Selection Methodology',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <p>
          The TOP 100 selection process is built on four core criteria that reflect excellence and impact in aerospace:
        </p>
        <div className="space-y-3 mt-4">
          <div>
            <p className="font-semibold">Innovation</p>
            <p className="text-xs mt-1">Breakthrough thinking, novel approaches, and pioneering contributions to aerospace technology, systems, or practice.</p>
          </div>
          <div>
            <p className="font-semibold">Impact</p>
            <p className="text-xs mt-1">Measurable influence on programs, teams, or the industry. Leadership of mission-critical initiatives, systems, or strategic directions.</p>
          </div>
          <div>
            <p className="font-semibold">Community</p>
            <p className="text-xs mt-1">Commitment to building the next generation. Mentorship, advocacy, representation, and ecosystem contribution.</p>
          </div>
          <div>
            <p className="font-semibold">Trajectory</p>
            <p className="text-xs mt-1">Momentum and visibility. Leadership presence, growth trajectory, and emerging influence in the field.</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          Nominations are open seasonally. Follow our newsletter for the next nomination window.
        </p>
      </div>
    )
  },
  categories: {
    title: 'The 8 Domains',
    content: (
      <div className="space-y-2 text-sm text-gray-700">
        <p>The TOP 100 spans eight core domains within aerospace and aviation:</p>
        <ul className="space-y-2 mt-4 text-xs">
          <li><span className="font-semibold">Space Sector</span> — Satellite, launch, deep space, and emerging space industries</li>
          <li><span className="font-semibold">Aviation</span> — Commercial, regional, and general aviation</li>
          <li><span className="font-semibold">Aerospace Engineering</span> — Structures, propulsion, systems, and advanced aerospace design</li>
          <li><span className="font-semibold">Academia & Education</span> — Research, university programs, and next-generation pipeline</li>
          <li><span className="font-semibold">Policy & Governance</span> — Regulation, institutional leadership, and industry direction</li>
          <li><span className="font-semibold">Healthcare & Medicine</span> — Human factors, physiology, and aerospace medicine</li>
          <li><span className="font-semibold">Consulting & Business</span> — Strategy, operations, and industry advisory</li>
          <li><span className="font-semibold">Communication & Outreach</span> — Advocacy, journalism, and community engagement</li>
        </ul>
      </div>
    )
  },
  sponsors: {
    title: 'Sponsorship Opportunities',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <p>
          TOP 100 OS partners with leading aerospace organizations to amplify excellence and community within the industry.
        </p>
        <div className="space-y-3 mt-4">
          <div>
            <p className="font-semibold">Strategic Sponsorship</p>
            <p className="text-xs text-gray-600 mt-1">$10K–$150K</p>
            <p className="text-xs mt-1">Brand visibility, directional partnership, and institutional alignment with TOP 100 OS.</p>
          </div>
          <div>
            <p className="font-semibold">Strategic Residency</p>
            <p className="text-xs text-gray-600 mt-1">$20K–$75K/month</p>
            <p className="text-xs mt-1">Deep integration with the community, thought leadership, and co-created initiatives.</p>
          </div>
          <div>
            <p className="font-semibold">Retainer Programs</p>
            <p className="text-xs text-gray-600 mt-1">$5K–$35K/month</p>
            <p className="text-xs mt-1">Ongoing advisory, community access, and institutional presence.</p>
          </div>
        </div>
        <p className="mt-4 text-xs">
          For partnership inquiries: <span className="font-semibold">strategy@top100os.com</span>
        </p>
      </div>
    )
  },
  press: {
    title: 'Press & Media',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <p>
          TOP 100 Aerospace & Aviation is available for interviews, featured stories, and industry commentary.
        </p>
        <div className="space-y-3 mt-4">
          <p className="font-semibold">Media Inquiries</p>
          <p className="text-xs">
            For interview requests, feature stories, or media partnerships, reach out to:
          </p>
          <p className="text-xs font-semibold">strategy@top100os.com</p>
        </div>
        <div className="space-y-2 mt-4">
          <p className="font-semibold">What We Offer</p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>Expert commentary on aerospace talent and leadership trends</li>
            <li>Access to verified directory and honoree profiles</li>
            <li>Founder insights and platform updates</li>
          </ul>
        </div>
      </div>
    )
  },
  governance: {
    title: 'Governance & Community',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <p>
          TOP 100 OS is built as a governance-first institution, with multiple paths for meaningful participation.
        </p>
        <div className="space-y-3 mt-4">
          <div>
            <p className="font-semibold">Membership Tiers</p>
            <ul className="text-xs space-y-1 mt-2 list-disc list-inside">
              <li><span className="font-semibold">Observer</span> — Browse and explore the directory</li>
              <li><span className="font-semibold">Member</span> — Nominate, endorse, and participate in community (free)</li>
              <li><span className="font-semibold">Verified Contributor</span> — Elevated signal in nominations and voting</li>
              <li><span className="font-semibold">Fellow (Honoree)</span> — One of the 100</li>
              <li><span className="font-semibold">Institutional Partner</span> — Strategic organization partnership</li>
            </ul>
          </div>
          <p className="text-xs mt-4">
            The community is open to anyone in aerospace. <span className="font-semibold">Join for free.</span>
          </p>
        </div>
      </div>
    )
  },
  contact: {
    title: 'Get in Touch',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <p>
          Have a question about the platform, want to nominate someone, or interested in partnership?
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="font-semibold text-sm">Contact Us</p>
          <p className="text-sm font-mono mt-2">strategy@top100os.com</p>
        </div>
        <p className="text-xs text-gray-600 mt-4">
          We'll get back to you within 24–48 business hours.
        </p>
      </div>
    )
  }
};

export default function FooterInfoModal({ isOpen, onClose, modalType }) {
  const section = modalContent[modalType];

  if (!section) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{section.title}</DialogTitle>
          <DialogClose className="absolute right-4 top-4 p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </DialogClose>
        </DialogHeader>
        <div className="mt-6">
          {section.content}
        </div>
      </DialogContent>
    </Dialog>
  );
}