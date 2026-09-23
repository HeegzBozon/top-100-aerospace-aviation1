import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Layers, CalendarRange } from 'lucide-react';
import SeasonForm from './SeasonForm';
import NomineeRolloverWizard from './NomineeRolloverWizard';
import { groupSeasons } from './season-manager/seasonGrouping';
import useIntakeBacklog from './season-manager/useIntakeBacklog';
import SeasonGroupList from './season-manager/SeasonGroupList';
import SeasonGroupDashboard from './season-manager/SeasonGroupDashboard';
import LooseSeasonsSection from './season-manager/LooseSeasonsSection';
import NewSeasonDialog from './season-manager/NewSeasonDialog';
import NestSeasonsDialog from './season-manager/NestSeasonsDialog';

export default function SeasonManager({ seasons, onSeasonsUpdate, onViewSeason, onNavigate }) {
  const { currentGroups, pastGroups, looseCurrent, loosePast } = useMemo(() => groupSeasons(seasons), [seasons]);
  const [tab, setTab] = useState('current');
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [rollover, setRollover] = useState(null);
  const [dialog, setDialog] = useState(null);
  const { counts: backlog } = useIntakeBacklog();

  const groups = tab === 'current' ? currentGroups : pastGroups;
  const loose = tab === 'current' ? looseCurrent : loosePast;
  const selected = groups.find((g) => g.group.id === selectedId) || groups[0];
  const previousSeasons = seasons.filter((s) => !s.is_group && ['completed', 'archived'].includes(s.status));
  const refresh = () => onSeasonsUpdate?.();
  const handlers = { onEdit: setEditing, onRollover: setRollover, onView: onViewSeason, onNavigate, onChanged: refresh, backlog };

  return (
    <div className="max-w-7xl mx-auto space-y-8 bg-editorial-cream -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 min-h-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-copper font-bold">Season Ops</p>
          <h1 className="font-heading text-4xl text-editorial-navy mt-1">Season Manager</h1>
          <p className="text-sm text-editorial-navy/60 mt-1">Each season holds its cohorts. Work down the checklist from setup to an activated pool.</p>
        </div>
        <div className="flex gap-2">
          {looseCurrent.length > 0 && (
            <Button variant="outline" onClick={() => setDialog('nest')} className="border-editorial-navy/20 text-editorial-navy"><Layers className="w-4 h-4 mr-1.5" />Group seasons</Button>
          )}
          <Button onClick={() => setDialog('new')} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white"><Plus className="w-4 h-4 mr-1.5" />New season</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelectedId(null); }}>
        <TabsList>
          <TabsTrigger value="current">Current ({currentGroups.length + looseCurrent.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastGroups.length + loosePast.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {selected ? (
        <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
          <SeasonGroupList groups={groups} selectedId={selected.group.id} onSelect={setSelectedId} />
          <SeasonGroupDashboard key={selected.group.id} entry={selected} handlers={handlers} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-editorial-navy/20 bg-white/60 py-16 text-center">
          <CalendarRange className="w-9 h-9 mx-auto text-editorial-gold mb-3" />
          <p className="font-heading text-xl text-editorial-navy">{tab === 'current' ? 'No grouped seasons yet' : 'No past grouped seasons'}</p>
          {tab === 'current' && (
            <>
              <p className="text-sm text-editorial-navy/60 mt-1 mb-5 max-w-md mx-auto">Create a new season with its cohorts, or group the existing Women, Men and Angels seasons under one parent.</p>
              <div className="flex justify-center gap-2">
                {looseCurrent.length > 0 && <Button variant="outline" onClick={() => setDialog('nest')} className="border-editorial-copper text-editorial-copper"><Layers className="w-4 h-4 mr-1.5" />Group seasons</Button>}
                <Button onClick={() => setDialog('new')} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white"><Plus className="w-4 h-4 mr-1.5" />New season</Button>
              </div>
            </>
          )}
        </div>
      )}

      <LooseSeasonsSection seasons={loose} handlers={handlers} title={tab === 'current' ? 'Ungrouped seasons' : 'Past ungrouped seasons'}
        onNest={tab === 'current' ? () => setDialog('nest') : null} />

      {dialog === 'new' && (
        <NewSeasonDialog open onClose={() => setDialog(null)} onCreated={(g) => { setDialog(null); setTab('current'); setSelectedId(g.id); refresh(); }} />
      )}
      {dialog === 'nest' && (
        <NestSeasonsDialog seasons={looseCurrent} onClose={() => setDialog(null)} onDone={() => { setDialog(null); setTab('current'); refresh(); }} />
      )}
      {editing && (
        <SeasonForm season={editing} previousSeasons={previousSeasons} onClose={() => setEditing(null)} onSuccess={() => { setEditing(null); refresh(); }} />
      )}
      {rollover && (
        <NomineeRolloverWizard sourceSeason={rollover} allSeasons={seasons.filter((s) => !s.is_group)} onClose={() => setRollover(null)} onComplete={refresh} />
      )}
    </div>
  );
}