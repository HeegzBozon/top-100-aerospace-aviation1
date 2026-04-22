import { Loader2, CheckCircle2, ExternalLink, Upload } from 'lucide-react';

function LinkedInIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function LinkedInConnectCard({ onPdfUpload, pdfUploading, pdfUploaded }) {
  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0077b5]/5 border-b border-[#0077b5]/10">
        <div className="w-6 h-6 rounded bg-[#0077b5] flex items-center justify-center">
          <LinkedInIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Import LinkedIn Profile</span>
      </div>

      <div className="p-4">
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Download your LinkedIn profile as a PDF and upload it here. Our team will use it to enrich your profile.
        </p>
        <ol className="space-y-1.5 text-[11px] text-slate-500 mb-4">
          {['Go to your LinkedIn profile', 'Click "More" → "Save to PDF"', 'Upload the PDF below'].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="shrink-0 w-4 h-4 rounded-full bg-[#0077b5]/10 text-[#0077b5] font-bold text-[9px] flex items-center justify-center mt-0.5">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>

        <label className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all text-xs font-medium ${
          pdfUploaded ? 'border-green-400 bg-green-50 text-green-700' : 'border-[#0077b5]/30 bg-[#0077b5]/5 text-[#0077b5] hover:bg-[#0077b5]/10'
        }`}>
          {pdfUploading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
          ) : pdfUploaded ? (
            <><CheckCircle2 className="w-3.5 h-3.5" /> Uploaded!</>
          ) : (
            <><Upload className="w-3.5 h-3.5" /> Upload LinkedIn PDF</>
          )}
          <input type="file" accept=".pdf" className="hidden" onChange={onPdfUpload} disabled={pdfUploading} />
        </label>

        <a href="https://www.linkedin.com/in/me/" target="_blank" rel="noopener noreferrer" className="mt-2 text-[10px] text-[#0077b5] hover:underline flex items-center justify-center gap-1">
          Open LinkedIn <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}