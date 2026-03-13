import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, Mail, Lock, Eye, Database, UserCheck } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Header */}
      <div className="border-b-2 py-12" style={{ borderColor: brandColors.navyDeep, background: 'white' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <h1 
              className="text-5xl font-bold"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: brandColors.navyDeep,
              }}
            >
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg" style={{ color: `${brandColors.navyDeep}CC` }}>
            Last Updated: December 12, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <p className="text-lg mb-6" style={{ color: brandColors.navyDeep }}>
            TOP 100 Aerospace & Aviation ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>

          {/* Information We Collect */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
              <h2 className="text-2xl font-bold" style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: brandColors.navyDeep 
              }}>
                Information We Collect
              </h2>
            </div>
            
            <h3 className="text-xl font-semibold mb-3" style={{ color: brandColors.navyDeep }}>
              Personal Information
            </h3>
            <ul className="list-disc ml-6 mb-4 space-y-2" style={{ color: `${brandColors.navyDeep}DD` }}>
              <li>Name and email address</li>
              <li>Professional information (title, company, LinkedIn profile)</li>
              <li>Profile photos and biographical information</li>
              <li>Contact details you provide</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3" style={{ color: brandColors.navyDeep }}>
              Usage Information
            </h3>
            <ul className="list-disc ml-6 mb-4 space-y-2" style={{ color: `${brandColors.navyDeep}DD` }}>
              <li>Voting and nomination data</li>
              <li>Interaction with platform features</li>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
              <h2 className="text-2xl font-bold" style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: brandColors.navyDeep 
              }}>
                How We Use Your Information
              </h2>
            </div>
            
            <ul className="list-disc ml-6 space-y-2" style={{ color: `${brandColors.navyDeep}DD` }}>
              <li>To operate and maintain the TOP 100 recognition platform</li>
              <li>To process nominations, votes, and evaluations</li>
              <li>To display honoree profiles and rankings</li>
              <li>To communicate updates and platform announcements</li>
              <li>To improve our services and user experience</li>
              <li>To prevent fraud and ensure platform integrity</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
              <h2 className="text-2xl font-bold" style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: brandColors.navyDeep 
              }}>
                Information Sharing
              </h2>
            </div>
            
            <p className="mb-4" style={{ color: `${brandColors.navyDeep}DD` }}>
              We may share your information with:
            </p>
            <ul className="list-disc ml-6 space-y-2" style={{ color: `${brandColors.navyDeep}DD` }}>
              <li><strong>Public Display:</strong> Honoree profiles and rankings are publicly visible</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in platform operations</li>
              <li><strong>Legal Compliance:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
              <h2 className="text-2xl font-bold" style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: brandColors.navyDeep 
              }}>
                Data Security
              </h2>
            </div>
            
            <p style={{ color: `${brandColors.navyDeep}DD` }}>
              We implement appropriate technical and organizational measures to protect your information. 
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
              <h2 className="text-2xl font-bold" style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: brandColors.navyDeep 
              }}>
                Your Rights
              </h2>
            </div>
            
            <p className="mb-4" style={{ color: `${brandColors.navyDeep}DD` }}>
              You have the right to:
            </p>
            <ul className="list-disc ml-6 space-y-2" style={{ color: `${brandColors.navyDeep}DD` }}>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              color: brandColors.navyDeep 
            }}>
              Cookies and Tracking
            </h2>
            
            <p style={{ color: `${brandColors.navyDeep}DD` }}>
              We use cookies and similar tracking technologies to track activity on our platform and store certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              color: brandColors.navyDeep 
            }}>
              Children's Privacy
            </h2>
            
            <p style={{ color: `${brandColors.navyDeep}DD` }}>
              Our platform is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              color: brandColors.navyDeep 
            }}>
              Changes to This Privacy Policy
            </h2>
            
            <p style={{ color: `${brandColors.navyDeep}DD` }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
              and updating the "Last Updated" date.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
              <h2 className="text-2xl font-bold" style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: brandColors.navyDeep 
              }}>
                Contact Us
              </h2>
            </div>
            
            <p className="mb-4" style={{ color: `${brandColors.navyDeep}DD` }}>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p style={{ color: brandColors.navyDeep, fontWeight: 600 }}>
              privacy@top100aerospaceandaviation.com
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link 
            to={createPageUrl('MissionControl')}
            className="inline-block px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
            style={{
              background: brandColors.goldPrestige,
              color: 'white',
              fontFamily: "'Montserrat', sans-serif"
            }}
          >
            Back to Mission Control
          </Link>
        </div>
      </div>
    </div>
  );
}