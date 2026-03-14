
import React, { useState, useEffect, useMemo } from 'react';
import { Feedback } from '@/entities/Feedback';
import { InvokeLLM } from '@/integrations/Core';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Inbox,
  AlertTriangle,
  Zap,
  Calendar,
  Archive,
  Star,
  MessageSquare,
  Bug,
  Lightbulb,
  GripVertical,
  Loader2,
  Filter,
  Sparkles,
  Target,
  Brain
} from 'lucide-react';

const ItemCard = ({ item, index, suggestion, onAcceptSuggestion }) => {
    const TypeIcon = item.type === 'bug_report' ? Bug : item.type === 'idea' ? Lightbulb : MessageSquare;
    const sentimentColor = item.ai_sentiment === 'positive' ? 'bg-green-100 text-green-800' : item.ai_sentiment === 'negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
    const urgencyColor = item.ai_urgency_level === 'critical' ? 'border-red-500' : item.ai_urgency_level === 'high' ? 'border-orange-400' : 'border-gray-200';

    const getSuggestionColor = (quadrant) => {
        switch (quadrant) {
            case 'Q1_Urgent_Important': return 'border-red-400 bg-red-50';
            case 'Q2_Important_Not_Urgent': return 'border-blue-400 bg-blue-50';
            case 'Q3_Urgent_Not_Important': return 'border-yellow-400 bg-yellow-50';
            case 'Q4_Neither': return 'border-gray-400 bg-gray-50';
            default: return '';
        }
    };

    const getSuggestionLabel = (quadrant) => {
        switch (quadrant) {
            case 'Q1_Urgent_Important': return 'Do First';
            case 'Q2_Important_Not_Urgent': return 'Schedule';
            case 'Q3_Urgent_Not_Important': return 'Delegate';
            case 'Q4_Neither': return 'Eliminate';
            default: return '';
        }
    };

    return (
        <Draggable draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`bg-white rounded-lg p-3 border-2 transition-all shadow-sm hover:shadow-md relative ${
                        snapshot.isDragging 
                            ? 'shadow-lg scale-105 border-indigo-400' 
                            : suggestion 
                                ? getSuggestionColor(suggestion.recommended_quadrant)
                                : urgencyColor
                    }`}
                >
                    {/* Lt. Perry Suggestion Banner */}
                    {suggestion && !item.quadrant && (
                        <div className="absolute -top-2 -right-2 z-10">
                            <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <Sparkles className="w-3 h-3" />
                                Lt. Perry
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-2">
                        <div {...provided.dragHandleProps} className="pt-1 text-gray-300 hover:text-gray-500 cursor-grab">
                            <GripVertical className="w-4 h-4"/>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <TypeIcon className="w-4 h-4 text-gray-500" />
                                <p className="font-semibold text-sm text-gray-800 line-clamp-2">{item.subject}</p>
                            </div>
                            
                            {/* AI Suggestion Row */}
                            {suggestion && !item.quadrant && (
                                <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded-md">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-purple-700">
                                            <strong>Lt. Perry suggests:</strong> {getSuggestionLabel(suggestion.recommended_quadrant)}
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-6 px-2 text-xs border-purple-300 text-purple-600 hover:bg-purple-100"
                                            onClick={() => onAcceptSuggestion(item.id, suggestion.recommended_quadrant)}
                                        >
                                            <Target className="w-3 h-3 mr-1" />
                                            Apply
                                        </Button>
                                    </div>
                                    {suggestion.reasoning && (
                                        <p className="text-xs text-purple-600 mt-1 italic">"{suggestion.reasoning}"</p>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-1.5">
                                {item.wsjf_score != null && (
                                    <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                                        <Star className="w-3 h-3" /> {item.wsjf_score.toFixed(1)}
                                    </Badge>
                                )}
                                {item.ai_sentiment && (
                                    <Badge className={`text-xs ${sentimentColor}`}>{item.ai_sentiment}</Badge>
                                )}
                                <span className="text-xs text-gray-400">{item.user_email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

const Quadrant = ({ id, title, icon: Icon, items, bgColor, borderColor, suggestions, onAcceptSuggestion }) => {
    const suggestedItems = suggestions.filter(s => s.recommended_quadrant === id);
    
    return (
        <div className={`rounded-xl p-4 ${bgColor} relative`}>
            {/* Suggestion Badge */}
            {suggestedItems.length > 0 && (
                <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-purple-600 text-white flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {suggestedItems.length}
                    </Badge>
                </div>
            )}
            
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Icon className="w-5 h-5" /> {title}
                <span className="text-sm font-normal text-gray-500">({items.length})</span>
            </h3>
            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] rounded-md border-2 border-dashed p-2 space-y-2 transition-colors ${
                            snapshot.isDraggingOver ? `bg-white/60 ${borderColor}`: `${borderColor} border-opacity-50`
                        }`}
                    >
                        {items.map((item, index) => {
                            const suggestion = suggestions.find(s => s.item_id === item.id);
                            return (
                                <div key={item.id} className="mb-2">
                                    <ItemCard 
                                        item={item} 
                                        index={index}
                                        suggestion={suggestion}
                                        onAcceptSuggestion={onAcceptSuggestion}
                                    />
                                </div>
                            );
                        })}
                        {provided.placeholder}
                        {items.length === 0 && (
                            <div className="text-center text-gray-400 py-8 text-sm">
                                Drop items here
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default function TriageDashboard() {
    const [feedbackItems, setFeedbackItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true); // New state to disable AI if needed
    const [filters, setFilters] = useState({
        type: 'all',
        wsjf_gte: '',
        sentiment: 'all'
    });
    const { toast } = useToast();

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const items = await Feedback.list('-created_date');
            setFeedbackItems(items);
            // Only generate AI suggestions if enabled and there are untriaged items
            const untriagedItems = items.filter(item => !item.quadrant);
            if (aiSuggestionsEnabled && untriagedItems.length > 0) {
                await generateAiSuggestions(untriagedItems);
            }
        } catch (error) {
            console.error("Error loading feedback items:", error);
            toast({
                variant: "destructive",
                title: "Failed to load feedback",
                description: "Could not fetch items from the server.",
            });
        } finally {
            setLoading(false);
        }
    };

    const generateAiSuggestions = async (untriagedItems) => {
        if (untriagedItems.length === 0 || !aiSuggestionsEnabled) return;
        
        setAiSuggestionsLoading(true);
        try {
            const suggestions = [];
            
            // Process items in smaller batches with more conservative timing
            const batchSize = 2; // Reduced from 3
            let consecutiveFailures = 0;
            const MAX_CONSECUTIVE_FAILURES = 3;
            
            for (let i = 0; i < untriagedItems.length; i += batchSize) {
                // If we've had too many consecutive failures, disable AI suggestions for this session
                if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                    console.log("Too many AI failures, disabling suggestions for this session");
                    setAiSuggestionsEnabled(false);
                    toast({
                        title: "AI Suggestions Temporarily Disabled",
                        description: "Lt. Perry is having connectivity issues. Triage will work normally without AI assistance.",
                    });
                    break;
                }
                
                const batch = untriagedItems.slice(i, i + batchSize);
                
                const batchPromises = batch.map(async (item) => {
                    try {
                        const prompt = `You are 'Lt. Perry', an expert product management AI using the Eisenhower Matrix for prioritization. Analyze this feedback item and recommend which quadrant it belongs in.

Feedback Subject: "${item.subject}"
Feedback Description: "${item.description}"
Current Type: ${item.type || 'feedback'}
AI Sentiment: ${item.ai_sentiment || 'unknown'}
AI Urgency: ${item.ai_urgency_level || 'unknown'}
WSJF Score: ${item.wsjf_score || 'unscored'}

Quadrants:
- Q1_Urgent_Important: Critical items that need immediate attention
- Q2_Important_Not_Urgent: Important but can be scheduled  
- Q3_Urgent_Not_Important: Urgent but low business value
- Q4_Neither: Neither urgent nor important

Based on the content, sentiment, and urgency signals, recommend a quadrant and provide reasoning.`;

                        const result = await InvokeLLM({
                            prompt,
                            response_json_schema: {
                                type: "object",
                                properties: {
                                    recommended_quadrant: {
                                        type: "string",
                                        enum: ["Q1_Urgent_Important", "Q2_Important_Not_Urgent", "Q3_Urgent_Not_Important", "Q4_Neither"],
                                        description: "The recommended Eisenhower Matrix quadrant"
                                    },
                                    confidence: {
                                        type: "number",
                                        minimum: 0,
                                        maximum: 1,
                                        description: "Confidence in the recommendation (0-1)"
                                    },
                                    reasoning: {
                                        type: "string",
                                        description: "Brief explanation of the recommendation"
                                    }
                                },
                                required: ["recommended_quadrant", "confidence", "reasoning"]
                            }
                        });

                        consecutiveFailures = 0; // Reset failure count on success
                        
                        if (result && result.confidence > 0.6) {
                            return {
                                item_id: item.id,
                                recommended_quadrant: result.recommended_quadrant,
                                confidence: result.confidence,
                                reasoning: result.reasoning
                            };
                        }
                    } catch (error) {
                        console.error(`Failed to get AI suggestion for item ${item.id}:`, error);
                        consecutiveFailures++;
                        
                        // Check if it's a network error
                        const isNetworkError = error.message && (
                            error.message.includes('Network Error') || 
                            error.message.includes('fetch') ||
                            error.message.includes('timeout') ||
                            error.message.includes('ERR_NETWORK')
                        );
                        
                        if (isNetworkError) {
                            console.log(`Network error detected for item ${item.id}, continuing without AI suggestion`);
                        }
                    }
                    return null;
                });

                const batchResults = await Promise.all(batchPromises);
                suggestions.push(...batchResults.filter(Boolean));
                
                // Longer delay between batches to be more conservative
                if (i + batchSize < untriagedItems.length) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Increased from 100ms
                }
            }
            
            setAiSuggestions(suggestions);
            
            if (suggestions.length > 0) {
                toast({
                    title: "Lt. Perry Analysis Complete",
                    description: `Generated ${suggestions.length} smart suggestions for your review.`,
                });
            }
        } catch (error) {
            console.error("Error generating AI suggestions:", error);
            // Don't show error toast for network issues - just continue without AI
            setAiSuggestionsEnabled(false);
        } finally {
            setAiSuggestionsLoading(false);
        }
    };

    const handleAcceptSuggestion = async (itemId, quadrant) => {
        try {
            await Feedback.update(itemId, { quadrant });
            
            // Update local state
            setFeedbackItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, quadrant } : item
                )
            );
            
            // Remove the suggestion
            setAiSuggestions(prev => prev.filter(s => s.item_id !== itemId));
            
            toast({
                title: "Suggestion Applied",
                description: "Lt. Perry's recommendation has been applied successfully.",
            });
        } catch (error) {
            console.error("Error applying suggestion:", error);
            toast({
                variant: "destructive",
                title: "Failed to apply suggestion",
                description: "Could not save the quadrant assignment.",
            });
        }
    };
    
    const filteredItems = useMemo(() => {
        return feedbackItems.filter(item => {
            const typeMatch = filters.type === 'all' || !filters.type || item.type === filters.type;
            const wsjfMatch = !filters.wsjf_gte || (item.wsjf_score != null && item.wsjf_score >= parseFloat(filters.wsjf_gte));
            const sentimentMatch = filters.sentiment === 'all' || !filters.sentiment || item.ai_sentiment === filters.sentiment;
            return typeMatch && wsjfMatch && sentimentMatch;
        });
    }, [feedbackItems, filters]);

    const columns = useMemo(() => {
        const inbox = filteredItems.filter(item => !item.quadrant);
        const q1 = filteredItems.filter(item => item.quadrant === 'Q1_Urgent_Important');
        const q2 = filteredItems.filter(item => item.quadrant === 'Q2_Important_Not_Urgent');
        const q3 = filteredItems.filter(item => item.quadrant === 'Q3_Urgent_Not_Important');
        const q4 = filteredItems.filter(item => item.quadrant === 'Q4_Neither');
        
        return { inbox, q1, q2, q3, q4 };
    }, [filteredItems]);

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const item = feedbackItems.find(i => i.id === draggableId);
        const newQuadrant = destination.droppableId === 'inbox' ? null : destination.droppableId;

        // Optimistic UI update
        setFeedbackItems(prevItems =>
            prevItems.map(i =>
                i.id === draggableId ? { ...i, quadrant: newQuadrant } : i
            )
        );

        // Remove suggestion if item was moved manually
        setAiSuggestions(prev => prev.filter(s => s.item_id !== draggableId));

        try {
            await Feedback.update(draggableId, { quadrant: newQuadrant });
            toast({
                title: "Item Prioritized",
                description: `Moved "${item.subject}" to the new quadrant.`,
            });
        } catch (error) {
            console.error("Error updating feedback quadrant:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not save the new quadrant assignment.",
            });
            // Revert on failure
            setFeedbackItems(prevItems =>
                prevItems.map(i =>
                    i.id === draggableId ? { ...i, quadrant: item.quadrant } : i
                )
            );
        }
    };

    if (loading) {
        return (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        );
    }
    
    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="p-6 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Triage Command Center</h2>
                    <div className="flex items-center gap-4">
                        {/* AI Status Indicator */}
                        {!aiSuggestionsEnabled && (
                            <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                AI Offline - Manual Mode
                            </div>
                        )}
                        {aiSuggestionsLoading && (
                            <div className="flex items-center gap-2 text-purple-600 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Lt. Perry is analyzing...
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-gray-500 mb-6">
                    Drag items from the Inbox to the Eisenhower Matrix to prioritize. 
                    {aiSuggestionsEnabled ? "Lt. Perry will suggest optimal placements." : "AI suggestions temporarily unavailable - manual triage ready."}
                </p>

                {/* Filter Controls */}
                <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Filter className="h-4 w-4" />
                    Filters:
                  </div>
                  <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="w-full sm:w-[150px] text-xs">
                      <SelectValue placeholder="Item Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="bug_report">Bug Reports</SelectItem>
                      <SelectItem value="idea">Ideas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.sentiment} onValueChange={(value) => setFilters(prev => ({ ...prev, sentiment: value }))}>
                    <SelectTrigger className="w-full sm:w-[150px] text-xs">
                      <SelectValue placeholder="Sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sentiments</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <label htmlFor="wsjf_gte" className="text-xs text-gray-600 font-medium">
                      WSJF &ge;
                    </label>
                    <Input
                      id="wsjf_gte"
                      type="number"
                      value={filters.wsjf_gte}
                      onChange={(e) => setFilters(prev => ({ ...prev, wsjf_gte: e.target.value }))}
                      placeholder="e.g. 8"
                      className="h-9 w-24 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Inbox Column */}
                    <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-bold text-lg text-gray-700 mb-3 flex items-center gap-2">
                           <Inbox className="w-5 h-5"/> Inbox ({columns.inbox.length})
                           {aiSuggestions.length > 0 && (
                               <Badge className="bg-purple-100 text-purple-700 ml-2">
                                   <Sparkles className="w-3 h-3 mr-1" />
                                   {aiSuggestions.length} suggestions
                               </Badge>
                           )}
                        </h3>
                        <Droppable droppableId="inbox">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`min-h-[400px] max-h-[70vh] overflow-y-auto p-2 rounded-md bg-gray-100 border-2 border-dashed transition-colors ${snapshot.isDraggingOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'}`}
                                >
                                    {columns.inbox.map((item, index) => {
                                        const suggestion = aiSuggestions.find(s => s.item_id === item.id);
                                        return (
                                            <div key={item.id} className="mb-2">
                                                <ItemCard 
                                                    item={item} 
                                                    index={index}
                                                    suggestion={suggestion}
                                                    onAcceptSuggestion={handleAcceptSuggestion}
                                                />
                                            </div>
                                        );
                                    })}
                                    {provided.placeholder}
                                    {columns.inbox.length === 0 && (
                                        <div className="text-center text-gray-500 py-16">
                                            <p>Inbox zero!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    {/* Eisenhower Matrix */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Quadrant 
                            id="Q1_Urgent_Important" 
                            title="Do First" 
                            icon={Zap} 
                            items={columns.q1} 
                            bgColor="bg-red-50" 
                            borderColor="border-red-300"
                            suggestions={aiSuggestions}
                            onAcceptSuggestion={handleAcceptSuggestion}
                        />
                        <Quadrant 
                            id="Q2_Important_Not_Urgent" 
                            title="Schedule" 
                            icon={Calendar} 
                            items={columns.q2} 
                            bgColor="bg-blue-50" 
                            borderColor="border-blue-300"
                            suggestions={aiSuggestions}
                            onAcceptSuggestion={handleAcceptSuggestion}
                        />
                        <Quadrant 
                            id="Q3_Urgent_Not_Important" 
                            title="Delegate" 
                            icon={AlertTriangle} 
                            items={columns.q3} 
                            bgColor="bg-yellow-50" 
                            borderColor="border-yellow-300"
                            suggestions={aiSuggestions}
                            onAcceptSuggestion={handleAcceptSuggestion}
                        />
                        <Quadrant 
                            id="Q4_Neither" 
                            title="Eliminate" 
                            icon={Archive} 
                            items={columns.q4} 
                            bgColor="bg-gray-100" 
                            borderColor="border-gray-300"
                            suggestions={aiSuggestions}
                            onAcceptSuggestion={handleAcceptSuggestion}
                        />
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}
