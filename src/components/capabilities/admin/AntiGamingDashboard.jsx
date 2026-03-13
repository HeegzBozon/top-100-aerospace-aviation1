import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Network,
  Clock
} from 'lucide-react';
import { scoringService } from '@/functions/scoringService';
import { useToast } from '@/components/ui/use-toast';

export default function AntiGamingDashboard() {
  const [gamingAnalysis, setGamingAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadGamingAnalysis();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadGamingAnalysis, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadGamingAnalysis = async () => {
    setLoading(true);
    try {
      const { data } = await scoringService({
        action: 'analyze_gaming',
        user_id: 'system',
        lookback_days: 30
      });
      
      setGamingAnalysis(data);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Failed to load gaming analysis:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not load anti-gaming analysis data."
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'low': return CheckCircle;
      case 'medium': return AlertCircle;
      case 'high': return XCircle;
      default: return AlertTriangle;
    }
  };

  const calculateHealthScore = () => {
    if (!gamingAnalysis) return 0;
    
    const { platform_health, anomalies } = gamingAnalysis;
    
    // Base health score
    let score = 100;
    
    // Deduct for anomalies
    if (anomalies.vote_outliers.length > 5) score -= 20;
    if (anomalies.suspicious_users > 10) score -= 30;
    if (anomalies.new_account_activity > platform_health.new_accounts * 0.8) score -= 25;
    
    // Account age factor
    const newAccountRatio = platform_health.new_accounts / platform_health.active_users;
    if (newAccountRatio > 0.3) score -= 15;
    
    return Math.max(score, 0);
  };

  if (loading && !gamingAnalysis) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="animate-spin">
            <Shield className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text)]">Loading Anti-Gaming Analysis...</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const healthScore = calculateHealthScore();
  const healthColor = healthScore >= 80 ? 'text-green-600' : healthScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[var(--accent)]" />
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Anti-Gaming Dashboard</h2>
            <p className="text-[var(--muted)]">Platform integrity monitoring and anomaly detection</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <div className="text-sm text-[var(--muted)] flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          <Button 
            onClick={loadGamingAnalysis} 
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Platform Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Platform Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`text-4xl font-bold ${healthColor}`}>
              {healthScore}%
            </div>
            <div className="flex-1">
              <Progress value={healthScore} className="h-2" />
              <p className="text-sm text-[var(--muted)] mt-1">
                {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
          </div>
          
          {gamingAnalysis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[var(--accent)]">
                  {gamingAnalysis.platform_health.active_users}
                </div>
                <div className="text-sm text-[var(--muted)]">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {gamingAnalysis.platform_health.total_votes}
                </div>
                <div className="text-sm text-[var(--muted)]">Total Votes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {gamingAnalysis.platform_health.total_rewards}
                </div>
                <div className="text-sm text-[var(--muted)]">Rewards Issued</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {gamingAnalysis.platform_health.new_accounts}
                </div>
                <div className="text-sm text-[var(--muted)]">New Accounts</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      {gamingAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Vote Outliers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Vote Outliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {gamingAnalysis.anomalies.vote_outliers.length}
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">
                Nominees receiving unusually high vote counts
              </p>
              
              {gamingAnalysis.anomalies.vote_outliers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--text)]">Top Outliers:</p>
                  {gamingAnalysis.anomalies.vote_outliers.slice(0, 3).map((outlier, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-[var(--muted)]">Nominee {outlier.nominee_id.slice(0, 8)}...</span>
                      <Badge variant="outline" className="text-xs">
                        {outlier.vote_count} votes
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suspicious Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                Suspicious Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {gamingAnalysis.anomalies.suspicious_users}
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">
                Users flagged for gaming patterns
              </p>
              
              <div className="space-y-2">
                <Badge className={getSeverityColor(gamingAnalysis.anomalies.suspicious_users > 10 ? 'high' : 'low')}>
                  {gamingAnalysis.anomalies.suspicious_users > 10 ? 'High Alert' : 'Normal'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* New Account Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                New Account Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {gamingAnalysis.anomalies.new_account_activity}
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">
                New accounts participating in voting
              </p>
              
              <div className="text-xs text-[var(--muted)]">
                {Math.round((gamingAnalysis.anomalies.new_account_activity / gamingAnalysis.platform_health.new_accounts) * 100)}% 
                of new accounts are active
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detection Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-500" />
              Anti-Gaming Measures Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Rapid Voting Detection', status: 'active', severity: 'low' },
                { name: 'Collusion Network Analysis', status: 'active', severity: 'medium' },
                { name: 'Sybil Attack Prevention', status: 'active', severity: 'low' },
                { name: 'Behavioral Pattern Analysis', status: 'active', severity: 'low' },
                { name: 'Rate Limiting', status: 'active', severity: 'low' }
              ].map((measure, index) => {
                const SeverityIcon = getSeverityIcon(measure.severity);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SeverityIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{measure.name}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {measure.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-500" />
              Recent Detections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Mock recent detections - in real implementation, this would come from the API */}
              <div className="text-sm text-[var(--muted)]">
                No significant gaming attempts detected in the last 24 hours.
              </div>
              
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-[var(--text)] mb-2">System Status:</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">All anti-gaming systems operational</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-700">
            {healthScore < 60 && (
              <p>• Consider implementing stricter rate limits due to detected anomalies</p>
            )}
            {gamingAnalysis?.anomalies.vote_outliers.length > 5 && (
              <p>• Investigate nominees with unusually high vote counts for potential gaming</p>
            )}
            {gamingAnalysis?.anomalies.suspicious_users > 10 && (
              <p>• Review flagged users and consider implementing additional verification</p>
            )}
            {healthScore >= 80 && (
              <p>• Platform integrity is excellent. Continue monitoring current patterns.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}