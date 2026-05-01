import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { brand } from './NominateConfig';
import { Link } from 'react-router-dom';

export default function StageConfirmation() {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/nominate`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: `${brand.gold}20` }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: brand.gold }} />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
          You just did something that matters.
        </h1>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed mb-10" style={{ color: `${brand.navy}80` }}>
          <p>Every name you submitted gets reviewed personally by the TOP 100 team. If they're a fit, we'll reach out within <strong style={{ color: brand.navy }}>5 business days</strong>.</p>
          <p>For Local Legends nominations, the message they receive will include your name unless you chose to remain anonymous.</p>
          <p className="text-sm" style={{ color: `${brand.navy}60` }}>For TOP 100 Women, Men, and Angels nominations, selection follows our Season 4 process.</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 mb-8" style={{ borderColor: `${brand.navy}10` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: brand.gold }}>
            Share with someone else who might want to nominate
          </p>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="rounded-full gap-2 cursor-pointer w-full"
            style={{ borderColor: `${brand.navy}25`, color: brand.navy }}
          >
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy nomination link</>}
          </Button>
        </div>

        <Link to="/">
          <Button className="rounded-full px-8 cursor-pointer text-white" style={{ background: brand.navy }}>
            Return Home
          </Button>
        </Link>

        <p className="text-xs italic mt-12" style={{ color: `${brand.navy}40`, fontFamily: "'Playfair Display', serif" }}>
          Think Global. Act Local. Ad Astra.
        </p>
        <p className="text-[10px] tracking-[0.2em] uppercase mt-2" style={{ color: `${brand.navy}30` }}>
          top100aero.space
        </p>
      </motion.div>
    </div>
  );
}