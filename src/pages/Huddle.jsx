
import React, { useState, useEffect, useCallback } from 'react';
import { Target, Flag, CheckCircle, Play, Pause, RotateCcw, Award, Zap, ThumbsUp, BrainCircuit, Plus, X, Check, Loader2, ShieldAlert, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox"; // New import
import { startHuddleSession } from '@/functions/startHuddleSession';
import { createHuddleBlocker } from '@/functions/createHuddleBlocker';
import { finishHuddleSession } from '@/functions/finishHuddleSession';

// New entity imports
import { User } from '@/entities/User';
import { HuddleSession } from '@/entities/HuddleSession';
import { DailyObjective } from '@/entities/DailyObjective';
import { PersonalTask } from '@/entities/PersonalTask';

const CountdownTimer = ({ initialMinutes, onComplete }) => {
  const [time, setTime] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      setIsActive(false);
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, time, onComplete]);

  const toggle = () => setIsActive(!isActive);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div 
        className="relative w-48 h-48 rounded-full flex items-center justify-center border-4 border-[var(--accent)]/30 shadow-2xl"
        style={{
          background: `conic-gradient(from 180deg, var(--accent) ${time/(initialMinutes*60) * 360}deg, var(--card) 0deg)`
        }}
      >
        <div className="absolute w-[88%] h-[88%] bg-[var(--card)] backdrop-blur-sm rounded-full flex items-center justify-center border border-[var(--border)]">
          <span className="text-4xl font-mono font-bold text-[var(--text)] tracking-widest drop-shadow-lg">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={toggle} variant="outline" className="w-24">
          {isActive ? <><Pause className="w-4 h-4 mr-2" />Pause</> : <><Play className="w-4 h-4 mr-2" />Resume</>}
        </Button>
      </div>
    </div>
  );
};


const BlockerForm = ({ sessionId, onBlockerAdded }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !desc) {
            toast({ variant: "destructive", title: "Incomplete Blocker", description: "Please provide a title and description." });
            return;
        }
        setLoading(true);
        try {
            await createHuddleBlocker({
                session_id: sessionId,
                title,
                desc,
                severity,
            });
            toast({ title: "Blocker Logged", description: "Your blocker has been recorded." });
            setTitle('');
            setDesc('');
            if (onBlockerAdded) onBlockerAdded();
        } catch (error) {
            toast({ variant: "destructive", title: "Error Logging Blocker", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
             <h3 className="font-semibold flex items-center gap-2 text-red-300"><ShieldAlert className="w-5 h-5 text-red-400" /> Log a Blocker</h3>
             <Input placeholder="Blocker Title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-white/5 placeholder:text-[var(--muted)]"/>
             <Textarea placeholder="Blocker Description..." value={desc} onChange={e => setDesc(e.target.value)} required className="bg-white/5 placeholder:text-[var(--muted)]"/>
             <div className="flex justify-between items-center">
                <select value={severity} onChange={e => setSeverity(e.target.value)} className="bg-transparent border border-[var(--border)] rounded-md px-2 py-1 text-sm text-[var(--text)]">
                    <option style={{backgroundColor: 'black'}} value="low">Low Severity</option>
                    <option style={{backgroundColor: 'black'}} value="medium">Medium Severity</option>
                    <option style={{backgroundColor: 'black'}} value="high">High Severity</option>
                    <option style={{backgroundColor: 'black'}} value="critical">Critical</option>
                </select>
                <Button type="submit" variant="destructive" size="sm" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Log Blocker"}
                </Button>
             </div>
        </form>
    );
}

const CompletionScreen = ({ objectives, onFinish, completionStatus, toggleCompletion }) => {
    const [loading, setLoading] = useState(false);

    const handleFinish = async () => {
        setLoading(true);
        await onFinish(); // No longer passing a count
        setLoading(false);
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-[var(--card)] backdrop-blur-sm border border-[var(--border)] rounded-2xl shadow-2xl p-8 space-y-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-400" />
            <h2 className="text-3xl font-bold text-[var(--text)]">Focus Block Complete!</h2>
            <p className="text-[var(--muted)]">Review your wins and mark what you've accomplished.</p>
            <div className="space-y-3 text-left">
                {objectives.map((obj, index) => (
                    <div 
                        key={obj.id}
                        onClick={() => toggleCompletion(index)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            completionStatus[index] ? 'bg-green-500/20' : 'bg-white/5 hover:bg-white/10'
                        }`}
                    >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 ${
                            completionStatus[index] ? 'bg-green-500 border-green-400' : 'border-[var(--muted)]'
                        }`}>
                            {completionStatus[index] && <Check className="w-5 h-5 text-white" />}
                        </div>
                        <span className={`flex-1 ${completionStatus[index] ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'}`}>{obj.title}</span>
                    </div>
                ))}
            </div>
            <Button onClick={handleFinish} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg text-white">
                {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : "Finish & Claim Rewards"}
            </Button>
        </div>
    );
};

