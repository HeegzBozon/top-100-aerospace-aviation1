
import React, { useState, useEffect } from 'react';
import { Feedback } from '@/entities/Feedback';
import { Feature } from '@/entities/Feature';
import { InvokeLLM } from '@/integrations/Core';
import { X, Loader2, Info, Bug, MessageSquare, ArrowUp, Star, Diamond, Sparkles, FileText, ChevronDown, Lightbulb, Tag, Settings, ClipboardList } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WSJF_DESCRIPTIONS = {
  business_value: "Impact on revenue, retention, or brand.",
  time_criticality: "Penalty for delay; deadlines/events.",
  risk_reduction: "Risk reduction or opportunity unlocked.",
  job_size: "Relative effort; smaller is better.",
};

const getWsjfColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-800';
    if (score >= 8) return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
    if (score >= 4) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
};

const ScoreSlider = ({ label, value, onValueChange, description }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2 group cursor-help" title={description}>
        {label}
        <Info className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
      </label>
      <span className="text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full min-w-[3rem] text-center">
        {value}
      </span>
    </div>
    <div className="relative">
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onValueChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(value - 1) * 11.11}%, #e5e7eb ${(value - 1) * 11.11}%, #e5e7eb 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  </div>
);

export default function FeedbackTriageModal({ feedback, users, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    status: feedback?.status || 'new',
    priority: feedback?.priority || 'medium',
    assignee_email: feedback?.assignee_email || '',
    business_value: feedback?.business_value || 1,
    time_criticality: feedback?.time_criticality || 1,
    risk_reduction: feedback?.risk_reduction || 1,
    job_size: feedback?.job_size || 1,
    wsjf_notes: feedback?.wsjf_notes || '',
    story_points: feedback?.story_points || '',
    feature_id: feedback?.feature_id || '',
    type: feedback?.type || 'feedback',
    tags: feedback?.tags || [],
  });
  const [wsjfScore, setWsjfScore] = useState(feedback?.wsjf_score || 0);
  const [loading, setLoading] = useState(false);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [features, setFeatures] = useState([]);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [aiScoringLoading, setAiScoringLoading] = useState(false);
  const [aiClassificationLoading, setAiClassificationLoading] = useState(false);
  const [aiSentimentLoading, setAiSentimentLoading] = useState(false);
  const [aiTagsLoading, setAiTagsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiClassificationSuggestion, setAiClassificationSuggestion] = useState(null);
  const [aiSentimentAnalysis, setAiSentimentAnalysis] = useState(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const generateSummary = async () => {
      if (!feedback.description || feedback.description.length < 20) {
          setSummary(feedback.subject);
          setSummaryLoading(false);
          return;
      }
      try {
        const result = await InvokeLLM({
          prompt: `Analyze the following user feedback and summarize its core problem or request into a concise, accurate 6-word story.
          \n\nFEEDBACK: "${feedback.description}"`,
          response_json_schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "The 6-word story summary."
              }
            },
            required: ["summary"]
          }
        });
        setSummary(result.summary || 'Could not generate summary.');
      } catch (error) {
        console.error("Failed to generate summary:", error);
        setSummary("Summary could not be generated.");
      } finally {
        setSummaryLoading(false);
      }
    };

    const suggestWsjfScores = async () => {
      // Don't re-suggest if the user has already saved custom values
      if (feedback.wsjf_score !== undefined && feedback.wsjf_score !== null && feedback.wsjf_score > 0) {
        return;
      }
      setAiScoringLoading(true);
      try {
        const prompt = `You are an expert product manager bot, 'Lt. Perry'. Analyze the following user feedback item and provide a Weighted Shortest Job First (WSJF) score assessment.

Feedback Subject: "${feedback.subject}"
Feedback Description: "${feedback.description}"

Based on the content, please provide your best estimate for the following values on a scale of 1 to 10 (integers only):
- Business Value: How much does this impact our business goals (revenue, market share, user satisfaction)? 1 is low, 10 is high.
- Time Criticality: How urgent is this? Is there a fixed deadline or a rapidly closing window of opportunity? 1 is not urgent, 10 is extremely urgent.
- Risk Reduction / Opportunity Enablement: Does this reduce significant technical, business, or security risks? Or does it enable new opportunities? 1 is low impact, 10 is high impact.
- Job Size (Effort): How large and complex is this to implement? 1 is trivial, 10 is a massive effort.

Return your assessment as a JSON object.`;

        const result = await InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              business_value: { type: "integer", minimum: 1, maximum: 10, description: "Business Value score" },
              time_criticality: { type: "integer", minimum: 1, maximum: 10, description: "Time Criticality score" },
              risk_reduction: { type: "integer", minimum: 1, maximum: 10, description: "Risk Reduction score" },
              job_size: { type: "integer", minimum: 1, maximum: 10, description: "Job Size score" }
            },
            required: ["business_value", "time_criticality", "risk_reduction", "job_size"]
          }
        });

        if (result) {
          const suggestions = {
            business_value: Math.max(1, Math.min(10, Math.round(result.business_value))),
            time_criticality: Math.max(1, Math.min(10, Math.round(result.time_criticality))),
            risk_reduction: Math.max(1, Math.min(10, Math.round(result.risk_reduction))),
            job_size: Math.max(1, Math.min(10, Math.round(result.job_size))),
          };
          setFormData(prev => ({ ...prev, ...suggestions }));
          setAiSuggestion(suggestions); // Store the applied suggestions
        }
      } catch (error) {
        console.error("Failed to get AI-suggested WSJF scores:", error);
      } finally {
        setAiScoringLoading(false);
      }
    };

    const classifyFeedbackType = async () => {
      // Don't re-classify if the user has already saved a type or if it's already been classified
      if (feedback.type && feedback.type !== 'feedback') {
        return;
      }
      
      setAiClassificationLoading(true);
      try {
        const prompt = `You are 'Lt. Perry', an expert product management AI. Analyze the following user submission and classify it into one of these categories:

Feedback Subject: "${feedback.subject}"
Feedback Description: "${feedback.description}"

Categories:
- "bug_report": Technical issues, errors, crashes, things not working as expected
- "idea": Feature requests, suggestions for improvements, new functionality proposals
- "feedback": General comments, user experience observations, or unclear submissions

Based on the language, tone, and content, classify this submission. Look for:
- Bug reports: Words like "error", "broken", "crash", "doesn't work", "fails"
- Ideas: Words like "could", "should", "feature", "suggest", "would be nice", "improvement"
- Feedback: General observations, unclear requests, or mixed content

Return your classification as a JSON object.`;

        const result = await InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              type: { 
                type: "string", 
                enum: ["bug_report", "idea", "feedback"],
                description: "The classified type of the submission" 
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description: "Confidence level in the classification (0-1)"
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of why this classification was chosen"
              }
            },
            required: ["type", "confidence", "reasoning"]
          }
        });

        if (result && result.confidence > 0.6) { // Only apply if reasonably confident
          setFormData(prev => ({ ...prev, type: result.type }));
          setAiClassificationSuggestion(result);
        }
      } catch (error) {
        console.error("Failed to get AI classification:", error);
      } finally {
        setAiClassificationLoading(false);
      }
    };

    const analyzeSentiment = async () => {
      // Don't re-analyze if we already have AI sentiment data on the feedback object
      if (feedback.ai_sentiment && feedback.ai_urgency_level) {
        setAiSentimentAnalysis({
          sentiment: feedback.ai_sentiment,
          urgency_level: feedback.ai_urgency_level,
          confidence_score: feedback.ai_confidence_score || 0,
          emotional_indicators: [], // We don't store this, but keep for display consistency
          reasoning: feedback.ai_sentiment_reasoning || '',
        });
        setAiSentimentLoading(false);
        return;
      }
      
      setAiSentimentLoading(true);
      try {
        const prompt = `You are 'Lt. Perry', an expert product management AI with advanced sentiment analysis capabilities. Analyze the emotional tone and urgency level of this user feedback submission.

Feedback Subject: "${feedback.subject}"
Feedback Description: "${feedback.description}"

Analyze for:
1. SENTIMENT: Overall emotional tone (positive, neutral, negative)
2. URGENCY LEVEL: How urgent/critical this feels (low, medium, high, critical)
3. EMOTIONAL INDICATORS: Specific words/phrases that indicate emotion or urgency

Look for urgency indicators like:
- Critical: "urgent", "broken", "can't work", "blocking", "critical", "emergency"
- High: "frustrated", "annoying", "really need", "asap", "important"
- Medium: "would like", "should", "could improve"
- Low: "suggestion", "nice to have", "when possible"

Look for sentiment indicators like:
- Positive: "love", "great", "awesome", "excited", "thanks"
- Negative: "hate", "terrible", "frustrated", "broken", "awful"
- Neutral: Factual reporting without emotional language

Return your analysis as a JSON object.`;

        const result = await InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              sentiment: { 
                type: "string", 
                enum: ["positive", "neutral", "negative"],
                description: "Overall emotional sentiment" 
              },
              urgency_level: {
                type: "string",
                enum: ["low", "medium", "high", "critical"],
                description: "Detected urgency level"
              },
              confidence_score: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description: "Confidence in the analysis (0-1)"
              },
              emotional_indicators: {
                type: "array",
                items: { type: "string" },
                description: "Key words/phrases that influenced the analysis"
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of the sentiment/urgency assessment"
              }
            },
            required: ["sentiment", "urgency_level", "confidence_score", "reasoning"]
          }
        });

        if (result && result.confidence_score > 0.5) { // Only display if reasonably confident
          setAiSentimentAnalysis(result);
        }
      } catch (error) {
        console.error("Failed to analyze sentiment:", error);
      } finally {
        setAiSentimentLoading(false);
      }
    };

    const suggestTags = async () => {
      // Don't re-suggest if tags already exist
      if (feedback.tags && feedback.tags.length > 0) {
        return;
      }
      setAiTagsLoading(true);
      try {
        const prompt = `You are 'Lt. Perry', an expert product management AI. Analyze the following user submission and generate a list of relevant, concise, single-word or two-word tags (in lowercase) that categorize the feedback.

Feedback Subject: "${feedback.subject}"
Feedback Description: "${feedback.description}"

Consider categories like:
- Feature area (e.g., 'dashboard', 'authentication', 'profile', 'sprint-planner')
- Issue type (e.g., 'performance', 'ui/ux', 'crash', 'typo', 'data-loss')
- Platform (e.g., 'mobile', 'desktop', 'api')
- User sentiment (e.g., 'frustration', 'positive-feedback')

Generate up to 5 relevant tags. Return your list of tags as a JSON object.`;

        const result = await InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              tags: {
                type: "array",
                items: { type: "string" },
                description: "An array of lowercase tags, max 5."
              }
            },
            required: ["tags"]
          }
        });

        if (result && result.tags) {
          setFormData(prev => ({ ...prev, tags: [...new Set([...prev.tags, ...result.tags])] }));
        }
      } catch (error) {
        console.error("Failed to get AI-suggested tags:", error);
      } finally {
        setAiTagsLoading(false);
      }
    };


    generateSummary();
    suggestWsjfScores();
    classifyFeedbackType();
    analyzeSentiment();
    suggestTags();
    loadFeatures();
  }, [feedback]);


  const loadFeatures = async () => {
    try {
      const allFeatures = await Feature.list('-created_date');
      setFeatures(allFeatures);
    } catch (error) {
      console.error('Error loading features:', error);
    }
  };

  useEffect(() => {
    const { business_value, time_criticality, risk_reduction, job_size } = formData;
    if (job_size > 0) {
      const score = (business_value + time_criticality + risk_reduction) / job_size;
      setWsjfScore(parseFloat(score.toFixed(2)));
    }
  }, [formData.business_value, formData.time_criticality, formData.risk_reduction, formData.job_size]);

  const handleFormChange = (field, value) => {
    const isNumeric = ['business_value', 'time_criticality', 'risk_reduction', 'job_size', 'story_points'].includes(field);
    setFormData(prev => ({ ...prev, [field]: isNumeric ? Number(value) : value }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { business_value, time_criticality, risk_reduction, job_size } = formData;
      const urgency_norm = time_criticality / 10.0;
      const importance_norm = (business_value + risk_reduction) / 20.0;
      let quadrant = "Q4_Neither";
      if (importance_norm >= 0.6 && urgency_norm >= 0.6) quadrant = "Q1_Urgent_Important";
      else if (importance_norm >= 0.6) quadrant = "Q2_Important_Not_Urgent";
      else if (urgency_norm >= 0.6) quadrant = "Q3_Urgent_Not_Important";
      
      const payload = { 
        ...formData, 
        wsjf_score: wsjfScore, 
        urgency_norm, 
        importance_norm, 
        quadrant,
        // Include AI sentiment analysis if available
        ...(aiSentimentAnalysis && {
          ai_sentiment: aiSentimentAnalysis.sentiment,
          ai_urgency_level: aiSentimentAnalysis.urgency_level,
          ai_confidence_score: aiSentimentAnalysis.confidence_score,
          ai_sentiment_reasoning: aiSentimentAnalysis.reasoning,
        })
      };
      if (!payload.story_points) delete payload.story_points;

      await Feedback.update(feedback.id, payload);
      onSuccess();
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Error updating feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToFeature = async () => {
    setPromotionLoading(true);
    try {
      const newFeature = await Feature.create({
        name: feedback.subject,
        description: feedback.description,
        status: 'funnel',
        business_value: formData.business_value,
        time_criticality: formData.time_criticality,
        risk_reduction: formData.risk_reduction,
        job_size: formData.job_size,
        wsjf_score: wsjfScore,
      });
      await Feedback.update(feedback.id, { status: 'planned', feature_id: newFeature.id });
      onSuccess();
    } catch (error) {
      console.error('Error promoting to feature:', error);
      alert('Error promoting to feature.');
    } finally {
      setPromotionLoading(false);
    }
  };

  // Adjusted to use formData.type for dynamic icon and conditional rendering
  const isUserSubmittedFeedback = formData.type === 'feedback' || formData.type === 'bug_report' || formData.type === 'idea';
  const isStory = formData.type === 'user_story' || formData.type === 'enabler_story';
  const getTypeIcon = () => {
    if (formData.type === 'bug_report') return Bug;
    if (formData.type === 'idea') return Lightbulb;
    if (formData.type === 'user_story') return ClipboardList;
    if (formData.type === 'enabler_story') return Settings;
    return MessageSquare;
  };
  const TypeIcon = getTypeIcon();

  // Helper function to get sentiment color
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '5vh 20px 20px 20px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Elegant Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <TypeIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Feedback Triage</h2>
                <p className="text-indigo-100 text-sm opacity-90 max-w-2xl truncate">
                  {feedback.subject}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Primary Triage Controls */}
            <div className="space-y-6">
              {/* Submission Details - Now at the TOP of the left column */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-500">6-Word Story</span>
                        {summaryLoading ? (
                          <Skeleton className="h-5 w-48 mt-1 bg-gray-200" />
                        ) : (
                          <p className="font-semibold text-gray-800 text-base">{summary}</p>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="max-h-40 overflow-y-auto text-sm text-gray-700 bg-white p-3 rounded border leading-relaxed">
                      {feedback.description}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                      <span className="font-medium">Submitted by:</span>
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                        {feedback.user_email}
                      </span>
                    </div>
                    
                    {/* AI Sentiment Analysis Display */}
                    {aiSentimentLoading ? (
                      <div className="mt-3 text-xs text-indigo-600 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Lt. Perry is analyzing sentiment...
                      </div>
                    ) : aiSentimentAnalysis && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-gray-600">Lt. Perry's Sentiment Analysis:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(aiSentimentAnalysis.sentiment)}`}>
                            {aiSentimentAnalysis.sentiment === 'positive' ? '😊' : aiSentimentAnalysis.sentiment === 'negative' ? '😞' : '😐'} {aiSentimentAnalysis.sentiment}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(aiSentimentAnalysis.urgency_level)}`}>
                            {aiSentimentAnalysis.urgency_level === 'critical' ? '🚨' : aiSentimentAnalysis.urgency_level === 'high' ? '⚡' : aiSentimentAnalysis.urgency_level === 'medium' ? '⏱️' : '🕐'} {aiSentimentAnalysis.urgency_level} urgency
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {Math.round(aiSentimentAnalysis.confidence_score * 100)}% confident
                          </span>
                        </div>
                        {aiSentimentAnalysis.reasoning && (
                          <p className="text-xs text-gray-600 italic">"{aiSentimentAnalysis.reasoning}"</p>
                        )}
                      </div>
                    )}
                  </div>
                </details>
              </div>

              {/* Type Classification */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  Type Classification
                  {aiClassificationLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  )}
                </label>
                {aiClassificationSuggestion && (
                  <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded-md mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span><strong>Lt. Perry suggests:</strong> {aiClassificationSuggestion.reasoning}</span>
                  </div>
                )}
                <select 
                  value={formData.type} 
                  onChange={e => handleFormChange('type', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <option value="feedback">💬 General Feedback</option>
                  <option value="bug_report">🐛 Bug Report</option>
                  <option value="idea">💡 Feature Idea</option>
                  <option value="user_story">📋 User Story</option>
                  <option value="enabler_story">⚙️ Enabler Story</option>
                </select>
              </div>

              {isStory && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Parent Feature</label>
                    <Select
                      value={formData.feature_id}
                      onValueChange={value => handleFormChange('feature_id', value)}
                    >
                      <SelectTrigger className="w-full p-4 h-auto border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md">
                        <SelectValue placeholder="Link to a feature..." />
                      </SelectTrigger>
                      <SelectContent>
                        {features.map(feature => (
                          <SelectItem key={feature.id} value={feature.id}>
                            {feature.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                <select 
                  value={formData.status} 
                  onChange={e => handleFormChange('status', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <option value="new">🆕 New</option>
                  <option value="under_consideration">🤔 Under Consideration</option>
                  <option value="planned">📋 Planned</option>
                  <option value="in_progress">🚧 In Progress</option>
                  <option value="resolved">✅ Resolved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>

              {(isUserSubmittedFeedback || isStory) && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Assignee</label>
                    <select
                      value={formData.assignee_email}
                      onChange={e => handleFormChange('assignee_email', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    >
                      <option value="">👤 Unassigned</option>
                      {users.map(user => (
                        <option key={user.email} value={user.email}>
                          {user.full_name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Priority</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['low', 'medium', 'high', 'critical'].map(p => (
                        <label key={p} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="priority"
                            value={p}
                            checked={formData.priority === p}
                            onChange={(e) => handleFormChange('priority', e.target.value)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="capitalize font-medium text-gray-700">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Story Points */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Story Points</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.story_points}
                        onChange={e => handleFormChange('story_points', e.target.value)}
                        className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        placeholder="e.g., 5"
                        min="0"
                      />
                      <Diamond className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Tags Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </label>
                    {aiTagsLoading && (
                      <div className="text-xs text-indigo-600 flex items-center gap-2 mb-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Lt. Perry is suggesting tags...
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-xl bg-gray-50 min-h-[48px]">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1.5 py-1 px-2 text-sm">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="rounded-full hover:bg-gray-400/20 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                      <Input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder={formData.tags.length === 0 ? "Add tags..." : ""}
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 p-0 h-auto"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - WSJF Scoring */}
            {(isUserSubmittedFeedback || isStory) && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-indigo-500" />
                    WSJF Score
                  </h3>
                  <div className={`px-4 py-2 rounded-full text-lg font-bold shadow-lg ${getWsjfColor(wsjfScore)}`}>
                    {wsjfScore}
                  </div>
                </div>
                
                {/* AI Callouts */}
                {aiScoringLoading ? (
                  <div className="text-sm text-center text-indigo-600 bg-indigo-100/70 p-2 rounded-lg mb-4 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Lt. Perry is analyzing...
                  </div>
                ) : aiSuggestion && (
                  <div className="text-sm text-center text-purple-800 bg-purple-100/70 p-2 rounded-lg mb-4 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span><strong>Lt. Perry Recommends:</strong> A starting point for your review.</span>
                  </div>
                )}

                <div className="space-y-6">
                  <ScoreSlider
                    label="Business Value"
                    value={formData.business_value}
                    onValueChange={(val) => handleFormChange('business_value', val)}
                    description={WSJF_DESCRIPTIONS.business_value}
                  />
                  <ScoreSlider
                    label="Time Criticality"
                    value={formData.time_criticality}
                    onValueChange={(val) => handleFormChange('time_criticality', val)}
                    description={WSJF_DESCRIPTIONS.time_criticality}
                  />
                  <ScoreSlider
                    label="Risk Reduction"
                    value={formData.risk_reduction}
                    onValueChange={(val) => handleFormChange('risk_reduction', val)}
                    description={WSJF_DESCRIPTIONS.risk_reduction}
                  />
                  <ScoreSlider
                    label="Job Size (Effort)"
                    value={formData.job_size}
                    onValueChange={(val) => handleFormChange('job_size', val)}
                    description={WSJF_DESCRIPTIONS.job_size}
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">WSJF Notes</label>
                  <textarea
                    value={formData.wsjf_notes}
                    onChange={e => handleFormChange('wsjf_notes', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                    placeholder="Add notes about WSJF scoring rationale..."
                    rows="3"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            {isUserSubmittedFeedback && (
              <button
                type="button"
                onClick={handlePromoteToFeature}
                disabled={promotionLoading}
                className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {promotionLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5 mr-2" />
                )}
                Promote to Feature
              </button>
            )}
            
            <div className="flex gap-4 flex-1 justify-end">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  'Save Triage'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
          border: 2px solid white;
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.6);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
          border: 2px solid white;
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}
