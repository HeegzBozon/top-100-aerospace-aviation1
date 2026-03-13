import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import SponsorCard from '@/components/epics/08-sponsor-commercial/sponsors/SponsorCard';
import PartnershipChatModal from '@/components/epics/08-sponsor-commercial/sponsors/PartnershipChatModal';
import BookMeetingModal from '@/components/epics/08-sponsor-commercial/sponsors/BookMeetingModal';
import { 
  Loader2, Award, TrendingUp, Users, Globe, Target, CheckCircle, 
  BarChart3, Rocket, Mail, Calendar, ArrowRight, Star, Trophy, 
  Sparkles, Zap
} from 'lucide-react';

const brandColors = {
    navyDeep: '#1e3a5a',
    skyBlue: '#4a90b8',
    goldPrestige: '#c9a87c',
    cream: '#faf8f5',
};

const sponsorshipTiers = [
    {
        name: 'Bronze',
        price: '$5,000',
        color: '#cd7f32',
        icon: Star,
        benefits: [
            'Logo on website footer',
            'Social media recognition (1 post)',
            'Mention in quarterly newsletter',
            'Community member access'
        ]
    },
    {
        name: 'Silver',
        price: '$15,000',
        color: '#c0c0c0',
        icon: Award,
        benefits: [
            'All Bronze benefits',
            'Logo on sponsor page with link',
            'Social media features (4 posts/year)',
            '2 complimentary event tickets',
            'Quarterly performance report',
            'Job postings in talent exchange'
        ]
    },
    {
        name: 'Gold',
        price: '$35,000',
        color: '#ffd700',
        icon: Trophy,
        popular: true,
        benefits: [
            'All Silver benefits',
            'Premium logo placement',
            'Dedicated sponsor spotlight article',
            'Speaking opportunity at annual event',
            '5 complimentary event tickets',
            'Exclusive networking sessions',
            'Monthly analytics dashboard',
            'Co-branded content opportunities'
        ]
    },
    {
        name: 'Platinum',
        price: '$75,000+',
        color: '#e5e4e2',
        icon: Sparkles,
        benefits: [
            'All Gold benefits',
            'Title sponsorship of major events',
            'Executive advisory board seat',
            'Custom activation opportunities',
            '10 complimentary event tickets',
            'Keynote speaking slot',
            'Premium booth space at events',
            'Dedicated account manager',
            'First access to new initiatives',
            'Custom research & insights reports'
        ]
    }
];

const impactMetrics = [
    { label: 'Active Members', value: '10,000+', icon: Users, color: brandColors.skyBlue },
    { label: 'Industry Reach', value: '50+ Countries', icon: Globe, color: brandColors.goldPrestige },
    { label: 'Engagement Rate', value: '42%', icon: TrendingUp, color: brandColors.navyDeep },
    { label: 'Annual Events', value: '12+', icon: Calendar, color: brandColors.skyBlue }
];

const valuePropositions = [
    {
        icon: Target,
        title: 'Precision Targeting',
        description: 'Reach decision-makers, innovators, and rising stars in aerospace & aviation.'
    },
    {
        icon: Rocket,
        title: 'Brand Elevation',
        description: 'Associate your brand with excellence, innovation, and industry leadership.'
    },
    {
        icon: Users,
        title: 'Talent Pipeline',
        description: 'Direct access to TOP 100 nominees and community for recruitment & partnerships.'
    },
    {
        icon: BarChart3,
        title: 'Measurable ROI',
        description: 'Detailed analytics on reach, engagement, and brand lift from sponsorship.'
    }
];

