import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Linkedin, Globe, Instagram, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CommunityNotesPanel from '@/components/profile/CommunityNotesPanel';
import TagManager from '@/components/profile/TagManager';
import EditSuggestionModal from '@/components/profile/EditSuggestionModal';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

export default function NomineeQuickView({ nominee, onClose }) {
  const [fullNominee, setFullNominee] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadFullNominee();
    loadUser();
  }, [nominee?.nomineeId]);

  const loadFullNominee = async () => {
    if (!nominee?.nomineeId) return;
    try {
      const data = await base44.entities.Nominee.get(nominee.nomineeId);
      setFullNominee(data);
    } catch (error) {
      console.error('Error loading nominee:', error);
    }
  };

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAdmin(currentUser?.role === 'admin');
    } catch (error) {
      setUser(null);
      setIsAdmin(false);
    }
  };

  if (!nominee) return null;

  const nomineeData = fullNominee || nominee;
  const profileUrl = `${window.location.origin}${createPageUrl('ProfileView')}?id=${nominee.nomineeId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileUrl)}&bgcolor=${brandColors.navyDeep.replace('#', '')}&color=ffffff&qzone=1`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Close Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute top-6 right-6 z-10"
        >
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="relative w-full max-w-2xl max-h-[90vh] mx-auto backdrop-blur-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col"
          style={{
            background: brandColors.cream,
            borderColor: brandColors.goldPrestige + '40'
          }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: brandColors.navyDeep + '20' }}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${activeTab === 'overview' ? 'border-b-2' : ''}`}
              style={{
                color: activeTab === 'overview' ? brandColors.navyDeep : brandColors.navyDeep + '60',
                borderColor: activeTab === 'overview' ? brandColors.goldPrestige : 'transparent'
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${activeTab === 'community' ? 'border-b-2' : ''}`}
              style={{
                color: activeTab === 'community' ? brandColors.navyDeep : brandColors.navyDeep + '60',
                borderColor: activeTab === 'community' ? brandColors.goldPrestige : 'transparent'
              }}
            >
              Community
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Hero Section */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/e15baa063_Gemini_Generated_Image_4pcatw4pcatw4pca.png"
                      alt="Laurel wreath"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {nominee.avatarUrl ? (
                        <img
                          src={nominee.avatarUrl}
                          alt={nominee.nomineeName}
                          className="w-20 h-20 rounded-full object-cover border-2 shadow-xl"
                          style={{ borderColor: brandColors.goldPrestige }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 shadow-xl"
                          style={{
                            background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})`,
                            borderColor: brandColors.goldPrestige
                          }}>
                          {nominee.nomineeName ? nominee.nomineeName.slice(0, 2).toUpperCase() : 'NN'}
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>
                    {nominee.nomineeName}
                  </h2>
                  <p className="text-sm mb-1" style={{ color: brandColors.navyDeep + 'CC' }}>
                    {nomineeData.title || nominee.title}
                  </p>
                  {(nomineeData.company || nominee.company) && (
                    <p className="text-sm mb-4" style={{ color: brandColors.navyDeep + '99' }}>
                      {nomineeData.company || nominee.company}
                    </p>
                  )}

                  {user && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowEditModal(true)}
                      className="mb-4"
                      style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}
                    >
                      <Edit3 className="w-3 h-3 mr-2" />
                      Suggest Edit
                    </Button>
                  )}
                </div>

                {/* Bio/Description */}
                {(nomineeData.bio || nomineeData.description || nominee.description) && (
                  <div className="bg-white/60 rounded-xl p-4 border" style={{ borderColor: brandColors.navyDeep + '20' }}>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: brandColors.navyDeep }}>
                      About
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: brandColors.navyDeep + 'DD' }}>
                      {nomineeData.bio || nomineeData.description || nominee.description}
                    </p>
                  </div>
                )}

                {/* Social Links */}
                {(nomineeData.linkedin_profile_url || nomineeData.website_url || nomineeData.instagram_url) && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {nomineeData.linkedin_profile_url && (
                      <a href={nomineeData.linkedin_profile_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" style={{ borderColor: brandColors.skyBlue, color: brandColors.skyBlue }}>
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn
                        </Button>
                      </a>
                    )}
                    {nomineeData.website_url && (
                      <a href={nomineeData.website_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}>
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                        </Button>
                      </a>
                    )}
                    {nomineeData.instagram_url && (
                      <a href={nomineeData.instagram_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" style={{ borderColor: brandColors.goldPrestige, color: brandColors.goldPrestige }}>
                          <Instagram className="w-4 h-4 mr-2" />
                          Instagram
                        </Button>
                      </a>
                    )}
                  </div>
                )}

                {/* Tags Preview */}
                {fullNominee && (
                  <div>
                    <TagManager nomineeId={fullNominee.id} user={user} isAdmin={isAdmin} />
                  </div>
                )}

                {/* QR Code section */}
                <div className="text-center">
                  <div className="inline-block rounded-xl p-3 border" style={{ backgroundColor: brandColors.navyDeep, borderColor: brandColors.goldPrestige }}>
                    <img
                      src={qrCodeUrl}
                      alt="Profile QR Code"
                      className="w-24 h-24 rounded-lg"
                    />
                  </div>
                  <p className="text-xs mt-2" style={{ color: brandColors.navyDeep + '99' }}>
                    Scan to view full profile
                  </p>
                </div>

                {/* Action Button */}
                <Link to={profileUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="w-full font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    style={{
                      backgroundColor: brandColors.goldPrestige,
                      color: brandColors.navyDeep
                    }}
                  >
                    <span>View Full Profile</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                {fullNominee && (
                  <CommunityNotesPanel nominee={fullNominee} user={user} isAdmin={isAdmin} />
                )}
              </div>
            )}
          </div>
        </motion.div>

        {showEditModal && fullNominee && (
          <EditSuggestionModal
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            nominee={fullNominee}
            user={user}
          />
        )}
      </div>
    </AnimatePresence>
  );
}