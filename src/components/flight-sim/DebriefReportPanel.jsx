import ReactMarkdown from 'react-markdown';
import { FileText } from 'lucide-react';

// The paid Flight Debrief, read in place the moment the payment clears.
export default function DebriefReportPanel({ report }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-[#c9a87c]/30 bg-[#c9a87c]/[0.05] p-6 sm:p-9">
        <div className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">
          <FileText className="h-3.5 w-3.5" /> Your Flight Debrief
        </div>
        <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:text-[#c9a87c] prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
        <p className="mt-8 border-t border-white/10 pt-4 text-[11px] text-white/35">
          A copy has been emailed to you. Bookmark this page to reread it.
        </p>
      </div>
    </section>
  );
}