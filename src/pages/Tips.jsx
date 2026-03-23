import { useState, useEffect } from 'react';
import { TipEntry } from '@/entities/TipEntry';
import { User } from '@/entities/User';
import TipCard from '@/components/tips/TipCard';
import TipForm from '@/components/tips/TipForm';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Loader2, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";

export default function TipsPage() {
  const [tips, setTips] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTipForm, setShowTipForm] = useState(false);
  const [filters, setFilters] = useState({ category: 'all', difficulty: 'all', search: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [user, allTips] = await Promise.all([
        User.me(),
        TipEntry.list('-created_date')
      ]);
      setCurrentUser(user);
      setTips(allTips);
    } catch (error) {
      console.error("Failed to load tips page data:", error);
      toast({
        variant: "destructive",
        title: "Error loading tips",
        description: "Could not fetch the community tips. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTipCreated = () => {
    setShowTipForm(false);
    fetchData(); // Refresh the list
  };
  
  const handleUpvote = async (tipId) => {
    try {
      const tip = tips.find(t => t.id === tipId);
      if (!tip) return;
      
      const alreadyUpvoted = tip.upvoted_by?.includes(currentUser.email);
      let newUpvotedBy = [...(tip.upvoted_by || [])];
      let newUpvotes = tip.upvotes || 0;

      if (alreadyUpvoted) {
        newUpvotedBy = newUpvotedBy.filter(email => email !== currentUser.email);
        newUpvotes--;
      } else {
        newUpvotedBy.push(currentUser.email);
        newUpvotes++;
      }
      
      const updatedTip = await TipEntry.update(tipId, { 
        upvotes: newUpvotes,
        upvoted_by: newUpvotedBy
      });
      
      setTips(prevTips => prevTips.map(t => t.id === tipId ? updatedTip : t));

    } catch (error) {
        console.error("Failed to upvote tip:", error);
        toast({
          variant: "destructive",
          title: "Upvote Failed",
        });
    }
  };


  const filteredTips = tips.filter(tip => {
    return (
      (filters.category === 'all' || tip.category === filters.category) &&
      (filters.difficulty === 'all' || tip.difficulty === filters.difficulty) &&
      (tip.title.toLowerCase().includes(filters.search.toLowerCase()) ||
       tip.content.toLowerCase().includes(filters.search.toLowerCase()))
    );
  }).sort((a,b) => (b.upvotes || 0) - (a.upvotes || 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)]">
          Community Knowledge Base
        </h1>
        <p className="text-lg text-[var(--muted)] mt-4 max-w-2xl mx-auto">
          Learn from the best. Share your wisdom. Earn Stardust for valuable contributions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-[var(--muted)]" />
          <Select value={filters.category} onValueChange={(v) => setFilters(f => ({...f, category: v}))}>
            <SelectTrigger className="w-[180px] bg-[var(--card)] border-[var(--border)]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="Technical">Technical</SelectItem><SelectItem value="Leadership">Leadership</SelectItem><SelectItem value="Process">Process</SelectItem><SelectItem value="Communication">Communication</SelectItem><SelectItem value="Innovation">Innovation</SelectItem></SelectContent>
          </Select>
          <Select value={filters.difficulty} onValueChange={(v) => setFilters(f => ({...f, difficulty: v}))}>
            <SelectTrigger className="w-[180px] bg-[var(--card)] border-[var(--border)]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Difficulties</SelectItem><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent>
          </Select>
          <Input placeholder="Search tips..." value={filters.search} onChange={(e) => setFilters(f => ({...f, search: e.target.value}))} className="bg-[var(--card)] border-[var(--border)] hidden lg:block" />
        </div>
        <Button onClick={() => setShowTipForm(true)} className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Share a Tip
        </Button>
      </div>

      {filteredTips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTips.map(tip => (
            <TipCard 
              key={tip.id} 
              tip={tip}
              currentUserEmail={currentUser.email}
              onUpvote={() => handleUpvote(tip.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[var(--card)] rounded-2xl">
          <BookOpen className="w-16 h-16 mx-auto text-[var(--muted)] mb-4"/>
          <h3 className="text-xl font-bold text-[var(--text)]">No Tips Found</h3>
          <p className="text-[var(--muted)] mt-2">No tips match your current filters. Why not share one?</p>
        </div>
      )}

      {showTipForm && (
        <TipForm 
          onClose={() => setShowTipForm(false)} 
          onSuccess={handleTipCreated}
        />
      )}
    </div>
  );
}