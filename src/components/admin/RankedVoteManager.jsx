
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Calculator, Upload, BarChart, FileJson, Settings, Zap, Copy } from 'lucide-react';
import { Season } from '@/entities/Season';
import { calculateBordaScores } from '@/functions/calculateBordaScores';
import { universalImport } from '@/functions/universalImport';
import { getRcvAnalytics } from '@/functions/getRcvAnalytics';
import { getRawRcvData } from '@/functions/getRawRcvData';
import RcvDataViewerModal from './RcvDataViewerModal';
import EngineTuningWizard from './EngineTuningWizard';

export default function RankedVoteManager() {
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [activeTab, setActiveTab] = useState('analytics'); // New state for tab management
    const [isTestingPipeline, setIsTestingPipeline] = useState(false); // New state for loading indicator
    const { toast } = useToast();
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerData, setViewerData] = useState({ title: '', data: [], headers: [], isLoading: false });

    useEffect(() => {
        const fetchSeasons = async () => {
            const seasonData = await Season.list('-start_date');
            setSeasons(seasonData);
            const activeSeason = seasonData.find(s => s.status === 'voting_open' || s.status === 'active');
            if (activeSeason) {
                setSelectedSeason(activeSeason.id);
            } else if (seasonData.length > 0) {
                setSelectedSeason(seasonData[0].id);
            }
        };
        fetchSeasons();
    }, []);

    const fetchAnalytics = useCallback(async () => {
        if (!selectedSeason) {
            setAnalytics(null); // Clear analytics if no season is selected
            return;
        }
        
        setLoadingAnalytics(true);
        try {
            const { data } = await getRcvAnalytics({ season_id: selectedSeason });
            if (data.success) {
                setAnalytics(data.analytics);
            } else {
                setAnalytics(null); // Clear analytics on failure
                toast({
                    variant: "destructive",
                    title: "Analytics Error",
                    description: data.error || "Failed to load RCV analytics data."
                });
            }
        } catch (error) {
            console.error('Failed to fetch RCV analytics:', error);
            setAnalytics(null);
            toast({
                variant: "destructive",
                title: "Analytics Error",
                description: `Failed to load RCV analytics data: ${error.message}`
            });
        } finally {
            setLoadingAnalytics(false);
        }
    }, [selectedSeason, toast]); // selectedSeason and toast are dependencies

    // Add analytics fetch when season changes
    useEffect(() => {
        fetchAnalytics();
    }, [selectedSeason, fetchAnalytics]); // fetchAnalytics is a dependency because it's a useCallback

    const handleViewData = async (dataType) => {
        if (!selectedSeason) return;

        const isVoters = dataType === 'voters';
        setViewerData({
            title: isVoters ? 'Unique Voters' : 'Submitted Ballots',
            data: [],
            headers: isVoters 
                ? [{ key: 'email', label: 'Email' }, { key: 'fullName', label: 'Name' }, {key: 'joined', label: 'Joined Date', isDate: true}]
                : [{ key: 'voter_email', label: 'Voter' }, { key: 'ballot', label: 'Ballot Order' }, {key: 'created_date', label: 'Submitted Date', isDate: true}],
            isLoading: true,
        });
        setIsViewerOpen(true);

        try {
            const { data: result } = await getRawRcvData({ season_id: selectedSeason, dataType });
            if (result.success) {
                setViewerData(prev => ({ ...prev, data: result.data, isLoading: false }));
            } else {
                throw new Error(result.error || "Failed to fetch data.");
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: `Could not load data: ${error.message}` });
            setViewerData(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleRunCalculation = async () => {
        if (!selectedSeason) {
            toast({ variant: "destructive", title: "No Season Selected", description: "Please select a season to calculate scores." });
            return;
        }
        setIsCalculating(true);
        try {
            const { data: result } = await calculateBordaScores({ season_id: selectedSeason });
            if (result.success) {
                toast({
                    title: "Calculation Complete",
                    description: `${result.nomineesUpdated} nominees updated based on ${result.ballotsProcessed} ballots.`,
                });
                fetchAnalytics(); // Refresh analytics after calculation
            } else {
                throw new Error(result.error || 'Calculation failed.');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Calculation Error", description: error.message });
        } finally {
            setIsCalculating(false);
        }
    };
    
    const handleFileChange = (e) => {
        setImportFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!importFile || !selectedSeason) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please select a file and a season for the import." });
            return;
        }

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const fileContent = event.target.result;
                const { data: result } = await universalImport({
                    file_content: fileContent,
                    import_type: 'json_enrich',
                    season_id: selectedSeason
                });

                if (result.success) {
                    const report = result.report.ranked_votes;
                    toast({
                        title: "Import Complete",
                        description: `Imported ${report.imported} ranked vote ballots. ${report.errors} errors.`,
                    });
                    fetchAnalytics(); // Refresh analytics after import
                } else {
                    throw new Error(result.error || 'Import failed.');
                }
            } catch (error) {
                 toast({ variant: "destructive", title: "Import Error", description: error.message });
            } finally {
                setIsImporting(false);
                setImportFile(null);
                // Reset file input
                const fileInput = document.getElementById('rcv-import-file');
                if(fileInput) fileInput.value = '';
            }
        };
        reader.readAsText(importFile);
    };

    const tabs = [
        { id: 'analytics', label: 'RCV Analytics', icon: BarChart },
        { id: 'tuning', label: 'Engine Tuning', icon: Settings },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'tuning':
                return <EngineTuningWizard />;
            case 'analytics':
            default:
                return (
                    <div className="space-y-6">
                        {/* Test Configuration Button */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Scoring System Testing
                                </CardTitle>
                                <CardDescription>
                                    Test the automated scoring system and configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button 
                                        onClick={async () => {
                                            if (!selectedSeason) {
                                                toast({ variant: "destructive", title: "No Season Selected", description: "Please select a season first." });
                                                return;
                                            }
                                            
                                            setIsTestingPipeline(true);
                                            try {
                                                // Call the master daily scoring function
                                                const response = await fetch('/api/functions/runDailyScoring', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({})
                                                });
                                                const result = await response.json();
                                                
                                                if (result.success) {
                                                    toast({
                                                        title: "Test Complete",
                                                        description: `Borda: ${result.borda_scores?.nomineesUpdated || 0} updated. Aura: ${result.aura_scores?.processed || 0} processed.`
                                                    });
                                                    fetchAnalytics(); // Refresh analytics after test
                                                } else {
                                                    throw new Error(result.error);
                                                }
                                            } catch (error) {
                                                toast({ variant: "destructive", title: "Test Failed", description: error.message });
                                            } finally {
                                                setIsTestingPipeline(false);
                                            }
                                        }}
                                        className="w-full"
                                        disabled={!selectedSeason || isTestingPipeline}
                                    >
                                        {isTestingPipeline ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Testing...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4 mr-2" />
                                                Test Full Scoring Pipeline
                                            </>
                                        )}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline"
                                        onClick={() => {
                                            const cronUrl = `${window.location.origin}/api/functions/runDailyScoring`;
                                            navigator.clipboard.writeText(cronUrl);
                                            toast({ title: "URL Copied", description: "Cron job URL copied to clipboard" });
                                        }}
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Cron URL
                                    </Button>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">📅 Setting Up Automatic Scheduling</h4>
                                    <p className="text-sm text-blue-800 mb-3">
                                        To run scoring automatically every day at 2 AM UTC, set up a cron job in your Base44 dashboard:
                                    </p>
                                    <ol className="text-sm text-blue-800 space-y-1">
                                        <li>1. Go to your Base44 project dashboard</li>
                                        <li>2. Navigate to Functions → Scheduled Jobs</li>
                                        <li>3. Create a new cron job with expression: <code className="bg-blue-200 px-1 rounded">0 2 * * *</code></li>
                                        <li>4. Set the target URL to: <code className="bg-blue-200 px-1 rounded">runDailyScoring</code></li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Analytics Dashboard */}
                        {selectedSeason && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart className="w-5 h-5" />
                                        RCV Analytics
                                    </CardTitle>
                                    <CardDescription>
                                        Current ranked choice voting statistics for the selected season
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loadingAnalytics ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                            Loading analytics...
                                        </div>
                                    ) : analytics ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => handleViewData('ballots')}>
                                                <div className="text-2xl font-bold text-blue-600">{analytics.total_ballots}</div>
                                                <div className="text-sm text-blue-800">Total Ballots</div>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100 transition-colors" onClick={() => handleViewData('voters')}>
                                                <div className="text-2xl font-bold text-green-600">{analytics.total_voters}</div>
                                                <div className="text-sm text-green-800">Unique Voters</div>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-purple-600">{analytics.avg_ballot_length ? analytics.avg_ballot_length.toFixed(2) : 'N/A'}</div>
                                                <div className="text-sm text-purple-800">Avg Ballot Length</div>
                                            </div>
                                            <div className="bg-orange-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-orange-600">{analytics.participation_rate ? analytics.participation_rate.toFixed(2) : 'N/A'}%</div>
                                                <div className="text-sm text-orange-800">Participation Rate</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No analytics data available for this season.</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Borda Score Calculation</CardTitle>
                                <CardDescription>
                                    Calculate Borda scores for all nominees based on the submitted "Your TOP 100" ballots for a season. This will update the `borda_score` on each nominee.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={handleRunCalculation} disabled={isCalculating || !selectedSeason}>
                                    {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                                    Run Borda Calculation
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Import Historical Ranked Votes</CardTitle>
                                <CardDescription>
                                    Import v1 ranked choice ballots from a JSON file. Ensure the file contains `ranked_votes` and that nominee IDs match the current system.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input id="rcv-import-file" type="file" accept=".json" onChange={handleFileChange} />
                                </div>
                                <Button onClick={handleImport} disabled={isImporting || !importFile || !selectedSeason}>
                                    {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    Import Ballots
                                </Button>
                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                    <FileJson className="w-4 h-4" />
                                    <code>{`JSON format: {"ranked_votes": [...]}`}</code>
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Top Nominees by Borda Score */}
                        {analytics && analytics.top_borda_nominees && analytics.top_borda_nominees.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Nominees by Borda Score</CardTitle>
                                    <CardDescription>
                                        Current leaders based on ranked choice voting (Borda score is updated by calculation)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {analytics.top_borda_nominees.map((nominee, index) => (
                                            <div key={nominee.nominee_id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-2 bg-gray-50 rounded">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-500 w-6 text-center">#{index + 1}</span>
                                                    <span className="font-medium">{nominee.nominee_name}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm mt-2 md:mt-0">
                                                    <span className="text-blue-600">Borda: {nominee.borda_score !== null ? nominee.borda_score.toFixed(2) : 'N/A'}</span>
                                                    <span className="text-purple-600">Aura: {nominee.aura_score !== null ? nominee.aura_score.toFixed(2) : 'N/A'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Next Steps</CardTitle>
                                <CardDescription>
                                    After calculating Borda scores, the next step is to integrate them into the overall Aura score calculation.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <BarChart className="w-5 h-5 text-indigo-500" />
                                    <span>Update scoring weights in the Engine Tuning wizard to include Borda Score.</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Ranked Choice Voting & Scoring</h2>
                    <p className="text-gray-600">Manage Borda score calculations and scoring engine configuration</p>
                </div>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                    <SelectTrigger className="w-full md:w-64">
                        <SelectValue placeholder="Select season..." />
                    </SelectTrigger>
                    <SelectContent>
                        {seasons.map(season => (
                            <SelectItem key={season.id} value={season.id}>{season.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                                    ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
            
            {isViewerOpen && (
                <RcvDataViewerModal
                    title={viewerData.title}
                    data={viewerData.data}
                    headers={viewerData.headers}
                    isLoading={viewerData.isLoading}
                    onClose={() => setIsViewerOpen(false)}
                />
            )}
        </div>
    );
}
