import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Award, Users, TrendingUp, Share2, FileText, Camera, 
  CheckCircle, ArrowRight, Sparkles, Target, Heart, Star
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function NomineeResources() {
  const resources = [
    {
      icon: CheckCircle,
      title: "Complete Your Profile",
      description: "Maximize your visibility by completing your profile with achievements, metrics, and media.",
      action: "Edit Profile",
      href: "EditProfile"
    },
    {
      icon: Camera,
      title: "Professional Headshot",
      description: "Upload a professional headshot to make a strong first impression.",
      action: "Upload Photo",
      href: "EditProfile"
    },
    {
      icon: FileText,
      title: "Submit Your Metrics",
      description: "Add patents, publications, missions, leadership roles, and ecosystem contributions.",
      action: "Add Metrics",
      href: "EditProfile"
    },
    {
      icon: Share2,
      title: "Share Your Nomination",
      description: "Spread the word and ask colleagues to endorse your nomination.",
      action: "Get Share Link",
      href: "Passport"
    },
    {
      icon: Users,
      title: "Engage the Community",
      description: "Participate in voting, endorse peers, and build your network.",
      action: "Explore Community",
      href: "TalentExchange"
    },
    {
      icon: TrendingUp,
      title: "Track Your Standing",
      description: "Monitor your ranking and see how you compare in the Arena.",
      action: "View Standings",
      href: "Arena"
    },
  ];

  const tips = [
    "Keep your LinkedIn profile synced for automatic follower updates",
    "Add specific, quantifiable achievements (e.g., '50+ patents filed')",
    "Include mentorship and ecosystem-building contributions",
    "Respond to endorsement requests promptly",
    "Share your nomination on social media to increase visibility",
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
              <Award className="w-3.5 h-3.5" />
              NOMINEE RESOURCES
            </div>
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: brandColors.navyDeep }}
            >
              Maximize Your Nomination
            </h1>
            <p 
              className="text-base md:text-lg max-w-2xl mx-auto"
              style={{ color: `${brandColors.navyDeep}80` }}
            >
              Congratulations on being nominated! Here's everything you need to strengthen your profile and increase your chances of being recognized.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                      style={{ background: `${brandColors.skyBlue}15` }}
                    >
                      <resource.icon className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                    </div>
                    <CardTitle className="text-base" style={{ color: brandColors.navyDeep }}>
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4" style={{ color: `${brandColors.navyDeep}70` }}>
                      {resource.description}
                    </p>
                    <Link to={createPageUrl(resource.href)}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}
                      >
                        {resource.action}
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

      {/* Tips Section */}
      <section className="py-12 px-6" style={{ background: `${brandColors.navyDeep}05` }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
              Pro Tips for Nominees
            </h2>
          </div>
          <div className="space-y-3">
            {tips.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-white p-4 rounded-xl"
              >
                <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: brandColors.goldPrestige }} />
                <p className="text-sm" style={{ color: brandColors.navyDeep }}>{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Questions About Your Nomination?
          </h2>
          <p className="text-sm mb-6" style={{ color: `${brandColors.navyDeep}70` }}>
            Check out our help center or reach out to the community.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to={createPageUrl('HelpCenter')}>
              <Button style={{ background: brandColors.navyDeep }}>
                Help Center
              </Button>
            </Link>
            <Link to={createPageUrl('Comms')}>
              <Button variant="outline" style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}>
                Community Chat
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}