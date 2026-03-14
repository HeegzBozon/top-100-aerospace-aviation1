import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Users, Building2, Rocket, Crown, Star, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

const MEMBERSHIP_TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceNote: 'Always free',
    description: 'Perfect for individuals exploring the aerospace & aviation community.',
    icon: Users,
    color: brandColors.skyBlue,
    features: [
      'Access to public directory',
      'View nominee profiles',
      'Community news & updates',
      'Basic networking features',
      'Event announcements',
    ],
    cta: 'Join Free',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Pro',
    price: '$249',
    priceNote: '/year',
    description: 'For professionals seeking to expand their network and visibility.',
    icon: Star,
    color: brandColors.goldPrestige,
    features: [
      'Everything in Basic',
      'Enhanced profile visibility',
      'Priority nomination consideration',
      'Direct messaging',
      'Exclusive webinars & events',
      'Industry insights & reports',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$1,999',
    priceNote: '/year',
    description: 'For businesses & organizations connecting with top aerospace talent.',
    icon: Building2,
    color: brandColors.navyDeep,
    features: [
      'Everything in Pro',
      'Company profile page',
      'Job posting privileges',
      'Talent sourcing tools',
      'Sponsor opportunities',
      'Partner badge & recognition',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'Contact us',
    description: 'Tailored solutions for large organizations and government agencies.',
    icon: Crown,
    color: brandColors.roseAccent,
    features: [
      'Everything in Business',
      'Custom integrations',
      'White-label options',
      'Bulk team accounts',
      'Priority support',
      'Custom reporting & analytics',
      'Strategic partnership benefits',
    ],
    cta: 'Get in Touch',
    popular: false,
  },
];

function TierCard({ tier, index }) {
  const Icon = tier.icon;
  
  const handleCTA = () => {
    if (tier.id === 'basic') {
      base44.auth.redirectToLogin();
    } else {
      // For paid tiers, could redirect to contact or checkout
      window.location.href = `mailto:partnerships@top100aerospace.com?subject=${encodeURIComponent(`Interest in ${tier.name} Membership`)}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-2xl p-6 flex flex-col h-full ${
        tier.popular ? 'ring-2 ring-offset-2' : 'border'
      }`}
      style={{
        background: tier.popular 
          ? `linear-gradient(135deg, ${brandColors.cream}, white)` 
          : 'white',
        borderColor: tier.popular ? brandColors.goldPrestige : `${brandColors.navyDeep}20`,
        ringColor: tier.popular ? brandColors.goldPrestige : undefined,
      }}
    >
      {tier.popular && (
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: brandColors.goldPrestige }}
        >
          MOST POPULAR
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${tier.color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: tier.color }} />
        </div>
        <div>
          <h3 
            className="text-lg font-bold"
            style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}
          >
            {tier.name}
          </h3>
        </div>
      </div>

      <div className="mb-4">
        <span 
          className="text-3xl font-bold"
          style={{ color: brandColors.navyDeep }}
        >
          {tier.price}
        </span>
        <span className="text-sm text-gray-500 ml-1">{tier.priceNote}</span>
      </div>

      <p 
        className="text-sm mb-6"
        style={{ color: `${brandColors.navyDeep}99`, fontFamily: "'Montserrat', sans-serif" }}
      >
        {tier.description}
      </p>

      <ul className="space-y-3 mb-6 flex-1">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check 
              className="w-4 h-4 mt-0.5 flex-shrink-0" 
              style={{ color: tier.color }} 
            />
            <span 
              className="text-sm"
              style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleCTA}
        className="w-full"
        style={{
          background: tier.popular 
            ? `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`
            : tier.id === 'basic' 
              ? brandColors.navyDeep 
              : 'transparent',
          color: tier.id === 'basic' || tier.popular ? 'white' : brandColors.navyDeep,
          border: tier.id !== 'basic' && !tier.popular ? `2px solid ${brandColors.navyDeep}` : 'none',
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {tier.cta}
      </Button>
    </motion.div>
  );
}

export default function Membership() {
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: brandColors.cream }}>
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: `${brandColors.goldPrestige}20` }}
          >
            <Rocket className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            <span 
              className="text-sm font-medium"
              style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}
            >
              Join the Network
            </span>
          </motion.div>

          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ 
              color: brandColors.navyDeep, 
              fontFamily: "'Playfair Display', Georgia, serif" 
            }}
          >
            Choose Your Membership
          </h1>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ 
              color: `${brandColors.navyDeep}99`, 
              fontFamily: "'Montserrat', sans-serif" 
            }}
          >
            Connect with aerospace & aviation leaders. From individual professionals 
            to enterprise organizations, we have a membership tier for you.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {MEMBERSHIP_TIERS.map((tier, index) => (
            <TierCard key={tier.id} tier={tier} index={index} />
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <div 
          className="rounded-2xl p-8 text-center"
          style={{ background: `${brandColors.navyDeep}08` }}
        >
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
          >
            Questions?
          </h2>
          <p 
            className="mb-6"
            style={{ color: `${brandColors.navyDeep}99`, fontFamily: "'Montserrat', sans-serif" }}
          >
            Our team is here to help you find the right membership for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = 'mailto:support@top100aerospace.com'}
              style={{ 
                borderColor: brandColors.navyDeep, 
                color: brandColors.navyDeep,
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Link to={createPageUrl('About')}>
              <Button
                style={{ 
                  background: brandColors.navyDeep, 
                  color: 'white',
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}