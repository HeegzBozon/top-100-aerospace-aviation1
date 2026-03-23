import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Siren, MapPin, AlertCircle, Loader2, Skull } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConflictEvents } from '@/lib/intelligence/hooks';
import { brandColors } from '@/lib/intelligence/constants';

export function ConflictAlertsPanel() {
  const [countryFilter, setCountryFilter] = useState(null);
  const { data, isLoading, isError } = useConflictEvents(
    countryFilter ? { country: countryFilter } : {}
  );
  const events = data?.events || [];

  if (isLoading) return <PanelLoader label="conflict events" />;
  if (isError) return <PanelError message="Unable to load conflict data" />;
  if (!events.length) {
    return (
      <div className="text-center py-16 text-sm text-slate-400">
        {import.meta.env.VITE_ACLED_API_KEY
          ? 'No conflict events in this period'
          : 'Set VITE_ACLED_API_KEY and VITE_ACLED_EMAIL in .env.local to enable conflict tracking'}
      </div>
    );
  }

  const countries = [...new Set(events.map(e => e.country))].sort();
  const totalFatalities = events.reduce((sum, e) => sum + e.fatalities, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Siren className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
          <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>
            {events.length} Conflict Events
          </h3>
          {totalFatalities > 0 && (
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
              <Skull className="w-3 h-3 mr-1" />{totalFatalities} fatalities
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setCountryFilter(null)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${!countryFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
        >
          All
        </button>
        {countries.slice(0, 10).map(c => (
          <button
            key={c}
            onClick={() => setCountryFilter(c)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${countryFilter === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {events.slice(0, 50).map((event, i) => (
          <motion.div key={event.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className={`border-slate-200/50 ${event.fatalities > 5 ? 'border-red-200/60 bg-red-50/20' : 'glass-card'}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>
                      {event.eventType}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="text-xs text-slate-500">{event.country}</span>
                      {event.admin1 && <><span className="text-slate-300">·</span><span className="text-xs text-slate-500">{event.admin1}</span></>}
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{event.occurredAt}</span>
                      {event.fatalities > 0 && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                          {event.fatalities} killed
                        </Badge>
                      )}
                    </div>
                    {event.actors.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {event.actors.join(' vs ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PanelLoader({ label }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading {label}…</span></div>;
}
function PanelError({ message }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{message}</span></div>;
}