const SummaryScreen = ({ summary, onRestart }) => {
    const { toast } = useToast();
    
    useEffect(() => {
        if(summary && summary.stardust_awarded > 0) {
            toast({
                title: "Stardust Awarded!",
                description: `You've earned ${summary.stardust_awarded} Stardust for completing your huddle!`,
                action: <div className="flex items-center text-yellow-400"><Zap className="w-5 h-5 mr-2"/>+{summary.stardust_awarded}</div>,
            });
        }
    }, [summary, toast]);

    return (
        <div className="w-full max-w-lg mx-auto bg-[var(--card)] backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6 text-center">
            <Award className="w-16 h-16 mx-auto text-yellow-400" />
            <h2 className="text-3xl font-bold">Huddle Complete!</h2>
            <p className="text-[var(--muted)]">Great work. Here's your summary:</p>
            <div className="grid grid-cols-2 gap-4 text-left bg-white/5 p-4 rounded-lg">
                <div><span className="font-semibold">Wins Completed:</span> {summary?.wins_completed} / {summary?.wins_total}</div>
                <div><span className="font-semibold">Stardust Earned:</span> {summary?.stardust_awarded}</div>
                <div><span className="font-semibold">Focus Time:</span> {summary?.session?.duration} mins</div>
            </div>
            <p className="text-sm text-green-400 flex items-center justify-center gap-2">
                <ThumbsUp className="w-4 h-4"/>
                Your progress has been logged. Keep up the great work!
            </p>
            <Button onClick={onRestart} className="w-full">
                Start a New Huddle
            </Button>
        </div>
    );
}

