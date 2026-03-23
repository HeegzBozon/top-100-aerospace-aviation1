import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen text-center">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-xl">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-400 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          
          <p className="text-xl text-white/70 mb-8">
            Looks like this page doesn't exist in the Continuum. Let's get you back on track!
          </p>

          <div className="space-y-4">
            <Link
              to={createPageUrl("Home")}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              <span>Go to Portal</span>
            </Link>

            <div className="text-white/60">
              <p className="mb-4">Or navigate to:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to={createPageUrl("Nominations")}
                  className="px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm hover:bg-white/20 transition-all duration-200"
                >
                  Nominations
                </Link>
                <Link
                  to={createPageUrl("Voting")}
                  className="px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm hover:bg-white/20 transition-all duration-200"
                >
                  Voting
                </Link>
                <Link
                  to={createPageUrl("TTT")}
                  className="px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm hover:bg-white/20 transition-all duration-200"
                >
                  TT&T
                </Link>
                <Link
                  to={createPageUrl("Afterparty")}
                  className="px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm hover:bg-white/20 transition-all duration-200"
                >
                  After Party
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">
            If you think this page should exist, please contact support through the Quick Actions menu.
          </p>
        </div>
      </div>
    </div>
  );
}