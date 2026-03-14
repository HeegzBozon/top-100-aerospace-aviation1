import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trophy, Crown, Download, Share2, Mic, Calendar,
  Users, Heart, Sparkles, ArrowRight, Star, Award, FileText
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function HonoreeResources() {
  const benefits = [
    {
      icon: Trophy,
      title: "Digital Badge & Certificate",
      description: "Download your official TOP 100 badge and certificate for your profiles and signature.",
      action: "Download Assets",
      href: "Passport"
    },
    {
      icon: Share2,
      title: "Shareable Card",
      description: "Get a custom shareable card to announce your recognition on social media.",
      action: "Create Card",
      href: "Passport"
    },
    {
      icon: Calendar,
      title: "Exclusive Events",
      description: "Access to honoree-only networking events, panels, and celebrations.",
      action: "View Events",
      href: "Calendar"
    },
    {
      icon: Mic,
      title: "Speaking Opportunities",
      description: "Be featured in podcasts, webinars, and industry panels.",
      action: "Express Interest",
      href: "Comms"
    },
    {
      icon: Users,
      title: "Honoree Network",
      description: "Connect with fellow honorees across seasons in our exclusive community.",
      action: "Join Network",
      href: "TalentExchange"
    },
    {
      icon: FileText,
      title: "Publication Feature",
      description: "Be featured in the official TOP 100 publication and archive.",
      action: "View Publication",
      href: "Top100Women2025"
    },
  ];

  const responsibilities = [
    {
      icon: Heart,
      title: "Mentor Future Leaders",
      description: "Pay it forward by mentoring nominees and emerging talent in aerospace.",
    },
    {
      icon: Award,
      title: "Nominate Others",
      description: "Help identify the next generation of leaders by submitting nominations.",
    },
    {
      icon: Star,
      title: "Share Your Story",
      description: "Inspire others by sharing your journey and achievements.",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
            >
              <Crown className="w-3.5 h-3.5" />
              HONOREE RESOURCES
            </div>
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: brandColors.navyDeep }}
            >
              Welcome, TOP 100 Honoree
            </h1>
            <p 
              className="text-base md:text-lg max-w-2xl mx-auto"
              style={{ color: `${brandColors.navyDeep}80` }}
            >
              Congratulations on your recognition! Here are the benefits, resources, and opportunities available to you as a TOP 100 honoree.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: brandColors.navyDeep }}>
            Your Honoree Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-2" style={{ borderColor: `${brandColors.goldPrestige}30` }}>
                  <CardHeader className="pb-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                      style={{ background: `${brandColors.goldPrestige}20` }}
                    >
                      <benefit.icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                    </div>
                    <CardTitle className="text-base" style={{ color: brandColors.navyDeep }}>
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4" style={{ color: `${brandColors.navyDeep}70` }}>
                      {benefit.description}
                    </p>
                    <Link to={createPageUrl(benefit.href)}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}
                      >
                        {benefit.action}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="py-12 px-6" style={{ background: `${brandColors.navyDeep}05` }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
              As an Honoree, You Can...
            </h2>
            <p className="text-sm mt-2" style={{ color: `${brandColors.navyDeep}60` }}>
              Help build the future of the female aerospace ecosystem
            </p>
          </div>
          <div className="space-y-4">
            {responsibilities.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 bg-white p-5 rounded-xl"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${brandColors.skyBlue}15` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: brandColors.navyDeep }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: `${brandColors.navyDeep}70` }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div 
            className="p-6 rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}20, ${brandColors.navyDeep}10)` }}
          >
            <Trophy className="w-10 h-10 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
              Your Legacy Continues
            </h2>
            <p className="text-sm mb-6" style={{ color: `${brandColors.navyDeep}70` }}>
              As a TOP 100 honoree, your recognition is permanent. You'll be featured in our historical archive and can continue to engage with future seasons.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to={createPageUrl('Season4')}>
                <Button style={{ background: brandColors.navyDeep }}>
                  Nominate Someone
                </Button>
              </Link>
              <Link to={createPageUrl('ArchiveLanding')}>
                <Button variant="outline" style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}>
                  View Archive
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}