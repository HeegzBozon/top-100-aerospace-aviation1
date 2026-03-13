
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowUp, ChevronsUp, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Panel = ({ title, icon, data, isLoading, onNomineeClick }) => {
    const Icon = icon;
    return (
        <div className="bg-[var(--glass)] border border-[var(--border)] rounded-2xl p-4">
            <h3 className="flex items-center gap-2 font-bold mb-3 text-[var(--accent)]">
                <Icon className="w-5 h-5" />
                <span>{title}</span>
            </h3>
            <div className="space-y-3">
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))
                ) : (
                    data.map((nominee, i) => (
                        <motion.div 
                            key={nominee.nomineeId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                            onClick={() => onNomineeClick?.(nominee)}
                        >
                            <img src={nominee.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${nominee.nomineeName}`} alt={nominee.nomineeName} className="w-8 h-8 rounded-full object-cover"/>
                            <div>
                                <p className="font-semibold text-sm truncate">{nominee.nomineeName}</p>
                                <p className="text-xs text-[var(--muted)]">Rank: {nominee.rank}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default function MomentumZone({ panels, isLoading, onNomineeClick }) {
    return (
        <div className="space-y-6">
            <Panel title="Rising Stars" icon={ChevronsUp} data={panels.risingStars} isLoading={isLoading} onNomineeClick={onNomineeClick} />
            <Panel title="Hot Seat" icon={Flame} data={panels.hotSeat} isLoading={isLoading} onNomineeClick={onNomineeClick} />
            <Panel title="Clutch Performers" icon={ArrowUp} data={panels.clutchPerformers} isLoading={isLoading} onNomineeClick={onNomineeClick} />
            <Panel title="New Entries" icon={UserPlus} data={panels.newEntries} isLoading={isLoading} onNomineeClick={onNomineeClick} />
        </div>
    );
}
