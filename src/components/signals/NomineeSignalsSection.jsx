import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShareableSignalCard from './ShareableSignalCard';
import { BookOpen, Award, Newspaper, Zap, Loader2 } from 'lucide-react';

export default function NomineeSignalsSection({ nomineeId, nomineeName }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await base44.entities.SignalCard.filter(
          { nominee_id: nomineeId },
          '-signal_date',
          50
        );
        setSignals(data || []);
      } catch (error) {
        console.error('Error loading signals:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nomineeId]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (signals.length === 0) {
    return null;
  }

  const groupedByType = {
    patent: signals.filter(s => s.signal_type === 'patent'),
    publication: signals.filter(s => s.signal_type === 'publication'),
    media_mention: signals.filter(s => s.signal_type === 'media_mention'),
    citation: signals.filter(s => s.signal_type === 'citation'),
  };

  const typeConfig = {
    patent: { label: 'Patents', icon: Award, color: 'text-purple-600' },
    publication: { label: 'Research', icon: BookOpen, color: 'text-blue-600' },
    media_mention: { label: 'Media', icon: Newspaper, color: 'text-orange-600' },
    citation: { label: 'Citations', icon: Zap, color: 'text-green-600' },
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Impact Signals</span>
          <span className="text-sm font-normal text-slate-500">({signals.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All
            </TabsTrigger>
            {Object.entries(groupedByType).map(([type, items]) => {
              const config = typeConfig[type];
              const Icon = config.icon;
              return (
                <TabsTrigger
                  key={type}
                  value={type}
                  disabled={items.length === 0}
                  className="text-xs sm:text-sm"
                >
                  <Icon className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">{config.label}</span>
                  <span className="sm:hidden">{items.length}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {signals.map(signal => (
              <ShareableSignalCard
                key={signal.id}
                signal={signal}
                nomineeName={nomineeName}
                compact={true}
              />
            ))}
          </TabsContent>

          {Object.entries(groupedByType).map(([type, items]) => (
            <TabsContent key={type} value={type} className="space-y-3 mt-4">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No {typeConfig[type].label.toLowerCase()} found
                </p>
              ) : (
                items.map(signal => (
                  <ShareableSignalCard
                    key={signal.id}
                    signal={signal}
                    nomineeName={nomineeName}
                    compact={true}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}