import React, { useState, useEffect } from 'react';
import { factoryReset } from '@/functions/factoryReset';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function FactoryReset() {
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Performing factory reset. This may take several minutes...');
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const performReset = async () => {
            try {
                const { data } = await factoryReset();
                if (data && data.success) {
                    setStatus('success');
                    setMessage(data.message || 'Factory reset completed successfully!');
                    setSummary(data.summary);
                } else {
                    throw new Error(data?.error || "An unknown error occurred during the factory reset.");
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.message || 'Failed to perform factory reset.');
            }
        };
        performReset();
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
            <div className="bg-[var(--card)]/80 backdrop-blur-2xl rounded-2xl border border-[var(--border)] p-8 text-center max-w-lg w-full shadow-2xl">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-[var(--text)] mb-2">Factory Reset In Progress</h2>
                        <p className="text-[var(--muted)] mb-4">{message}</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                                <p className="text-sm text-yellow-800">Please do not close this window or navigate away.</p>
                            </div>
                        </div>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-[var(--text)] mb-2">Factory Reset Complete!</h2>
                        <p className="text-[var(--muted)] mb-4">{message}</p>
                        {summary && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                                <h3 className="font-semibold text-green-800 mb-2">Reset Summary:</h3>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• {summary.users_reset} users reset to default</li>
                                    <li>• {summary.nominees_reset} nominees reset to default</li>
                                    <li>• {summary.pairwise_votes_deleted} pairwise votes deleted</li>
                                    <li>• {summary.standings_deleted} standings records deleted</li>
                                    <li>• {summary.reward_grants_deleted} reward transactions deleted</li>
                                    <li>• All monitoring data cleared</li>
                                </ul>
                            </div>
                        )}
                        <Link to={createPageUrl('Admin')}>
                            <Button className="bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white">
                                Return to Admin Panel
                            </Button>
                        </Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-[var(--text)] mb-2">Factory Reset Failed</h2>
                        <p className="text-red-600 mb-6">{message}</p>
                        <Link to={createPageUrl('Admin')}>
                            <Button variant="outline">Return to Admin Panel</Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}