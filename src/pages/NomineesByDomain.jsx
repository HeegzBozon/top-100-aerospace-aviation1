import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  cream: '#faf8f5',
  goldPrestige: '#c9a87c',
};

export default function NomineesByDomainPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const domainName = urlParams.get('domain');

  const { data: subsystems = [] } = useQuery({
    queryKey: ['subsystems', domainName],
    queryFn: async () => {
      if (!domainName) return [];
      return await base44.entities.Subsystem.filter({ name: domainName });
    },
    enabled: !!domainName,
  });

  const subsystemId = subsystems.length > 0 ? subsystems[0].id : null;

  const { data: nominees = [], isLoading } = useQuery({
    queryKey: ['nomineesByDomain', subsystemId],
    queryFn: async () => {
      if (!subsystemId) return [];
      const allNominees = await base44.entities.Nominee.list('-updated_date', 500);
      return allNominees.filter((n) => n.domain_ids && n.domain_ids.includes(subsystemId));
    },
    enabled: !!subsystemId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
          {domainName || 'Domain'}
        </h1>
        <p className="text-gray-600 mb-6">{nominees.length} nominees in this domain</p>

        {nominees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No nominees found in this domain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nominees.map((nominee) => (
              <Link key={nominee.id} to={createPageUrl('ProfileView', `id=${nominee.id}`)}>
                <div className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {nominee.avatar_url && (
                    <img
                      src={nominee.avatar_url}
                      alt={nominee.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">{nominee.name}</h3>
                  {nominee.professional_role && (
                    <p className="text-sm text-gray-600 mb-2">{nominee.professional_role}</p>
                  )}
                  {nominee.country && (
                    <p className="text-xs text-gray-500">{nominee.country}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}