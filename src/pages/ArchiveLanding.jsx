import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { FileText, Table, Database, Download, Crown, Shield, Lock, ArrowRight, Heart, Gift, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/entities/User';
import { createArchiveCheckout } from '@/functions/createArchiveCheckout';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const EXPORT_FORMATS = [
  {
    id: 'pdf',
    icon: FileText,
    title: 'PDF Archive',
    description: 'Beautifully formatted document with all honoree profiles. Print-ready.',
  },
  {
    id: 'csv',
    icon: Table,
    title: 'CSV Spreadsheet',
    description: 'Directory data in spreadsheet format. Import into Excel or Google Sheets.',
  },
  {
    id: 'json',
    icon: Database,
    title: 'JSON Data',
    description: 'Structured data for developers and integrations.',
  },
];

const HISTORICAL_EDITIONS = [
  {
    year: '2025',
    title: 'Orbital Edition',
    description: 'Celebrating the rise of commercial space and orbital infrastructure.',
    honorees: 100,
    theme: 'Space Industrialization',
    featuredImg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  },
  {
    year: '2024',
    title: 'Supersonic Edition',
    description: 'Focusing on high-speed aviation and sustainable propulsion systems.',
    honorees: 100,
    theme: 'Next-Gen Propulsion',
    featuredImg: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80'
  }
];

const SUGGESTED_AMOUNTS = [0, 10, 25, 50];

function HistoricalEditionCard({ edition }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="group relative overflow-hidden rounded-3xl material-shadow bg-white"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={edition.featuredImg}
          alt={edition.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-navy-900/80 text-white text-xs font-bold backdrop-blur-md">
          {edition.year}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>{edition.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{edition.description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
            {edition.honorees} Honorees • {edition.theme}
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent" style={{ color: brandColors.goldPrestige }}>
            Browse <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function FormatCard({ format }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6 flex items-start gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${brandColors.skyBlue}15` }}
      >
        <format.icon className="w-6 h-6" style={{ color: brandColors.skyBlue }} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1" style={{ color: brandColors.navyDeep }}>{format.title}</h3>
        <p className="text-sm text-gray-600">{format.description}</p>
      </div>
      <Download className="w-5 h-5 shrink-0" style={{ color: brandColors.goldPrestige }} />
    </motion.div>
  );
}

function DonationBox({ onDonate, onSkip, loading }) {
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');

  const handleAmountSelect = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    if (val) setAmount(parseInt(val) || 0);
  };

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : amount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-3xl p-8 md:p-10 max-w-xl mx-auto"
      style={{ border: `2px solid ${brandColors.goldPrestige}30` }}
    >
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: `${brandColors.goldPrestige}20` }}
        >
          <Heart className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
        </div>
        <h3
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Support the Mission
        </h3>
        <p className="text-gray-600">
          Downloads are free! Consider an optional donation to support our work.
        </p>
      </div>

      {/* Suggested amounts */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {SUGGESTED_AMOUNTS.map((val) => (
          <button
            key={val}
            onClick={() => handleAmountSelect(val)}
            className={`py-3 rounded-xl font-bold text-sm transition-all ${amount === val && !customAmount
                ? 'text-white'
                : 'hover:opacity-80'
              }`}
            style={{
              background: amount === val && !customAmount
                ? brandColors.navyDeep
                : `${brandColors.navyDeep}10`,
              color: amount === val && !customAmount ? 'white' : brandColors.navyDeep,
            }}
          >
            {val === 0 ? 'Free' : `$${val}`}
          </button>
        ))}
      </div>

      {/* Custom amount - only show if not free */}
      {finalAmount > 0 && (
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
          <Input
            type="text"
            placeholder="Custom amount"
            value={customAmount}
            onChange={handleCustomChange}
            className="pl-8 py-6 text-lg font-bold text-center rounded-xl"
            style={{ borderColor: customAmount ? brandColors.goldPrestige : undefined }}
          />
        </div>
      )}

      {/* What you get */}
      <div
        className="rounded-xl p-4 mb-6 text-sm"
        style={{ background: `${brandColors.skyBlue}10` }}
      >
        <p className="font-bold mb-2" style={{ color: brandColors.navyDeep }}>
          <Gift className="w-4 h-4 inline mr-2" style={{ color: brandColors.goldPrestige }} />
          What you'll receive:
        </p>
        <ul className="text-gray-600 space-y-1 ml-6">
          <li>• PDF Archive with all 100 honoree profiles</li>
          <li>• CSV Spreadsheet for easy data access</li>
          <li>• JSON Data export for developers</li>
          <li>• Instant download access</li>
        </ul>
      </div>

      {finalAmount > 0 ? (
        <Button
          onClick={() => onDonate(finalAmount)}
          disabled={loading}
          className="w-full py-6 rounded-xl font-bold text-base"
          style={{
            background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.goldLight})`,
            color: brandColors.navyDeep,
          }}
        >
          {loading ? 'Processing...' : `Donate $${finalAmount} & Download`}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      ) : (
        <Button
          onClick={onSkip}
          disabled={loading}
          className="w-full py-6 rounded-xl font-bold text-base"
          style={{
            background: brandColors.navyDeep,
            color: 'white',
          }}
        >
          <Download className="w-5 h-5 mr-2" />
          Download for Free
        </Button>
      )}

      <p className="text-center text-xs text-gray-400 mt-4">
        {finalAmount > 0
          ? 'Secure payment via Stripe. Thank you for your support!'
          : 'Downloads are always free. Donations help us continue this mission.'}
      </p>
    </motion.div>
  );
}

