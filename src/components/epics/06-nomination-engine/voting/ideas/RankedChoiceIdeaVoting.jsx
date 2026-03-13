import React, { useState } from 'react';
import { IdeaRankedVote } from '@/entities/IdeaRankedVote';
import { awardStardust } from '@/functions/awardStardust';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trophy, Zap, Lightbulb } from 'lucide-react';

export default function RankedChoiceIdeaVoting({ ideas, currentUser, onVoteComplete }) {
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [availableIdeas, setAvailableIdeas] = useState([...ideas]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxSelections = 5;

  const handleAdd = (idea) => {
    if (selectedIdeas.length >= maxSelections) return;
    setSelectedIdeas(prev => [...prev, idea]);
    setAvailableIdeas(prev => prev.filter(i => i.id !== idea.id));
  };

  const handleRemove = (idea) => {
    setSelectedIdeas(prev => prev.filter(i => i.id !== idea.id));
    setAvailableIdeas(prev => [...prev, idea]);
  };
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedIdeas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedIdeas(items);
  };

  const handleSubmit = async () => {
    if (selectedIdeas.length < 3) {
      alert('Please rank at least 3 ideas.');
      return;
    }
    setIsSubmitting(true);
    try {
      await IdeaRankedVote.create({
        voter_email: currentUser.email,
        ballot: selectedIdeas.map(i => i.id),
      });
      await awardStardust({
        user_email: currentUser.email,
        action_type: 'idea_ranked_ballot',
      });
      onVoteComplete({ stardust_earned: 5 });
      setSelectedIdeas([]);
      setAvailableIdeas([...ideas]);
    } catch (error) {
      console.error('Error submitting ranked idea ballot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rank Your Top Ideas</h2>
        <p className="text-gray-600 mb-4">
          Select and rank up to {maxSelections} ideas by importance.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full inline-flex">
          <Zap className="w-4 h-4" />
          <span>Worth 5 Stardust • Select 3-{maxSelections} ideas</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Ideas</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {availableIdeas.map((idea) => (
              <div key={idea.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <p className="font-semibold text-gray-800 flex-1 truncate pr-4">{idea.subject}</p>
                <button
                  onClick={() => handleAdd(idea)}
                  disabled={selectedIdeas.length >= maxSelections}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Ballot ({selectedIdeas.length}/{maxSelections})</h3>
          {selectedIdeas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Add ideas to build your ranked ballot</p>
            </div>
          ) : (
            <>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="ranked-ideas">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 mb-6">
                      {selectedIdeas.map((idea, index) => (
                        <Draggable key={idea.id} draggableId={idea.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div {...provided.dragHandleProps}><GripVertical className="w-5 h-5 text-gray-400 cursor-grab" /></div>
                              </div>
                              <p className="font-semibold text-gray-900 flex-1 truncate">{idea.subject}</p>
                              <button onClick={() => handleRemove(idea)} className="p-1 rounded hover:bg-red-100 text-red-600">✕</button>
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
                disabled={selectedIdeas.length < 3 || isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ranked Ballot'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}