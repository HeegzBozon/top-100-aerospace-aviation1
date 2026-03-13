import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function BatchNominations() {
  const [signals, setSignals] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [nominationReason, setNominationReason] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [currentUser, cardsData, nomineesData] = await Promise.all([
          base44.auth.me(),
          base44.entities.SignalCard.filter(
            { confidence: { $in: ['A', 'B'] } },
            '-signal_date',
            300
          ),
          base44.entities.Nominee.filter({ status: 'active' }, null, 1000),
        ]);
        setUser(currentUser);
        setSignals(cardsData || []);
        setNominees(nomineesData || []);
      } catch (error) {
        console.error('Error loading:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = signals;
    if (filterType !== 'all') {
      result = result.filter(s => s.signal_type === filterType);
    }
    return result;
  }, [signals, filterType]);

  const handleToggle = signalId => {
    const newSelected = new Set(selected);
    if (newSelected.has(signalId)) {
      newSelected.delete(signalId);
    } else {
      newSelected.add(signalId);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(s => s.id)));
    }
  };

  const handleSubmit = async () => {
    if (!nominationReason.trim() || selected.size === 0) {
      alert('Select signals and enter a reason');
      return;
    }

    setSubmitting(true);
    try {
      const selectedSignals = signals.filter(s => selected.has(s.id));
      let created = 0;

      for (const signal of selectedSignals) {
        const nominee = nominees.find(n => n.id === signal.nominee_id);
        try {
          await base44.entities.Nomination.create({
            nominee_id: signal.nominee_id,
            nominee_name: nominee?.name || 'Unknown',
            nominated_by: user.email,
            reason: nominationReason,
            source_type: 'signal_detection',
            source_signal_id: signal.id,
            status: 'pending',
          });
          created++;
        } catch (err) {
          console.error('Nomination error:', err);
        }
      }

      setSuccess(`Created ${created} nomination(s)`);
      setSelected(new Set());
      setNominationReason('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Batch submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Batch Nominations</h1>
          <p className="text-slate-600">Create multiple nominations from trending signals</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Signals List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter */}
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="patent">Patents</SelectItem>
                  <SelectItem value="publication">Research</SelectItem>
                  <SelectItem value="media_mention">Media</SelectItem>
                  <SelectItem value="citation">Citations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Select All */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-slate-200">
                  <Checkbox
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Select All ({filtered.length})
                  </span>
                </div>

                {/* Signal Cards */}
                {filtered.map(signal => {
                  const nominee = nominees.find(n => n.id === signal.nominee_id);
                  return (
                    <Card key={signal.id} className="cursor-pointer hover:border-blue-300 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selected.has(signal.id)}
                            onCheckedChange={() => handleToggle(signal.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 line-clamp-2">
                              {signal.headline}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {nominee?.name} • {signal.source_name}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge
                                variant="secondary"
                                className="text-xs capitalize"
                              >
                                {signal.signal_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {signal.confidence}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nomination Form */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selected.size} Selected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Nomination Reason
                  </label>
                  <Textarea
                    value={nominationReason}
                    onChange={e => setNominationReason(e.target.value)}
                    placeholder="Why nominate these people?"
                    className="min-h-20"
                    disabled={submitting}
                  />
                </div>

                {/* Success */}
                {success && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={selected.size === 0 || submitting || !nominationReason.trim()}
                  className="w-full gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create {selected.size} Nominations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}