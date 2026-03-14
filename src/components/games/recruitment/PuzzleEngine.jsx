import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Lightbulb, Clock } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

// Pattern Match Puzzle Component
function PatternMatchPuzzle({ clues, onSolve }) {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState([]);

  const handleReveal = (index) => {
    if (!revealed.includes(index)) {
      setRevealed([...revealed, index]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 
        className="text-lg font-semibold"
        style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
      >
        Decode the Pattern
      </h3>
      <p className="text-slate-600 text-sm">
        Analyze the clues to identify the candidate's key attributes.
      </p>
      
      <div className="space-y-3">
        {clues.map((clue, i) => (
          <div 
            key={i}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Clue #{i + 1}</div>
                {revealed.includes(i) || !clue.is_encrypted ? (
                  <p className="text-slate-800">{clue.clue_text}</p>
                ) : (
                  <p className="text-slate-400 font-mono">████████ ███████ ██████</p>
                )}
              </div>
              {clue.is_encrypted && !revealed.includes(i) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReveal(i)}
                  style={{ borderColor: brandColors.skyBlue, color: brandColors.skyBlue }}
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Decrypt
                </Button>
              )}
            </div>
            {clue.hint && revealed.includes(i) && (
              <div 
                className="mt-2 text-xs p-2 rounded"
                style={{ background: `${brandColors.goldPrestige}15`, color: brandColors.goldPrestige }}
              >
                💡 {clue.hint}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Data Decode Puzzle Component
function DataDecodePuzzle({ clues, onSolve }) {
  const [code, setCode] = useState('');

  return (
    <div className="space-y-4">
      <h3 
        className="text-lg font-semibold"
        style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
      >
        Decode the Transmission
      </h3>
      <p className="text-slate-600 text-sm">
        The Council has intercepted a coded transmission. Decode it to reveal the candidate.
      </p>
      
      <div 
        className="p-4 rounded-xl font-mono text-center text-xl tracking-widest"
        style={{ background: brandColors.navyDeep, color: brandColors.goldPrestige }}
      >
        {clues[0]?.clue_text || '??? - ??? - ???'}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter decoded message..."
          className="font-mono uppercase"
        />
      </div>
    </div>
  );
}

export default function PuzzleEngine({ mission, nominees, onComplete, onFail }) {
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [result, setResult] = useState(null); // 'success' | 'fail' | null

  useEffect(() => {
    if (result) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (timedOut = false) => {
    if (timedOut || selectedNominee !== mission.solution_nominee_id) {
      setResult('fail');
      setTimeout(() => onFail?.(), 2000);
    } else {
      setResult('success');
      setTimeout(() => onComplete?.(mission.insight_reward), 2000);
    }
  };

  const renderPuzzle = () => {
    switch (mission.puzzle_type) {
      case 'pattern_match':
        return <PatternMatchPuzzle clues={mission.clues || []} />;
      case 'data_decode':
        return <DataDecodePuzzle clues={mission.clues || []} />;
      default:
        return <PatternMatchPuzzle clues={mission.clues || []} />;
    }
  };

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        {result === 'success' ? (
          <>
            <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
            <h2 
              className="text-2xl mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: brandColors.navyDeep }}
            >
              Mission Complete!
            </h2>
            <p className="text-slate-600">+{mission.insight_reward} Insight Points</p>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 mx-auto mb-4 text-red-500" />
            <h2 
              className="text-2xl mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: brandColors.navyDeep }}
            >
              Mission Failed
            </h2>
            <p className="text-slate-600">The trail has gone cold. Try again.</p>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="flex items-center justify-between">
        <h2 
          className="text-xl font-semibold"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
        >
          {mission.title}
        </h2>
        <div 
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeRemaining < 60 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}
        >
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* Puzzle Area */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        {renderPuzzle()}
      </div>

      {/* Candidate Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
        >
          Identify the Candidate
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {nominees.slice(0, 6).map((nominee) => (
            <button
              key={nominee.id}
              onClick={() => setSelectedNominee(nominee.id)}
              className={`p-3 rounded-xl text-left transition-all ${
                selectedNominee === nominee.id 
                  ? 'ring-2 ring-offset-2' 
                  : 'hover:bg-slate-50'
              }`}
              style={{ 
                borderColor: selectedNominee === nominee.id ? brandColors.goldPrestige : '#e2e8f0',
                border: '1px solid',
                ringColor: brandColors.goldPrestige
              }}
            >
              <div className="font-medium text-sm" style={{ color: brandColors.navyDeep }}>
                {nominee.name}
              </div>
              <div className="text-xs text-slate-500">{nominee.professional_role}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={() => handleSubmit()}
        disabled={!selectedNominee}
        className="w-full py-6 text-lg font-semibold text-white"
        style={{ 
          background: selectedNominee ? `linear-gradient(135deg, ${brandColors.goldPrestige}, #d4a84b)` : '#9ca3af',
          fontFamily: "'Montserrat', sans-serif"
        }}
      >
        Submit Identification
      </Button>
    </div>
  );
}