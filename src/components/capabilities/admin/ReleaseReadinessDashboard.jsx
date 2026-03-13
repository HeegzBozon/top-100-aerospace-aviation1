
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InvokeLLM } from '@/integrations/Core';
import { Feedback } from '@/entities/Feedback';
import { Sprint } from '@/entities/Sprint';
import { useToast } from "@/components/ui/use-toast";
import { SmartReleaseWizard } from '@/components/capabilities/admin';
import { BlockerResolutionWizard } from '@/components/capabilities/admin'; // New import
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  TestTube,
  Rocket,
  Loader2,
  Flag,
  ShoppingCart,
  Brain,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  AlertOctagon,
  MessageSquare
} from 'lucide-react';

const SpectrumMeter = ({ value = 65, isActive = true }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, [isActive]);

  const getBarHeight = (barIndex, baseValue) => {
    const phase = (animationPhase + barIndex * 30) * (Math.PI / 180);
    const wave = Math.sin(phase) * 0.3 + 0.7;
    const randomFactor = Math.sin(phase * 2.3) * 0.2 + 0.8;
    return Math.max(5, baseValue * wave * randomFactor);
  };

  const getBarColor = (height, maxHeight) => {
    const intensity = height / maxHeight;
    if (value < 40) {
      return intensity > 0.7 ? '#ff4757' : intensity > 0.4 ? '#ff6b7a' : '#ff8a9b';
    } else if (value < 70) {
      return intensity > 0.7 ? '#ffa502' : intensity > 0.4 ? '#ffb732' : '#ffc854';
    } else {
      return intensity > 0.7 ? '#2ed573' : intensity > 0.4 ? '#4ede7a' : '#7ce688';
    }
  };

  const bars = Array.from({ length: 20 }, (_, i) => {
    const baseHeight = (value / 100) * 60 * (0.8 + Math.random() * 0.4);
    const height = getBarHeight(i, baseHeight);
    const maxHeight = 60;
    
    return {
      height: Math.min(height, maxHeight),
      color: getBarColor(height, maxHeight),
      delay: i * 50
    };
  });

  return (
    <div className="relative flex items-end justify-center h-20 bg-black/30 rounded-xl p-4 backdrop-blur-sm border border-white/20 overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '10px 5px'
        }} />
      </div>
      
      {/* Spectrum bars */}
      <div className="relative flex items-end justify-center gap-1 h-full z-10">
        {bars.map((bar, index) => (
          <div
            key={index}
            className="relative transition-all duration-100 ease-out rounded-t-sm"
            style={{
              width: '6px',
              height: `${bar.height}px`,
              backgroundColor: bar.color,
              boxShadow: `0 0 8px ${bar.color}40, 0 0 16px ${bar.color}20`,
              filter: 'brightness(1.2)',
              animationDelay: `${bar.delay}ms`
            }}
          >
            <div 
              className="absolute inset-0 rounded-t-sm"
              style={{
                background: `linear-gradient(to top, ${bar.color}, ${bar.color}80)`,
                filter: 'blur(0.5px)'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          )`
        }}
      />
    </div>
  );
};

const LtPerryInsight = ({ insight, onApplySuggestion, loading }) => (
  <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-400/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 text-purple-300">
        <Brain className="w-5 h-5" />
        <span className="text-sm font-bold">Lt. Perry Analysis</span>
      </div>
    </div>
    <div className="mt-3">
      <div className="flex items-start gap-2 mb-3">
        <AlertOctagon className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-[var(--text)] text-sm font-medium">{insight.risk_assessment}</p>
      </div>
      <div className="flex items-start gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-[var(--muted)] text-sm">{insight.prediction}</p>
      </div>
      <div className="flex items-start gap-2 mb-4">
        <Target className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
        <p className="text-[var(--muted)] text-sm">{insight.recommendation}</p>
      </div>
      {insight.suggested_action && (
        <Button
          size="sm"
          onClick={() => onApplySuggestion(insight.suggested_action)}
          disabled={loading}
          className="bg-purple-600/20 border border-purple-400/30 text-purple-200 hover:bg-purple-600/30"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Apply Suggestion
        </Button>
      )}
    </div>
  </div>
);

const ChecklistItem = ({ text, status, source, onClick }) => {
  const statusConfig = {
    ready: { 
      icon: CheckCircle, 
      textColor: 'text-green-400', 
      bgColor: 'bg-green-500/10 border-green-400/20', 
      glow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
    },
    attention: { 
      icon: AlertTriangle, 
      textColor: 'text-amber-400', 
      bgColor: 'bg-amber-500/10 border-amber-400/20', 
      glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
    },
    blocker: { 
      icon: XCircle, 
      textColor: 'text-red-400', 
      bgColor: 'bg-red-500/10 border-red-400/20', 
      glow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' 
    },
  };
  const { icon: Icon, textColor, bgColor, glow } = statusConfig[status] || statusConfig.attention;

  const isActionable = status === 'blocker' || status === 'attention';

  return (
    <button
      onClick={onClick}
      disabled={!isActionable}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${bgColor} ${
        isActionable ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default opacity-70'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${status.startsWith('blocker') ? 'red' : 'amber'}-500`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${textColor} ${glow} transition-all`} />
          <span className={`leading-relaxed ${textColor}`}>{text}</span>
        </div>
        <span className="text-xs text-right text-[var(--muted)] bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          {source}
        </span>
      </div>
    </button>
  );
};

const CategoryCard = ({ title, icon: Icon, score, children }) => (
  <div className="group relative bg-gradient-to-br from-[var(--card)] to-transparent border border-white/20 rounded-2xl p-6 space-y-6 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-[var(--accent)]/30">
    {/* Subtle background pattern */}
    <div className="absolute inset-0 opacity-5 rounded-2xl overflow-hidden">
      <div className="w-full h-full" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, var(--accent) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />
    </div>
    
    <div className="relative z-10">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-lg">
          <Icon className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-[var(--text)] to-[var(--muted)] bg-clip-text text-transparent">
          {title}
        </h3>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-[var(--muted)] font-medium">Progress</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent drop-shadow-sm">
            {score}%
          </span>
        </div>
        <div className="relative h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
          <div 
            className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-full transition-all duration-1000 ease-out shadow-lg"
            style={{ 
              width: `${score}%`,
              boxShadow: `0 0 20px var(--accent)40`
            }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {children}
      </div>
    </div>
  </div>
);

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [targetDate]);

  const CountdownUnit = ({ value, label }) => (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-[var(--muted)] bg-clip-text text-transparent drop-shadow-2xl mono">
        {String(value || 0).padStart(2, '0')}
      </div>
      <div className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold mt-1">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-end">
      <div className="text-sm text-[var(--muted)] uppercase tracking-wider mb-2 font-semibold">
        Countdown to Launch
      </div>
      <div className="flex gap-3 justify-end">
        <CountdownUnit value={timeLeft.days} label="days" />
        <CountdownUnit value={timeLeft.hours} label="hours" />
        <CountdownUnit value={timeLeft.minutes} label="minutes" />
        <CountdownUnit value={timeLeft.seconds} label="seconds" />
      </div>
    </div>
  );
};

export default function ReleaseReadinessDashboard({ currentUser, onTasksCreated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [ltPerryInsight, setLtPerryInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [realData, setRealData] = useState(null);
  const { toast } = useToast();
  const [showReleaseWizard, setShowReleaseWizard] = useState(false);
  const [showBlockerWizard, setShowBlockerWizard] = useState(false);
  const [selectedBlocker, setSelectedBlocker] = useState(null);

  // Load real data and generate Lt. Perry insights
  useEffect(() => {
    loadRealDataAndAnalyze();
  }, []);

  const loadRealDataAndAnalyze = async () => {
    setInsightLoading(true);
    try {
      // Load real data from the platform
      const [feedbackItems, sprints] = await Promise.all([
        Feedback.list('-created_date', 50),
        Sprint.list('-created_date', 10)
      ]);
      
      setRealData({ feedbackItems, sprints });
      
      // Generate Lt. Perry insights based on real data
      await generateLtPerryInsights(feedbackItems, sprints);
    } catch (error) {
      console.error('Error loading data for Lt. Perry analysis:', error);
    } finally {
      setInsightLoading(false);
    }
  };

  const generateLtPerryInsights = async (feedbackItems, sprints) => {
    try {
      // Count critical issues and blockers
      const criticalBugs = feedbackItems.filter(item => 
        item.type === 'bug_report' && (item.priority === 'critical' || item.priority === 'high')
      ).length;
      
      const activeBlockers = feedbackItems.filter(item =>
        item.quadrant === 'Q1_Urgent_Important' && item.status !== 'resolved'
      ).length;
      
      const activeSprints = sprints.filter(s => s.status === 'active').length;
      const completedSprints = sprints.filter(s => s.status === 'completed').length;
      
      const totalFeedback = feedbackItems.length;
      const resolvedFeedback = feedbackItems.filter(item => item.status === 'resolved').length;
      
      const prompt = `You are Lt. Perry, an expert product management AI analyzing release readiness. Based on this data, provide insights:

Current State:
- Total feedback items: ${totalFeedback}
- Resolved feedback items: ${resolvedFeedback}
- Critical/High priority bugs: ${criticalBugs}
- Active blockers (Q1 items): ${activeBlockers}
- Active sprints: ${activeSprints}
- Completed sprints: ${completedSprints}

Analyze the release readiness and provide:
1. A risk assessment of the current state
2. A prediction about timeline and readiness
3. A specific recommendation for next steps
4. An actionable suggestion if appropriate

Be concise, direct, and actionable in your analysis.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risk_assessment: {
              type: "string",
              description: "Assessment of current risks and readiness level"
            },
            prediction: {
              type: "string", 
              description: "Prediction about timeline and likelihood of success"
            },
            recommendation: {
              type: "string",
              description: "Specific recommendation for next steps"
            },
            suggested_action: {
              type: "string",
              description: "Specific actionable suggestion (optional)"
            },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Confidence in the analysis"
            }
          },
          required: ["risk_assessment", "prediction", "recommendation"]
        }
      });

      if (result && result.confidence > 0.6) {
        setLtPerryInsight(result);
      }
    } catch (error) {
      console.error('Error generating Lt. Perry insights:', error);
    }
  };

  const handleApplySuggestion = async (suggestion) => {
    setIsLoading(true);
    try {
      // Create a new feedback item based on Lt. Perry's suggestion
      await Feedback.create({
        type: 'feedback',
        subject: 'Lt. Perry Recommendation',
        description: suggestion,
        user_email: currentUser?.email || 'system@base44.io',
        status: 'new',
        priority: 'high',
        quadrant: 'Q2_Important_Not_Urgent'
      });
      
      toast({
        title: "Lt. Perry Suggestion Applied",
        description: "A new task has been created based on Lt. Perry's recommendation.",
      });
      
      // Refresh insights
      if (realData) {
        await generateLtPerryInsights(realData.feedbackItems, realData.sprints);
      }
      
    } catch (error) {
      console.error('Error applying Lt. Perry suggestion:', error);
      toast({
        variant: "destructive",
        title: "Failed to Apply Suggestion",
        description: "Could not create task from Lt. Perry's recommendation.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockerClick = (item) => {
    if (item.status === 'blocker' || item.status === 'attention') {
      setSelectedBlocker(item);
      setShowBlockerWizard(true);
    }
  };

  // Mock data - in production this would be enhanced with real data analysis
  const mockData = {
    launchDate: new Date('2025-02-01T09:00:00'),
    technicalReadiness: {
      score: realData ? Math.min(90, Math.round((realData.feedbackItems.filter(i => i.status === 'resolved').length / Math.max(realData.feedbackItems.length, 1)) * 100)) : 60,
      checklist: [
        { text: 'All MVP backlog items functional', status: 'ready', source: 'Automated QA + Signoff' },
        { text: 'User authentication flow complete', status: 'ready', source: 'Manual Testing' },
        { text: 'Data persistence layer stable', status: 'attention', source: 'Performance Tests' },
        { text: 'API endpoints documented', status: 'ready', source: 'Documentation Review' },
        { text: 'Load testing passed for 1000+ users', status: 'attention', source: 'Load Tests' },
        { text: 'Database query optimization complete', status: 'blocker', source: 'Performance Audit' },
        { text: 'CDN integration and caching configured', status: 'ready', source: 'Infrastructure Team' },
        { text: 'Security audit completed', status: 'ready', source: 'Security Team' },
        { text: 'GDPR compliance verified', status: 'attention', source: 'Legal Review' },
        { text: 'Penetration testing passed', status: 'ready', source: 'External Audit' }
      ]
    },
    marketingReadiness: {
      score: 40,
      checklist: [
        { text: 'Landing page live; app store listings', status: 'ready', source: 'Marketing Team' },
        { text: 'Brand guidelines finalized', status: 'ready', source: 'Design Team' },
        { text: 'Messaging framework approved', status: 'attention', source: 'Content Strategy' },
        { text: 'Social media content scheduled', status: 'attention', source: 'Social Media Manager' },
        { text: 'Press release drafted and approved', status: 'blocker', source: 'PR Team' },
        { text: 'Influencer partnerships confirmed', status: 'blocker', source: 'Partnership Team' },
        { text: 'User documentation complete', status: 'ready', source: 'Technical Writing' },
        { text: 'Support team trained', status: 'attention', source: 'Support Lead' },
        { text: 'FAQ and troubleshooting guides', status: 'attention', source: 'Support Documentation' }
      ]
    }
  };

  const overallReadiness = Math.round(
    (mockData.technicalReadiness.score * 0.6) + (mockData.marketingReadiness.score * 0.4)
  );

  const handleExportReport = async () => {
    setIsLoading(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Report Exported",
        description: "Release readiness report has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to generate report. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerQA = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast({
        title: "QA Cycle Initiated",
        description: "Final QA cycle has been triggered. All stakeholders have been notified.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "QA Trigger Failed",
        description: "Failed to initiate QA cycle. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = () => {
    if (overallReadiness < 80) {
      toast({
        variant: "destructive",
        title: "Release Blocked",
        description: "Overall readiness must be at least 80% before release can proceed.",
      });
      return;
    }
    
    // Open the Smart Release Wizard instead of direct launch
    setShowReleaseWizard(true);
  };

  const handleWizardLaunch = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 4000));
      toast({
        title: "🚀 Release Initiated!",
        description: "Deployment pipeline has been triggered. The release is now live!",
      });
      setShowReleaseWizard(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Release Failed",
        description: "Failed to initiate release. Please contact DevOps team.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(circle at 20% 80%, var(--accent)10 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, var(--accent-2)10 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, var(--accent)05 0%, transparent 50%)
          `
        }} />
      </div>

      <div className="relative z-10 p-8">
        {/* MERGED & COMPACTED Header + Vibe Meter */}
        <div className="mb-8 p-8 bg-gradient-to-r from-[var(--card)] to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side: Info & Vibe Score */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--text)] to-[var(--accent)] bg-clip-text text-transparent mb-2 drop-shadow-sm">
                Go Live Readiness
              </h1>
              <p className="text-[var(--muted)] text-base mb-4">Real-time status for our next major release.</p>
              
              <div className="mt-6">
                 <h2 className="text-xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[var(--accent)]" />
                  The Vibe Meter
                </h2>
                <div className="text-4xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent drop-shadow-lg mb-2">
                  {overallReadiness}%
                </div>
                <div className="text-xs text-[var(--muted)]">
                  Release Vibe: Technical ({mockData.technicalReadiness.score}%), Marketing ({mockData.marketingReadiness.score}%)
                </div>
              </div>
            </div>

            {/* Right Side: Visual Meters */}
            <div className="space-y-6">
              <Countdown targetDate={mockData.launchDate} />
              <SpectrumMeter value={overallReadiness} />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-50 pointer-events-none"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-xl opacity-50 pointer-events-none"></div>
        </div>

        {/* Lt. Perry Insights */}
        {insightLoading ? (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-400/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 text-purple-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-bold">Lt. Perry is analyzing your release readiness...</span>
            </div>
          </div>
        ) : ltPerryInsight && (
          <LtPerryInsight 
            insight={ltPerryInsight} 
            onApplySuggestion={handleApplySuggestion}
            loading={isLoading}
          />
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={handleExportReport}
            disabled={isLoading}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-[var(--text)] hover:bg-white/20 transition-all duration-300"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export Report
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleTriggerQA}
            disabled={isLoading}
            className="bg-amber-500/10 backdrop-blur-sm border-amber-400/20 text-amber-300 hover:bg-amber-500/20 transition-all duration-300"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
            Trigger Final QA Cycle
          </Button>
          
          <Button 
            onClick={handleRelease}
            disabled={isLoading || overallReadiness < 80}
            className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
            Release Now
          </Button>
        </div>

        {/* Readiness Categories */}
        <div className="grid md:grid-cols-2 gap-8">
          <CategoryCard title="Technical Readiness" score={mockData.technicalReadiness.score} icon={TestTube}>
            {mockData.technicalReadiness.checklist.map((item, index) => (
              <ChecklistItem key={index} {...item} onClick={() => handleBlockerClick(item)} />
            ))}
          </CategoryCard>
          <CategoryCard title="Marketing Readiness" score={mockData.marketingReadiness.score} icon={ShoppingCart}>
            {mockData.marketingReadiness.checklist.map((item, index) => (
              <ChecklistItem key={index} {...item} onClick={() => handleBlockerClick(item)} />
            ))}
          </CategoryCard>
        </div>
      </div>

      <SmartReleaseWizard 
        isOpen={showReleaseWizard}
        onClose={() => setShowReleaseWizard(false)}
        onLaunch={handleWizardLaunch}
        currentUser={currentUser}
      />

      <BlockerResolutionWizard
        isOpen={showBlockerWizard}
        onClose={() => setShowBlockerWizard(false)}
        blockerItem={selectedBlocker}
      />
      
      <style jsx>{`
        .mono { font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; }
      `}</style>
    </div>
  );
}
