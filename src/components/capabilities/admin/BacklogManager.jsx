
import { useState, useEffect } from 'react';
import { Initiative } from '@/entities/Initiative';
import { Capability } from '@/entities/Capability';
import { Feature } from '@/entities/Feature';
import { Feedback } from '@/entities/Feedback';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { Plus, Layers, Milestone, Flag, GitCommit, Loader2, ArrowUpDown, Inbox, Filter, Search, X } from 'lucide-react';

import BacklogItemForm from './BacklogItemForm';
import BacklogItemView from './BacklogItemView';

const backlogLevels = [
  { id: 'triage', name: 'Triage', icon: Inbox, entity: Feedback, child: 'portfolio' },
  { id: 'portfolio', name: 'Portfolio', icon: Layers, entity: Initiative, child: 'solution', parent: 'triage' },
  { id: 'solution', name: 'Solution Train', icon: Milestone, entity: Capability, child: 'art', parent: 'portfolio' },
  { id: 'art', name: 'ART', icon: Flag, entity: Feature, child: 'team', parent: 'solution' },
  { id: 'team', name: 'Team', icon: GitCommit, entity: Feedback, child: null, parent: 'art' },
];

const BacklogFilters = ({ level, filters, onFiltersChange, itemCount }) => {
  const getFilterOptions = () => {
    switch (level) {
      case 'triage':
        return {
          status: ['all', 'new', 'under_consideration', 'planned', 'in_progress', 'resolved', 'rejected'],
          type: ['all', 'feedback', 'idea', 'bug_report'],
          priority: ['all', 'low', 'medium', 'high', 'critical'],
          quadrant: ['all', 'Q1_Urgent_Important', 'Q2_Important_Not_Urgent', 'Q3_Urgent_Not_Important', 'Q4_Neither', 'unassigned']
        };
      case 'portfolio':
      case 'solution':
      case 'art':
        return {
          status: ['all', 'funnel', 'reviewing', 'analyzing', 'portfolio_backlog', 'backlog', 'implementing', 'validating', 'done']
        };
      case 'team':
        return {
          status: ['all', 'new', 'under_consideration', 'planned', 'in_progress', 'resolved'],
          type: ['all', 'user_story', 'enabler_story'],
          priority: ['all', 'low', 'medium', 'high', 'critical']
        };
      default:
        return {};
    }
  };

  const filterOptions = getFilterOptions();

  return (
    <div className="bg-white/50 dark:bg-black/10 backdrop-blur-sm rounded-lg border border-[var(--border)] p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
          <Filter className="w-4 h-4" />
          Filters ({itemCount} items):
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <Input
            placeholder="Search..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 w-48"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        {filterOptions.status && (
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.status.map(status => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Type Filter */}
        {filterOptions.type && (
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.type.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Priority Filter */}
        {filterOptions.priority && (
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.priority.map(priority => (
                <SelectItem key={priority} value={priority}>
                  {priority === 'all' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Quadrant Filter (Triage only) */}
        {filterOptions.quadrant && (
          <Select
            value={filters.quadrant || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, quadrant: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Quadrant" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.quadrant.map(quadrant => (
                <SelectItem key={quadrant} value={quadrant}>
                  {quadrant === 'all' ? 'All Quadrants' : 
                   quadrant === 'unassigned' ? 'Unassigned' :
                   quadrant.replace(/_/g, ' ').replace('Q1', 'Q1:').replace('Q2', 'Q2:').replace('Q3', 'Q3:').replace('Q4', 'Q4:')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* WSJF Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted)]">WSJF ≥</span>
          <Input
            type="number"
            step="0.1"
            placeholder="0"
            value={filters.wsjf_min || ''}
            onChange={(e) => onFiltersChange({ ...filters, wsjf_min: e.target.value })}
            className="w-20"
          />
        </div>

        {/* Clear Filters */}
        {Object.keys(filters).some(key => filters[key] && filters[key] !== 'all' && filters[key] !== '') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({})}
            className="text-[var(--muted)] hover:text-[var(--text)]"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

const TriageBacklogList = ({ items, onSelectItem, onAddItem, levelConfig, sortConfig, setSortConfig, filters, onFiltersChange }) => {
  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'desc' });
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug_report': return '🐛';
      case 'idea': return '💡';
      case 'feedback': return '💬';
      default: return '📝';
    }
  };
  
  // Apply filters and then sort
  const filteredAndSortedItems = [...items]
    .filter(item => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!item.subject?.toLowerCase().includes(searchTerm) && 
            !item.description?.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.type && filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.priority && filters.priority !== 'all' && item.priority !== filters.priority) return false;
      if (filters.quadrant && filters.quadrant !== 'all') {
        if (filters.quadrant === 'unassigned' && item.quadrant) return false;
        if (filters.quadrant !== 'unassigned' && item.quadrant !== filters.quadrant) return false;
      }
      if (filters.wsjf_min && (!item.wsjf_score || item.wsjf_score < parseFloat(filters.wsjf_min))) return false;
      return true;
    })
    .sort((a, b) => {
      const key = sortConfig.key;
      let valA = a[key] || 0;
      let valB = b[key] || 0;

      if (key === 'subject') {
        valA = a.subject || '';
        valB = b.subject || '';
        return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      if (sortConfig.direction === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

  return (
    <div className="space-y-4">
      <div className="relative z-10">
        <BacklogFilters 
          level="triage" 
          filters={filters} 
          onFiltersChange={onFiltersChange}
          itemCount={filteredAndSortedItems.length}
        />
      </div>
      
      <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-[var(--border)]">
          <h3 className="font-bold text-lg text-[var(--text)] flex items-center gap-2">
            <levelConfig.icon className="w-5 h-5" />
            {levelConfig.name} Backlog
          </h3>
          <Button onClick={() => onAddItem(levelConfig.id)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Feedback Item
          </Button>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {filteredAndSortedItems.length > 0 ? (
            filteredAndSortedItems.map(item => (
              <div key={item.id} onClick={() => onSelectItem(item, levelConfig.id)} className="p-4 hover.bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-1">{getTypeIcon(item.type)}</span>
                  <div>
                    <div className="font-medium text-[var(--text)]">{item.subject}</div>
                    <p className="text-sm text-[var(--muted)] line-clamp-2">{item.description}</p>
                  </div>
                </div>
                {item.wsjf_score != null && (
                  <div className="flex flex-col items-center justify-center bg-red-100/80 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg px-3 py-1.5 shrink-0">
                    <span className="text-xs font-bold">WSJF</span>
                    <span className="text-lg font-bold">{item.wsjf_score.toFixed(1)}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[var(--muted)]">
              {Object.keys(filters).some(key => filters[key] && filters[key] !== 'all' && filters[key] !== '') 
                ? 'No items match the current filters.' 
                : 'No items in the triage backlog.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BacklogList = ({ items, onSelectItem, onAddItem, levelConfig, sortConfig, setSortConfig, filters, onFiltersChange }) => {
  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'desc' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      funnel: 'bg-gray-200 text-gray-800',
      reviewing: 'bg-blue-200 text-blue-800',
      analyzing: 'bg-purple-200 text-purple-800',
      portfolio_backlog: 'bg-yellow-200 text-yellow-800',
      backlog: 'bg-yellow-200 text-yellow-800',
      implementing: 'bg-orange-200 text-orange-800',
      validating: 'bg-teal-200 text-teal-800',
      done: 'bg-green-200 text-green-800',
      // For team backlog, some statuses might overlap with triage
      new: 'bg-blue-200 text-blue-800',
      under_consideration: 'bg-yellow-200 text-yellow-800',
      planned: 'bg-green-200 text-green-800',
      in_progress: 'bg-orange-200 text-orange-800',
      resolved: 'bg-gray-200 text-gray-800',
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };
  
  // Apply filters and then sort
  const filteredAndSortedItems = [...items]
    .filter(item => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!item.name?.toLowerCase().includes(searchTerm) && 
            !item.description?.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.type && filters.type !== 'all' && item.type !== filters.type) return false; // For team backlog
      if (filters.priority && filters.priority !== 'all' && item.priority !== filters.priority) return false; // For team backlog
      if (filters.wsjf_min && (!item.wsjf_score || item.wsjf_score < parseFloat(filters.wsjf_min))) return false;
      return true;
    })
    .sort((a, b) => {
      const key = sortConfig.key;
      let valA = a[key] || 0;
      let valB = b[key] || 0;

      if (key === 'name') {
        valA = a.name || '';
        valB = b.name || '';
        return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      if (sortConfig.direction === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'wsjf_score', label: 'WSJF' },
    { key: 'business_value', label: 'BV' },
    { key: 'time_criticality', label: 'TC' },
    { key: 'risk_reduction', label: 'RR' },
    { key: 'job_size', label: 'Size' },
    { key: 'status', label: 'Status' },
  ];

  if (levelConfig.id === 'team') {
    headers.splice(1, 5); // Remove WSJF, BV, TC, RR, Size for Team backlog
    headers.splice(1, 0, { key: 'type', label: 'Type' }, { key: 'priority', label: 'Priority' }); // Add Type and Priority
  }

  return (
    <div className="space-y-4">
      <div className="relative z-10">
        <BacklogFilters 
          level={levelConfig.id} 
          filters={filters} 
          onFiltersChange={onFiltersChange}
          itemCount={filteredAndSortedItems.length}
        />
      </div>
      
      <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-[var(--border)]">
          <h3 className="font-bold text-lg text-[var(--text)] flex items-center gap-2">
            <levelConfig.icon className="w-5 h-5" />
            {levelConfig.name} Backlog
          </h3>
          <Button onClick={() => onAddItem(levelConfig.id)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add {levelConfig.name} Item
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                {headers.map(header => (
                  <th key={header.key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    <button onClick={() => handleSort(header.key)} className="flex items-center gap-1 hover:text-[var(--text)]">
                      {header.label}
                      {sortConfig.key === header.key && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredAndSortedItems.map(item => (
                <tr key={item.id} onClick={() => onSelectItem(item, levelConfig.id)} className="hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-[var(--text)]">{item.name || item.subject}</div> {/* Use name for most, subject for team feedback items */}
                    <div className="text-xs text-[var(--muted)] line-clamp-1">{item.description}</div>
                  </td>
                  {levelConfig.id === 'team' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)] capitalize">{item.type?.replace('_', ' ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)] capitalize">{item.priority || 'N/A'}</td>
                    </>
                  )}
                  {levelConfig.id !== 'team' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-[var(--accent)]">
                        {item.wsjf_score?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">{item.business_value || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">{item.time_criticality || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">{item.risk_reduction || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">{item.job_size || 'N/A'}</td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
               {filteredAndSortedItems.length === 0 && (
                <tr>
                  <td colSpan={headers.length} className="text-center py-8 text-[var(--muted)]">
                    {Object.keys(filters).some(key => filters[key] && filters[key] !== 'all' && filters[key] !== '') 
                      ? 'No items match the current filters.' 
                      : 'No items in this backlog.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default function BacklogManager() {
  const [activeLevel, setActiveLevel] = useState('triage');
  const [data, setData] = useState({
    triage: [],
    portfolio: [],
    solution: [],
    art: [],
    team: [],
  });
  const [loading, setLoading] = useState(true);
  
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLevel, setFormLevel] = useState(null);
  const [formParentItem, setFormParentItem] = useState(null);

  const [viewingItem, setViewingItem] = useState(null);
  const [viewingLevel, setViewingLevel] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'wsjf_score', direction: 'desc' });
  const [filters, setFilters] = useState({});

  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [initiatives, capabilities, features, allFeedback] = await Promise.all([
        Initiative.list('-wsjf_score'),
        Capability.list('-wsjf_score'),
        Feature.list('-wsjf_score'),
        Feedback.list('-created_date', 1000),
      ]);
      
      // Filter feedback for different backlog levels
      const triageFeedback = allFeedback.filter(item => {
        // Include all feedback, ideas, and bug reports that haven't been promoted
        // Exclude user_story and enabler_story as they belong in Team backlog when linked to features
        const isTriageType = ['feedback', 'idea', 'bug_report'].includes(item.type);
        const isNotPromoted = !item.feature_id; // Not linked to a feature yet
        return isTriageType && isNotPromoted;
      });
      
      const teamStories = allFeedback.filter(item => 
        (item.type === 'user_story' || item.type === 'enabler_story') && item.feature_id
      );
      
      setData({
        triage: triageFeedback,
        portfolio: initiatives,
        solution: capabilities,
        art: features,
        team: teamStories,
      });
    } catch (error) {
      console.error('Failed to load backlog data:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load backlog data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (level) => {
    setEditingItem(null);
    setFormParentItem(null);
    setFormLevel(level);
    setShowItemForm(true);
  };
  
  const handleSelectItem = (item, level) => {
    setViewingItem(item);
    setViewingLevel(level);
  };

  const handleAddChild = (parentLevel, parent) => {
    const parentConfig = backlogLevels.find(l => l.id === parentLevel);
    if (!parentConfig || !parentConfig.child) {
      toast({ variant: 'destructive', title: 'Error', description: `Cannot add a child to ${parentConfig?.name || 'this level'}.` });
      return;
    }

    setViewingItem(null);
    setEditingItem(null);
    setFormParentItem(parent);
    setFormLevel(parentConfig.child);
    setShowItemForm(true);
  };

  const handleFormSuccess = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setFormParentItem(null);
    loadAllData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const activeLevelConfig = backlogLevels.find(l => l.id === activeLevel);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text)]">Primary Unified Backlog</h2>
      </div>

      {/* Level Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-2">
        {backlogLevels.map(level => (
          <Button
            key={level.id}
            variant={activeLevel === level.id ? 'secondary' : 'ghost'}
            onClick={() => {setActiveLevel(level.id); setFilters({});}}
            className="flex items-center gap-2"
          >
            <level.icon className="w-4 h-4" />
            {level.name}
            <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
              {data[level.id]?.length || 0}
            </span>
          </Button>
        ))}
      </div>

      <div>
        {activeLevel === 'triage' ? (
          <TriageBacklogList 
            items={data[activeLevel]}
            onSelectItem={handleSelectItem}
            onAddItem={handleAddItem}
            levelConfig={activeLevelConfig}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            filters={filters}
            onFiltersChange={setFilters}
          />
        ) : (
          <BacklogList 
            items={data[activeLevel]}
            onSelectItem={handleSelectItem}
            onAddItem={handleAddItem}
            levelConfig={activeLevelConfig}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}
      </div>

      {showItemForm && (
        <BacklogItemForm
          item={editingItem}
          level={formLevel}
          parentItem={formParentItem}
          onClose={() => setShowItemForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {viewingItem && (
        <BacklogItemView
          item={viewingItem}
          level={viewingLevel}
          onClose={() => setViewingItem(null)}
          onAddChild={handleAddChild}
          onEdit={(item, level) => {
            setViewingItem(null);
            setEditingItem(item);
            setFormLevel(level);
            setFormParentItem(null);
            setShowItemForm(true);
          }}
        />
      )}
    </div>
  );
}
