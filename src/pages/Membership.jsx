import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import StandingAxis from '@/components/membership/StandingAxis';
import AccessTierCard from '@/components/membership/AccessTierCard';
import SelectionIntegrityLine from '@/components/membership/SelectionIntegrityLine';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import AdvocacyStrip from '@/components/events/AdvocacyStrip';
import HomeDock from '@/components/home-v3/HomeDock';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';
const CREAM = '#faf8f5';

const ACCESS_TIERS = [
  {
    id: 'public',
    name: 'Public',
    audience: 'Free, forever',
    price: 'Free',
    priceNote: 'always',
    description:
      'Browse the published Volumes. Read the Dispatch. Submit nominations. Attend open events. Receive the newsletter.',
    features: [
      'Browse published Volumes',
      'Read The Dispatch newsletter',
      'Submit nominations — free forever',
      'Attend open events',
      'Receive the newsletter',
    ],
    cta: 'Join Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    audience: 'Individual, paid',
    price: '$249',
    priceNote: '/year',
    description:
      'The pitch is not visibility — visibility is earned. The pitch is the graph: the verified network, searchable.',
    features: [
      'Search the verified network by discipline, domain, geography, seniority',
      'Direct messaging to Fellows who have opted in',
      'Season briefings and closed Moon Joy sessions',
      'Archive access across all Volumes',
      'Phoenix Project proposal rights',
    ],
    cta: 'Get Pro',
  },
  {
    id: 'business',
    name: 'Business',
    audience: 'Organization, paid',
    price: null,
    priceNote: '',
    description:
      'Where the revenue lives. Run as a design-partner motion — five aerospace employers, discounted, in exchange for telling us what the product needs to be.',
    features: [
      'Talent search and saved searches',
      'Verified company profile',
      'Roles board',
      'Season sponsorship eligibility (eligibility to buy, not sponsorship itself)',
      'Named account contact',
    ],
    cta: 'Contact Sales',
  },
];

export default function Membership() {
  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* HomeV3-aligned top chrome */}
      <AnnouncementBanner />
      <div className="relative z-[99]">
        <AdvocacyStrip />
      </div>

      <div className="mx-auto max-w-5xl p-4 md:p-8">
        {/* Hero */}
        <div className="mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: `${GOLD}20` }}
          >
            <Rocket className="h-4 w-4" style={{ color: GOLD }} />
            <span
              className="text-sm font-medium"
              style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
            >
              Two axes. Never touching.
            </span>
          </motion.div>

          <h1
            className="mb-4 text-4xl font-bold md:text-5xl"
            style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Standing is earned. Access is purchased.
          </h1>
          <p
            className="mx-auto max-w-2xl text-base md:text-lg"
            style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
          >
            The modern aerospace chamber runs on two axes that never touch. What you
            earn here, no one can buy. What you buy here, buys you no standing.
          </p>
        </div>

        {/* Axis I — Standing */}
        <StandingAxis />

        {/* Axis II — Access */}
        <div className="mb-8 text-center">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.24em]"
            style={{ color: GOLD }}
          >
            Axis II · Access
          </span>
          <h2
            className="mt-2 text-2xl md:text-3xl font-bold"
            style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Tools and community. Never standing.
          </h2>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {ACCESS_TIERS.map((tier, index) => (
            <AccessTierCard key={tier.id} tier={tier} index={index} />
          ))}
        </div>

        {/* Permanent integrity line */}
        <SelectionIntegrityLine />

        {/* Fellows comped callout */}
        <div
          className="mb-12 rounded-2xl p-6 text-center"
          style={{ background: `${NAVY}08` }}
        >
          <h3
            className="mb-2 text-xl font-bold"
            style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Fellows get Pro comped. Permanently.
          </h3>
          <p
            className="mx-auto max-w-2xl text-sm leading-6"
            style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
          >
            It costs nothing, it is the correct signal, and it means every Fellow is
            inside the tool — generating the engagement data our measurement thesis
            depends on.
          </p>
        </div>

        {/* Partner — off the pricing page */}
        <div
          className="mb-12 rounded-2xl border p-6"
          style={{ borderColor: `${NAVY}20`, background: 'white' }}
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                className="text-lg font-bold"
                style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
              >
                Partner
              </h3>
              <p
                className="mt-1 max-w-xl text-sm leading-6"
                style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
              >
                Sponsorship, API access, research and data licensing, Local Legends
                placement. Sales-led, priced per engagement — not on this page.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = `mailto:partnerships@top100aerospace.com?subject=${encodeURIComponent('Partner Inquiry')}`)
              }
              style={{
                borderColor: NAVY,
                color: NAVY,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Talk to Partnerships
            </Button>
          </div>
        </div>

        {/* Close */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: `${NAVY}08` }}
        >
          <h2
            className="mb-3 text-2xl font-bold"
            style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Questions?
          </h2>
          <p
            className="mb-6"
            style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
          >
            Our team is here to help you find the right access for your needs.
          </p>
          <Link to="/About">
            <Button
              style={{
                background: NAVY,
                color: 'white',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Learn More About Us
            </Button>
          </Link>
        </div>
      </div>

      {/* Spacer so the sticky dock never covers content */}
      <div className="h-24" />

      {/* HomeV3-aligned sticky bottom dock */}
      <HomeDock />
    </div>
  );
}