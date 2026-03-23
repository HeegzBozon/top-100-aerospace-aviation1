import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Rocket, TrendingUp, Users, Star, ArrowRight, 
  Target, Zap, Building2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const features = [
  {
    icon: Target,
    title: 'Funding Readiness Scoring',
    description: 'Get evaluated on team, market, product, traction, and pitch quality',
  },
  {
    icon: Users,
    title: 'Investor Matching',
    description: 'Connect with vetted investors actively seeking aerospace opportunities',
  },
  {
    icon: Zap,
    title: 'Micro-Acceleration',
    description: 'Optional 4-8 week program to sharpen your narrative and GTM strategy',
  },
];

const stats = [
  { value: '50+', label: 'Active Investors' },
  { value: '$10M+', label: 'Capital Deployed' },
  { value: '100+', label: 'Startups Evaluated' },
];

export default function RaisingJupiter() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myStartup } = useQuery({
    queryKey: ['my-startup', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const startups = await base44.entities.StartupProfile.filter({ founder_email: user.email });
      return startups[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: myInvestorProfile } = useQuery({
    queryKey: ['my-investor-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.InvestorProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero */}
      <div 
        className="relative text-white py-24 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 100%)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl" style={{ background: brandColors.skyBlue }} />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: brandColors.goldPrestige }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              Raising Jupiter — Startup Capital Engine
            </Badge>

            <h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Funding for the New Space Era
            </h1>

            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-10" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Raising Jupiter connects aerospace startups with capital, evaluation, and acceleration—transforming TOP 100 into a full-spectrum engine for innovation.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  {myStartup ? (
                    <Link to={createPageUrl('MissionControl') + '?module=founder'}>
                      <Button size="lg" className="px-8 py-6 rounded-full" style={{ background: brandColors.goldPrestige }}>
                        <Building2 className="w-5 h-5 mr-2" />
                        View My Startup
                      </Button>
                    </Link>
                  ) : myInvestorProfile ? (
                    <Link to={createPageUrl('MissionControl') + '?module=investor'}>
                      <Button size="lg" className="px-8 py-6 rounded-full" style={{ background: brandColors.goldPrestige }}>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Investor Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to={createPageUrl('FounderApplication')}>
                        <Button size="lg" className="px-8 py-6 rounded-full" style={{ background: brandColors.goldPrestige }}>
                          <Rocket className="w-5 h-5 mr-2" />
                          Apply as Founder
                        </Button>
                      </Link>
                      <Link to={createPageUrl('InvestorOnboarding')}>
                        <Button size="lg" variant="outline" className="px-8 py-6 rounded-full border-white text-white hover:bg-white/10">
                          <Users className="w-5 h-5 mr-2" />
                          Join as Investor
                        </Button>
                      </Link>
                    </>
                  )}

                  <Link to={createPageUrl('StartupDirectory')}>
                    <Button size="lg" variant="outline" className="px-8 py-6 rounded-full border-white text-white hover:bg-white/10">
                      <Star className="w-5 h-5 mr-2" />
                      Browse Startups
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="px-8 py-6 rounded-full" 
                    style={{ background: brandColors.goldPrestige }}
                    onClick={() => base44.auth.redirectToLogin(createPageUrl('RaisingJupiter'))}
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Get Started
                  </Button>
                  <Link to={createPageUrl('StartupDirectory')}>
                    <Button size="lg" variant="outline" className="px-8 py-6 rounded-full border-white text-white hover:bg-white/10">
                      <Star className="w-5 h-5 mr-2" />
                      View Startups
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <section className="py-16" style={{ background: brandColors.navyDeep }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-bold mb-2" style={{ color: brandColors.goldPrestige, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
              How Raising Jupiter Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              A structured, three-part system designed to accelerate your path to funding.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-shadow"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${brandColors.navyDeep}10` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: brandColors.navyDeep }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Ready to Launch Your Funding Journey?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Join the startups using Raising Jupiter to gain visibility, credibility, and capital in the aerospace ecosystem.
          </p>
          {user ? (
            <Link to={createPageUrl('FounderApplication')}>
              <Button size="lg" className="px-10 py-6 rounded-full" style={{ background: brandColors.navyDeep }}>
                Submit Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button 
              size="lg" 
              className="px-10 py-6 rounded-full" 
              style={{ background: brandColors.navyDeep }}
              onClick={() => base44.auth.redirectToLogin(createPageUrl('RaisingJupiter'))}
            >
              Sign In to Apply
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}