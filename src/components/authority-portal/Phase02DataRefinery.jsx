import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Lock, Upload } from 'lucide-react';

export default function Phase02DataRefinery({ onNext }) {
  const [assets, setAssets] = useState({
    logo: null,
    colors: null,
    copy: null,
    history: null,
  });
  const [deposits, setDeposits] = useState({ paid: false });
  const [peers, setPeers] = useState([]);
  const [peerEmail, setPeerEmail] = useState('');

  const assetCount = Object.values(assets).filter(Boolean).length;
  const requiredAssets = 4;
  const isComplete = deposits.paid && assetCount === requiredAssets && peers.length > 0;

  const handleAddPeer = () => {
    if (peerEmail.trim()) {
      setPeers([...peers, peerEmail]);
      setPeerEmail('');
    }
  };

  const handleAssetUpload = (key) => {
    setAssets({ ...assets, [key]: true });
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            className="text-4xl font-bold mb-2 font-serif text-brand-gold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Phase 02: The Data Refinery
          </motion.h1>
          <p className="text-slate-300">Complete your onboarding and establish account integrity.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Financial Close */}
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-brand-navy-08">
          <h2 className="text-2xl font-bold text-brand-navy mb-4 font-serif">Financial Close</h2>
          <p className="text-slate-600 mb-6">Secure your deposit to establish account integrity.</p>
          <button
            onClick={() => setDeposits({ paid: true })}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              deposits.paid
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-brand-gold text-brand-navy hover:bg-brand-gold/90'
            }`}
          >
            {deposits.paid ? <Check className="w-4 h-4" /> : null}
            {deposits.paid ? 'Deposit Secured' : 'Pay Deposit: $350'}
          </button>
        </section>

        {/* Flightography Setup */}
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-brand-navy-08">
          <h2 className="text-2xl font-bold text-brand-navy mb-4 font-serif">Flightography Setup</h2>
          <p className="text-slate-600 mb-6">Upload brand assets, history, and subsystems (service lines).</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'logo', label: 'Logo' },
              { key: 'colors', label: 'Brand Colors' },
              { key: 'copy', label: 'Copy & Messaging' },
              { key: 'history', label: 'Company History' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => handleAssetUpload(item.key)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold border-2 transition-all ${
                  assets[item.key]
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-dashed border-slate-300 text-slate-600 hover:border-brand-gold'
                }`}
              >
                {assets[item.key] ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Peer Validation */}
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-brand-navy-08">
          <h2 className="text-2xl font-bold text-brand-navy mb-4 font-serif">Verification Loop</h2>
          <p className="text-slate-600 mb-6">Invite team members to confirm brand details.</p>
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="team@example.com"
              value={peerEmail}
              onChange={(e) => setPeerEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <Button onClick={handleAddPeer} className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {peers.map((email, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-4 py-2 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
                {email}
              </div>
            ))}
          </div>
        </section>

        {/* Status Gate */}
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-brand-navy-08">
          <h2 className="text-2xl font-bold text-brand-navy mb-4 font-serif">Completion Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-semibold">Deposit Secured</span>
              {deposits.paid ? <Check className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-slate-300" />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-semibold">Brand Assets ({assetCount}/{requiredAssets})</span>
              {assetCount === requiredAssets ? <Check className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-slate-300" />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-semibold">Peer Validation ({peers.length})</span>
              {peers.length > 0 ? <Check className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-slate-300" />}
            </div>
          </div>
          <div className="mt-6 w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-brand-gold h-full transition-all"
              style={{ width: `${isComplete ? 100 : (assetCount / requiredAssets + (deposits.paid ? 0.33 : 0) + (peers.length > 0 ? 0.33 : 0)) * 33}%` }}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-10">
          <Button
            onClick={onNext}
            disabled={!isComplete}
            className={`text-lg px-8 py-4 h-auto ${
              isComplete
                ? 'bg-brand-gold text-brand-navy hover:bg-brand-gold/90'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isComplete ? 'Proceed to Phase 03 →' : 'Complete all steps to continue'}
          </Button>
        </section>
      </div>
    </div>
  );
}