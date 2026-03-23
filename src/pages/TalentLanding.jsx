import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Building2, Rocket, Award, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

const features = [
  { icon: Award, title: 'TOP 100 Talent Pool', description: 'Access pre-vetted aerospace leaders recognized by industry peers' },
  { icon: Building2, title: 'Premier Employers', description: 'Connect with leading aerospace companies actively hiring' },
  { icon: Rocket, title: 'Career Advancement', description: 'Exclusive opportunities for industry professionals' },
];

export default function TalentLanding() {
  const handleGetStarted = () => {
    base44.auth.redirectToLogin('/TalentExchange');
  };

  const handleEmployerAccess = () => {
    base44.auth.redirectToLogin('/EmployerDashboard');
  };

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <section 
        className="relative py-24 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 100%)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: brandColors.skyBlue }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: brandColors.goldPrestige }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Briefcase className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
              <span 
                className="text-sm uppercase tracking-widest"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}
              >
                TOP 100 Talent Exchange
              </span>
            </div>

            <h1 
              className="text-4xl md:text-6xl text-white mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              Where Aerospace Excellence
              <span 
                className="block text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(90deg, ${brandColors.goldPrestige}, #e8d4b8)` }}
              >
                Meets Opportunity
              </span>
            </h1>

            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              The premier talent platform connecting recognized aerospace leaders with industry-leading employers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="text-lg px-8 py-6 rounded-full font-semibold"
                style={{ 
                  background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #e8d4b8)`,
                  color: 'white',
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                <Users className="w-5 h-5 mr-2" />
                Find Opportunities
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={handleEmployerAccess}
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full font-semibold"
                style={{ 
                  borderColor: brandColors.goldPrestige,
                  color: brandColors.goldPrestige,
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                <Building2 className="w-5 h-5 mr-2" />
                Employer Portal
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border"
                style={{ borderColor: '#e2e8f0' }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${brandColors.navyDeep}10` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: brandColors.navyDeep }} />
                </div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
                >
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

      {/* Stats */}
      <section className="py-16 px-4" style={{ background: brandColors.navyDeep }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '500+', label: 'Aerospace Leaders' },
            { value: '50+', label: 'Premier Employers' },
            { value: '30+', label: 'Countries' },
          ].map((stat) => (
            <div key={stat.label}>
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {stat.value}
              </div>
              <div className="text-white/60 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 
          className="text-3xl mb-4"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
        >
          Ready to Elevate Your Career?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Join the exclusive network of aerospace and aviation professionals.
        </p>
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="px-10 py-6 rounded-full font-semibold"
          style={{ 
            background: brandColors.navyDeep,
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </section>
    </div>
  );
}