export default function ArchiveLanding() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDonate = async (amount) => {
    if (amount < 1) return;

    setLoading(true);

    try {
      // Check if user is logged in
      let user = null;
      try {
        user = await User.me();
      } catch (e) {
        // Not logged in, redirect to login first
        User.redirectToLogin(window.location.href);
        return;
      }

      // Create checkout session with donation amount
      const response = await createArchiveCheckout({
        amount: amount,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToDownload = () => {
    // Redirect to Top100Women2025 page where free downloads are available
    window.location.href = createPageUrl('Top100Women2025') + '#archive';
  };

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${brandColors.navyDeep} 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: `${brandColors.goldPrestige}20` }}
          >
            <Crown className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            <span className="text-xs font-bold tracking-wider" style={{ color: brandColors.goldPrestige }}>
              CONTINUITY ARCHIVE
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            TOP 100 Directory
            <br />
            <span style={{ color: brandColors.goldPrestige }}>Archive & Export</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-8"
            style={{ color: brandColors.navyDeep, opacity: 0.7 }}
          >
            Download the complete TOP 100 Aerospace & Aviation directory.
            Access honoree profiles, contact information, and industry data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6 text-sm"
            style={{ color: brandColors.navyDeep }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
              <span>Instant access</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Export Formats */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: brandColors.goldPrestige }}>
              AVAILABLE FORMATS
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Export & Download
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {EXPORT_FORMATS.map((format) => (
              <FormatCard key={format.id} format={format} />
            ))}
          </div>

          <div
            className="mt-6 p-4 rounded-xl text-center text-sm"
            style={{ background: `${brandColors.navyDeep}08`, color: brandColors.navyDeep }}
          >
            All exports include the TOP 100 honorees from the 2025 Orbital Edition.
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: brandColors.goldPrestige }}>
              PAY WHAT YOU WANT
            </p>
            <h2
              className="text-2xl md:text-4xl font-bold mb-4"
              style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Name Your Price
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              We believe in accessibility. Pay what feels right and get full access to the archive.
            </p>
          </div>

          <DonationBox onDonate={handleDonate} onSkip={handleSkipToDownload} loading={loading} />
        </div>
      </section>

      {/* Browsable Historical Editions */}
      <section className="py-20 px-4" style={{ background: `${brandColors.navyDeep}05` }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: brandColors.goldPrestige }}>
                HISTORICAL RECORD
              </p>
              <h2
                className="text-3xl md:text-5xl font-bold mb-4"
                style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Institutional Editions
              </h2>
              <p className="text-gray-600">
                The TOP 100 archive serves as the permanent industry record of the people and programs shaping the future of aerospace. Explore past cycles and evolving legacies.
              </p>
            </div>
            <Link to={createPageUrl('Top100OS')}>
              <Button variant="outline" className="rounded-full border-gray-200">
                View Evolution Timeline <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {HISTORICAL_EDITIONS.map((edition) => (
              <HistoricalEditionCard key={edition.year} edition={edition} />
            ))}

            {/* Blank Placeholder for v1 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-400 mb-2">Pre-Digital Records</h3>
              <p className="text-xs text-gray-400">
                v1 Legacy data is currently being ingested into the new Institutional Archive.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="glass-card rounded-3xl p-8 md:p-12 text-center"
            style={{ border: `1px solid ${brandColors.goldPrestige}30` }}
          >
            <Crown className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
            <h3
              className="text-xl md:text-2xl font-bold mb-4"
              style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Trusted by Industry Leaders
            </h3>
            <p className="text-gray-600 mb-6">
              Join hundreds of aerospace professionals, recruiters, and organizations
              who use the TOP 100 directory to connect with industry talent.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: brandColors.navyDeep }}>
              <span className="px-4 py-2 rounded-full" style={{ background: `${brandColors.skyBlue}10` }}>NASA</span>
              <span className="px-4 py-2 rounded-full" style={{ background: `${brandColors.skyBlue}10` }}>SpaceX</span>
              <span className="px-4 py-2 rounded-full" style={{ background: `${brandColors.skyBlue}10` }}>Boeing</span>
              <span className="px-4 py-2 rounded-full" style={{ background: `${brandColors.skyBlue}10` }}>Lockheed Martin</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center">
        <p className="text-sm text-gray-500">
          © 2025 TOP 100 Aerospace & Aviation. All rights reserved.
        </p>
      </footer>
    </div>
  );
}