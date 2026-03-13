
import React, { useState, useEffect } from 'react';
import { Sprint } from '@/entities/Sprint';
import { Feedback } from '@/entities/Feedback';
import { User } from '@/entities/User'; // Assuming a User entity for current user info
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Rocket, 
  Timer, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Calendar as CalendarIcon,
  Star,
  Diamond,
  Zap,
  Users,
  Trophy,
  AlertTriangle,
  Sparkles,
  BookOpen, // New icon for review
  User as UserIcon, // New icon for team members (aliased to avoid conflict with entity User)
  UserPlus, // New icon for adding team members
  Download, // New for export
  TrendingUp, // New for velocity trends
  Award, // New for achievements
  Flame // New for streak indicators
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const CountdownTimer = ({ timeLeft, onTimeUp, isActive }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const getUrgencyLevel = () => {
    if (timeLeft <= 300) return 'critical'; // 5 minutes
    if (timeLeft <= 600) return 'warning'; // 10 minutes
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();
  const urgencyColors = {
    normal: 'text-blue-600 border-blue-300 bg-blue-50',
    warning: 'text-orange-600 border-orange-300 bg-orange-50',
    critical: 'text-red-600 border-red-300 bg-red-50 animate-pulse'
  };

  if (!isActive) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border-2 ${urgencyColors[urgencyLevel]} backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <Timer className="w-5 h-5" />
        <div className="text-center">
          <div className="text-2xl font-bold font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-xs font-medium">
            {urgencyLevel === 'critical' && '🚨 Final minutes!'}
            {urgencyLevel === 'warning' && '⚡ Time is running low'}
            {urgencyLevel === 'normal' && '🚀 Sprint planning in progress'}
          </div>
        </div>
      </div>
    </div>
  );
};

// New Achievement Badge Component
const AchievementBadge = ({ icon, title, description, earned = false }) => (
  <div className={`p-4 rounded-xl border-2 transition-all ${earned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
    <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${earned ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-400'}`}>
      {icon}
    </div>
    <h4 className={`font-semibold text-sm text-center mb-1 ${earned ? 'text-yellow-800' : 'text-gray-500'}`}>{title}</h4>
    <p className={`text-xs text-center ${earned ? 'text-yellow-600' : 'text-gray-400'}`}>{description}</p>
  </div>
);

