import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const footerLinks = [
  { label: 'About', modalType: 'about' },
  { label: 'Methodology', modalType: 'methodology' },
  { label: 'Categories', modalType: 'categories' },
  { label: 'Sponsors', modalType: 'sponsors' },
  { label: 'Press', modalType: 'press' },
  { label: 'Governance', modalType: 'governance' },
  { label: 'Contact', modalType: 'contact' },
];

export default function LandingFooter({ onFooterLinkClick }) {
  return (
    <footer className="text-white py-16" style={{ background: '#0a1628' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/5ece7f59b_TOP100AerospaceAviationlogo.png"
              alt="TOP 100 Aerospace & Aviation"
              className="h-14 w-14 object-contain"
            />
            <div className="text-left">
              <h3 
                className="text-xl"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: brandColors.goldPrestige }}
              >
                TOP 100
              </h3>
              <p 
                className="text-xs"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.6)' }}
              >
                Aerospace & Aviation
              </p>
            </div>
          </div>

          {/* Links */}
           <nav className="flex flex-wrap items-center justify-center gap-6">
             {footerLinks.map((link) => (
               <button
                 key={link.label}
                 onClick={() => onFooterLinkClick(link.modalType)}
                 className="hover:text-white transition-colors text-sm"
                 style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
               >
                 {link.label}
               </button>
             ))}
           </nav>
        </div>

        {/* Divider */}
        <div className="pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.5)' }}>
              © 2025 TOP 100 Aerospace & Aviation. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <a 
                href="#" 
                className="hover:text-white transition-colors"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.5)' }}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-colors"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.5)' }}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}