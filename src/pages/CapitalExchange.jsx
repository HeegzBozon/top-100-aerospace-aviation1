import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { User } from '@/entities/User';
import { 
  Coins, ArrowRight, Clock, Star, Search, 
  Sparkles, TrendingUp, Shield, Lock, CheckCircle,
  ArrowUpRight, ArrowDownLeft, Filter, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

function BalanceCard({ balance }) {
  return (
    <Card className="border-2" style={{ borderColor: brandColors.goldPrestige }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold" style={{ color: brandColors.navyDeep }}>
                {balance?.balance || 0}
              </span>
              <span className="text-lg" style={{ color: brandColors.goldPrestige }}>XC</span>
            </div>
            {balance?.escrowed > 0 && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {balance.escrowed} XC in escrow
              </p>
            )}
          </div>
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: `${brandColors.goldPrestige}20` }}
          >
            <Coins className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-slate-500">Earned</p>
            <p className="font-semibold text-green-600">+{balance?.lifetime_earned || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Spent</p>
            <p className="font-semibold text-slate-600">{balance?.lifetime_spent || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Reliability</p>
            <p className="font-semibold" style={{ color: brandColors.skyBlue }}>
              {balance?.reliability_score || 100}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceUnitCard({ unit, onRequest, isRequesting }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${brandColors.navyDeep}10` }}
        >
          <Briefcase className="w-6 h-6" style={{ color: brandColors.navyDeep }} />
        </div>
        <Badge 
          className="text-xs"
          style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
        >
          {unit.unit_type?.replace('_', ' ')}
        </Badge>
      </div>

      <h3 className="text-lg font-bold mb-2" style={{ color: brandColors.navyDeep }}>
        {unit.title}
      </h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{unit.description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {unit.duration_minutes}m
        </div>
        {unit.avg_rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            {unit.avg_rating.toFixed(1)}
          </div>
        )}
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          {unit.total_redemptions || 0} completed
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <span className="text-2xl font-bold" style={{ color: brandColors.goldPrestige }}>
            {unit.xc_cost}
          </span>
          <span className="text-sm text-slate-500 ml-1">XC</span>
          {unit.reference_value_usd && (
            <p className="text-xs text-slate-400">(~${unit.reference_value_usd} value)</p>
          )}
        </div>
        <Button 
          onClick={() => onRequest(unit)}
          disabled={isRequesting}
          style={{ background: brandColors.navyDeep }}
        >
          Request <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function TransactionItem({ tx }) {
  const isEarn = tx.amount > 0;
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isEarn ? 'bg-green-100' : 'bg-slate-100'
          }`}
        >
          {isEarn ? (
            <ArrowDownLeft className="w-4 h-4 text-green-600" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-slate-600" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium capitalize">
            {tx.transaction_type.replace('_', ' ')}
          </p>
          <p className="text-xs text-slate-500">{tx.notes}</p>
        </div>
      </div>
      <span className={`font-bold ${isEarn ? 'text-green-600' : 'text-slate-600'}`}>
        {isEarn ? '+' : ''}{tx.amount} XC
      </span>
    </div>
  );
}

export default function CapitalExchange() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => User.me()
  });

  const { data: balance } = useQuery({
    queryKey: ['xc-balance'],
    queryFn: async () => {
      const res = await base44.functions.invoke('capitalExchange', { action: 'get_balance' });
      return res.data;
    },
    enabled: !!currentUser
  });

  const { data: serviceUnits, isLoading: unitsLoading } = useQuery({
    queryKey: ['service-units'],
    queryFn: () => base44.entities.ServiceUnit.filter({ is_active: true }),
    initialData: []
  });

  const { data: transactions } = useQuery({
    queryKey: ['credit-transactions', currentUser?.email],
    queryFn: () => base44.entities.CreditTransaction.filter(
      { user_email: currentUser.email },
      '-created_date',
      20
    ),
    enabled: !!currentUser?.email,
    initialData: []
  });

  const { data: myExchanges } = useQuery({
    queryKey: ['my-exchanges', currentUser?.email],
    queryFn: async () => {
      const asRequester = await base44.entities.ServiceExchange.filter(
        { requester_email: currentUser.email }
      );
      const asProvider = await base44.entities.ServiceExchange.filter(
        { provider_email: currentUser.email }
      );
      return { asRequester, asProvider };
    },
    enabled: !!currentUser?.email,
    initialData: { asRequester: [], asProvider: [] }
  });

  const requestMutation = useMutation({
    mutationFn: async (unit) => {
      const res = await base44.functions.invoke('capitalExchange', {
        action: 'request_exchange',
        service_unit_id: unit.id
      });
      if (res.data.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Exchange requested! Credits locked in escrow.');
      queryClient.invalidateQueries({ queryKey: ['xc-balance'] });
      queryClient.invalidateQueries({ queryKey: ['my-exchanges'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const filteredUnits = serviceUnits.filter(unit => {
    const matchesSearch = !searchTerm || 
      unit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
      unit.category?.includes(categoryFilter);
    // Don't show user's own units
    const notOwnUnit = unit.provider_email !== currentUser?.email;
    return matchesSearch && matchesCategory && notOwnUnit;
  });

  const pendingExchanges = [
    ...(myExchanges?.asRequester?.filter(e => e.status === 'escrow' || e.status === 'in_progress') || []),
    ...(myExchanges?.asProvider?.filter(e => e.status === 'escrow' || e.status === 'in_progress') || [])
  ];

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero */}
      <div 
        className="relative text-white py-16 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 100%)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: brandColors.goldPrestige }} />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: brandColors.skyBlue }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
            <span className="text-sm uppercase tracking-widest" style={{ color: brandColors.goldPrestige }}>
              Reputation-Cleared Exchange
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            The TOP 100 Capital Exchange
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mb-8">
            Exchange expertise without cash. Earn credits by delivering value, spend them across the network.
          </p>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span>Reputation Gated</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span>Escrow Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span>Credit Caps</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Balance & Activity */}
          <div className="space-y-6">
            <BalanceCard balance={balance} />

            {/* Pending Exchanges */}
            {pendingExchanges.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                    Active Exchanges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingExchanges.slice(0, 3).map(ex => (
                      <div key={ex.id} className="p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {ex.status}
                          </Badge>
                          <span className="text-sm font-bold">{ex.xc_amount} XC</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {ex.requester_email === currentUser?.email ? 'You requested' : 'Requested from you'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No transactions yet</p>
                ) : (
                  <div>
                    {transactions.slice(0, 5).map(tx => (
                      <TransactionItem key={tx.id} tx={tx} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Service Units Marketplace */}
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search service units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Mentorship">Mentorship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                Available Service Units
              </h2>
              <span className="text-sm text-slate-500">{filteredUnits.length} available</span>
            </div>

            {unitsLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center py-16">
                <Coins className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-700">No service units available</h3>
                <p className="text-slate-500 mb-6">Be the first to offer your expertise</p>
                <Link to={createPageUrl('MissionControl') + '?module=provider'}>
                  <Button style={{ background: brandColors.navyDeep }}>
                    Create Service Unit
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredUnits.map(unit => (
                  <ServiceUnitCard 
                    key={unit.id} 
                    unit={unit}
                    onRequest={() => requestMutation.mutate(unit)}
                    isRequesting={requestMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}