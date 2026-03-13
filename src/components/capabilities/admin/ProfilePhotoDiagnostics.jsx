import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle, Camera, Loader2, RefreshCw } from 'lucide-react';

export default function ProfilePhotoDiagnostics() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        try {
            const { data } = await base44.functions.invoke('diagnoseProfilePhotos', {});
            if (data.success) {
                setReport(data.report);
            }
        } catch (error) {
            console.error('Diagnostic error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Camera className="w-6 h-6 text-purple-500" />
                            <CardTitle>Profile Photo Diagnostics</CardTitle>
                        </div>
                        <Button onClick={runDiagnostics} disabled={loading}>
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Run Diagnostics
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {!report && !loading && (
                        <div className="text-center py-8 text-[var(--muted)]">
                            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Click "Run Diagnostics" to analyze profile photo issues</p>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-[var(--accent)]" />
                            <p className="text-[var(--muted)]">Analyzing profile photos...</p>
                        </div>
                    )}

                    {report && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-blue-50">
                                    <CardContent className="pt-6">
                                        <div className="text-sm text-gray-600 mb-1">User Photos</div>
                                        <div className="text-2xl font-bold">{report.users.withPhotos} / {report.users.total}</div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            {report.users.withoutPhotos} missing
                                            {report.users.brokenUrls.length > 0 && `, ${report.users.brokenUrls.length} broken`}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-purple-50">
                                    <CardContent className="pt-6">
                                        <div className="text-sm text-gray-600 mb-1">Nominee Photos</div>
                                        <div className="text-2xl font-bold">{report.nominees.withPhotos} / {report.nominees.total}</div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            {report.nominees.withoutPhotos} missing
                                            {report.nominees.brokenUrls.length > 0 && `, ${report.nominees.brokenUrls.length} broken`}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* URL Patterns */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">URL Pattern Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="font-semibold">Supabase</div>
                                            <div className="text-xl">{report.urlPatterns.supabaseUrls}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="font-semibold">Base44</div>
                                            <div className="text-xl">{report.urlPatterns.base44Urls}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="font-semibold">External</div>
                                            <div className="text-xl">{report.urlPatterns.externalUrls}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="font-semibold">Empty</div>
                                            <div className="text-xl">{report.urlPatterns.emptyUrls}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="font-semibold">Null</div>
                                            <div className="text-xl">{report.urlPatterns.nullUrls}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recommendations */}
                            {report.recommendations.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {report.recommendations.map((rec, idx) => (
                                                <div key={idx} className={`border rounded-lg p-4 ${getSeverityColor(rec.severity)}`}>
                                                    <div className="flex items-start gap-3">
                                                        {rec.severity === 'HIGH' ? (
                                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                        ) : (
                                                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="font-semibold mb-1">{rec.issue}</div>
                                                            <div className="text-sm mb-2">{rec.detail}</div>
                                                            <div className="text-sm font-medium">Action: {rec.action}</div>
                                                            {rec.examples && (
                                                                <details className="mt-2 text-xs">
                                                                    <summary className="cursor-pointer font-medium">View Examples</summary>
                                                                    <pre className="mt-2 bg-white/50 p-2 rounded overflow-x-auto">
                                                                        {JSON.stringify(rec.examples, null, 2)}
                                                                    </pre>
                                                                </details>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Sample URLs */}
                            {report.users.sampleUrls.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Sample User Photo URLs</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-xs">
                                            {report.users.sampleUrls.map((sample, idx) => (
                                                <div key={idx} className="bg-gray-50 p-2 rounded">
                                                    <div className="font-semibold">{sample.email}</div>
                                                    <div className="text-[var(--muted)] break-all">{sample.url}</div>
                                                    <Badge variant="outline" className="mt-1">{sample.urlType}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}