import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import SponsorCard from '@/components/sponsors/SponsorCard';
import { 
  Loader2, Award, TrendingUp, Users, Globe, Target, CheckCircle, 
  BarChart3, Rocket, Mail, ArrowRight, Trophy, Zap, Calendar
} from 'lucide-react';

const brandColors = {
    navyDeep: '#1e3a5a',
    skyBlue: '#4a90b8',
    goldPrestige: '#c9a87c',
    cream: '#faf8f5',
};

const sponsorshipTracks = [
    {
        id: 'fellow',
        title: 'Sponsor a Fellow or Alumni',
        subtitle: '',
        price: '$5K – $30K / cycle',
        priceNote: 'Entry',
        color: '#8b7fbf',
        bgColor: '#eeedfe',
        borderColor: '#c9c0e8',
        icon: Award,
        benefits: [
            'Named visibility boost',
            'Authority Piece underwrite',
            'Time Capsule patronage',
            'Fellow Accelerator Program'
        ]
    },
    {
        id: 'initiative',
        title: 'Sponsor an Initiative or Mission',
        subtitle: '',
        price: '$7.5K – $75K / event',
        priceNote: 'Entry',
        color: '#b8860b',
        bgColor: '#faeeda',
        borderColor: '#e5c89b',
        icon: Rocket,
        benefits: [
            'Mission Room underwrite',
            'Rapid Response Cell activation',
            'Project Container funding',
            'Annual cycle co-sponsorship'
        ]
    },
    {
        id: 'institution',
        title: 'Sponsor the Institution (Patron)',
        subtitle: 'Patron of record',
        price: '$10K – $150K / year',
        priceNote: '',
        color: '#a74242',
        bgColor: '#faece7',
        borderColor: '#e5bfb8',
        icon: Trophy,
        popular: true,
        benefits: [
            'Bronze — visibility',
            'Silver — mentorship integration',
            'Gold — workforce activation',
            'Platinum — full residency'
        ]
    }
];

const sponsorActors = [
    'Corporations',
    'Fellows & Alumni',
    'Community members',
    'Boosters (nominators)'
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
                                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
                                onClick={() => window.location.href = 'mailto:partners@top100aerospace.com'}
                            >
                                <Mail className="mr-2 w-5 h-5" />
                                Contact
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

            {/* Sponsorship Tracks */}
            <section id="tiers" className="py-20" style={{ background: 'white' }}>
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ 
                            color: brandColors.navyDeep,
                            fontFamily: "'Playfair Display', Georgia, serif"
                        }}>
                            The Sponsor Parallel Track
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: brandColors.navyDeep + '80' }}>
                            Sponsors run alongside — not inside — the annual cycle. Choose one of three sponsorship objects:
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {sponsorshipTracks.map((track, index) => (
                            <motion.div
                                key={track.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative rounded-3xl p-8 border-2 transition-all hover:shadow-lg"
                                style={{ 
                                    borderColor: track.borderColor,
                                    background: track.bgColor
                                }}
                            >
                                {track.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white" style={{ background: track.color }}>
                                        Most Popular
                                    </div>
                                )}
                                
                                <div className="mb-6">
                                    <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${track.color}30` }}>
                                        <track.icon className="w-6 h-6" style={{ color: track.color }} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-1" style={{ color: track.color, fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        {track.title}
                                    </h3>
                                    {track.subtitle && (
                                        <p className="text-sm mb-3" style={{ color: track.color }}>
                                            {track.subtitle}
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {track.benefits.map((benefit, idx) => (
                                        <li key={idx} className="text-sm" style={{ color: brandColors.navyDeep }}>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-6 border-t-2" style={{ borderColor: track.borderColor }}>
                                    <p className="font-bold text-lg mb-3" style={{ color: track.color, fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        {track.priceNote && `${track.priceNote}: `}{track.price}
                                    </p>
                                    <Button
                                        className="w-full text-white font-semibold"
                                        style={{ background: track.color }}
                                        onClick={() => window.location.href = `mailto:partners@top100aerospace.com?subject=Sponsor%20${track.id.replace('-', '%20')}`}
                                    >
                                        Learn More
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Actor Types */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mt-16 pt-12 border-t-2"
                        style={{ borderColor: brandColors.navyDeep + '20' }}
                    >
                        <p className="text-lg font-semibold mb-6" style={{ color: brandColors.navyDeep + '80' }}>
                            Any of these actors can sponsor any of the three objects:
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {sponsorActors.map((actor, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    viewport={{ once: true }}
                                    className="px-6 py-3 rounded-full border-2"
                                    style={{ borderColor: brandColors.navyDeep + '30', background: 'white' }}
                                >
                                    <p className="font-semibold" style={{ color: brandColors.navyDeep }}>
                                        {actor}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
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
                            className="text-lg px-8 py-6"
                            style={{ background: brandColors.goldPrestige, color: 'white' }}
                            onClick={() => window.location.href = 'mailto:partners@top100aerospace.com?subject=Custom%20Sponsorship%20Inquiry'}
                        >
                            Contact Us
                            <Mail className="ml-2 w-5 h-5" />
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
                        <Button
                            size="lg"
                            className="text-lg px-8 py-6"
                            style={{ background: brandColors.goldPrestige, color: 'white' }}
                            onClick={() => window.location.href = 'mailto:partners@top100aerospace.com?subject=Partnership%20Inquiry'}
                        >
                            <Mail className="mr-2 w-5 h-5" />
                            Get in Touch
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}