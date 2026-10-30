import { disciplineLabel } from './kitSeed';

// The downloadable kit. Composed in the browser from the same confirmed fields the web
// version is drawn from, so the PDF and the page can never disagree.

const NAVY_DEEP = [22, 41, 63];
const NAVY = [30, 58, 90];
const COPPER = [184, 115, 51];
const GOLD = [201, 168, 124];
const INK = [46, 56, 70];
const MUTED = [116, 126, 140];
const CREAM = [250, 248, 245];

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 52;
const CONTENT_W = PAGE_W - MARGIN * 2;

const slugFor = (name) =>
  String(name || 'fellow')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export async function downloadKitPdf(kit, shareUrl) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const standing = [disciplineLabel(kit.discipline), kit.location].filter(Boolean).join('  ·  ');

  // Masthead
  doc.setFillColor(...NAVY_DEEP);
  doc.rect(0, 0, PAGE_W, 132, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, 30, 26, 2, 'F');

  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TOP 100 AEROSPACE & AVIATION', MARGIN, 26);
  doc.text('PRESS KIT', PAGE_W - MARGIN, 26, { align: 'right' });

  const nameLines = doc.splitTextToSize(kit.full_name || 'Fellow', CONTENT_W);
  doc.setTextColor(...CREAM);
  doc.setFont('times', 'bold');
  doc.setFontSize(27);
  let headY = 72;
  nameLines.slice(0, 2).forEach((line) => {
    doc.text(line, MARGIN, headY);
    headY += 30;
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  const headLines = kit.headline ? doc.splitTextToSize(kit.headline, CONTENT_W) : [];
  headLines.slice(0, 1).forEach((line) => {
    doc.text(line, MARGIN, headY - 6);
  });
  if (standing) {
    doc.setTextColor(210, 216, 224);
    doc.setFontSize(9);
    doc.text(standing, MARGIN, headY + 10);
  }

  let y = 170;

  const sectionHead = (label) => {
    if (y > 740) {
      doc.addPage();
      y = MARGIN + 20;
    }
    doc.setTextColor(...COPPER);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(String(label).toUpperCase(), MARGIN, y);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y + 5, PAGE_W - MARGIN, y + 5);
    y += 20;
  };

  const paragraph = (text, size = 10, color = INK) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    for (const line of doc.splitTextToSize(String(text || ''), CONTENT_W)) {
      if (y > 770) {
        doc.addPage();
        y = MARGIN + 20;
      }
      doc.text(line, MARGIN, y);
      y += size * 1.5;
    }
    y += 8;
  };

  if (kit.summary) paragraph(kit.summary, 10.5, NAVY);

  const evidence = (kit.evidence || []).filter((row) => row.label || row.detail);
  if (evidence.length) {
    sectionHead('The record');
    for (const item of evidence) {
      if (y > 760) {
        doc.addPage();
        y = MARGIN + 20;
      }
      doc.setTextColor(...NAVY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      for (const line of doc.splitTextToSize(item.label || '', CONTENT_W)) {
        doc.text(line, MARGIN, y);
        y += 13;
      }
      if (item.detail) paragraph(item.detail, 9.5, INK);
      y += 4;
    }
  }

  const links = (kit.links || []).filter((row) => row.url);
  if (links.length) {
    sectionHead('Elsewhere');
    for (const link of links) {
      if (y > 760) {
        doc.addPage();
        y = MARGIN + 20;
      }
      doc.setTextColor(...NAVY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(String(link.label || 'Link').toUpperCase(), MARGIN, y);
      doc.setTextColor(...COPPER);
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(link.url, CONTENT_W - 110)[0], MARGIN + 104, y);
      y += 16;
    }
    y += 6;
  }

  if (kit.contact_email) {
    sectionHead('Press enquiries');
    paragraph(kit.contact_email, 10, NAVY);
  }

  // Foot: the provenance line, and the share address when the kit has been published.
  const footY = PAGE_H - MARGIN;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, footY - 22, PAGE_W - MARGIN, footY - 22);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Composed from this Fellow’s own record at TOP 100 Aerospace & Aviation.', MARGIN, footY - 10);
  if (shareUrl) doc.text(shareUrl, PAGE_W - MARGIN, footY - 10, { align: 'right' });

  doc.save(`${slugFor(kit.full_name)}-press-kit.pdf`);
}