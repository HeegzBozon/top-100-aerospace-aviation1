import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Code2, ExternalLink } from 'lucide-react';

export default function SignalEmbed() {
  const [selectedSignalId, setSelectedSignalId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [signals, setSignals] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const load = async () => {
      try {
        const [cardsData, nomineesData] = await Promise.all([
          base44.entities.SignalCard.filter({ confidence: 'A' }, '-signal_date', 100),
          base44.entities.Nominee.filter({ status: 'active' }, null, 1000),
        ]);
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

  const filteredSignals = useMemo(() => {
    if (!searchQuery) return signals;
    const q = searchQuery.toLowerCase();
    return signals.filter(
      s =>
        s.headline?.toLowerCase().includes(q) ||
        s.source_name?.toLowerCase().includes(q)
    );
  }, [signals, searchQuery]);

  const selectedSignal = selectedSignalId
    ? signals.find(s => s.id === selectedSignalId)
    : null;
  const nominee = selectedSignal
    ? nominees.find(n => n.id === selectedSignal.nominee_id)
    : null;

  const generateEmbedCode = (signalId, width = 400, height = 300) => {
    return `<!-- Aerospace Dashboard - Impact Signal Embed -->
<div id="signal-${signalId}"></div>
<script src="${window.location.origin}/embed/signal.js"></script>
<script>
  window.AerospaceSignal = window.AerospaceSignal || {};
  window.AerospaceSignal.render('${signalId}', {
    width: ${width},
    height: ${height}
  });
</script>`;
  };

  const handleCopyEmbed = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Signal Embed Builder</h1>
          <p className="text-slate-600">
            Create embeddable cards for your website or blog
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Signal List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Search signals..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="text-sm"
                />

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
                  ) : filteredSignals.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No signals found</p>
                  ) : (
                    filteredSignals.map(signal => {
                      const sig_nominee = nominees.find(n => n.id === signal.nominee_id);
                      return (
                        <button
                          key={signal.id}
                          onClick={() => setSelectedSignalId(signal.id)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                            selectedSignalId === signal.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <p className="font-medium text-slate-900 line-clamp-2">
                            {signal.headline}
                          </p>
                          <p className="text-slate-500 mt-1">{sig_nominee?.name}</p>
                          <Badge className="mt-2 text-xs bg-slate-100 text-slate-700">
                            {signal.signal_type}
                          </Badge>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Embed Code */}
          <div className="lg:col-span-2 space-y-6">
            {selectedSignal ? (
              <>
                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-slate-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                          S
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
                            {selectedSignal.headline}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {nominee?.name} • {selectedSignal.source_name}
                          </p>
                        </div>
                      </div>
                      {selectedSignal.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {selectedSignal.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {selectedSignal.evidence_links?.[0] && (
                        <a
                          href={selectedSignal.evidence_links[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          View source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Embed Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      Embed Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                        {generateEmbedCode(selectedSignal.id, 400, 300)}
                      </pre>
                    </div>
                    <Button
                      onClick={() =>
                        handleCopyEmbed(generateEmbedCode(selectedSignal.id, 400, 300))
                      }
                      className="w-full gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Code
                        </>
                      )}
                    </Button>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                      <p className="font-medium mb-1">How to use:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Copy the code above</li>
                        <li>Paste into your website's HTML</li>
                        <li>The signal will appear as an embeddable card</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500">Select a signal to generate embed code</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}