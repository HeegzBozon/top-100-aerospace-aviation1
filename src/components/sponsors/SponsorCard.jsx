import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail } from 'lucide-react';

export default function SponsorCard({ sponsor }) {
    const tierColors = {
        platinum: "bg-slate-900 text-white border-slate-900",
        gold: "bg-amber-400 text-amber-950 border-amber-400",
        silver: "bg-slate-300 text-slate-900 border-slate-300",
        bronze: "bg-orange-200 text-orange-900 border-orange-200"
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col items-center text-center h-full"
        >
            <div className="w-full aspect-[3/2] mb-6 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden">
                {sponsor.logo_url ? (
                    <img src={sponsor.logo_url} alt={sponsor.organization_name} className="w-full h-full object-contain p-4" />
                ) : (
                    <div className="text-slate-300 font-bold text-2xl">LOGO</div>
                )}
            </div>
            
            <div className="mb-2">
                <Badge className={`${tierColors[sponsor.tier] || tierColors.bronze} uppercase tracking-wider text-xs font-bold border`}>
                    {sponsor.tier} Partner
                </Badge>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-4">{sponsor.organization_name}</h3>

            <div className="mt-auto flex gap-3">
                {sponsor.contact_email && (
                    <a href={`mailto:${sponsor.contact_email}`} className="text-slate-400 hover:text-[var(--accent)] transition-colors">
                        <Mail className="w-5 h-5" />
                    </a>
                )}
                {/* Assuming we might add a website URL later, but for now just placeholder or if exists */}
                <button className="text-slate-400 hover:text-[var(--accent)] transition-colors">
                    <ExternalLink className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}