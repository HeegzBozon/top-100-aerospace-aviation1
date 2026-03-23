
import { X, Users, CheckCircle, Trophy, Star } from 'lucide-react';

export default function VoterGuidanceModal({ isOpen, onClose, votingMode }) {
  if (!isOpen) {
    return null;
  }

  const guidanceContent = {
    pairwise: {
      title: 'Head-to-Head Voting Guide',
      icon: Users,
      color: 'from-blue-500 to-cyan-400',
      description: 'Compare two nominees directly to help build accurate rankings.',
      tips: [
        'Consider overall contribution and impact, not just seniority',
        'Think about who you would want on your dream team',
        'Factor in leadership, innovation, and collaboration',
        'Trust your instincts - there\'s no perfect answer',
        'Each vote helps refine the ELO ratings for better matching'
      ],
      rewards: 'Earn 1 Stardust per vote + chance to award Spotlights'
    },
    direct: {
      title: 'Direct Vote Guide',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-400',
      description: 'Cast your single, powerful vote for the nominee you believe deserves the most recognition.',
      tips: [
        'This is your most important vote - choose wisely',
        'You can change your vote anytime',
        'Consider who has made the biggest impact',
        'Think about who embodies the values you want to see',
        'Your vote carries more weight than pairwise comparisons'
      ],
      rewards: 'Earn 3 Stardust for casting your direct vote'
    },
    ranked: {
      title: 'Ranked Choice Voting Guide',
      icon: Trophy,
      color: 'from-purple-500 to-indigo-400',
      description: 'Order your top nominees by preference to contribute to more nuanced rankings.',
      tips: [
        'Select 3-10 nominees for your ballot',
        'Order them from most to least deserving',
        'Drag and drop to reorder your selections',
        'Consider the full range of contributions',
        'This method captures the subtlety of your preferences'
      ],
      rewards: 'Earn 10 Stardust for submitting a complete ranked ballot'
    },
    urgencymatrix: {
      title: 'Urgency Matrix Guide',
      icon: CheckCircle,
      color: 'from-orange-500 to-red-400',
      description: 'Rate bugs on both urgency and impact to create a priority matrix.',
      tips: [
        'Consider how many users are affected (Impact)',
        'Think about how quickly it needs to be fixed (Urgency)',
        'Your rating helps build a clear priority list for developers',
        'This method is more detailed than a simple ranked list'
      ],
      rewards: 'Earn 2 Stardust for each bug you rate'
    }
  };

  const content = guidanceContent[votingMode] || guidanceContent.pairwise;
  const IconComponent = content.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${content.color} rounded-xl flex items-center justify-center`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
                <p className="text-gray-600">{content.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Tips</h3>
            <ul className="space-y-3">
              {content.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800">Stardust Rewards</h4>
            </div>
            <p className="text-yellow-700">{content.rewards}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Why Your Vote Matters</h4>
            <p className="text-gray-700 text-sm">
              Every vote helps create a more accurate and fair ranking system. Your participation 
              ensures that recognition goes to those who truly deserve it, while also building 
              your own reputation and influence in the community through Stardust rewards.
            </p>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
            >
              Got it, let's vote!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