// New Velocity Trends Component
const VelocityTrends = ({ sprints }) => {
  const last5Sprints = sprints
    .filter(s => s.status === 'completed')
    .slice(0, 5)
    .reverse(); // Show most recent first conceptually, or oldest first for trend line

  if (last5Sprints.length === 0) return null;

  const maxVelocity = Math.max(...last5Sprints.map(s => s.capacity_points || 0), 1); // Ensure maxVelocity is at least 1 to avoid division by zero
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        Velocity Trends
      </h3>
      <div className="space-y-3">
        {last5Sprints.map((sprint, index) => (
          <div key={sprint.id} className="flex items-center gap-3">
            <span className="text-sm font-mono text-gray-600 w-16 truncate">{sprint.name}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
                style={{ width: `${(sprint.capacity_points / maxVelocity) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 w-8">{sprint.capacity_points}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        Average: {Math.round(last5Sprints.reduce((sum, s) => sum + s.capacity_points, 0) / last5Sprints.length)} pts
      </div>
    </div>
  );
};


// Enhanced Success Screen with Rocket Launch Animation
const SuccessScreen = ({ sprintData, achievements, onExport }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex items-center justify-center relative overflow-hidden">
    {/* Animated rocket launch */}
    <div className="absolute inset-0">
      {/* Stars */}
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            opacity: Math.random() * 0.8 + 0.2
          }}
        />
      ))}
      
      {/* Rocket animation */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 rocket-launch-animation">
        <Rocket className="w-32 h-32 text-blue-400 animate-pulse" />
        <div className="w-8 h-20 bg-gradient-to-t from-orange-500 to-red-500 mx-auto -mt-4 rounded-full animate-pulse opacity-80" />
      </div>
    </div>
    
    <div className="text-center z-10 max-w-4xl px-8">
      <div className="mb-8">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
          🚀 Mission Complete!
        </h1>
        <p className="text-2xl text-gray-300 mb-4">Sprint "{sprintData.name}" is ready for launch!</p>
      </div>
      
      {/* Achievement Badges */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
          <Award className="w-6 h-6 text-yellow-400" />
          Mission Badges Earned
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <AchievementBadge key={index} {...achievement} earned={true} />
            ))
          ) : (
            <p className="text-gray-400 col-span-full">No special achievements this time, but every sprint is a win!</p>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        <Button 
          onClick={() => onExport('pdf')}
          size="lg"
          className="text-lg px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 mr-4"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Sprint Summary (PDF)
        </Button>
        <Button 
          onClick={() => onExport('csv')}
          size="lg"
          variant="outline"
          className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-gray-900"
        >
          <Download className="w-5 h-5 mr-2" />
          Export as CSV
        </Button>
      </div>
    </div>

    <style jsx>{`
      @keyframes rocket-launch {
        0% { transform: translate(-50%, 0) scale(1); }
        50% { transform: translate(-50%, -100px) scale(1.1); }
        100% { transform: translate(-50%, -200px) scale(0.8); opacity: 0.5; }
      }
      .rocket-launch-animation {
        animation: rocket-launch 3s ease-out forwards;
      }
    `}</style>
  </div>
);

const StartScreen = ({ onStart }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex items-center justify-center relative overflow-hidden">
    {/* Animated stars background */}
    <div className="absolute inset-0">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: Math.random() * 0.8 + 0.2
          }}
        />
      ))}
    </div>
    
    <div className="text-center z-10 max-w-4xl px-8">
      <div className="mb-8">
        <Rocket className="w-24 h-24 mx-auto mb-6 text-blue-400" />
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Sprint Runner
        </h1>
        <p className="text-xl text-gray-300 mb-2">Sprint planning at the speed of thought</p>
        <p className="text-lg text-gray-400">15 minutes to go from backlog to blast-off</p>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6">Mission Overview</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <h3 className="font-semibold mb-1">Set Sprint Goal</h3>
            <p className="text-gray-400">Define your mission objective</p>
          </div>
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <h3 className="font-semibold mb-1">Select Stories</h3>
            <p className="text-gray-400">Choose your payload</p>
          </div>
          <div className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <h3 className="font-semibold mb-1">Launch Sprint</h3>
            <p className="text-gray-400">Commit and blast off</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={onStart}
          size="lg"
          className="text-xl px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
        >
          <Rocket className="w-6 h-6 mr-3" />
          Ready to Run? 🚀
        </Button>
        <p className="text-sm text-gray-500">Guided sprint planning • 15 minutes • Aerospace theme</p>
      </div>
    </div>
  </div>
);

const SetGoalStep = ({ sprintData, onSprintDataChange, backlogItems }) => {
  const goal = sprintData.goal;
  const onGoalChange = (newGoal) => onSprintDataChange(prev => ({ ...prev, goal: newGoal }));

  const generateGoalSuggestions = () => {
    const highPriorityItems = backlogItems
      .filter(item => item.wsjf_score && item.wsjf_score >= 6)
      .slice(0, 3);
    
    return highPriorityItems.map(item => 
      `Complete ${item.subject.toLowerCase()} and deliver measurable user value`
    );
  };
  const suggestions = generateGoalSuggestions();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Your Sprint Mission</h2>
        <p className="text-gray-600">One powerful sentence that defines success for this sprint</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Sprint Goal</label>
        <Textarea
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder="e.g., Deliver a seamless user onboarding experience that reduces drop-off by 20%"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg min-h-[100px]"
        />
      </div>
      
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Suggestions from your backlog:</h3>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onGoalChange(suggestion)}
                className="w-full p-3 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SelectStoriesStep = ({ backlogItems, sprintItems, onDragEnd, sprintData }) => {
  const capacity = parseInt(sprintData.capacity_points);
  const sprintName = sprintData.name;

  const allocatedPoints = sprintItems.reduce((sum, item) => sum + (item.story_points || 0), 0);
  const utilizationPercent = capacity > 0 ? Math.round((allocatedPoints / capacity) * 100) : 0;
  const isOverCapacity = utilizationPercent > 100;

  const quadrants = {
    q1: backlogItems.filter(item => item.quadrant === 'Q1_Urgent_Important'),
    q2: backlogItems.filter(item => item.quadrant === 'Q2_Important_Not_Urgent'),
    q3: backlogItems.filter(item => item.quadrant === 'Q3_Urgent_Not_Important'),
    q4: backlogItems.filter(item => item.quadrant === 'Q4_Neither' || !item.quadrant),
  };

  const BacklogQuadrant = ({ title, items, droppableId, bgColor }) => (
    <div className={`rounded-lg p-3 ${bgColor} h-64`}>
      <h4 className="font-semibold text-gray-700 text-sm mb-2">{title}</h4>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`h-48 overflow-y-auto rounded border-2 border-dashed ${
              snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <div className="p-2 space-y-1">
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-2 rounded border bg-white shadow-sm hover:shadow-md transition-all cursor-grab ${
                        snapshot.isDragging ? 'shadow-lg rotate-3 scale-105' : ''
                      }`}
                    >
                      <p className="text-xs font-medium line-clamp-2">{item.subject}</p>
                      <div className="flex justify-between items-center mt-1">
                        {item.story_points && (
                          <Badge variant="outline" className="text-xs">
                            <Diamond className="w-3 h-3 mr-1" />
                            {item.story_points}
                          </Badge>
                        )}
                        {item.wsjf_score && (
                          <Badge variant="outline" className="text-xs text-red-600">
                            <Star className="w-3 h-3 mr-1" />
                            {item.wsjf_score.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Backlog Quadrants - Left 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-center mb-4">
            <Zap className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">Select Your Payload</h2>
            <p className="text-gray-600 text-sm">Drag stories from the prioritized backlog into your sprint</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <BacklogQuadrant title="🚨 Do First" items={quadrants.q1} droppableId="q1" bgColor="bg-red-50" />
            <BacklogQuadrant title="📅 Schedule" items={quadrants.q2} droppableId="q2" bgColor="bg-blue-50" />
            <BacklogQuadrant title="⚡ Delegate" items={quadrants.q3} droppableId="q3" bgColor="bg-yellow-50" />
            <BacklogQuadrant title="🗑️ Eliminate" items={quadrants.q4} droppableId="q4" bgColor="bg-gray-50" />
          </div>
        </div>

        {/* Sprint Container - Right 1/3 */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-indigo-600 to-purple-700 text-white rounded-xl p-4 h-full">
            <div className="text-center mb-4">
              <Rocket className="w-10 h-10 mx-auto mb-2" />
              <h3 className="text-xl font-bold">{sprintName || 'Current Sprint'}</h3>
            </div>
            
            {/* Capacity Gauge */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span>Capacity</span>
                <span className={`font-bold ${isOverCapacity ? 'text-red-300' : 'text-green-300'}`}>
                  {allocatedPoints}/{capacity} pts
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isOverCapacity ? 'bg-red-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                />
              </div>
              <div className="text-center text-xs mt-1 opacity-80">
                {utilizationPercent}% utilized
              </div>
            </div>

            {/* Sprint Items Drop Zone */}
            <Droppable droppableId="sprint">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-96 rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver 
                      ? 'border-white bg-white/10' 
                      : 'border-white/30'
                  }`}
                >
                  <div className="p-3 space-y-2">
                    {sprintItems.length === 0 ? (
                      <div className="text-center text-white/60 py-12">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Drop stories here to add to sprint</p>
                      </div>
                    ) : (
                      sprintItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              className={`p-2 rounded bg-white/90 text-gray-800 shadow hover:shadow-md transition-all cursor-grab ${
                                snapshot.isDragging ? 'shadow-lg scale-105' : ''
                              }`}
                            >
                              <p className="text-sm font-medium line-clamp-2">{item.subject}</p>
                              <div className="flex justify-between items-center mt-1">
                                {item.story_points && (
                                  <Badge className="text-xs bg-gray-200 text-gray-700">
                                    <Diamond className="w-3 h-3 mr-1" />
                                    {item.story_points}
                                  </Badge>
                                )}
                                {item.wsjf_score && (
                                  <Badge className="text-xs bg-red-100 text-red-700">
                                    <Star className="w-3 h-3 mr-1" />
                                    {item.wsjf_score.toFixed(1)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

const AssignOwnershipStep = ({ sprintItems, onAssignmentChange, teamMembers, onTeamMemberAdd, onTeamMemberRemove }) => {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  const getTeamMemberLoad = (memberEmail) => {
    const assignedItems = sprintItems.filter(item => item.assignedTo === memberEmail);
    return assignedItems.reduce((sum, item) => sum + (item.story_points || 0), 0);
  };

  const getUnassignedItems = () => sprintItems.filter(item => !item.assignedTo);
  
  const handleAddMember = () => {
    if (newMemberEmail.trim() && !teamMembers.some(m => m.email === newMemberEmail.trim())) {
      onTeamMemberAdd({
        email: newMemberEmail.trim(),
        name: newMemberEmail.split('@')[0] // Simple name extraction
      });
      setNewMemberEmail('');
      setShowAddMember(false);
    }
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    // Only allow assignment if the item is being dragged into a team member's droppable area
    // or back to the unassigned area.
    if (destination.droppableId === 'unassigned' || teamMembers.some(m => m.email === destination.droppableId)) {
        const assignedTo = destination.droppableId === 'unassigned' ? null : destination.droppableId;
        onAssignmentChange(draggableId, assignedTo);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Assign Mission Crew</h2>
          <p className="text-gray-600">Distribute stories to team members and balance the workload</p>
        </div>

        {/* Team Members Management */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Team Members</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddMember(!showAddMember)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </Button>
          </div>

          {showAddMember && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter team member email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                  className="flex-1"
                />
                <Button onClick={handleAddMember}>Add</Button>
                <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => {
              const load = getTeamMemberLoad(member.email);
              const assignedItems = sprintItems.filter(item => item.assignedTo === member.email);
              const isOverloaded = load > 20; // Assume 20 points is high load
              
              return (
                <div key={member.email} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTeamMemberRemove(member.email)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Workload</span>
                      <span className={isOverloaded ? 'text-red-600 font-bold' : 'text-gray-600'}>
                        {load} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          isOverloaded ? 'bg-red-500' : load > 15 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((load / 25) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <Droppable droppableId={member.email} type="STORY_ASSIGNMENT">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[100px] border-2 border-dashed rounded-lg p-2 transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'border-indigo-400 bg-indigo-50' 
                            : 'border-gray-300'
                        }`}
                      >
                        {assignedItems.length === 0 ? (
                          <div className="text-center text-gray-500 py-4 text-xs">
                            Drop stories here
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {assignedItems.map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-2 bg-white rounded border text-xs transition-all ${
                                      snapshot.isDragging ? 'shadow-lg scale-105' : 'shadow-sm'
                                    }`}
                                  >
                                    <p className="font-medium line-clamp-2">{item.subject}</p>
                                    {item.story_points && (
                                      <div className="flex items-center gap-1 mt-1 text-gray-500">
                                        <Diamond className="w-3 h-3" />
                                        <span>{item.story_points} pts</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unassigned Stories */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Unassigned Stories</h3>
          <Droppable droppableId="unassigned" type="STORY_ASSIGNMENT">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[150px] border-2 border-dashed rounded-lg p-4 transition-colors ${
                  snapshot.isDraggingOver 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-300'
                }`}
              >
                {getUnassignedItems().length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p>All stories assigned! Great work.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getUnassignedItems().map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 bg-gray-50 rounded-lg border transition-all ${
                              snapshot.isDragging ? 'shadow-lg scale-105 bg-white' : 'shadow-sm'
                            }`}
                          >
                            <p className="font-medium text-sm line-clamp-2">{item.subject}</p>
                            {item.story_points && (
                              <div className="flex items-center gap-1 mt-2 text-gray-500">
                                <Diamond className="w-3 h-3" />
                                <span className="text-xs">{item.story_points} pts</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Load Balancing Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Team Load Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {teamMembers.filter(member => getTeamMemberLoad(member.email) > 20).length}
              </p>
              <p className="text-sm text-gray-600">Overloaded Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {teamMembers.length > 0 ? Math.round(sprintItems.reduce((sum, item) => sum + (item.story_points || 0), 0) / teamMembers.length) : 0}
              </p>
              <p className="text-sm text-gray-600">Avg Points per Member</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {getUnassignedItems().length}
              </p>
              <p className="text-sm text-gray-600">Unassigned Stories</p>
            </div>
          </div>
          
          {teamMembers.some(member => getTeamMemberLoad(member.email) > 20) && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Some team members may be overloaded. Consider redistributing stories.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DragDropContext>
  );
};

// Enhanced Confirm Step with Insights
const ConfirmStep = ({ 
  sprintData, 
  sprintItems, 
  onConfirm, 
  loading, 
  onLessonsLearnedChange,
  sprints,
  teamMembers 
}) => {
  const totalPoints = sprintItems.reduce((sum, item) => sum + (item.story_points || 0), 0);
  const completedSprints = sprints.filter(s => s.status === 'completed' && s.capacity_points > 0);
  const avgVelocity = completedSprints.length > 0 
    ? Math.round(completedSprints.reduce((sum, s) => sum + s.capacity_points, 0) / completedSprints.length)
    : 0;
  
  // Calculate insights
  const isOverAverageCapacity = avgVelocity > 0 && totalPoints > avgVelocity * 1.1; // 10% over avg
  const isUnderCapacity = parseInt(sprintData.capacity_points) > 0 && totalPoints < parseInt(sprintData.capacity_points) * 0.8; // 20% under defined capacity
  const hasUnassignedWork = sprintItems.some(item => !item.assignedTo);
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Pre-Launch Checklist</h2>
        <p className="text-gray-600">Review your mission parameters before blast-off</p>
      </div>
      
      {/* Sprint Summary with Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">Mission Summary</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3 text-sm">
              <div><strong>Mission:</strong> {sprintData.name}</div>
              <div><strong>Objective:</strong> {sprintData.goal || 'No specific goal set'}</div>
              <div><strong>Duration:</strong> {format(sprintData.start_date, 'MMM d')} - {format(sprintData.end_date, 'MMM d')}</div>
            </div>
          </div>
          <div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <strong>Capacity:</strong> 
                <span className={totalPoints > parseInt(sprintData.capacity_points) ? 'text-red-600 font-bold' : 'text-green-600'}>
                  {totalPoints}/{sprintData.capacity_points} points
                </span>
              </div>
              <div><strong>Stories Selected:</strong> {sprintItems.length}</div>
              <div><strong>Team Size:</strong> {teamMembers.length} members</div>
            </div>
          </div>
        </div>
        
        {/* Insights Panel */}
        {(isOverAverageCapacity || isUnderCapacity || hasUnassignedWork) && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Mission Control Insights
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {isOverAverageCapacity && avgVelocity > 0 && (
                <li>• This sprint is {Math.round(((totalPoints / avgVelocity) - 1) * 100)}% above your average velocity of {avgVelocity} points. Consider if this is realistic.</li>
              )}
              {isUnderCapacity && (
                <li>• Consider adding more work - you're only at {Math.round((totalPoints / parseInt(sprintData.capacity_points)) * 100)}% of your declared capacity.</li>
              )}
              {hasUnassignedWork && (
                <li>• Some stories are unassigned - consider distributing workload to team members.</li>
              )}
            </ul>
          </div>
        )}
        {!(isOverAverageCapacity || isUnderCapacity || hasUnassignedWork) && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Optimal Configuration
            </h4>
            <p className="text-sm text-green-700">Your sprint configuration looks well-balanced. Ready for launch!</p>
          </div>
        )}
      </div>

      {/* Velocity Trends */}
      {avgVelocity > 0 && <VelocityTrends sprints={sprints} />}

      {/* Selected Stories with Enhanced View */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Mission Payload ({sprintItems.length} stories)</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {sprintItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>No stories selected for this sprint</p>
            </div>
          ) : (
            sprintItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{item.subject}</div>
                  {item.assignedTo && (
                    <div className="text-sm text-gray-500">Assigned to: {teamMembers.find(m => m.email === item.assignedTo)?.name || item.assignedTo.split('@')[0]}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {item.wsjf_score && (
                    <div className="flex items-center gap-1 text-sm font-bold text-red-500">
                      <Star className="w-3 h-3" />
                      {item.wsjf_score.toFixed(1)}
                    </div>
                  )}
                  {item.story_points && (
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-600">
                      <Diamond className="w-3 h-3" />
                      {item.story_points}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lessons Learned Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Capture Lessons for Next Mission
        </h3>
        <p className="text-sm text-gray-600 mb-4">What's one thing we can improve upon in our next sprint?</p>
        <Textarea
          value={sprintData.lessons_learned || ''}
          onChange={(e) => onLessonsLearnedChange(e.target.value)}
          placeholder="e.g., 'Improve communication on backend changes to avoid frontend rework...'"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
        />
      </div>
      
      {/* Launch Button */}
      <div className="text-center">
        <Button 
          onClick={onConfirm} 
          disabled={loading}
          size="lg"
          className="text-xl px-12 py-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-xl transform hover:scale-105 transition-all"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Launching Mission...
            </>
          ) : (
            <>
              <Rocket className="w-6 h-6 mr-3" />
              🚀 Launch Sprint Mission
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const ReviewPreviousSprintStep = ({ previousSprint }) => {
  if (!previousSprint) {
    return (
      <div className="text-center max-w-2xl mx-auto">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">First Mission!</h2>
        <p className="text-gray-600">No previous sprint data found. You're embarking on a brand new journey. Let's set a great precedent!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Previous Mission Debrief</h2>
        <p className="text-gray-600">Reviewing "{previousSprint.name}" to inform our next flight plan.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Velocity</p>
              <p className="text-2xl font-bold text-blue-600">{previousSprint.completed_points} / {previousSprint.capacity_points} <span className="text-lg font-medium text-gray-500">pts</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">{Math.round(previousSprint.completion_rate)}%</p>
              <p className="text-xs text-gray-500">
                {previousSprint.total_stories_count > 0 ? 
                  `${previousSprint.completed_points_count} of ${previousSprint.total_stories_count} stories` :
                  'No stories in sprint'
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Previous Goal</h3>
          <p className="italic text-gray-700">"{previousSprint.goal || 'No goal was set.'}"</p>
        </div>
      </div>
      
      {previousSprint.lessons_learned && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5"/>
            Lessons Learned
          </h3>
          <p className="text-yellow-700">{previousSprint.lessons_learned}</p>
        </div>
      )}
    </div>
  );
};


export default function SprintWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState('start');
  const [sprints, setSprints] = useState([]);
  const [backlogItems, setBacklogItems] = useState([]);
  const [sprintItems, setSprintItems] = useState([]);
  const [previousSprint, setPreviousSprint] = useState(null);
  const [sprintData, setSprintData] = useState({
    name: '',
    goal: '',
    capacity_points: '40', // Changed to string as it comes from input
    start_date: new Date(),
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    status: 'planning',
    lessons_learned: ''
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [achievements, setAchievements] = useState([]);

  // Load all sprints (for naming) on component mount
  useEffect(() => {
    loadSprints();
    loadBacklogData(); // Load initial backlog items
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const loadSprints = async () => {
    try {
      const allSprints = await Sprint.list('-start_date'); // Order by start_date descending
      setSprints(allSprints);
    } catch (error) {
      console.error('Error loading all sprints:', error);
    }
  };

  const loadBacklogData = async () => {
    try {
      const feedback = await Feedback.list('-wsjf_score');
      // Filter for items not assigned to any sprint
      const unplannedFeedback = feedback.filter(item => !item.sprint_id);
      setBacklogItems(unplannedFeedback);
    } catch (error) {
      console.error('Error loading backlog:', error);
    }
  };

  const loadPreviousSprintData = async () => {
    try {
      const completedSprints = await Sprint.filter({ status: 'completed' }, '-end_date', 1); // Get the latest completed sprint
      if (completedSprints.length > 0) {
        const lastSprint = completedSprints[0];
        const itemsInSprint = await Feedback.filter({ sprint_id: lastSprint.id });
        const completedItems = itemsInSprint.filter(item => item.status === 'resolved' || item.status === 'done');
        const completedPoints = completedItems.reduce((sum, item) => sum + (item.story_points || 0), 0);
        const completionRate = itemsInSprint.length > 0 ? (completedItems.length / itemsInSprint.length) * 100 : 0;
        
        setPreviousSprint({
          ...lastSprint,
          completed_points: completedPoints,
          completed_points_count: completedItems.length,
          completion_rate: completionRate,
          total_stories_count: itemsInSprint.length
        });
      } else {
        setPreviousSprint(null); // No previous completed sprint found
      }
    } catch (error) {
      console.error("Error loading previous sprint data:", error);
      alert('Could not load previous sprint data. Please check console for details.');
      setPreviousSprint(null); // Ensure state is reset on error
    }
  };

  const handleStart = async () => {
    await loadPreviousSprintData(); // Load previous sprint info for review step
    setCurrentStep('reviewPreviousSprint');
    setTimerActive(true); // Timer starts from this step
    
    // Generate default sprint name based on existing sprints count
    const sprintNumber = sprints.length + 1;
    const currentYear = new Date().getFullYear();
    const defaultName = `Sprint ${currentYear.toString().slice(-2)}.${sprintNumber.toString().padStart(2, '0')}`;
    
    setSprintData(prev => ({
      ...prev,
      name: defaultName,
      // Dates are already initialized in state, so no need to reset unless we change logic
    }));

    // Initialize with current user if available
    try {
      const currentUser = await User.me();
      if (currentUser) {
        setTeamMembers([{
          email: currentUser.email,
          name: currentUser.full_name || currentUser.email.split('@')[0]
        }]);
      } else {
        setTeamMembers([]); // No current user, start with empty team
      }
    } catch (error) {
      console.warn("Could not load current user, starting with empty team:", error);
      setTeamMembers([]);
    }
  };

  const handleNext = () => {
    if (currentStep === 'reviewPreviousSprint') {
      setCurrentStep('setGoal');
      return;
    }
    if (currentStep === 'setGoal') setCurrentStep('selectStories');
    if (currentStep === 'selectStories') setCurrentStep('assignOwnership');
    if (currentStep === 'assignOwnership') setCurrentStep('confirm');
  };

  const handleBack = () => {
    if (currentStep === 'setGoal') setCurrentStep('reviewPreviousSprint');
    if (currentStep === 'selectStories') setCurrentStep('setGoal');
    if (currentStep === 'assignOwnership') setCurrentStep('selectStories');
    if (currentStep === 'confirm') setCurrentStep('assignOwnership');
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const draggedItem = [...backlogItems, ...sprintItems].find(item => item.id === draggableId);
    if (!draggedItem) return;

    if (destination.droppableId === 'sprint') {
      // Move to sprint
      if (source.droppableId !== 'sprint') {
        if (!sprintItems.some(item => item.id === draggedItem.id)) {
            setSprintItems(prev => [...prev, draggedItem]);
            setBacklogItems(prev => prev.filter(item => item.id !== draggableId));
        }
      } else {
        // Reorder within sprint
        const newSprintItems = Array.from(sprintItems);
        const [reorderedItem] = newSprintItems.splice(source.index, 1);
        newSprintItems.splice(destination.index, 0, reorderedItem);
        setSprintItems(newSprintItems);
      }
    } else {
      // Moving back to backlog or reordering within a backlog quadrant
      if (source.droppableId === 'sprint') {
        if (!backlogItems.some(item => item.id === draggedItem.id)) {
            setBacklogItems(prev => [...prev, draggedItem]);
        }
        setSprintItems(prev => prev.filter(item => item.id !== draggableId));
      } else {
        // Reordering within backlog quadrants (handled by re-filtering)
      }
    }
  };

  const handleAssignmentChange = (storyId, assignedTo) => {
    setSprintItems(prev => prev.map(item => 
      item.id === storyId ? { ...item, assignedTo } : item
    ));
  };

  const handleTeamMemberAdd = (member) => {
    setTeamMembers(prev => {
      // Prevent adding duplicate members based on email
      if (prev.some(m => m.email === member.email)) {
        return prev;
      }
      return [...prev, member];
    });
  };

  const handleTeamMemberRemove = (memberEmail) => {
    setTeamMembers(prev => prev.filter(m => m.email !== memberEmail));
    // Unassign all stories from this member
    setSprintItems(prev => prev.map(item => 
      item.assignedTo === memberEmail ? { ...item, assignedTo: null } : item
    ));
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Create the sprint
      const newSprint = await Sprint.create({
        name: sprintData.name,
        goal: sprintData.goal,
        capacity_points: parseInt(sprintData.capacity_points),
        start_date: sprintData.start_date.toISOString().split('T')[0],
        end_date: sprintData.end_date.toISOString().split('T')[0],
        status: 'planning',
        lessons_learned: sprintData.lessons_learned || ''
      });

      // Assign selected items to the sprint, including their assignedTo property
      await Promise.all(
        sprintItems.map(item => 
          Feedback.update(item.id, { 
            sprint_id: newSprint.id,
            assignee_email: item.assignedTo || null // Save assignment, or null if unassigned
          })
        )
      );

      // Calculate achievements
      const earnedAchievements = [];
      
      // Time-based achievement
      const timeUsed = (15 * 60) - timeLeft;
      if (timeUsed < 600) { // Under 10 minutes
        earnedAchievements.push({
          icon: <Zap className="w-6 h-6" />,
          title: "Speed Demon",
          description: "Completed planning in under 10 minutes"
        });
      }
      
      // Team collaboration achievement
      if (sprintItems.length > 0 && sprintItems.every(item => item.assignedTo)) {
        earnedAchievements.push({
          icon: <Users className="w-6 h-6" />,
          title: "Mission Commander",
          description: "Assigned all work to team members"
        });
      }
      
      // Capacity optimization achievement
      const totalAllocatedPoints = sprintItems.reduce((sum, item) => sum + (item.story_points || 0), 0);
      const sprintCapacity = parseInt(sprintData.capacity_points);
      const utilization = sprintCapacity > 0 ? totalAllocatedPoints / sprintCapacity : 0;
      if (utilization >= 0.9 && utilization <= 1.0) { // 90-100% utilization
        earnedAchievements.push({
          icon: <Target className="w-6 h-6" />,
          title: "Perfect Balance",
          description: "Optimal capacity utilization"
        });
      } else if (utilization >= 0.8 && utilization < 0.9) { // 80-90% utilization
        earnedAchievements.push({
          icon: <Flame className="w-6 h-6" />,
          title: "Well-Fueled Flight",
          description: "Achieved good capacity utilization"
        });
      }

      setAchievements(earnedAchievements);
      // Show success screen with achievements
      setCurrentStep('success');

    } catch (error) {
      console.error('Error creating sprint:', error);
      alert('Error creating sprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = async (format) => {
    try {
      if (format === 'pdf') {
        // Generate PDF summary (simplified to plain text for this example)
        const summaryText = `
SPRINT SUMMARY
=============
Sprint: ${sprintData.name}
Goal: ${sprintData.goal || 'No goal set'}
Duration: ${format(sprintData.start_date, 'MMM d, yyyy')} - ${format(sprintData.end_date, 'MMM d, yyyy')}
Capacity: ${sprintData.capacity_points} points
Stories Selected: ${sprintItems.length}
Total Points Allocated: ${sprintItems.reduce((sum, item) => sum + (item.story_points || 0), 0)}
Team Members: ${teamMembers.length}

Lessons Learned: ${sprintData.lessons_learned || 'N/A'}

---
SELECTED STORIES:
${sprintItems.map(item => `• ${item.subject} (${item.story_points || 0} pts) - ${item.assignedTo ? (teamMembers.find(m => m.email === item.assignedTo)?.name || item.assignedTo.split('@')[0]) : 'Unassigned'}`).join('\n')}

---
ACHIEVEMENTS:
${achievements.length > 0 ? achievements.map(a => `🏆 ${a.title}: ${a.description}`).join('\n') : 'No special achievements.'}
        `;
        
        const blob = new Blob([summaryText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sprintData.name}_Summary.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
      } else if (format === 'csv') {
        // Generate CSV
        const csvContent = [
          ['Story', 'Points', 'Assigned To', 'WSJF Score', 'Quadrant'],
          ...sprintItems.map(item => [
            `"${item.subject.replace(/"/g, '""')}"`, // Escape double quotes
            item.story_points || 0,
            item.assignedTo ? (teamMembers.find(m => m.email === item.assignedTo)?.name || item.assignedTo.split('@')[0]) : 'Unassigned',
            item.wsjf_score || '',
            item.quadrant || 'N/A'
          ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sprintData.name}_Stories.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (currentStep === 'start') {
    return <StartScreen onStart={handleStart} />;
  }

  if (currentStep === 'success') {
    return (
      <SuccessScreen 
        sprintData={sprintData} 
        achievements={achievements}
        onExport={handleExport}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 flex flex-col">
      <CountdownTimer 
        timeLeft={timeLeft} 
        onTimeUp={() => alert('Time is up! Consider wrapping up your sprint planning.')}
        isActive={timerActive}
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Rocket className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sprint Runner</h1>
              <p className="text-sm text-gray-600">
                {currentStep === 'reviewPreviousSprint' && 'Debrief: Learning from the past'}
                {currentStep === 'setGoal' && 'Step 1: Define your mission'}
                {currentStep === 'selectStories' && 'Step 2: Select your payload'}
                {currentStep === 'assignOwnership' && 'Step 3: Assign your crew'}
                {currentStep === 'confirm' && 'Step 4: Final systems check'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onCancel}>
              Abort Mission
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Wizard Steps */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto"> {/* Centering content within the left pane */}
            {currentStep === 'reviewPreviousSprint' && (
              <ReviewPreviousSprintStep 
                previousSprint={previousSprint} 
              />
            )}
            {currentStep === 'setGoal' && (
              <SetGoalStep
                sprintData={sprintData}
                onSprintDataChange={setSprintData}
                backlogItems={backlogItems}
              />
            )}
            
            {currentStep === 'selectStories' && (
              <SelectStoriesStep 
                backlogItems={backlogItems}
                sprintItems={sprintItems}
                onDragEnd={handleDragEnd}
                sprintData={sprintData}
              />
            )}

            {currentStep === 'assignOwnership' && (
              <AssignOwnershipStep 
                sprintItems={sprintItems}
                onAssignmentChange={handleAssignmentChange}
                teamMembers={teamMembers}
                onTeamMemberAdd={handleTeamMemberAdd}
                onTeamMemberRemove={handleTeamMemberRemove}
              />
            )}
            
            {currentStep === 'confirm' && (
              <ConfirmStep 
                sprintData={sprintData}
                sprintItems={sprintItems}
                onConfirm={handleConfirm}
                loading={loading}
                onLessonsLearnedChange={(lessons) => setSprintData(prev => ({...prev, lessons_learned: lessons}))}
                sprints={sprints}
                teamMembers={teamMembers}
              />
            )}
          </div>
        </div>
        
        {/* Right side - Live Sprint Summary */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
          <div className="sticky top-0"> {/* Sticky at the top of the right pane */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-600" />
              Mission Control
            </h3>
            
            {/* Sprint Details */}
            <div className="bg-white rounded-lg p-4 shadow-sm border mb-4">
              <div className="space-y-3 text-sm">
                <div><strong>Sprint:</strong> {sprintData.name || 'Unnamed Sprint'}</div>
                <div><strong>Goal:</strong> {sprintData.goal || 'No goal set'}</div>
                <div className="flex items-center gap-2">
                  <strong>Capacity:</strong>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        sprintItems.reduce((sum, item) => sum + (item.story_points || 0), 0) > parseInt(sprintData.capacity_points) 
                          ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min((sprintItems.reduce((sum, item) => sum + (item.story_points || 0), 0) / parseInt(sprintData.capacity_points)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                <div className="text-center text-xs text-gray-500">
                  {sprintItems.reduce((sum, item) => sum + (item.story_points || 0), 0)}/{sprintData.capacity_points} points
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{sprintItems.length}</div>
                <div className="text-xs text-blue-500">Stories</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{teamMembers.length}</div>
                <div className="text-xs text-green-500">Team Members</div>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="space-y-2">
              {[
                { id: 'reviewPreviousSprint', label: 'Review Previous', icon: BookOpen },
                { id: 'setGoal', label: 'Set Goal', icon: Target },
                { id: 'selectStories', label: 'Select Stories', icon: Zap },
                { id: 'assignOwnership', label: 'Assign Work', icon: Users },
                { id: 'confirm', label: 'Launch', icon: Rocket }
              ].map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const stepOrder = ['reviewPreviousSprint', 'setGoal', 'selectStories', 'assignOwnership', 'confirm'];
                const isCompleted = stepOrder.indexOf(step.id) < stepOrder.indexOf(currentStep);
                
                return (
                  <div key={step.id} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 'text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                    {isCompleted && <CheckCircle className="w-4 h-4 ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-40"> {/* Adjusted z-index if needed */}
        <div className="max-w-7xl mx-auto flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 'reviewPreviousSprint'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={
              (currentStep === 'setGoal' && !sprintData.goal.trim()) ||
              (currentStep === 'assignOwnership' && teamMembers.length === 0) ||
              currentStep === 'confirm' // Confirm step calls its own handler
            }
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {currentStep === 'confirm' ? 'Launch Sprint' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
