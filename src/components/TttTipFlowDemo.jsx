import { useState } from 'react';
import { Send, Share2, ClipboardCopy } from 'lucide-react';

export default function TttTipFlowDemo() {
  const [tipAmount, setTipAmount] = useState(10);
  const [message, setMessage] = useState('');
  const [tipSent, setTipSent] = useState(false);
  const [tipLink, setTipLink] = useState('');
  const [showComposer, setShowComposer] = useState(false);

  const handleSendTip = () => {
    // Stub: Simulate sending tip
    console.log(`Sending tip of ${tipAmount} with message: "${message}"`);
    setTipSent(true);
    setTipLink(`https://your-app.com/tip/${Date.now()}`); // Simulate a unique link
  };

  const handleShareTipLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this tip!',
          text: 'Here is a tip link from the TT&T app!',
          url: tipLink,
        });
        alert('Tip link shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Failed to share tip link.');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(tipLink)
        .then(() => alert('Tip link copied to clipboard!'))
        .catch(err => console.error('Could not copy text: ', err));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen text-center">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-xl">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-white text-3xl">💡</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Tips, Tricks & Training
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Learn something new, share insights, and get rewarded!
          </p>

          {!tipSent ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">Send a Tip</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-white text-3xl font-bold">$</span>
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="w-24 p-2 text-white bg-white/10 rounded-lg border border-white/20 text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="1"
                  />
                  <span className="text-white text-xl">points</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message for your tip (optional)"
                  className="w-full p-3 h-24 text-white bg-white/10 rounded-lg border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
                <button
                  onClick={handleSendTip}
                  className="w-full px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-full shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Tip (Sandbox)</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-white">
              <h2 className="text-3xl font-bold text-white mb-4">Tip Sent Successfully!</h2>
              <p className="text-xl text-white/70 mb-6">
                Your tip has been delivered.
              </p>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <input
                  type="text"
                  value={tipLink}
                  readOnly
                  className="flex-1 p-3 text-white bg-white/10 rounded-lg border border-white/20 text-center text-sm"
                />
                <button
                  onClick={handleShareTipLink}
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                  title="Share Tip Link"
                >
                  {navigator.share ? <Share2 className="w-5 h-5" /> : <ClipboardCopy className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={() => setShowComposer(!showComposer)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
              >
                {showComposer ? 'Hide Thank-you Composer' : 'Show Thank-you Composer'}
              </button>

              {showComposer && (
                <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
                  <h3 className="text-xl font-bold mb-3">Thank-you Composer</h3>
                  <textarea
                    placeholder="Write a thank-you message..."
                    className="w-full p-3 h-24 text-white bg-white/10 rounded-lg border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300">
                    Send Thank You
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}