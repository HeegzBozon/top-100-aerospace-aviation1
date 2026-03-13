import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { UploadFile } from '@/integrations/Core';
import {
  X,
  Crown,
  LogOut,
  Camera,
  Loader2,
  Users,
  DollarSign,
  Award,
  Share2,
  CheckSquare,
  Bookmark,
  Calendar,
  FileText,
  Clock,
  Rocket,
  History,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MyStuffFlipCard from '@/components/MyStuffFlipCard';
import MobileProfileFlipCard from '@/components/MobileProfileFlipCard';
import { brandColors } from '@/components/core/brandTheme';

export default function UserProfileModal({ isOpen, onClose, user }) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Please choose a photo under 5MB" });
      return;
    }

    setUploadingPhoto(true);
    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ avatar_url: file_url });
      toast({ title: "Photo Updated!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}${createPageUrl('UserProfile')}?id=${user?.id}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({ title: "Profile link copied!" });
    } catch {
      toast({ variant: "destructive", title: "Failed to copy link" });
    }
  };

  const profileUrl = user ? `${window.location.origin}${createPageUrl('UserProfile')}?id=${user.id}` : '';
  const qrCodeUrl = user ? `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(profileUrl)}&bgcolor=1e3a5a&color=ffffff&qzone=1` : '';

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 overflow-y-auto"
        style={{ zIndex: 9999 }}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: brandColors.cream }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" style={{ color: brandColors.navyDeep }} />
            </button>

            {!user ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: brandColors.navyDeep }} />
                <p className="text-sm" style={{ color: brandColors.navyDeep }}>Loading...</p>
              </div>
            ) : (
              <>
                {/* Mobile: Full Flip Card Experience */}
                <div className="md:hidden p-4 pt-8">
                  <MobileProfileFlipCard user={user} onClose={onClose} />
                </div>

                {/* Desktop: Traditional Layout with My Stuff Flip Card */}
                <div className="hidden md:block">
                  {/* Header with Avatar */}
                  <div 
                    className="pt-8 pb-6 px-6 text-center"
                    style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, #2a4a6a)` }}
                  >
                    <div className="relative inline-block mb-3">
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=c9a87c&color=1e3a5a&size=96`}
                        alt={user.full_name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white/30 shadow-lg"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                        style={{ background: brandColors.goldPrestige }}
                      >
                        {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">{user.full_name || 'Set your name'}</h2>
                    <p className="text-white/70 text-sm">{user.email}</p>
                    
                    {user.role === 'admin' && (
                      <span 
                        className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
                      >
                        <Crown className="w-3 h-3" /> Platform Admin
                      </span>
                    )}

                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm">
                      <Award className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                      {user.aura_rank_name || 'Bronze I-III'}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-px bg-gray-200">
                    <div className="bg-white p-3 text-center">
                      <div className="text-lg font-bold" style={{ color: brandColors.goldPrestige }}>{user.aura_score?.toLocaleString() || 0}</div>
                      <div className="text-xs text-gray-500">Aura</div>
                    </div>
                    <div className="bg-white p-3 text-center">
                      <div className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>{user.starpower_score?.toLocaleString() || 0}</div>
                      <div className="text-xs text-gray-500">Starpower</div>
                    </div>
                    <div className="bg-white p-3 text-center">
                      <div className="text-lg font-bold text-amber-500">{user.stardust_points?.toLocaleString() || 0}</div>
                      <div className="text-xs text-gray-500">Stardust</div>
                    </div>
                  </div>

                  {/* QR Code & Share */}
                  <div className="p-4 bg-white border-b flex items-center justify-center gap-4">
                    {qrCodeUrl && (
                      <div className="rounded-lg overflow-hidden border" style={{ borderColor: `${brandColors.navyDeep}20` }}>
                        <img src={qrCodeUrl} alt="Profile QR" className="w-16 h-16" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-xs text-gray-500 mb-1">Share your profile</p>
                      <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
                        <Share2 className="w-3.5 h-3.5" />
                        Copy Link
                      </Button>
                    </div>
                  </div>

                  {/* My Stuff Flip Card */}
                  <div className="p-4 bg-white border-b">
                    <MyStuffFlipCard onNavigate={onClose} />
                  </div>

                  {/* Actions */}
                  <div className="p-4 space-y-2 bg-gray-50">
                    <Link to={createPageUrl('ClaimProfile')} onClick={onClose}>
                      <Button 
                        className="w-full gap-2 text-white"
                        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, #2a4a6a)` }}
                      >
                        <Crown className="w-4 h-4" />
                        Check for Nominations
                      </Button>
                    </Link>

                    <Link to={createPageUrl('HypeSquad')} onClick={onClose}>
                      <Button variant="outline" className="w-full gap-2">
                        <Users className="w-4 h-4" />
                        HypeSquad Dashboard
                      </Button>
                    </Link>

                    <Link to={createPageUrl('PayoutSettings')} onClick={onClose}>
                      <Button variant="outline" className="w-full gap-2">
                        <DollarSign className="w-4 h-4" />
                        Payout Settings
                      </Button>
                    </Link>

                    <Button variant="ghost" className="w-full gap-2 text-gray-500 hover:text-red-600" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}