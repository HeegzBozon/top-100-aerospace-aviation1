import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import WorkCard from './WorkCard';
import WorkDetailModal from './WorkDetailModal';

export default function NomineeWorksPanel({ nomineeId }) {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkId, setSelectedWorkId] = useState(null);

  useEffect(() => {
    if (!nomineeId) return;

    const loadWorks = async () => {
      setLoading(true);
      try {
        // Get all credits for this nominee
        const credits = await base44.entities.WorkCredit.filter(
          { nominee_id: nomineeId },
          '-created_date',
          100
        );

        // Fetch full work objects
        const workIds = [...new Set(credits.map(c => c.work_id))];
        const worksData = await Promise.all(
          workIds.map(id => base44.entities.Work.read(id))
        );

        setWorks(worksData.filter(Boolean));
      } catch (err) {
        console.error('Error loading works:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorks();
  }, [nomineeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-500">No works found for this person</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <WorkCard
            key={work.id}
            work={work}
            onClick={() => setSelectedWorkId(work.id)}
          />
        ))}
      </div>

      <WorkDetailModal
        workId={selectedWorkId}
        open={!!selectedWorkId}
        onOpenChange={(open) => !open && setSelectedWorkId(null)}
      />
    </>
  );
}