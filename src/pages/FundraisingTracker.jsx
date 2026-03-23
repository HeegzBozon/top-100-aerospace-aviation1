import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function FundraisingTracker() {
  const { data: fundingRounds = [] } = useQuery({
    queryKey: ['funding-rounds'],
    queryFn: () => base44.entities.FundingRound.list('-close_date'),
  });

  const { data: startups = [] } = useQuery({
    queryKey: ['all-startups-funding'],
    queryFn: () => base44.entities.StartupProfile.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['completed-enrollments'],
    queryFn: async () => {
      const all = await base44.entities.AcceleratorEnrollment.list();
      return all.filter(e => e.status === 'completed');
    },
  });

  const totalRaised = fundingRounds.reduce((sum, r) => sum + (r.amount_raised || 0), 0);
  const acceleratorAttributed = fundingRounds.filter(r => r.accelerator_attributed).reduce((sum, r) => sum + (r.amount_raised || 0), 0);
  const fundedStartups = [...new Set(fundingRounds.map(r => r.startup_id))].length;
  const graduatedStartups = enrollments.length;
  const successRate = graduatedStartups > 0 ? Math.round((fundedStartups / graduatedStartups) * 100) : 0;

  const getStartupName = (startupId) => {
    const startup = startups.find(s => s.id === startupId);
    return startup?.company_name || 'Unknown';
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Accelerator Impact
          </h1>
          <p className="text-xl text-gray-600">Tracking our portfolio's fundraising success</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Capital Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>
                ${(totalRaised / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-500">Across all portfolio companies</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Accelerator Attributed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1" style={{ color: brandColors.goldPrestige }}>
                ${(acceleratorAttributed / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-500">Directly attributed to program</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Funded Startups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>
                {fundedStartups}
              </div>
              <div className="text-xs text-gray-500">Raised funding post-program</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1" style={{ color: brandColors.goldPrestige }}>
                {successRate}%
              </div>
              <div className="text-xs text-gray-500">Graduates who raised</div>
              <Progress value={successRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Funding Rounds */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: brandColors.navyDeep }}>
            Recent Funding Rounds
          </h2>
          <div className="space-y-4">
            {fundingRounds.slice(0, 20).map(round => (
              <Card key={round.id}>
                <CardContent className="py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>
                          {getStartupName(round.startup_id)}
                        </h3>
                        <Badge variant="outline">
                          {round.round_type.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        {round.accelerator_attributed && (
                          <Badge style={{ background: brandColors.goldPrestige }}>
                            ACCELERATOR
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Amount Raised</div>
                          <div className="font-semibold text-green-600">
                            ${(round.amount_raised / 1000000).toFixed(2)}M
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Lead Investor</div>
                          <div className="font-medium">{round.lead_investor || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Close Date</div>
                          <div className="font-medium">{new Date(round.close_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      {round.post_money_valuation && (
                        <div className="mt-2 text-sm text-gray-600">
                          Post-money valuation: ${(round.post_money_valuation / 1000000).toFixed(1)}M
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Portfolio Performance */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Raise by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              {['pre_seed', 'seed', 'series_a'].map(stage => {
                const stageRounds = fundingRounds.filter(r => r.round_type === stage);
                const avgRaise = stageRounds.length > 0
                  ? stageRounds.reduce((sum, r) => sum + r.amount_raised, 0) / stageRounds.length
                  : 0;

                return (
                  <div key={stage} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{stage.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-sm font-bold" style={{ color: brandColors.goldPrestige }}>
                        ${(avgRaise / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{stageRounds.length} rounds</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Graduated Startups</span>
                <span className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>{graduatedStartups}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Alumni</span>
                <span className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>{fundedStartups}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Funding Events</span>
                <span className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>{fundingRounds.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Follow-on Success</span>
                <span className="text-lg font-bold" style={{ color: brandColors.goldPrestige }}>{successRate}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}