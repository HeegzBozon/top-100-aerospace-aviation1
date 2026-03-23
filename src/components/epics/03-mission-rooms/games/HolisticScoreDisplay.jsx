import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Award, Target, Users, BookOpen, Scale } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function HolisticScoreDisplay({ nominee }) {
  const [expanded, setExpanded] = useState(false);

  const layers = [
    {
      name: 'Perception',
      score: nominee.perception_layer_score || 0,
      weight: 30,
      icon: Users,
      color: brandColors.skyBlue,
      description: 'Pairwise voting, ranked choice, profile strength'
    },
    {
      name: 'Objective',
      score: nominee.objective_layer_score || 0,
      weight: 30,
      icon: Target,
      color: brandColors.goldPrestige,
      description: 'Quantitative metrics: patents, leadership, innovation'
    },
    {
      name: 'SME',
      score: nominee.sme_layer_score || 0,
      weight: 20,
      icon: Award,
      color: brandColors.navyDeep,
      description: 'Expert evaluations and peer review'
    },
    {
      name: 'Narrative',
      score: nominee.narrative_layer_score || 0,
      weight: 10,
      icon: BookOpen,
      color: brandColors.skyBlue,
      description: 'Story arc, clarity, persuasion strength'
    },
    {
      name: 'Normalization',
      score: nominee.normalization_layer_score || 0,
      weight: 10,
      icon: Scale,
      color: brandColors.goldPrestige,
      description: 'Discipline, career stage, regional adjustments'
    }
  ];

  const holisticScore = nominee.holistic_score || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 rounded-lg transition-all hover:shadow-lg"
        style={{ background: 'white', border: `2px solid ${brandColors.goldPrestige}40` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: brandColors.goldPrestige + '20' }}>
              <Award className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Holistic Score v3.0</p>
              <p className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>
                {holisticScore.toFixed(1)}
              </p>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-2"
          >
            <div className="p-4 rounded-lg bg-white border-2" style={{ borderColor: brandColors.navyDeep + '10' }}>
              <p className="text-xs text-gray-600 mb-4">
                Multi-layer evaluation combining perception, quantitative metrics, expert review, narrative analysis, and normalization adjustments.
              </p>
              <div className="space-y-3">
                {layers.map((layer, index) => {
                  const Icon = layer.icon;
                  return (
                    <motion.div
                      key={layer.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" style={{ color: layer.color }} />
                        <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
                          {layer.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({layer.weight}%)
                        </span>
                        <span className="ml-auto text-sm font-bold" style={{ color: layer.color }}>
                          {layer.score.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${layer.score}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ background: layer.color }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{layer.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}