
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Edit, Layers, Milestone, Flag, GitCommit, Plus, Loader2 } from 'lucide-react';
import { Capability } from '@/entities/Capability';
import { Feature } from '@/entities/Feature';
import { Feedback } from '@/entities/Feedback';

const levelConfigMap = {
  triage: { name: 'Feedback Item', icon: GitCommit, childEntity: null, childLevel: null, parentField: null },
  portfolio: { name: 'Initiative (Epic)', icon: Layers, childEntity: Capability, childLevel: 'solution', parentField: 'initiative_id' },
  solution: { name: 'Capability', icon: Milestone, childEntity: Feature, childLevel: 'art', parentField: 'capability_id' },
  art: { name: 'Feature', icon: Flag, childEntity: Feedback, childLevel: 'team', parentField: 'feature_id' },
  team: { name: 'Story', icon: GitCommit, childEntity: null, childLevel: null, parentField: null },
};

function ChildItemsList({ parentItem, config, onAddChild }) {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            if (!config || !config.childEntity) {
                setLoading(false);
                return;
            }
            try {
                const filter = { [config.parentField]: parentItem.id };
                const childItems = await config.childEntity.filter(filter);
                setChildren(childItems);
            } catch (error) {
                console.error("Failed to fetch child items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, [parentItem, config]);

    if (!config || !config.childLevel) {
        return null;
    }

    if (loading) {
        return <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div>;
    }
    
    const childConfig = levelConfigMap[config.childLevel];
    if (!childConfig) return null;
    const ChildIcon = childConfig.icon;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <ChildIcon className="w-4 h-4" />
                    Child {childConfig.name}s
                </h4>
                <Button size="sm" onClick={() => onAddChild(config.childLevel, parentItem)} className="text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Child
                </Button>
            </div>
            
            {children.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    No child items have been created yet.
                </div>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                    {children.map(child => (
                        <div key={child.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                            <div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{child.name || child.subject}</span>
                                {child.wsjf_score != null && (
                                    <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        WSJF: {child.wsjf_score.toFixed(2)}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {child.status || 'No Status'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function BacklogItemView({ item, level, onClose, onAddChild, onEdit }) {
    if (!item || !level) {
        return null;
    }
    
    const config = levelConfigMap[level];
    
    if (!config) {
        console.error(`No config found for level: ${level}`);
        return null;
    }

    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <IconComponent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {item.name || item.subject}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {config.name}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                            <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                {item.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</h4>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                    {item.status || 'No Status'}
                                </span>
                            </div>
                            
                            {item.wsjf_score != null && (
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">WSJF Score</h4>
                                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                        {item.wsjf_score.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {item.priority && (
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Priority</h4>
                                    <span className="capitalize text-gray-700 dark:text-gray-300">
                                        {item.priority}
                                    </span>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Created</h4>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">
                                    {new Date(item.created_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {(item.business_value || item.time_criticality || item.risk_reduction || item.job_size) && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">WSJF Components</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {item.business_value && (
                                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{item.business_value}</div>
                                            <div className="text-xs text-blue-500 dark:text-blue-300">Business Value</div>
                                        </div>
                                    )}
                                    {item.time_criticality && (
                                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{item.time_criticality}</div>
                                            <div className="text-xs text-orange-500 dark:text-orange-300">Time Criticality</div>
                                        </div>
                                    )}
                                    {item.risk_reduction && (
                                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="text-lg font-bold text-green-600 dark:text-green-400">{item.risk_reduction}</div>
                                            <div className="text-xs text-green-500 dark:text-green-300">Risk Reduction</div>
                                        </div>
                                    )}
                                    {item.job_size && (
                                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{item.job_size}</div>
                                            <div className="text-xs text-purple-500 dark:text-purple-300">Job Size</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <ChildItemsList 
                            parentItem={item} 
                            config={config} 
                            onAddChild={onAddChild}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={() => onEdit(item, level)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>
        </div>
    );
}
