import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Video, ExternalLink, ShieldCheck, Zap, BrainCircuit, Heart, Rocket } from 'lucide-react';

const brandColors = {
    navyDeep: '#1e3a5a',
    skyBlue: '#4a90b8',
    goldPrestige: '#c9a87c',
};

export default function StartupPitch({ startup, user, mySignal, signals }) {
    const queryClient = useQueryClient();
    const [showInterestForm, setShowInterestForm] = useState(false);
    const [message, setMessage] = useState('');

    const isFounder = user?.email === startup.founder_email;

    const signalMutation = useMutation({
        mutationFn: async (data) => {
            const res = await base44.entities.InterestSignal.create({
                startup_id: startup.id,
                investor_email: user.email,
                signal_type: 'interested',
                message: data.message,
                intro_requested: true,
            });

            await base44.entities.StartupProfile.update(startup.id, {
                interest_count: (startup.interest_count || 0) + 1
            });

            await base44.entities.Notification.create({
                user_email: startup.founder_email,
                title: 'New Investor Interest',
                message: `${user.email} has expressed interest in ${startup.company_name}`,
                type: 'info',
                important: true,
            });

            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['unified-profile']);
            toast.success('Interest signal sent!');
            setShowInterestForm(false);
            setMessage('');
        },
    });

    return (
        <div className="space-y-6">
            {/* Interactive Header for Startup */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>Startup Profile</h3>
                        <p className="text-sm text-gray-500">{startup.tagline}</p>
                    </div>
                    {!isFounder && user && (
                        <div>
                            {mySignal ? (
                                <Button disabled variant="outline">
                                    <Heart className="w-4 h-4 mr-2 fill-current" />
                                    Interest Sent
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setShowInterestForm(true)}
                                    style={{ background: brandColors.goldPrestige }}
                                >
                                    <Heart className="w-4 h-4 mr-2" />
                                    Express Interest
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    <div>
                        <div className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{startup.readiness_score || 0}</div>
                        <div className="text-xs text-gray-500">Readiness Score</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{startup.interest_count || 0}</div>
                        <div className="text-xs text-gray-500">Investor Signals</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{startup.team_size || 'N/A'}</div>
                        <div className="text-xs text-gray-500">Team Size</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                            {startup.funding_target ? `$${(startup.funding_target / 1000000).toFixed(1)}M` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Target Raise</div>
                    </div>
                </div>
            </div>

            {/* Interest Form */}
            {showInterestForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                >
                    <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>Express Your Interest</h3>
                    <Textarea
                        placeholder="Optional: Add a message to the founder..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="mb-4"
                    />
                    <div className="flex gap-3">
                        <Button onClick={() => signalMutation.mutate({ message })} disabled={signalMutation.isPending}>
                            Send Interest Signal
                        </Button>
                        <Button variant="outline" onClick={() => setShowInterestForm(false)}>
                            Cancel
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Detail Cards */}
            <Card>
                <CardHeader>
                    <CardTitle>About Company</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{startup.description}</p>
                </CardContent>
            </Card>

            {startup.key_differentiator && (
                <Card>
                    <CardHeader>
                        <CardTitle>What Makes Us Unique</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{startup.key_differentiator}</p>
                    </CardContent>
                </Card>
            )}

            {startup.demo_video_url && (
                <Card>
                    <CardHeader>
                        <CardTitle>Demo Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <a
                            href={startup.demo_video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                            <Video className="w-4 h-4" /> Watch Demo <ExternalLink className="w-3 h-3" />
                        </a>
                    </CardContent>
                </Card>
            )}

            {signals && signals.length > 0 && (
                <Card className="border-t-4" style={{ borderTopColor: brandColors.goldPrestige }}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Innovation Intelligence</CardTitle>
                        <ShieldCheck className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4">
                            {signals.map(signal => (
                                <div key={signal.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                                    <div className="mt-1">
                                        {signal.type === 'patent' ? <Zap className="w-5 h-5 text-orange-500" /> : <BrainCircuit className="w-5 h-5 text-purple-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <h4 className="font-bold text-sm leading-snug" style={{ color: brandColors.navyDeep }}>{signal.title}</h4>
                                            <Badge variant="secondary" className="text-[10px] uppercase">{signal.type}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{signal.abstract || signal.summary}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {startup.accelerator_enrolled && (
                <Card className="border-2" style={{ borderColor: brandColors.goldPrestige }}>
                    <CardContent className="pt-6 text-center">
                        <Rocket className="w-8 h-8 mx-auto mb-2" style={{ color: brandColors.goldPrestige }} />
                        <div className="font-semibold text-sm">Accelerator Enrolled</div>
                        <div className="text-xs text-gray-500 mt-1">Micro-Acceleration Track</div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
