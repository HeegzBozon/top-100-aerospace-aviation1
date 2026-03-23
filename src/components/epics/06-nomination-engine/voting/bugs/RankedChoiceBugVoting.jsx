import { useState } from 'react';
import { BugRankedVote } from '@/entities/BugRankedVote';
import { awardStardust } from '@/functions/awardStardust';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trophy, Zap } from 'lucide-react';

export default function RankedChoiceBugVoting({ bugs, currentUser, onVoteComplete }) {
  const [selectedBugs, setSelectedBugs] = useState([]);
  const [availableBugs, setAvailableBugs] = useState([...bugs]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxSelections = 5;

  const handleAdd = (bug) => {
    if (selectedBugs.length >= maxSelections) return;
    setSelectedBugs(prev => [...prev, bug]);
    setAvailableBugs(prev => prev.filter(b => b.id !== bug.id));
  };

  const handleRemove = (bug) => {
    setSelectedBugs(prev => prev.filter(b => b.id !== bug.id));
    setAvailableBugs(prev => [...prev, bug]);
  };
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedBugs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedBugs(items);
  };

  const handleSubmit = async () => {
    if (selectedBugs.length < 3) {
      alert('Please rank at least 3 bugs by urgency.');
      return;
    }
    setIsSubmitting(true);
    try {
      await BugRankedVote.create({
        voter_email: currentUser.email,
        ballot: selectedBugs.map(b => b.id),
      });
      await awardStardust({
        user_email: currentUser.email,
        action_type: 'bug_ranked_ballot',
      });
      onVoteComplete({ stardust_earned: 5 });
      setSelectedBugs([]);
      setAvailableBugs([...bugs]);
    } catch (error) {
      console.error('Error submitting ranked bug ballot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rank Bugs by Urgency</h2>
        <p className="text-gray-600 mb-4">
          Select and rank up to {maxSelections} bugs by how urgently they need to be fixed.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-full inline-flex">
          <Zap className="w-4 h-4" />
          <span>Worth 5 Stardust • Select 3-{maxSelections} bugs</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Bugs</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {availableBugs.map((bug) => (
              <div key={bug.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 truncate pr-4">{bug.subject}</p>
                  <p className="text-xs text-gray-500">Status: {bug.status}</p>
                </div>
                <button
                  onClick={() => handleAdd(bug)}
                  disabled={selectedBugs.length >= maxSelections}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Urgency Ranking ({selectedBugs.length}/{maxSelections})</h3>
          {selectedBugs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Add bugs to build your urgency ranking</p>
            </div>
          ) : (
            <>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="ranked-bugs">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 mb-6">
                      {selectedBugs.map((bug, index) => (
                        <Draggable key={bug.id} draggableId={bug.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div {...provided.dragHandleProps}><GripVertical className="w-5 h-5 text-gray-400 cursor-grab" /></div>
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 truncate">{bug.subject}</p>
                                <p className="text-xs text-gray-500">Status: {bug.status}</p>
                              </div>
                              <button onClick={() => handleRemove(bug)} className="p-1 rounded hover:bg-red-100 text-red-600">✕</button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <button
                onClick={handleSubmit}
                disabled={selectedBugs.length < 3 || isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:from-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Urgency Ranking'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}