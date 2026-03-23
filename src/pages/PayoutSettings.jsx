import { Card, CardContent } from "@/components/ui/card";
import { Construction, DollarSign, Calendar, Sparkles } from "lucide-react";

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function PayoutSettings() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div 
          className="p-8 text-center"
          style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #2c4a6e 100%)` }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <Construction className="w-10 h-10 text-white" />
          </div>
          <h1 
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Payout Settings
          </h1>
          <p className="text-white/80 text-lg">Coming Soon</p>
        </div>

        <CardContent className="p-8 space-y-6" style={{ background: brandColors.cream }}>
          <div className="text-center space-y-4">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.navyDeep }}
            >
              <Calendar className="w-4 h-4" />
              Expected: Q1/Q2 2026
            </div>

            <p className="text-slate-600 max-w-md mx-auto">
              We're building a seamless payout system so you can earn from services you provide to the TOP 100 community.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-slate-100">
              <DollarSign className="w-5 h-5 mt-0.5" style={{ color: brandColors.goldPrestige }} />
              <div>
                <h3 className="font-semibold text-slate-800">Stripe Connect</h3>
                <p className="text-sm text-slate-500">Secure, instant payouts to your bank</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-slate-100">
              <Sparkles className="w-5 h-5 mt-0.5" style={{ color: brandColors.goldPrestige }} />
              <div>
                <h3 className="font-semibold text-slate-800">Service Marketplace</h3>
                <p className="text-sm text-slate-500">Offer consulting & coaching services</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 pt-4">
            Stay tuned for updates. We'll notify you when this feature launches.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}