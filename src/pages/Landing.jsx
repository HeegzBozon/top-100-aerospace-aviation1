import React, { useState, useEffect } from 'react';
import ProfileView from '@/pages/ProfileView';
import LandingHeroSection from '@/components/landing/LandingHeroSection';
import FooterInfoModal from '@/components/landing/FooterInfoModal';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const brandColors = {
  cream: '#faf8f5',
};

export default function LandingPage() {
  const [publicUserEmail, setPublicUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userEmail = urlParams.get('user');
      if (userEmail) {
        setPublicUserEmail(userEmail);
      }

      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (publicUserEmail) {
    return <ProfileView />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: brandColors.cream }}>
      <div className="flex-1">
        <LandingHeroSection user={user} onFooterLinkClick={setActiveModal} />
      </div>

      <footer className="relative z-10 px-6 sm:px-8 lg:px-20 py-12 border-t" style={{ borderColor: '#c9a87c15' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="text-sm font-medium" style={{ color: '#4a5568' }}>
            © 2026 TOP 100 Aerospace & Aviation Women
          </div>
          <nav className="flex flex-wrap justify-center gap-8 text-sm">
            {[
              { label: 'About', modalType: 'about' },
              { label: 'Methodology', modalType: 'methodology' },
              { label: 'Categories', modalType: 'categories' },
              { label: 'Sponsors', modalType: 'sponsors' },
              { label: 'Press', modalType: 'press' },
              { label: 'Governance', modalType: 'governance' },
              { label: 'Contact', modalType: 'contact' }
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => setActiveModal(link.modalType)}
                className="font-medium hover:opacity-70 transition"
                style={{ color: '#c9a87c' }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </footer>

      <FooterInfoModal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
        modalType={activeModal} 
      />
    </div>
  );
}