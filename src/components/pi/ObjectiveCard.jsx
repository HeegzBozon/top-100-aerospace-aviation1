import React, { useState, useMemo } from 'react';
import { Objective } from '@/entities/Objective';
import { KeyResult } from '@/entities/KeyResult';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Flag, Edit, Plus, Trash2, CheckCircle, Radio } from 'lucide-react';
import KeyResultForm from './KeyResultForm';

const KeyResultRow = ({ kr, onUpdate }) => {
    const [currentValue, setCurrentValue] = useState(kr.current_value);

    const handleUpdate = async () => {
        await KeyResult.update(kr.id, { current_value: Number(currentValue) });
        onUpdate();
    };

    const getKrProgress = () => {
        if (kr.target_value === kr.start_value) return kr.current_value >= kr.target_value ? 100 : 0;
        const progress = ((kr.current_value - kr.start_value) / (kr.target_value - kr.start_value)) * 100;
        return Math.max(0, Math.min(progress, 100));
    };
    
    const progress = getKrProgress();

    return (
        <div className="py-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
                <p className="text-gray-700 flex-1 pr-2">{kr.name}</p>
                <div className="flex items-center gap-2 w-48">
                    <input 
                        type="number"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onBlur={handleUpdate}
                        className="w-20 text-sm text-center border rounded-md"
                    />
                    <span className="text-gray-500">of {kr.target_value}</span>
                </div>
            </div>
            <Progress value={progress} />
        </div>
    );
};

export default function ObjectiveCard({ objective, keyResults, onUpdate, onEdit }) {
  const [showKrForm, setShowKrForm] = useState(false);

  const overallProgress = useMemo(() => {
    if (!keyResults || keyResults.length === 0) return 0;

    const totalProgress = keyResults.reduce((sum, kr) => {
      if (kr.target_value === kr.start_value) {
        return sum + (kr.current_value >= kr.target_value ? 100 : 0);
      }
      const progress = ((kr.current_value - kr.start_value) / (kr.target_value - kr.start_value)) * 100;
      return sum + Math.max(0, Math.min(progress, 100));
    }, 0);
    
    return totalProgress / keyResults.length;
  }, [keyResults]);

  const handleKrFormSuccess = () => {
    setShowKrForm(false);
    onUpdate();
  };

  const handleDeleteObjective = async () => {
      if(confirm("Are you sure you want to delete this objective and all its key results?")) {
          // In a real app, you might want to do this in a transaction
          for (const kr of keyResults) {
              await KeyResult.delete(kr.id);
          }
          await Objective.delete(objective.id);
          onUpdate();
      }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border flex flex-col h-full">
      <div className="p-5 border-b">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${overallProgress > 80 ? 'bg-green-100' : 'bg-indigo-100'}`}>
                  <Target className={`w-5 h-5 ${overallProgress > 80 ? 'text-green-600' : 'text-indigo-600'}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{objective.name}</h3>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={handleDeleteObjective} className="h-8 w-8 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
            </div>
        </div>
        <p className="text-sm text-gray-600 mt-2 ml-11">{objective.description}</p>
      </div>

      <div className="p-5 flex-grow">
        <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800">Key Results</h4>
            <span className={`text-xl font-bold ${overallProgress > 80 ? 'text-green-600' : 'text-indigo-600'}`}>{overallProgress.toFixed(0)}%</span>
        </div>
        <Progress value={overallProgress} indicatorClassName={overallProgress > 80 ? 'bg-green-500' : 'bg-indigo-500'} />
        
        <div className="mt-4 space-y-2 divide-y divide-gray-100">
            {keyResults.map(kr => <KeyResultRow key={kr.id} kr={kr} onUpdate={onUpdate} />)}
        </div>
      </div>
      
      <div className="p-5 border-t bg-gray-50/50 rounded-b-xl">
        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowKrForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Key Result
        </Button>
      </div>

      {showKrForm && (
        <KeyResultForm
          objectiveId={objective.id}
          onClose={() => setShowKrForm(false)}
          onSuccess={handleKrFormSuccess}
        />
      )}
    </div>
  );
}