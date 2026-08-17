import { useState, useEffect } from 'react';
import { LayoutGrid, Layers, Rocket, ShieldAlert } from 'lucide-react';
import TypeGrouping from './TypeGrouping';
import PrioritizationMatrix from './PrioritizationMatrix';
import HorizonView from './HorizonView';
import OrphanTriage from './OrphanTriage';
import { getOrphans } from './TraceabilityHealth';

export default function ExploreTab({ items, loading, onEdit, onCreate, onBulkUpdate, onUpdateItem, levelConfig, level, onOpenDetail, onQuickAdd, forceTriage, onTriageHandled }) {
    const [view, setView] = useState('matrix');
    const hasHorizons = !!levelConfig.horizons;
    const orphanCount = getOrphans(items, level).length;

    useEffect(() => {
        if (forceTriage) {
            setView('triage');
            onTriageHandled?.();
        }
    }, [forceTriage, onTriageHandled]);

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

    const toggleBtn = (key, icon, label) => (
        <button
            onClick={() => setView(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
                background: view === key ? '#1e3a5a' : 'transparent',
                color: view === key ? 'white' : '#5d7a94',
            }}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex rounded-lg overflow-hidden" style={{ border: '1px solid #1e3a5a60' }}>
                    {toggleBtn('matrix', <LayoutGrid className="w-3.5 h-3.5" />, 'Prioritization Matrix')}
                    {toggleBtn('type', <Layers className="w-3.5 h-3.5" />, 'By Type')}
                    {hasHorizons && toggleBtn('horizon', <Rocket className="w-3.5 h-3.5" />, 'Horizons')}
                    {orphanCount > 0 && (
                        <button
                            onClick={() => setView('triage')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ml-auto"
                            style={{
                                background: view === 'triage' ? '#c87e9d' : '#c87e9d20',
                                color: view === 'triage' ? 'white' : '#c87e9d',
                            }}
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Triage {orphanCount}
                        </button>
                    )}
                </div>
            </div>

            {view === 'matrix' && (
                <PrioritizationMatrix
                    items={items}
                    loading={loading}
                    onEdit={onEdit}
                    onOpenDetail={onOpenDetail}
                    onQuickAdd={onQuickAdd}
                    onCreate={onCreate}
                    onUpdateItem={onUpdateItem}
                    labelKey={levelConfig.labelKey}
                />
            )}

            {view === 'triage' && (
                <OrphanTriage
                    items={items}
                    level={level}
                    levelConfig={levelConfig}
                    onEdit={onEdit}
                    onOpenDetail={onOpenDetail}
                />
            )}

            {view === 'type' && <TypeGrouping {...groupingProps} />}

            {view === 'horizon' && hasHorizons && (
                <HorizonView
                    items={items}
                    loading={loading}
                    onEdit={onEdit}
                    onCreate={onCreate}
                    onUpdateItem={onUpdateItem}
                    horizons={levelConfig.horizons}
                    labelKey={levelConfig.labelKey}
                />
            )}
        </div>
    );
}