import React from 'react';
import { jsPDF } from 'jspdf';
import { FileDown, FileText } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// The issue as plain text: one section per page, in page order.
function toMarkdown(issue, pages) {
  const lines = [`# ${issue.title}`, issue.subtitle ? `_${issue.subtitle}_` : '', ''];
  pages.forEach((p) => {
    lines.push(`---`, `<!-- Page ${p.page_number} · ${p.layout_type} -->`, '');
    (p.content_blocks || []).forEach((b) => {
      if (b.type === 'heading') lines.push(`${'#'.repeat(Math.min((b.level || 1) + 1, 4))} ${b.text}`, '');
      else if (b.type === 'kicker') lines.push(`**${(b.text || '').toUpperCase()}**`, '');
      else if (b.type === 'byline') lines.push(`_${b.text}_`, '');
      else if (b.type === 'pull_quote') lines.push(`> ${b.text}`, b.attribution ? `> — ${b.attribution}` : '', '');
      else if (b.type === 'image') lines.push(`![${b.caption || ''}](${b.url})`, '');
      else if (b.text) lines.push(b.text, '');
    });
  });
  return lines.join('\n');
}

function toPdf(issue, pages) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth() - 120;
  pages.forEach((p, n) => {
    if (n) doc.addPage();
    let y = 80;
    doc.setFontSize(8).setTextColor(150).text(`${issue.title} · Page ${p.page_number}`, 60, 40);
    (p.content_blocks || []).forEach((b) => {
      if (!b.text) return;
      const size = b.type === 'heading' ? 24 : b.type === 'pull_quote' ? 18 : b.type === 'kicker' ? 9 : 11;
      doc.setFont('times', b.type === 'byline' || b.type === 'pull_quote' ? 'italic' : b.type === 'heading' ? 'bold' : 'normal');
      doc.setFontSize(size).setTextColor(30, 58, 90);
      const wrapped = doc.splitTextToSize(b.type === 'kicker' ? b.text.toUpperCase() : b.text, W);
      doc.text(wrapped, 60, y);
      y += wrapped.length * size * 1.35 + 10;
    });
  });
  return doc;
}

function save(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function IssueExportButtons({ issue, pages }) {
  const base = `issue-${issue.issue_number || issue.id}`;
  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);
  const btn = 'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold';
  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
      <h3 className="text-sm font-serif mb-1" style={{ color: P.navy }}>Download preview</h3>
      <p className="text-xs mb-4" style={{ color: 'rgba(30,58,90,0.55)' }}>The current pages, for review outside the studio.</p>
      <div className="flex gap-3">
        <button type="button" disabled={!sorted.length} className={btn} style={{ background: P.navy, color: P.cream }}
          onClick={() => toPdf(issue, sorted).save(`${base}.pdf`)}>
          <FileDown className="w-4 h-4" /> PDF
        </button>
        <button type="button" disabled={!sorted.length} className={btn} style={{ border: `1px solid ${P.navy}`, color: P.navy }}
          onClick={() => save(new Blob([toMarkdown(issue, sorted)], { type: 'text/markdown' }), `${base}.md`)}>
          <FileText className="w-4 h-4" /> Markdown
        </button>
      </div>
    </div>
  );
}