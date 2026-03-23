import { X, User, Tag, Heart, Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function TipViewModal({ tip, onClose }) {
  if (!tip) return null;

  const getCategoryColor = (category) => {
    const colors = {
      'Technical': 'from-blue-500 to-cyan-400',
      'Leadership': 'from-purple-500 to-indigo-400',
      'Process': 'from-green-500 to-emerald-400',
      'Communication': 'from-orange-500 to-amber-400',
      'Innovation': 'from-pink-500 to-rose-400'
    };
    return colors[category] || 'from-gray-500 to-slate-400';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Tip Details</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{tip.title}</h3>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(tip.category)} text-white rounded-full font-medium`}>
              {tip.category}
            </div>
            <div className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(tip.difficulty)}`}>
              {tip.difficulty}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <User className="w-4 h-4" />
              <span>{tip.author}</span>
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-800 leading-relaxed">
            <p>{tip.content}</p>
          </div>

          {tip.tags && tip.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {tip.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <div>
                <div className="font-bold text-gray-800">{tip.upvotes || 0}</div>
                <div>Upvotes</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-bold text-gray-800">{tip.views || 0}</div>
                <div>Views</div>
              </div>
            </div>
            <div className="flex items-center gap-2 col-span-2 md:col-span-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-bold text-gray-800">{format(new Date(tip.created_date), 'PPP')}</div>
                <div>Created</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}