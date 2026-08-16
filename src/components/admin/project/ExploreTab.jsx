import { useState } from 'react';
import { LayoutGrid, Layers } from 'lucide-react';
import TypeGrouping from './TypeGrouping';
import PrioritizationMatrix from './PrioritizationMatrix';

export default function ExploreTab({ items, loading, onEdit, onCreate, onBulkUpdate, onUpdateItem, levelConfig }) {
    const [view, setView] = useState('matrix');

    const groupingProps = {
        items,
        loading,
        onEdit,
        onCreate,
        onBulkUpdate,
        groups: levelConfig.groups,
        groupKey: levelConfig.groupKey,
        labelKey: levelConfig.labelKey,
    };

    if (levelConfig.hasMatrix) {
        return (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="inline-flex rounded-lg overflow-hidden" style={{ border: '1px solid #1e3a5a60' }}>
                        <button
                            onClick={() => setView('matrix')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
                            style={{
                                background: view === 'matrix' ? '#1e3a5a' : 'transparent',
                                color: view === 'matrix' ? 'white' : '#5d7a94',
                            }}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Prioritization Matrix
                        </button>
                        <button
                            onClick={() => setView('type')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
                            style={{
                                background: view === 'type' ? '#1e3a5a' : 'transparent',
                                color: view === 'type' ? 'white' : '#5d7a94',
                            }}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            By Type
                        </button>
                    </div>
                </div>

                {view === 'matrix' ? (
                    <PrioritizationMatrix
                        items={items}
                        loading={loading}
                        onEdit={onEdit}
                        onCreate={onCreate}
                        onUpdateItem={onUpdateItem}
                        labelKey={levelConfig.labelKey}
                    />
                ) : (
                    <TypeGrouping {...groupingProps} />
                )}
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm mb-3" style={{ color: '#5d7a94' }}>
                {levelConfig.label} parking lot — explore and triage {levelConfig.sub.toLowerCase()} by type. Drag to reorder priority within each lane.
            </p>
            <TypeGrouping {...groupingProps} />
        </div>
    );
}