import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, CheckCircle, BookOpen, Database, Lock, CreditCard, Heart } from 'lucide-react';

import { User } from '@/entities/User';
import { createArchiveCheckout } from '@/functions/createArchiveCheckout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

export default function ArchiveExport({ nominees, title = "TOP 100 Women in Aerospace & Aviation 2025" }) {
  const [exporting, setExporting] = useState(null);
  const [completed, setCompleted] = useState(null);
  const [user, setUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState(5);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        // Admins always bypass paywall
        if (currentUser?.role === 'admin') {
          setHasPurchased(true);
        } else {
          setHasPurchased(currentUser?.archive_export_purchased === true);
        }
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const handleExportClick = (format, exportFn) => {
    if (hasPurchased) {
      exportFn();
    } else {
      setPendingExport({ format, fn: exportFn });
      setShowPaywall(true);
    }
  };

  const handlePurchase = async () => {
    setCheckoutLoading(true);
    try {
      const { data } = await createArchiveCheckout({
        success_url: `${window.location.origin}/Top100Women2025?export_success=true`,
        cancel_url: `${window.location.origin}/Top100Women2025`,
        amount: donationAmount
      });

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Check for successful purchase on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('export_success') === 'true' && user) {
      // Mark user as having purchased
      User.updateMyUserData({ archive_export_purchased: true }).then(() => {
        setHasPurchased(true);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      });
    }
  }, [user]);

  const generatePDF = async () => {
    setExporting('pdf');

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      // Helper functions
      const addPage = () => {
        doc.addPage();
        y = margin;
      };

      const checkPageBreak = (requiredSpace) => {
        if (y + requiredSpace > pageHeight - margin) {
          addPage();
          return true;
        }
        return false;
      };

      // Cover Page
      doc.setFillColor(30, 58, 90); // navyDeep
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Gold bar
      doc.setFillColor(201, 168, 124); // goldPrestige
      doc.rect(0, 60, pageWidth, 3, 'F');

      // Title
      doc.setTextColor(250, 248, 245); // cream
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP 100', pageWidth / 2, 100, { align: 'center' });
      doc.setFontSize(18);
      doc.text('WOMEN IN AEROSPACE & AVIATION', pageWidth / 2, 115, { align: 'center' });

      doc.setTextColor(201, 168, 124); // goldPrestige
      doc.setFontSize(14);
      doc.text('The Orbital Edition', pageWidth / 2, 135, { align: 'center' });
      doc.setFontSize(24);
      doc.text('2025', pageWidth / 2, 150, { align: 'center' });

      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(10);
      doc.text('Official Publication Archive', pageWidth / 2, pageHeight - 30, { align: 'center' });

      // Table of Contents
      addPage();
      doc.setFillColor(250, 248, 245);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setTextColor(30, 58, 90);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Directory of Honorees', margin, y + 10);
      y += 25;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      nominees.slice(0, 100).forEach((nominee, i) => {
        checkPageBreak(8);
        doc.setTextColor(30, 58, 90);
        doc.text(`${String(i + 1).padStart(3, '0')}`, margin, y);
        doc.text(nominee.name || 'Unknown', margin + 15, y);
        doc.setTextColor(100, 100, 100);
        const role = (nominee.title || nominee.professional_role || '').substring(0, 40);
        doc.text(role, margin + 80, y);
        y += 6;
      });

      // Honoree Pages
      nominees.slice(0, 100).forEach((nominee, index) => {
        addPage();

        // Background
        doc.setFillColor(250, 248, 245);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Header stripe
        doc.setFillColor(30, 58, 90);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Gold accent
        doc.setFillColor(201, 168, 124);
        doc.rect(0, 40, pageWidth, 2, 'F');

        // Rank badge
        doc.setTextColor(201, 168, 124);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`#${String(index + 1).padStart(3, '0')}`, margin, 20);

        // Name in header
        doc.setTextColor(250, 248, 245);
        doc.setFontSize(16);
        doc.text((nominee.name || 'Unknown').toUpperCase(), margin, 32);

        y = 55;

        // Title & Company
        doc.setTextColor(74, 144, 184); // skyBlue
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(nominee.title || nominee.professional_role || '', margin, y);
        y += 7;

        if (nominee.company) {
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text(nominee.company, margin, y);
          y += 7;
        }

        if (nominee.country) {
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(10);
          doc.text(`📍 ${nominee.country}`, margin, y);
          y += 10;
        }

        // Six word story
        if (nominee.six_word_story) {
          y += 5;
          doc.setDrawColor(201, 168, 124);
          doc.line(margin, y, pageWidth - margin, y);
          y += 8;

          doc.setTextColor(30, 58, 90);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'italic');
          doc.text(`"${nominee.six_word_story}"`, margin, y);
          y += 10;
        }

        // Bio
        if (nominee.bio) {
          y += 5;
          doc.setTextColor(60, 60, 60);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');

          const bioLines = doc.splitTextToSize(nominee.bio, pageWidth - margin * 2);
          bioLines.slice(0, 15).forEach(line => {
            checkPageBreak(6);
            doc.text(line, margin, y);
            y += 5;
          });
        }

        // Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text('TOP 100 Women in Aerospace & Aviation 2025 · The Orbital Edition', margin, pageHeight - 15);
        doc.text(`Page ${index + 3}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
      });

      // Save
      doc.save('TOP100-Women-Aerospace-2025-Archive.pdf');
      setCompleted('pdf');
      setTimeout(() => setCompleted(null), 3000);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const generateCSV = () => {
    setExporting('csv');

    try {
      const headers = ['Rank', 'Name', 'Title', 'Company', 'Country', 'Industry', 'Six Word Story', 'LinkedIn'];
      const rows = nominees.slice(0, 100).map((n, i) => [
        i + 1,
        n.name || '',
        n.title || n.professional_role || '',
        n.company || '',
        n.country || '',
        n.industry || '',
        n.six_word_story || '',
        n.linkedin_profile_url || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'TOP100-Women-Aerospace-2025-Directory.csv';
      link.click();

      setCompleted('csv');
      setTimeout(() => setCompleted(null), 3000);
    } catch (error) {
      console.error('CSV generation failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const generateMarkdown = () => {
    setExporting('markdown');

    try {
      const date = new Date().toLocaleDateString();
      let mdContent = `# TOP 100 Women in Aerospace & Aviation 2025\n`;
      mdContent += `*Edition: The Orbital Edition*\n`;
      mdContent += `*Generated: ${date}*\n\n`;

      mdContent += `## Executive Summary\n`;
      mdContent += `This document contains the official directory of the TOP 100 Women in Aerospace & Aviation for 2025. This cohort represents the highest signal-strength leadership across global aerospace, defense, and commercial aviation sectors.\n\n`;

      mdContent += `## Honoree Directory\n\n`;

      nominees.slice(0, 100).forEach((n, i) => {
        mdContent += `### ${i + 1}. ${n.name || 'Unknown'}\n`;
        mdContent += `**Role:** ${n.title || n.professional_role || 'N/A'}\n`;
        mdContent += `**Organization:** ${n.company || 'N/A'}\n`;
        mdContent += `**Location:** ${n.country || 'N/A'}\n`;
        if (n.industry) mdContent += `**Sector:** ${n.industry}\n`;
        if (n.six_word_story) mdContent += `**Six-Word Story:** *${n.six_word_story}*\n`;
        if (n.bio) mdContent += `\n**Biography:**\n${n.bio}\n`;
        if (n.linkedin_profile_url) mdContent += `\n**Profile:** [LinkedIn](${n.linkedin_profile_url})\n`;
        mdContent += `\n---\n\n`;
      });

      mdContent += `## Data Metrics & Methodology\n`;
      mdContent += `- **Total Cohort Size:** 100\n`;
      mdContent += `- **Selection Criteria:** Combined Signal Strength (Aura) and Ranked Choice Voting (RCV) performance.\n`;
      mdContent += `- **Archive Status:** Official Orbital Edition 2025.\n\n`;
      mdContent += `*© ${new Date().getFullYear()} TOP 100 Aerospace & Aviation*`;

      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'TOP100-2025-NotebookLM-Research-Pack.md';
      link.click();

      setCompleted('markdown');
      setTimeout(() => setCompleted(null), 3000);
    } catch (error) {
      console.error('Markdown generation failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const generateJSON = () => {
    setExporting('json');

    try {
      const exportData = {
        title: "TOP 100 Women in Aerospace & Aviation 2025",
        edition: "The Orbital Edition",
        generated: new Date().toISOString(),
        count: Math.min(nominees.length, 100),
        honorees: nominees.slice(0, 100).map((n, i) => ({
          rank: i + 1,
          name: n.name,
          title: n.title || n.professional_role,
          company: n.company,
          country: n.country,
          industry: n.industry,
          six_word_story: n.six_word_story,
          linkedin: n.linkedin_profile_url,
          profile_url: `${window.location.origin}/ProfileView?id=${n.id}`
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'TOP100-Women-Aerospace-2025-Data.json';
      link.click();

      setCompleted('json');
      setTimeout(() => setCompleted(null), 3000);
    } catch (error) {
      console.error('JSON generation failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const ExportButton = ({ format, icon: Icon, label, onClick, description, locked }) => {
    const isExporting = exporting === format;
    const isCompleted = completed === format;

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={isExporting}
        className="flex items-start gap-4 p-5 rounded-xl border text-left transition-all w-full relative"
        style={{
          background: isCompleted ? `${brandColors.goldPrestige}10` : 'white',
          borderColor: isCompleted ? brandColors.goldPrestige : `${brandColors.navyDeep}20`
        }}
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${brandColors.navyDeep}10` }}
        >
          {isExporting ? (
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: brandColors.navyDeep }} />
          ) : isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Icon className="w-6 h-6" style={{ color: brandColors.navyDeep }} />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            {label}
            {locked && <Lock className="w-3.5 h-3.5" style={{ color: brandColors.goldPrestige }} />}
          </h4>
          <p className="text-sm mt-1" style={{ color: `${brandColors.navyDeep}70` }}>{description}</p>
        </div>
        <Download className="w-5 h-5 flex-shrink-0" style={{ color: brandColors.goldPrestige }} />
      </motion.button>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <p className="text-sm tracking-widest uppercase mb-2" style={{ color: brandColors.goldPrestige }}>
          Archive Center
        </p>
        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
          Export & Archive
        </h2>
        <p className="mt-2 max-w-xl mx-auto text-sm" style={{ color: brandColors.skyBlue }}>
          Download the complete TOP 100 directory in multiple formats for your records.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        <ExportButton
          format="pdf"
          icon={FileText}
          label="PDF Archive"
          description="Beautifully formatted document with all honoree profiles. Print-ready."
          onClick={() => handleExportClick('pdf', generatePDF)}
          locked={!hasPurchased}
        />
        <ExportButton
          format="csv"
          icon={BookOpen}
          label="CSV Spreadsheet"
          description="Directory data in spreadsheet format. Import into Excel or Google Sheets."
          onClick={() => handleExportClick('csv', generateCSV)}
          locked={!hasPurchased}
        />
        <ExportButton
          format="json"
          icon={Database}
          label="JSON Data"
          description="Structured data for developers and integrations."
          onClick={() => handleExportClick('json', generateJSON)}
          locked={!hasPurchased}
        />
        <ExportButton
          format="markdown"
          icon={BookOpen}
          label="NotebookLM Pack"
          description="Markdown format optimized for AI research & NotebookLM ingestion."
          onClick={() => handleExportClick('markdown', generateMarkdown)}
          locked={!hasPurchased}
        />
      </div>

      {/* Optional Donation Modal */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
              <Heart className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              Support the TOP 100
            </DialogTitle>
            <DialogDescription>
              Downloads are free! Consider a small donation to support our mission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* What You Get */}
            <div
              className="p-4 rounded-lg"
              style={{ background: `${brandColors.navyDeep}05` }}
            >
              <p className="font-medium mb-3 text-sm" style={{ color: brandColors.navyDeep }}>
                You'll get access to:
              </p>
              <ul className="space-y-2 text-sm" style={{ color: brandColors.navyDeep }}>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  PDF Archive with all 100 profiles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  NotebookLM Research Pack (Markdown)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  CSV Spreadsheet for data analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  JSON Data for integrations
                </li>
              </ul>
            </div>

            {/* Optional Donation Amount Selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
                Optional contribution (thank you!)
              </label>
              <div className="flex gap-2 mb-3">
                {[0, 5, 10, 25].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDonationAmount(amount)}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: donationAmount === amount ? brandColors.goldPrestige : `${brandColors.navyDeep}10`,
                      color: donationAmount === amount ? 'white' : brandColors.navyDeep,
                      border: donationAmount === amount ? 'none' : `1px solid ${brandColors.navyDeep}15`
                    }}
                  >
                    {amount === 0 ? 'Free' : `$${amount}`}
                  </button>
                ))}
              </div>
              {donationAmount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: brandColors.navyDeep }}>$</span>
                  <Input
                    type="number"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center font-medium"
                    style={{ borderColor: `${brandColors.navyDeep}20` }}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {donationAmount > 0 ? (
                <Button
                  onClick={() => handlePurchase('bundle')}
                  disabled={checkoutLoading}
                  className="w-full py-5 text-base font-semibold"
                  style={{ background: brandColors.goldPrestige, color: 'white' }}
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Heart className="w-5 h-5 mr-2" />
                  )}
                  {checkoutLoading ? 'Processing...' : `Contribute $${donationAmount} & Download`}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setShowPaywall(false);
                    setHasPurchased(true);
                    if (pendingExport?.fn) {
                      pendingExport.fn();
                    }
                  }}
                  className="w-full py-5 text-base font-semibold"
                  style={{ background: brandColors.navyDeep, color: 'white' }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download for Free
                </Button>
              )}
            </div>

            <p className="text-xs text-center" style={{ color: `${brandColors.navyDeep}60` }}>
              {donationAmount > 0
                ? '100% goes toward celebrating women in aerospace. Secure payment via Stripe.'
                : 'Downloads are always free. Donations help us continue this mission.'}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className="mt-6 p-4 rounded-lg text-center text-sm"
        style={{ background: `${brandColors.navyDeep}05`, color: `${brandColors.navyDeep}70` }}
      >
        All exports include the TOP 100 honorees from the 2025 Orbital Edition.
      </div>
    </div>
  );
}