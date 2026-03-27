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
            className="text-4xl font-bold mb-2 font-serif text-[#D4A574]"
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
        <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1e3a5a] font-serif">Financial Close</h2>
            {deposits.paid && <Check className="w-5 h-5 text-green-600" />}
          </div>
          <p className="text-slate-600 text-sm mb-6">Secure your deposit to establish account integrity.</p>
          <button
            onClick={() => setDeposits({ paid: true })}
            disabled={deposits.paid}
            className={`px-6 py-2.5 rounded-full font-semibold transition-colors duration-200 text-sm ${
              deposits.paid
                ? 'bg-slate-100 text-slate-600 cursor-default'
                : 'bg-[#D4A574] text-white hover:bg-[#C19A6B]'
            }`}
          >
            {deposits.paid ? 'Deposit Secured' : 'Pay Deposit: $350'}
          </button>
        </section>

        {/* Flightography Setup */}
        <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1e3a5a] font-serif">Flightography Setup</h2>
            <span className="text-xs font-semibold text-slate-500">{assetCount}/{requiredAssets}</span>
          </div>
          <p className="text-slate-600 text-sm mb-6">Upload brand assets, history, and subsystems.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'logo', label: 'Logo' },
              { key: 'colors', label: 'Brand Colors' },
              { key: 'copy', label: 'Copy & Messaging' },
              { key: 'history', label: 'Company History' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => handleAssetUpload(item.key)}
                className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl font-medium text-sm transition-all ${
                  assets[item.key]
                    ? 'bg-green-50 border border-green-300 text-green-700'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-[#D4A574]'
                }`}
              >
                {assets[item.key] ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Peer Validation */}
        <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-lg font-bold text-[#1e3a5a] mb-4 font-serif">Verification Loop</h2>
          <p className="text-slate-600 text-sm mb-6">Invite team members to confirm brand details.</p>
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="team@example.com"
              value={peerEmail}
              onChange={(e) => setPeerEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50"
            />
            <Button onClick={handleAddPeer} className="bg-[#D4A574] text-white hover:bg-[#C19A6B] transition-colors duration-200 text-sm px-4 h-auto py-2">
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {peers.map((email, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-4 py-2 rounded-lg">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                {email}
              </div>
            ))}
          </div>
        </section>

        {/* Status Gate */}
        <section className="bg-gradient-to-br from-[#faf8f5] to-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-[#1e3a5a] mb-6 font-serif">Completion Status</h2>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">Deposit Secured</span>
              {deposits.paid ? <Check className="w-4 h-4 text-green-600" /> : <span className="w-4 h-4 bg-slate-200 rounded-full" />}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">Brand Assets</span>
              <span className="text-xs text-slate-500">{assetCount}/{requiredAssets}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">Peer Validation</span>
              <span className="text-xs text-slate-500">{peers.length} added</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#D4A574] h-full transition-all duration-300"
              style={{ width: `${isComplete ? 100 : (assetCount / requiredAssets + (deposits.paid ? 0.33 : 0) + (peers.length > 0 ? 0.33 : 0)) * 33}%` }}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-10">
          <Button
            onClick={onNext}
            disabled={!isComplete}
            className={`text-base px-8 py-3 h-auto rounded-full transition-all duration-200 ${
              isComplete
                ? 'bg-[#D4A574] text-white hover:bg-[#C19A6B]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isComplete ? 'Next: Mission Control' : 'Complete all steps to continue'}
          </Button>
        </section>
      </div>
    </div>
  );
}