import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2, XCircle, ExternalLink, User, 
  Briefcase, Linkedin, Globe, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProviderTierBadge from '@/components/talent/ProviderTierBadge';

export default function ProviderReviewManager() {
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = React.useState(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['provider-applications'],
    queryFn: async () => {
      const apps = await base44.entities.ProviderApplication.filter({ status: 'pending' });
      return apps.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    initialData: []
  });

  const { data: providerTiers } = useQuery({
    queryKey: ['all-provider-tiers'],
    queryFn: () => base44.entities.ProviderTier.list(),
    initialData: []
  });

  const tierUpdateMutation = useMutation({
    mutationFn: async ({ email, tier }) => {
      const existing = providerTiers.find(t => t.provider_email === email);
      if (existing) {
        return base44.entities.ProviderTier.update(existing.id, { tier });
      } else {
        return base44.entities.ProviderTier.create({ provider_email: email, tier });
      }
    },
    onSuccess: () => {
      toast.success('Tier updated');
      queryClient.invalidateQueries(['all-provider-tiers']);
    }
  });

  const decisionMutation = useMutation({
    mutationFn: async ({ applicationId, decision }) => {
      return base44.functions.invoke('approveProvider', { applicationId, decision });
    },
    onSuccess: (data, variables) => {
      if (data.data.error) {
        toast.error(data.data.error);
      } else {
        toast.success(`Application ${variables.decision}`);
        queryClient.invalidateQueries(['provider-applications']);
      }
    },
    onError: (err) => {
      toast.error("Action failed: " + err.message);
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading applications...</div>;

  // Manual tier management section
  const ManualTierManager = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Manual Tier Assignment</CardTitle>
        <CardDescription>Override provider tiers manually</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <input
            type="email"
            placeholder="Provider email..."
            className="flex-1 px-3 py-2 border rounded-md"
            id="tier-email-input"
          />
          <Select onValueChange={(tier) => setSelectedTier(tier)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => {
              const email = document.getElementById('tier-email-input').value;
              if (email && selectedTier) {
                tierUpdateMutation.mutate({ email, tier: selectedTier });
              }
            }}
            disabled={tierUpdateMutation.isPending}
          >
            Assign
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (applications.length === 0) {
    return (
      <div>
        <ManualTierManager />
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
          <p>No pending applications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManualTierManager />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Pending Provider Requests</h2>
        <Badge variant="outline">{applications.length} pending</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="border-l-4 border-l-amber-400">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-4 h-4 text-slate-400" />
                    {app.applicant_email}
                    <ProviderTierBadge providerEmail={app.applicant_email} size="sm" />
                  </CardTitle>
                  <CardDescription>
                    Applied on {new Date(app.created_date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                  {app.service_categories?.[0] || "General"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Experience Summary
                  </h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
                    {app.experience_summary}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900 mb-2">Links</h4>
                  {app.linkedin_profile && (
                    <a 
                      href={app.linkedin_profile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 p-2 rounded border border-blue-100 transition-colors hover:bg-blue-100"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {app.portfolio_link && (
                    <a 
                      href={app.portfolio_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-emerald-600 hover:underline bg-emerald-50 p-2 rounded border border-emerald-100 transition-colors hover:bg-emerald-100"
                    >
                      <Globe className="w-4 h-4" />
                      Portfolio / Website
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {!app.linkedin_profile && !app.portfolio_link && (
                    <p className="text-slate-400 italic">No links provided</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-3 border-t bg-slate-50/50">
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => decisionMutation.mutate({ applicationId: app.id, decision: 'rejected' })}
                disabled={decisionMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => decisionMutation.mutate({ applicationId: app.id, decision: 'approved' })}
                disabled={decisionMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve Provider
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}