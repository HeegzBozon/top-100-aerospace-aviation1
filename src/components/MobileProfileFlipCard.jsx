import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { UploadFile } from '@/integrations/Core';
import {
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
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { brandColors } from '@/components/core/brandTheme';

const myStuffItems = [
  { icon: CheckSquare, label: 'Nominations', href: 'VotingHub' },
  { icon: Bookmark, label: 'Bookmarks', href: 'Arena' },
  { icon: Calendar, label: 'Schedule', href: 'Calendar' },
  { icon: FileText, label: 'Drafts', href: 'Submit' },
  { icon: Clock, label: 'Activity', href: 'Home' },
  { icon: Rocket, label: 'Boosts', href: 'Endorse' },
];

export default function MobileProfileFlipCard({ user, onClose }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if ('vibrate' in navigator) navigator.vibrate(30);
  };

  const handlePhotoUpload = async (event) => {
    event.stopPropagation();
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large" });
      return;
    }
    setUploadingPhoto(true);
    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ avatar_url: file_url });
      toast({ title: "Photo Updated!" });
    } catch {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const profileUrl = `${window.location.origin}${createPageUrl('UserProfile')}?id=${user?.id}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({ title: "Profile link copied!" });
    } catch {
      toast({ variant: "destructive", title: "Failed to copy" });
    }
  };

  const profileUrl = user ? `${window.location.origin}${createPageUrl('UserProfile')}?id=${user.id}` : '';
  const qrCodeUrl = user ? `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(profileUrl)}&bgcolor=1e3a5a&color=ffffff&qzone=1` : '';

  if (!user) return null;

  return (
    <div className="relative w-full" style={{ perspective: '1200px' }}>
      {/* Flip Indicator */}
      <button
        onClick={handleFlip}
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ 
          background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #d4b896)`,
          color: 'white',
        }}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        {isFlipped ? 'Back to Profile' : 'View My Stuff'}
      </button>

      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        onClick={handleFlip}
      >
        {/* FRONT - Profile Card */}
        <div
          className="w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', background: brandColors.cream }}
        >
          {/* Header */}
          <div 
            className="pt-10 pb-5 px-4 text-center relative"
            style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, #2a4a6a)` }}
          >
            {/* Avatar */}
            <div className="relative inline-block mb-2">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=c9a87c&color=1e3a5a&size=80`}
                alt={user.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
              />
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ background: brandColors.goldPrestige }}
              >
                {uploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>

            <h2 className="text-lg font-bold text-white">{user.full_name || 'Set your name'}</h2>
            <p className="text-white/60 text-xs">{user.email}</p>
            
            {user.role === 'admin' && (
              <span 
                className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
              >
                <Crown className="w-2.5 h-2.5" /> Admin
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            <div className="bg-white p-2 text-center">
              <div className="text-base font-bold" style={{ color: brandColors.goldPrestige }}>{user.aura_score?.toLocaleString() || 0}</div>
              <div className="text-[10px] text-gray-500">Aura</div>
            </div>
            <div className="bg-white p-2 text-center">
              <div className="text-base font-bold" style={{ color: brandColors.navyDeep }}>{user.starpower_score?.toLocaleString() || 0}</div>
              <div className="text-[10px] text-gray-500">Starpower</div>
            </div>
            <div className="bg-white p-2 text-center">
              <div className="text-base font-bold text-amber-500">{user.stardust_points?.toLocaleString() || 0}</div>
              <div className="text-[10px] text-gray-500">Stardust</div>
            </div>
          </div>

          {/* QR & Share */}
          <div className="p-3 bg-white flex items-center justify-center gap-3">
            {qrCodeUrl && (
              <div className="rounded-lg overflow-hidden border" style={{ borderColor: `${brandColors.navyDeep}20` }}>
                <img src={qrCodeUrl} alt="QR" className="w-12 h-12" />
              </div>
            )}
            <div>
              <p className="text-[10px] text-gray-500 mb-1">Share profile</p>
              <Button variant="outline" size="sm" onClick={handleShare} className="h-7 text-xs gap-1">
                <Share2 className="w-3 h-3" /> Copy
              </Button>
            </div>
          </div>

          {/* Rank Badge */}
          <div className="px-4 pb-4 bg-white">
            <div 
              className="flex items-center justify-center gap-2 py-2 rounded-lg"
              style={{ background: `${brandColors.goldPrestige}15` }}
            >
              <Award className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
              <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
                {user.aura_rank_name || 'Bronze I-III'}
              </span>
            </div>
          </div>
        </div>

        {/* BACK - My Stuff & Actions */}
        <div
          className="absolute inset-0 w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, ${brandColors.navyDeep}, #1a2f45)`
          }}
        >
          {/* My Stuff Grid */}
          <div className="pt-10 px-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-white/70" />
              <span className="text-sm font-semibold text-white">My Stuff</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {myStuffItems.map((item) => (
                <Link
                  key={item.label}
                  to={createPageUrl(item.href)}
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 transition-colors"
                >
                  <item.icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                  <span className="text-[9px] font-medium text-white/80">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 space-y-2">
            <Link to={createPageUrl('ClaimProfile')} onClick={(e) => { e.stopPropagation(); onClose(); }}>
              <Button 
                className="w-full h-9 text-xs gap-2"
                style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
              >
                <Crown className="w-3.5 h-3.5" /> Check Nominations
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link to={createPageUrl('HypeSquad')} onClick={(e) => { e.stopPropagation(); onClose(); }}>
                <Button variant="outline" className="w-full h-8 text-[10px] gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Users className="w-3 h-3" /> HypeSquad
                </Button>
              </Link>
              <Link to={createPageUrl('PayoutSettings')} onClick={(e) => { e.stopPropagation(); onClose(); }}>
                <Button variant="outline" className="w-full h-8 text-[10px] gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <DollarSign className="w-3 h-3" /> Payouts
                </Button>
              </Link>
            </div>
          </div>

          {/* Logout */}
          <div className="px-4 pb-4">
            <Button 
              variant="ghost" 
              className="w-full h-8 text-xs gap-2 text-white/50 hover:text-red-400 hover:bg-red-500/10"
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}