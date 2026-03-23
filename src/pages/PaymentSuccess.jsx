import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center border border-slate-100"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2 font-playfair">Payment Successful</h1>
        <p className="text-slate-600 mb-8">
          Thank you! Your booking has been confirmed and paid for. You will receive a confirmation email shortly.
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-8 text-sm text-slate-500 border border-slate-100">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Receipt className="w-4 h-4" />
            <span>Transaction ID</span>
          </div>
          <code className="bg-white px-2 py-1 rounded border text-xs select-all">
            {sessionId ? sessionId.slice(0, 16) + "..." : "Loading..."}
          </code>
        </div>

        <div className="space-y-3">
          <Link to="/ServicesLanding">
            <Button className="w-full bg-[#1e3a5a] hover:bg-[#2c4a6e] h-12 text-lg">
              Return to Marketplace
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full text-slate-500">
              Go to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}