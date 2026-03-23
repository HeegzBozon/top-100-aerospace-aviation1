import { base44 } from "@/api/base44Client";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
};

export default function Landing2TopNav() {
  return (
    <header className="sticky top-0 z-50" style={{ background: brandColors.navyDeep, borderBottom: `1px solid ${brandColors.skyBlue}20` }}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/5ece7f59b_TOP100AerospaceAviationlogo.png"
            alt="TOP 100"
            className="h-10 w-auto"
          />
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: brandColors.goldLight }} />
            <Input
              placeholder="Search honorees, services, events..."
              className="w-full pl-10 text-white placeholder:text-white/40 h-9"
              style={{ background: `${brandColors.skyBlue}20`, borderColor: `${brandColors.skyBlue}30`, fontFamily: "'Montserrat', sans-serif" }}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button className="md:hidden p-2" style={{ color: brandColors.goldLight }}>
            <Search className="w-5 h-5" />
          </button>
          <Button 
            variant="ghost" 
            onClick={() => base44.auth.redirectToLogin()}
            className="hover:bg-white/10"
            style={{ color: brandColors.goldLight, fontFamily: "'Montserrat', sans-serif" }}
          >
            Log in
          </Button>
          <Button 
            onClick={() => base44.auth.redirectToLogin()}
            className="text-white font-medium h-9"
            style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`, fontFamily: "'Montserrat', sans-serif" }}
          >
            Sign up - it's free
          </Button>
        </div>
      </div>
    </header>
  );
}