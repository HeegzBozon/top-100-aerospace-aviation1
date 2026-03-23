import { useState, useEffect } from 'react';
import { resetAllScores } from '@/functions/resetAllScores';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function AdminAction() {
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Resetting all scores to default values. This may take a few moments...');

    useEffect(() => {
        const performReset = async () => {
            try {
                const { data } = await resetAllScores();
                if (data && data.success) {
                    setStatus('success');
                    setMessage(data.message || 'All scores have been reset successfully!');
                } else {
                    throw new Error(data?.error || "An unknown error occurred during the reset.");
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.message || 'Failed to reset scores.');
            }
        };

        performReset();
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
            <div className="bg-[var(--card)]/80 backdrop-blur-2xl rounded-2xl border border-[var(--border)] p-8 text-center max-w-md w-full shadow-2xl">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-[var(--text)]">Resetting Scores...</h2>
                        <p className="text-[var(--muted)]">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text)]">Reset Complete!</h2>
                        <p className="text-[var(--muted)]">{message}</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text)]">Error</h2>
                        <p className="text-[var(--muted)]">{message}</p>
                    </>
                )}
                 <Link to={createPageUrl('Admin?tab=engine_tuning')} className="mt-6 inline-block">
                    <Button variant="outline">Back to Admin Panel</Button>
                </Link>
            </div>
        </div>
    );
}