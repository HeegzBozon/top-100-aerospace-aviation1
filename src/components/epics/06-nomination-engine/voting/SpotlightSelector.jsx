import React, { useState } from 'react';
import { SpotlightVote } from '@/entities/SpotlightVote';
import { Star, Zap, Rocket, Award, X } from 'lucide-react';

export default function SpotlightSelector({ nominee, currentUser, activeSeason, onClose }) {
  const [selectedSpotlight, setSelectedSpotlight] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const spotlightCategories = [
    {
      id: 'rising_star',
      name: 'Rising Star',
      icon: Star,
      color: 'from-blue-500 to-cyan-400',
      description: 'New talent showing great potential'
    },
    {
      id: 'rock_star',
      name: 'Rock Star',
      icon: Zap,
      color: 'from-yellow-500 to-orange-400',
      description: 'Consistent high performer'
    },
    {
      id: 'super_star',
      name: 'Super Star',
      icon: Rocket,
      color: 'from-purple-500 to-indigo-400',
      description: 'Exceptional achievement and leadership'
    },
    {
      id: 'north_star',
      name: 'North Star',
      icon: Award,
      color: 'from-pink-500 to-rose-400',
      description: 'Guides and inspires the entire team'
    }
  ];

  const handleSpotlightSubmit = async () => {
    if (!selectedSpotlight || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await SpotlightVote.create({
        nominee_id: nominee.id,
        voter_email: currentUser.email,
        category: selectedSpotlight,
        season_id: activeSeason.id,
        context: 'pairwise'
      });

      onClose(true); // Spotlight was given
    } catch (error) {
      console.error('Error submitting spotlight vote:', error);
      onClose(false); // No spotlight given due to error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose(false); // No spotlight given
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Give a Spotlight?</h2>
              <p className="text-gray-600 mt-1">
                Award {nominee.name} a special recognition
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Nominee Info */}
          <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <img
              src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=random`}
              alt={nominee.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-900">{nominee.name}</h3>
              <p className="text-gray-600">{nominee.title}</p>
              {nominee.department && <p className="text-sm text-gray-500">{nominee.department}</p>}
            </div>
          </div>

          {/* Spotlight Categories */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {spotlightCategories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedSpotlight === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedSpotlight(category.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                    isSelected
                      ? 'border-purple-300 bg-purple-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl mb-4 flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h4>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSpotlightSubmit}
              disabled={!selectedSpotlight || isSubmitting}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Awarding...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Award Spotlight
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}