import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Star,
  Sparkles,
  QrCode
} from 'lucide-react';

export default function HolographicNomineeCard({ nominee, cardData, onShare }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'golden': return 'from-yellow-400 to-yellow-600';
      case 'chase': return 'from-purple-400 to-pink-600';
      case 'rare': return 'from-blue-400 to-cyan-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getHolographicEffect = (variant) => {
    switch (variant) {
      case 'rainbow': return 'bg-gradient-to-br from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400';
      case 'foil': return 'bg-gradient-to-br from-silver-300 to-silver-500';
      case 'special': return 'bg-gradient-to-br from-rose-gold-400 to-rose-gold-600';
      default: return 'bg-gradient-to-br from-indigo-400 to-purple-600';
    }
  };

  // Generate QR code URL for nominee spotlight page
  const generateQRCodeUrl = (nominee) => {
    const spotlightUrl = `${window.location.origin}/Arena?nominee=${nominee.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(spotlightUrl)}`;
  };

  return (
    <div 
      className="perspective-1000 w-64 h-80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        animate={{
          rotateY: isHovered ? 5 : 0,
          rotateX: isHovered ? -5 : 0,
          scale: isHovered ? 1.05 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Card className={`w-full h-full border-4 border-white/20 ${getHolographicEffect(cardData?.holographic_variant)} overflow-hidden shadow-2xl`}>
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Holographic Overlay */}
            <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/40 via-transparent to-white/20 animate-pulse"></div>
            
            <CardContent className="relative h-full p-6 flex flex-col justify-between text-white">
              {/* Header */}
              <div className="text-center">
                <Badge className={`bg-gradient-to-r ${getRarityColor(cardData?.rarity)} text-white mb-2`}>
                  Card No. {String(cardData?.card_number || 1).padStart(2, '0')}/100
                </Badge>
                <h3 className="text-sm font-medium opacity-90">{cardData?.tagline}</h3>
              </div>

              {/* Nominee Photo */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden shadow-xl">
                  <img 
                    src={nominee?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee?.name || 'Nominee')}&background=random`}
                    alt={nominee?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Nominee Info */}
              <div className="text-center">
                <h2 className="text-xl font-bold mb-1">{nominee?.name}</h2>
                <p className="text-sm opacity-80">{nominee?.title}</p>
                <p className="text-xs opacity-70 mb-2">{nominee?.company}</p>
                
                {/* Aura/Stats */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">{Math.round(nominee?.aura_score || 0)}</span>
                  </div>
                  {nominee?.starpower_score > 0 && (
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium">{Math.round(nominee?.starpower_score || 0)}</span>
                    </div>
                  )}
                </div>

                {/* Rarity Indicator */}
                <div className="flex justify-center">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {cardData?.rarity?.toUpperCase() || 'STANDARD'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back of Card - QR Code */}
        <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden">
          <Card className="w-full h-full border-4 border-white/20 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden shadow-2xl">
            <CardContent className="h-full p-6 flex flex-col items-center justify-center text-white">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold mb-2">Scan to Learn More</h3>
                <p className="text-sm opacity-80">Discover {nominee?.name}'s full profile</p>
              </div>
              
              {/* Actual Scannable QR Code */}
              <div className="w-32 h-32 bg-white rounded-lg p-2 mb-6">
                <img 
                  src={generateQRCodeUrl(nominee)}
                  alt="QR Code"
                  className="w-full h-full"
                />
              </div>
              
              <div className="text-center">
                <p className="text-xs opacity-70">TOP 100 Women in Aerospace & Aviation</p>
                <p className="text-xs opacity-50">2025 Edition</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsFlipped(!isFlipped)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <QrCode className="w-4 h-4 mr-1" />
          Flip
        </Button>
        <Button
          size="sm"
          onClick={() => onShare?.(nominee, cardData)}
          className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </div>
    </div>
  );
}