export default function SponsorsPage() {
    const [selectedTier, setSelectedTier] = useState(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    
    const { data: sponsors, isLoading } = useQuery({
        queryKey: ['sponsors'],
        queryFn: () => base44.entities.Sponsor.list({
            filter: { is_active: true },
            sort: { tier: 1 }
        }),
        initialData: []
    });

    const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
    const sortedSponsors = [...sponsors].sort((a, b) => {
        return (tierOrder[a.tier] || 4) - (tierOrder[b.tier] || 4);
    });
    
    const hasSponsors = sortedSponsors.length > 0;

    return (
        <div className="min-h-screen" style={{ background: brandColors.cream }}>
            {/* Hero Section */}
            <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0a1525 100%)` }}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 20% 50%, ${brandColors.skyBlue} 1px, transparent 1px),
                                         radial-gradient(circle at 80% 80%, ${brandColors.goldPrestige} 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>
                
                <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-block mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="text-white/90 text-sm font-medium">Founding Partnership Opportunities</span>
                            </div>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" style={{
                            fontFamily: "'Playfair Display', Georgia, serif"
                        }}>
                            Partner With Excellence
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12">
                            Connect with the aerospace & aviation industry's most influential voices and rising stars.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={() => document.getElementById('tiers').scrollIntoView({ behavior: 'smooth' })}
                                className="text-lg px-8 py-6"
                                style={{ background: brandColors.goldPrestige, color: 'white' }}
                            >
                                View Partnership Tiers
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setShowChatModal(true)}
                                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
                            >
                                <Sparkles className="mr-2 w-5 h-5" />
                                Let's Chat
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Impact Metrics */}
            <section className="py-16" style={{ background: 'white' }}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {impactMetrics.map((metric, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${metric.color}20` }}>
                                    <metric.icon className="w-8 h-8" style={{ color: metric.color }} />
                                </div>
                                <div className="text-3xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>
                                    {metric.value}
                                </div>
                                <div className="text-sm" style={{ color: brandColors.navyDeep + '80' }}>
                                    {metric.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Current Partners (if any) */}
            {hasSponsors && (
                <section className="py-20" style={{ background: brandColors.cream }}>
                    <div className="max-w-6xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ 
                                color: brandColors.navyDeep,
                                fontFamily: "'Playfair Display', Georgia, serif"
                            }}>
                                Our Partners
                            </h2>
                            <p className="text-xl" style={{ color: brandColors.navyDeep + '80' }}>
                                Organizations shaping the future of aerospace
                            </p>
                        </motion.div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                {sortedSponsors.map(sponsor => (
                                    <SponsorCard key={sponsor.id} sponsor={sponsor} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Value Propositions */}
            <section className="py-20" style={{ background: hasSponsors ? 'white' : brandColors.cream }}>
                <div className="max-w-6xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ 
                            color: brandColors.navyDeep,
                            fontFamily: "'Playfair Display', Georgia, serif"
                        }}>
                            Why Partner With Us
                        </h2>
                        <p className="text-xl" style={{ color: brandColors.navyDeep + '80' }}>
                            Strategic benefits that drive real business outcomes
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {valuePropositions.map((prop, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="p-8 rounded-2xl border"
                                style={{ background: 'white', borderColor: brandColors.navyDeep + '20' }}
                            >
                                <div className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center" style={{ background: `${brandColors.skyBlue}20` }}>
                                    <prop.icon className="w-7 h-7" style={{ color: brandColors.skyBlue }} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3" style={{ color: brandColors.navyDeep }}>
                                    {prop.title}
                                </h3>
                                <p className="text-lg" style={{ color: brandColors.navyDeep + '80' }}>
                                    {prop.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sponsorship Tiers */}
            <section id="tiers" className="py-20" style={{ background: 'white' }}>
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-block mb-4">
                            <div className="px-4 py-2 rounded-full" style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}>
                                <span className="font-bold">🚀 Founding Partner Benefits Available</span>
                            </div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ 
                            color: brandColors.navyDeep,
                            fontFamily: "'Playfair Display', Georgia, serif"
                        }}>
                            Partnership Tiers
                        </h2>
                        <p className="text-xl" style={{ color: brandColors.navyDeep + '80' }}>
                            Choose the partnership level that aligns with your goals
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sponsorshipTiers.map((tier, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative rounded-2xl p-8 border-2 transition-all hover:scale-105 cursor-pointer"
                                style={{ 
                                    borderColor: tier.popular ? tier.color : brandColors.navyDeep + '20',
                                    background: tier.popular ? `linear-gradient(135deg, ${tier.color}05, white)` : 'white',
                                    boxShadow: tier.popular ? `0 10px 40px ${tier.color}30` : 'none'
                                }}
                                onClick={() => setSelectedTier(tier.name)}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white" style={{ background: tier.color }}>
                                        Most Popular
                                    </div>
                                )}
                                
                                <div className="mb-6">
                                    <div className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${tier.color}20` }}>
                                        <tier.icon className="w-7 h-7" style={{ color: tier.color }} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
                                        {tier.name}
                                    </h3>
                                    <div className="text-3xl font-bold" style={{ color: tier.color }}>
                                        {tier.price}
                                    </div>
                                    <div className="text-sm" style={{ color: brandColors.navyDeep + '60' }}>
                                        per year
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {tier.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                                            <span className="text-sm" style={{ color: brandColors.navyDeep + '90' }}>
                                                {benefit}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full"
                                    style={{ 
                                        background: tier.popular ? tier.color : 'transparent',
                                        color: tier.popular ? 'white' : tier.color,
                                        border: tier.popular ? 'none' : `2px solid ${tier.color}`
                                    }}
                                    onClick={() => window.location.href = `mailto:partners@top100aerospace.com?subject=${tier.name}%20Partnership%20Inquiry`}
                                >
                                    Get Started
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Custom Solutions */}
            <section className="py-20" style={{ background: brandColors.cream }}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Rocket className="w-16 h-16 mx-auto mb-6" style={{ color: brandColors.goldPrestige }} />
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ 
                            color: brandColors.navyDeep,
                            fontFamily: "'Playfair Display', Georgia, serif"
                        }}>
                            Need a Custom Solution?
                        </h2>
                        <p className="text-xl mb-8" style={{ color: brandColors.navyDeep + '80' }}>
                            We work with partners to create tailored sponsorship packages that align with your specific goals, budget, and activation needs.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => setShowChatModal(true)}
                            className="text-lg px-8 py-6"
                            style={{ background: brandColors.goldPrestige, color: 'white' }}
                        >
                            Let's Chat
                            <Sparkles className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20" style={{ background: brandColors.navyDeep }}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{
                            fontFamily: "'Playfair Display', Georgia, serif"
                        }}>
                            Ready to Make an Impact?
                        </h2>
                        <p className="text-xl text-white/80 mb-10">
                            Join the coalition of organizations shaping the future of aerospace and aviation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={() => setShowChatModal(true)}
                                className="text-lg px-8 py-6"
                                style={{ background: brandColors.goldPrestige, color: 'white' }}
                            >
                                <Sparkles className="mr-2 w-5 h-5" />
                                Let's Chat
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setShowBookingModal(true)}
                                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
                            >
                                <Calendar className="mr-2 w-5 h-5" />
                                Book Meeting
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Partnership Chat Modal */}
            <PartnershipChatModal 
                isOpen={showChatModal} 
                onClose={() => setShowChatModal(false)} 
            />

            {/* Book Meeting Modal */}
            <BookMeetingModal 
                isOpen={showBookingModal} 
                onClose={() => setShowBookingModal(false)} 
            />
        </div>
    );
}