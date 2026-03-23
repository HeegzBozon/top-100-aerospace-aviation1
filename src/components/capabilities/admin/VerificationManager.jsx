import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, XCircle, Search, User, Shield, Linkedin, Globe, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function VerificationManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch provider applications
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['provider-applications-all'],
    queryFn: () => base44.entities.ProviderApplication.list('-created_date', 100),
    initialData: []
  });

  // Fetch users who are providers but may need verification review
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers-list'],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ is_service_provider: true });
      return users;
    },
    initialData: []
  });

  // Fetch services to check for verification needs
  const { data: services } = useQuery({
    queryKey: ['services-verification'],
    queryFn: () => base44.entities.Service.list('-created_date', 200),
    initialData: []
  });

  const approveMutation = useMutation({
    mutationFn: async ({ applicationId, decision }) => {
      const response = await base44.functions.invoke('approveProvider', { 
        applicationId, 
        decision 
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Application ${variables.decision}`);
      queryClient.invalidateQueries(['provider-applications-all']);
      queryClient.invalidateQueries(['providers-list']);
    },
    onError: (err) => {
      toast.error('Action failed: ' + err.message);
    }
  });

  const verifyServiceMutation = useMutation({
    mutationFn: async ({ serviceId, verified }) => {
      await base44.entities.Service.update(serviceId, { is_verified: verified });
    },
    onSuccess: () => {
      toast.success('Service verification updated');
      queryClient.invalidateQueries(['services-verification']);
    }
  });

  const pendingApps = applications.filter(a => a.status === 'pending');
  const approvedApps = applications.filter(a => a.status === 'approved');
  const rejectedApps = applications.filter(a => a.status === 'rejected');

  const filteredApps = (activeTab === 'pending' ? pendingApps : 
    activeTab === 'approved' ? approvedApps : rejectedApps)
    .filter(app => 
      !search || 
      app.applicant_email?.toLowerCase().includes(search.toLowerCase())
    );

  const unverifiedServices = services.filter(s => !s.is_verified && s.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
          Verification Manager
        </h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {pendingApps.length} pending
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingApps.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedApps.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedApps.length})
          </TabsTrigger>
          <TabsTrigger value="services">
            Services ({unverifiedServices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <ApplicationsList 
            applications={filteredApps}
            onApprove={(id) => approveMutation.mutate({ applicationId: id, decision: 'approved' })}
            onReject={(id) => approveMutation.mutate({ applicationId: id, decision: 'rejected' })}
            isPending={approveMutation.isPending}
            showActions
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <ApplicationsList applications={filteredApps} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <ApplicationsList applications={filteredApps} />
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <ServiceVerificationList 
            services={unverifiedServices}
            onVerify={(id) => verifyServiceMutation.mutate({ serviceId: id, verified: true })}
            isPending={verifyServiceMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApplicationsList({ applications, onApprove, onReject, isPending, showActions }) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          <User className="w-10 h-10 mx-auto mb-2 opacity-20" />
          No applications in this category
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map(app => (
        <Card key={app.id} className={app.status === 'pending' ? 'border-l-4 border-l-amber-400' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{app.applicant_email}</span>
                  <Badge variant="outline" className="text-xs">
                    {app.service_categories?.[0] || 'General'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{app.experience_summary}</p>
                
                <div className="flex gap-3 mt-2">
                  {app.linkedin_profile && (
                    <a href={app.linkedin_profile} target="_blank" rel="noopener noreferrer" 
                       className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <Linkedin className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                  {app.portfolio_link && (
                    <a href={app.portfolio_link} target="_blank" rel="noopener noreferrer"
                       className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Portfolio
                    </a>
                  )}
                </div>
              </div>

              {showActions && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onReject(app.id)}
                    disabled={isPending}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onApprove(app.id)}
                    disabled={isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                </div>
              )}

              {!showActions && (
                <Badge className={
                  app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }>
                  {app.status}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ServiceVerificationList({ services, onVerify, isPending }) {
  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          <Shield className="w-10 h-10 mx-auto mb-2 opacity-20" />
          All active services are verified
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {services.map(service => (
        <Card key={service.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{service.title}</h4>
                <p className="text-sm text-slate-500">{service.provider_user_email}</p>
                <p className="text-xs text-slate-400 mt-1">${service.base_price} · {service.duration_minutes}min</p>
              </div>
              <Button
                size="sm"
                onClick={() => onVerify(service.id)}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Shield className="w-4 h-4 mr-1" /> Verify
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}