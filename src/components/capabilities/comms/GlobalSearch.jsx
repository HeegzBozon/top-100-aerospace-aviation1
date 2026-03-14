import React, { useState, useEffect, useRef } from "react";
import { createPageUrl } from "@/utils";
import { Search, Hash, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

const STORAGE_KEY = "top100_recent_searches";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5));
  }, []);

  const addRecentSearch = (value) => {
    if (!value.trim()) return;
    const updated = [value, ...recentSearches.filter((s) => s !== value)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const q = query.toLowerCase().trim();
        const allNominees = await base44.entities.Nominee.list("-created_date", 1000);
        const nomineeResults = allNominees
          .filter(
            (n) =>
              (n.status === "active" || n.status === "approved") &&
              (n.name?.toLowerCase().includes(q) ||
                n.description?.toLowerCase().includes(q) ||
                n.title?.toLowerCase().includes(q) ||
                n.company?.toLowerCase().includes(q))
          )
          .slice(0, 5)
          .map((n) => ({
            type: "nominee",
            id: n.id,
            title: n.name,
            subtitle: n.title || n.description?.substring(0, 60),
            avatar: n.avatar_url,
          }));
        setResults(nomineeResults);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (value) => {
    if (!value.trim()) return;
    addRecentSearch(value.trim());
    setOpen(false);
    setQuery("");
    window.location.href = createPageUrl(`Top100Women2025?search=${encodeURIComponent(value)}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all w-full group"
          aria-label="Search"
        >
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all text-white/60 group-hover:text-white group-hover:bg-white/10">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 group-hover:opacity-80">
            Search
          </span>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        className="w-80 p-0 border-0 shadow-2xl rounded-xl overflow-hidden"
        style={{ background: "#1a1d21" }}
      >
        {/* Input */}
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search nominees…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              autoFocus
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 text-sm"
              aria-label="Search nominees"
            />
          </div>
        </div>

        {/* Full-text search shortcut */}
        {query.trim() && (
          <button
            className="flex items-center gap-2 px-3 py-2 w-full border-b border-white/10 hover:bg-white/5 transition-colors text-left"
            onClick={() => handleSearch(query)}
          >
            <Hash className="w-4 h-4 text-white/40 shrink-0" />
            <span className="text-sm text-white">Search for "{query}"</span>
          </button>
        )}

        {/* Recent */}
        {!query.trim() && recentSearches.length > 0 && (
          <div className="py-2">
            <p className="px-3 py-2 text-xs font-medium text-white/40">Recent</p>
            {recentSearches.map((s) => (
              <button
                key={s}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 transition-colors text-left"
                onClick={() => handleSearch(s)}
              >
                <Clock className="w-3 h-3 text-white/40 shrink-0" />
                <span className="text-sm text-white">{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="p-3 text-center text-xs text-white/60">Searching…</p>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="py-2 border-t border-white/10">
            <p className="px-3 py-2 text-xs font-medium text-white/40">Results</p>
            {results.map((r) => (
              <a
                key={`${r.type}-${r.id}`}
                href={createPageUrl(`Nominee?id=${r.id}`)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors"
              >
                {r.avatar ? (
                  <img src={r.avatar} alt={r.title} className="w-6 h-6 rounded object-cover shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-bold shrink-0">
                    {r.title?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.title}</p>
                  {r.subtitle && (
                    <p className="text-xs text-white/60 truncate">{r.subtitle}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}