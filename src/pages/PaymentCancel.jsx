import React from "react";
import { Link } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center border border-slate-100"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2 font-playfair">Payment Cancelled</h1>
        <p className="text-slate-600 mb-8">
          The checkout process was cancelled. No charges were made. You can try again whenever you're ready.
        </p>

        <Link to="/ServicesLanding">
          <Button className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Marketplace
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}