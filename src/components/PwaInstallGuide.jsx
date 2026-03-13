import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, MoreVertical, Download } from 'lucide-react';

export default function PwaInstallGuide({ onClose }) {
  const [os, setOs] = useState('other');

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setOs('ios');
    } else if (/android/i.test(userAgent)) {
      setOs('android');
    } else {
      setOs('other');
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: 'Check out the Continuum app!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert("Your browser doesn't support the Share API. Please use the manual steps.");
    }
  };

  const renderInstructions = () => {
    switch (os) {
      case 'ios':
        return (
          <>
            <h3 className="text-xl font-bold text-white mb-4">Install on your iPhone/iPad</h3>
            <ol className="space-y-4 text-left text-white/80">
              <li className="flex items-start gap-3">
                <span className="font-bold text-lg">1.</span>
                <div>
                  Tap the <Share className="inline-block w-5 h-5 mx-1" /> Share button in your browser's toolbar.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-lg">2.</span>
                <div>
                  Scroll down and tap on <PlusSquare className="inline-block w-5 h-5 mx-1" /> "Add to Home Screen".
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-lg">3.</span>
                <div>
                  Confirm by tapping "Add" in the top-right corner.
                </div>
              </li>
            </ol>
            <button
              onClick={handleShare}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Share className="w-5 h-5" />
              <span>Open Share Menu</span>
            </button>
          </>
        );
      case 'android':
        return (
          <>
            <h3 className="text-xl font-bold text-white mb-4">Install on your Android</h3>
            <ol className="space-y-4 text-left text-white/80">
              <li className="flex items-start gap-3">
                <span className="font-bold text-lg">1.</span>
                <div>
                  Tap the <MoreVertical className="inline-block w-5 h-5 mx-1" /> Menu button in your browser (usually 3 dots).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-lg">2.</span>
                <div>
                  Tap on "Install app" or "Add to Home screen".
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-lg">3.</span>
                <div>
                  Follow the on-screen prompts to complete the installation.
                </div>
              </li>
            </ol>
          </>
        );
      default: // Desktop
        return (
          <>
            <h3 className="text-lg font-bold text-white mb-3">Install on your Desktop</h3>
            <ol className="space-y-3 text-left text-white/80 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold text-base">1.</span>
                <div>
                  Look for the <Download className="inline-block w-4 h-4 mx-1" /> Install icon in your browser's address bar.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-base">2.</span>
                <div>
                  Click the icon and then click "Install" in the prompt.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-base">3.</span>
                <div>
                  The app will be added to your desktop or applications folder.
                </div>
              </li>
            </ol>
          </>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="
          relative w-full max-w-sm bg-gradient-to-br from-slate-800 to-purple-900/80 
          rounded-2xl border border-white/20 shadow-2xl p-6 text-center
          max-h-[80vh] overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="pt-2">
          {renderInstructions()}
        </div>
      </div>
    </div>
  );
}