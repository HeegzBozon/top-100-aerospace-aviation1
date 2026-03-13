import React, { useState, useEffect } from 'react';
import { Quest } from '@/entities/Quest';
import { UserQuest } from '@/entities/UserQuest';
import { User } from '@/entities/User';
import QuestCard from '@/components/epics/03-mission-rooms/missions/QuestCard';
import { Trophy, Sparkles, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useToast } from "@/components/ui/use-toast";

export default function QuestsPage() {
  const [quests, setQuests] = useState([]);
  const [userQuests, setUserQuests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allQuests, allUserQuests, user] = await Promise.all([
        Quest.filter({ is_active: true }),
        UserQuest.list(),
        User.me()
      ]);
      setQuests(allQuests);
      setUserQuests(allUserQuests.filter(uq => uq.user_email === user.email));
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading quests:", error);
      toast({
        variant: "destructive",
        title: "Failed to Load Quests",
        description: "There was an error loading your quests. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptQuest = async (questId) => {
    if (!currentUser) return;

    try {
      await UserQuest.create({
        quest_id: questId,
        user_email: currentUser.email,
        status: 'accepted',
        progress: []
      });
      await loadData(); // Refresh data
      toast({
        title: "Quest Accepted!",
        description: "You've successfully accepted this quest. Good luck!",
      });
    } catch (error) {
      console.error("Error accepting quest:", error);
      toast({
        variant: "destructive",
        title: "Failed to Accept Quest",
        description: error.message,
      });
    }
  };

  const handleCompleteQuest = async (questId) => {
    if (!currentUser) return;

    try {
      const userQuest = userQuests.find(uq => uq.quest_id === questId);
      if (userQuest) {
        await UserQuest.update(userQuest.id, {
          status: 'completed',
          completed_date: new Date().toISOString()
        });
        await loadData(); // Refresh data
        toast({
          title: "Quest Completed!",
          description: "Congratulations! You've successfully completed this quest.",
        });
      }
    } catch (error) {
      console.error("Error completing quest:", error);
      toast({
        variant: "destructive",
        title: "Failed to Complete Quest",
        description: error.message,
      });
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // No destination or same position
    if (!destination || 
        (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const questId = draggableId;

    try {
      // Moving from "todo" to "doing" (accepting quest)
      if (source.droppableId === 'todo' && destination.droppableId === 'doing') {
        await handleAcceptQuest(questId);
      }
      // Moving from "doing" to "done" (completing quest)
      else if (source.droppableId === 'doing' && destination.droppableId === 'done') {
        await handleCompleteQuest(questId);
      }
      // Moving from "done" back to "doing" (reopening quest)
      else if (source.droppableId === 'done' && destination.droppableId === 'doing') {
        const userQuest = userQuests.find(uq => uq.quest_id === questId);
        if (userQuest) {
          await UserQuest.update(userQuest.id, {
            status: 'in_progress',
            completed_date: null
          });
          await loadData();
          toast({
            title: "Quest Reopened",
            description: "This quest has been moved back to in progress.",
          });
        }
      }
    } catch (error) {
      console.error("Error updating quest status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update quest status. Please try again.",
      });
    }
  };

  // Categorize quests
  const availableQuests = quests.filter(q => !userQuests.some(uq => uq.quest_id === q.id));
  const acceptedQuests = quests.filter(q => {
    const userQuest = userQuests.find(uq => uq.quest_id === q.id);
    return userQuest && ['accepted', 'in_progress'].includes(userQuest.status);
  });
  const completedQuests = quests.filter(q => {
    const userQuest = userQuests.find(uq => uq.quest_id === q.id);
    return userQuest && userQuest.status === 'completed';
  });

  const renderColumn = (title, questList, droppableId, emptyMessage) => (
    <div className="flex-1">
      <h2 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
        {title}
        <span className="bg-[var(--accent)] text-white text-sm px-2 py-1 rounded-full font-bold">
          {questList.length}
        </span>
      </h2>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[400px] space-y-4 p-4 rounded-xl border-2 border-dashed transition-colors ${
              snapshot.isDraggedOver 
                ? 'border-[var(--accent)] bg-[var(--accent)]/5' 
                : 'border-[var(--border)] bg-[var(--card)]/30'
            }`}
          >
            {questList.length > 0 ? (
              questList.map((quest, index) => {
                const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
                return (
                  <Draggable key={quest.id} draggableId={quest.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-transform ${
                          snapshot.isDragging ? 'rotate-3 scale-105' : ''
                        }`}
                      >
                        <QuestCard
                          quest={quest}
                          userQuest={userQuest}
                          onAccept={handleAcceptQuest}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })
            ) : (
              <div className="text-center py-12 text-[var(--muted)]">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{emptyMessage}</p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)]">Quest Board</h1>
          <p className="text-lg text-[var(--muted)] mt-2">Drag quests between columns to manage your progress</p>
        </header>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {renderColumn(
                "To Do", 
                availableQuests, 
                "todo", 
                "No available quests. Check back later for new challenges!"
              )}
              {renderColumn(
                "Doing", 
                acceptedQuests, 
                "doing", 
                "No quests in progress. Drag a quest from 'To Do' to get started!"
              )}
              {renderColumn(
                "Done", 
                completedQuests, 
                "done", 
                "No completed quests yet. Finish some quests to see them here!"
              )}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}