export default function Huddle() {
  const [huddleState, setHuddleState] = useState('idle'); // idle, committing, focus, completing
  const [currentUser, setCurrentUser] = useState(null);
  const [dailyWins, setDailyWins] = useState([{ title: '' }, { title: '' }, { title: '' }]);
  const [session, setSession] = useState(null);
  const [dailyObjectives, setDailyObjectives] = useState([]);
  const [completionStatus, setCompletionStatus] = useState([false, false, false]);
  const [focusTime, setFocusTime] = useState(25);
  const [loading, setLoading] = useState(true);
  const [personalTasks, setPersonalTasks] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user && user.pomodoro_preset) {
          setFocusTime(user.pomodoro_preset);
        }

        const today = new Date().toISOString().split('T')[0];
        const existingSessions = await HuddleSession.filter({
          user_email: user.email,
          date: today,
        }, '-created_date', 1); // Get latest session

        if (existingSessions.length > 0) {
          const latestSession = existingSessions[0];
          setSession(latestSession);
          if (latestSession.status === 'completed') {
            setHuddleState('completed_today');
            // If completed, maybe fetch summary or just indicate it's done for the day
            setSummary({
                wins_completed: 0, // Placeholder
                wins_total: 0, // Placeholder
                stardust_awarded: 0, // Placeholder
                session: { duration: latestSession.duration_minutes || focusTime }
            });
          } else {
            const objectives = await DailyObjective.filter({ session_id: latestSession.id });
            setDailyObjectives(objectives);
            setCompletionStatus(new Array(objectives.length).fill(false)); // Initialize completion status for loaded objectives
            setHuddleState('focus');
          }
        } else {
            setHuddleState('committing'); // No existing session, ready to commit
        }
      } catch (e) {
        console.error("User not logged in or error fetching data", e);
        setHuddleState('committing'); // Allow committing even if user data fails
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (currentUser) {
        const loadPersonalTasks = async () => {
            try {
                // Filter for tasks not already in dailyWins to avoid showing already selected ones
                const currentWinTitles = new Set(dailyWins.map(win => win.title));
                const tasks = await PersonalTask.filter({ status: 'todo', created_by: currentUser.email }, '-created_date', 5);
                setPersonalTasks(tasks.filter(task => !currentWinTitles.has(task.title)));
            } catch (error) {
                console.error("Failed to load personal tasks:", error);
                toast({ variant: "destructive", title: "Could not load personal tasks." });
            }
        };
        loadPersonalTasks();
    }
  }, [currentUser, toast, dailyWins]); // Add dailyWins to dependency array to update suggestions when wins change


  const handleWinChange = (index, value) => {
    const newWins = [...dailyWins];
    newWins[index] = { ...newWins[index], title: value };
    setDailyWins(newWins);
  };

  const handleSelectTaskAsWin = (task) => {
    const firstEmptyIndex = dailyWins.findIndex(win => !win.title.trim());
    if (firstEmptyIndex !== -1) {
        const newWins = [...dailyWins];
        newWins[firstEmptyIndex] = { title: task.title, personal_task_id: task.id };
        setDailyWins(newWins);
        // Remove the selected task from suggestions to avoid double selection
        setPersonalTasks(prev => prev.filter(p => p.id !== task.id));
    } else {
        toast({ title: "No empty slots", description: "Your three wins for today are already filled." });
    }
  };

  const handleStartHuddle = async () => {
    const winsToCommit = dailyWins.filter(win => win.title.trim() !== '');
    if (winsToCommit.length === 0) {
        toast({ variant: "destructive", title: "No Wins Defined", description: "Please define at least one win for today." });
        return;
    }

    setLoading(true);
    try {
      // Assuming startHuddleSession now handles creating objectives internally
      const response = await startHuddleSession({
        dailyWins: winsToCommit,
        focusTime,
      });
      if (response && response.data && response.data.session) {
        setSession(response.data.session);
        // Fetch objectives after session is created and objectives are linked
        const objectives = await DailyObjective.filter({ session_id: response.data.session.id });
        setDailyObjectives(objectives);
        setCompletionStatus(new Array(objectives.length).fill(false));
        setHuddleState('focus');
        toast({ title: "Commitment Locked!", description: `Your goals are set. Time to focus!` });
      } else {
        throw new Error(response.data.message || "Invalid response from server during session start.");
      }
    } catch (error) {
      console.error("Huddle start failed:", error);
      toast({ variant: "destructive", title: "Huddle Start Failed", description: error.message || "An unknown error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleFocusComplete = useCallback(() => {
    setHuddleState('completing');
  }, []);
  
  const handleFinishSession = async () => {
    const completedObjectives = dailyObjectives.filter((_, index) => completionStatus[index]);
    try {
        const response = await finishHuddleSession({ 
            sessionId: session.id, 
            completedObjectives: completedObjectives 
        });

        if (!response || !response.data || !response.data.success) {
            throw new Error(response?.data?.message || "Failed to finish session.");
        }
        
        setSummary({
            wins_completed: completedObjectives.length,
            wins_total: dailyObjectives.length,
            stardust_awarded: response.data.stardust_earned || 0,
            session: { duration: session.duration || focusTime }
        });
        setHuddleState('summary');
    } catch (error) {
         console.error("Finish session failed:", error);
         setSummary({
            wins_completed: completedObjectives.length,
            wins_total: dailyObjectives.length,
            stardust_awarded: 0,
            session: { duration: session.duration || focusTime }
         });
         setHuddleState('summary');
         toast({
            variant: "destructive",
            title: "Failed to log completion",
            description: "Your session summary may be incomplete. No worries!"
         });
    }
  };
    
  const handleRestart = () => {
      setHuddleState('committing'); // Go back to committing
      setSession(null);
      setDailyWins([{ title: '' }, { title: '' }, { title: '' }]); // Reset wins
      setDailyObjectives([]);
      setCompletionStatus([false, false, false]);
      setPersonalTasks([]); // Clear loaded personal tasks
      setSummary(null);
  };

  const toggleCompletion = useCallback((objectiveIndex) => {
    setCompletionStatus(prev => {
        const newState = [...prev];
        newState[objectiveIndex] = !newState[objectiveIndex];
        return newState;
    });
  }, []);

  const [summary, setSummary] = useState(null); // Define summary state for SummaryScreen

  const renderContent = () => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-[var(--accent)]" />
                <p className="mt-4 text-[var(--muted)]">Loading your huddle...</p>
            </div>
        );
    }

    switch (huddleState) {
      case 'idle':
      case 'committing':
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] shadow-xl rounded-2xl p-8 max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Commit to Your 3 Wins</h2>
            <p className="text-[var(--muted)] mb-6">What are the 3 most important things you'll accomplish today?</p>
            <div className="space-y-4 text-left">
              {[0, 1, 2].map(index => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[var(--muted)]">{index + 1}</span>
                  <Input
                    type="text"
                    placeholder={`Win #${index + 1}`}
                    value={dailyWins[index]?.title || ''}
                    onChange={(e) => handleWinChange(index, e.target.value)}
                    className="bg-white/10 border-white/20 h-12 text-lg"
                  />
                </div>
              ))}
            </div>
            {personalTasks.length > 0 && (
              <div className="mt-6 text-left">
                  <h3 className="text-lg font-semibold mb-3">Suggestions from your Inbox</h3>
                  <div className="space-y-2">
                      {personalTasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10">
                              <span className="font-medium">{task.title}</span>
                              <Button size="sm" variant="ghost" onClick={() => handleSelectTaskAsWin(task)}>
                                  <Plus className="w-4 h-4 mr-2"/>
                                  Add
                              </Button>
                          </div>
                      ))}
                  </div>
              </div>
            )}
            <Button onClick={handleStartHuddle} size="lg" disabled={loading} className="mt-8 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg h-14 shadow-lg hover:shadow-xl transition-shadow">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Commit & Start Focus"}
            </Button>
          </div>
        );
      case 'focus':
          return (
              <div className="w-full max-w-lg mx-auto space-y-8">
                  <CountdownTimer initialMinutes={focusTime} onComplete={handleFocusComplete} />
                  {session && <BlockerForm sessionId={session.id} />}
              </div>
          );
      case 'completing':
           return <CompletionScreen objectives={dailyObjectives} onFinish={handleFinishSession} completionStatus={completionStatus} toggleCompletion={toggleCompletion} />;
      case 'summary':
          return <SummaryScreen summary={summary} onRestart={handleRestart}/>;
      case 'completed_today':
          return (
              <div className="w-full max-w-lg mx-auto bg-[var(--card)] backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-400" />
                  <h2 className="text-3xl font-bold">Huddle Complete for Today!</h2>
                  <p className="text-[var(--muted)]">You've already finished your huddle session for today. Come back tomorrow!</p>
                  {summary && <SummaryScreen summary={summary} onRestart={handleRestart}/>}
                  {!summary && (
                    <Button onClick={handleRestart} className="w-full">
                        Start a New Huddle (Force Restart)
                    </Button>
                  )}
              </div>
          );
      default:
          return null;
    }
  };

  return (
    <div className="min-h-screen w-full p-4 flex items-center justify-center">
        <div className="relative z-10 w-full">
            {renderContent()}
        </div>
    </div>
  );
}
