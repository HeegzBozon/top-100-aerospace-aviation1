import React, { useState, useEffect } from 'react';
import { SeasonalPlan } from '@/entities/SeasonalPlan';
import { Objective } from '@/entities/Objective';
import { KeyResult } from '@/entities/KeyResult';
import { Sprint } from '@/entities/Sprint';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, Target, Flag } from 'lucide-react';

import SeasonalPlanCreationForm from '@/components/pi/SeasonalPlanCreationForm';
import ObjectiveCard from '@/components/pi/ObjectiveCard';
import ObjectiveForm from '@/components/pi/ObjectiveForm';

export default function PIPlanner() {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [keyResults, setKeyResults] = useState([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      loadObjectivesAndKRs(selectedPlanId);
    } else {
      setObjectives([]);
      setKeyResults([]);
    }
  }, [selectedPlanId]);

  const loadPlans = async () => {
    const allPlans = await SeasonalPlan.list('-start_date');
    setPlans(allPlans);
    if (allPlans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(allPlans[0].id);
    }
  };

  const loadObjectivesAndKRs = async (planId) => {
    // Note: Objective entity still needs to be updated to use plan_id instead of pi_id
    const planObjectives = await Objective.filter({ pi_id: planId });
    setObjectives(planObjectives);
    if (planObjectives.length > 0) {
      const objectiveIds = planObjectives.map(o => o.id);
      const allKRs = await KeyResult.filter({ objective_id: { $in: objectiveIds } });
      setKeyResults(allKRs);
    } else {
      setKeyResults([]);
    }
  };

  const handlePlanFormSuccess = () => {
    setShowPlanForm(false);
    loadPlans();
  };

  const handleObjectiveFormSuccess = () => {
    setShowObjectiveForm(false);
    setEditingObjective(null);
    loadObjectivesAndKRs(selectedPlanId);
  };
  
  const handleEditObjective = (objective) => {
    setEditingObjective(objective);
    setShowObjectiveForm(true);
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seasonal Planner</h1>
            <p className="text-gray-600">Define and track your strategic objectives.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPlanId || ''} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a Seasonal Plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowPlanForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Plan
          </Button>
        </div>
      </div>

      {selectedPlan ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Flag className="w-6 h-6 text-indigo-600"/>
                <span>{selectedPlan.name} Objectives</span>
            </h2>
            <Button onClick={() => { setEditingObjective(null); setShowObjectiveForm(true); }}>
              <Target className="w-4 h-4 mr-2" /> Add Objective
            </Button>
          </div>
          
          {objectives.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {objectives.map(obj => (
                <ObjectiveCard
                  key={obj.id}
                  objective={obj}
                  keyResults={keyResults.filter(kr => kr.objective_id === obj.id)}
                  onUpdate={() => loadObjectivesAndKRs(selectedPlanId)}
                  onEdit={() => handleEditObjective(obj)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500">No Objectives Defined</h3>
              <p className="text-gray-400 mb-4">Create your first objective for this plan to get started.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
          <TrendingUp className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Seasonal Plan Selected</h2>
          <p className="text-gray-500">Please select or create a plan to begin planning.</p>
        </div>
      )}

      {showPlanForm && <SeasonalPlanCreationForm onClose={() => setShowPlanForm(false)} onSuccess={handlePlanFormSuccess} />}
      {showObjectiveForm && <ObjectiveForm objective={editingObjective} planId={selectedPlanId} onClose={() => { setShowObjectiveForm(false); setEditingObjective(null); }} onSuccess={handleObjectiveFormSuccess} />}
    </div>
  );
}