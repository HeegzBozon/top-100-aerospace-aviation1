import { faq, howItWorks, invitation } from './voteGateCopy';

// The signed-out letter at /vote, taken away as a file.
//
// Composed from the same copy the page is drawn from rather than captured off the glass,
// so the letter prints as a document: crisp type, every question answered in full rather
// than folded shut, and the promoted address on its foot. jsPDF is loaded only when the
// key is pressed.

const NAVY_DEEP = [13, 31, 51];
const NAVY = [30, 58, 90];
const COPPER = [184, 115, 51];
const GOLD = [201, 168, 124];
const CREAM = [250, 248, 245];
const LABEL = [143, 92, 44];
const INK = [46, 56, 70];

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 52;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOT = PAGE_H - 74;

const PUBLIC_ADDRESS = 'top100aero.space/vote';

// The invitation plate, as it is printed on the page. A document without it is a letter
// without its card, so it is drawn when the artwork can be read and the letter simply
// sets without it when it cannot.
const ART_URL =
  'https://base44.app/api/apps/68996845be6727838fdb822e/files/mp/public/68996845be6727838fdb822e/2ac211591_TOP100AerospaceInvitation.png';

async function loadArt() {
  try {
    const res = await fetch(ART_URL);
    if (!res.ok) return null;
    const blob = await res.blob();
    const src = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const img = new Image();
    img.src = src;
    await img.decode();
    return { src, ratio: (img.naturalHeight || 4) / (img.naturalWidth || 3) };
  } catch {
    return null;
  }
}

export async function downloadVoteGatePdf() {
  const { jsPDF } = await import('jspdf');
  const art = await loadArt();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  let y = 0;

  const fill = () => {
    doc.setFillColor(...CREAM);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  };

  const newPage = () => {
    doc.addPage();
    fill();
    doc.setFillColor(...COPPER);
    doc.rect(MARGIN, 54, 26, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...LABEL);
    doc.text('INVITATION · SELECTION COMMITTEE', MARGIN, 46);
    y = 82;
  };

  const room = (need) => {
    if (y + need > FOOT) newPage();
  };

  const write = (
    text,
    { font = 'helvetica', style = 'normal', size = 9.5, color = INK, leading = 1.55, gap = 0, width = CONTENT_W } = {},
  ) => {
    const lines = doc.splitTextToSize(String(text || ''), width);
    lines.forEach((line) => {
      room(size * leading);
      doc.setFont(font, style);
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(line, MARGIN, y);
      y += size * leading;
    });
    y += gap;
  };

  const rule = (thickness = 1.4, gap = 24) => {
    room(24);
    doc.setFillColor(...COPPER);
    doc.rect(MARGIN, y, CONTENT_W, thickness, 'F');
    y += gap;
  };

  // ── The masthead, with the invitation itself inside it ──
  fill();
  doc.setFillColor(...NAVY_DEEP);
  doc.rect(0, 0, PAGE_W, 146, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, 34, 26, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text('TOP 100 AEROSPACE & AVIATION', MARGIN, 28);
  doc.text('SELECTION COMMITTEE', PAGE_W - MARGIN, 28, { align: 'right' });
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...CREAM);
  doc
    .splitTextToSize(invitation.headline, CONTENT_W - 24)
    .slice(0, 3)
    .forEach((line, i) => doc.text(line, MARGIN, 84 + i * 26));

  y = 146 + 26;

  if (art) {
    const w = Math.min(CONTENT_W * 0.46, 240);
    const h = w * art.ratio;
    const x = MARGIN + (CONTENT_W - w) / 2;
    doc.setFillColor(...COPPER);
    doc.rect(x - 3, y - 3, w + 6, h + 6, 'F');
    doc.addImage(art.src, 'PNG', x, y, w, h);
    y += h + 26;
  }

  // ── The letter ──
  write(invitation.label.toUpperCase(), { font: 'helvetica', style: 'bold', size: 7, color: LABEL, gap: 14 });
  write(invitation.greeting, { font: 'times', style: 'italic', size: 12, color: NAVY, leading: 1.4, gap: 10 });
  invitation.paragraphs.forEach((paragraph, i) => {
    write(paragraph, { size: 9.5, leading: 1.6, gap: i === invitation.paragraphs.length - 1 ? 16 : 10 });
  });
  write(invitation.signoff, { font: 'times', style: 'italic', size: 11, color: NAVY, leading: 1.4, gap: 6 });
  write(invitation.signature.toUpperCase(), { font: 'helvetica', style: 'bold', size: 7.5, color: LABEL, gap: 0 });

  // ── How it works: the two ballots, three steps each ──
  y += 26;
  rule(1.4, 26);
  write(howItWorks.label.toUpperCase(), { font: 'helvetica', style: 'bold', size: 7.5, color: LABEL, gap: 8 });
  write(howItWorks.heading, { font: 'times', style: 'bold', size: 18, color: NAVY, leading: 1.3, gap: 10 });
  write(howItWorks.intro, { size: 9.5, leading: 1.6, gap: 18 });

  howItWorks.ballots.forEach((ballot) => {
    room(120);
    doc.setFillColor(...COPPER);
    doc.rect(MARGIN, y, CONTENT_W, 1.2, 'F');
    y += 16;
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    doc.text(ballot.name, MARGIN, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...LABEL);
    doc.text(ballot.kind.toUpperCase(), PAGE_W - MARGIN, y, { align: 'right' });
    y += 18;
    ballot.steps.forEach((step, i) => {
      write(`${i + 1}.  ${step}`, { size: 9, leading: 1.55, gap: 5 });
    });
    y += 12;
  });

  // ── The questions, every one of them answered ──
  rule(1.4, 26);
  write(faq.label.toUpperCase(), { font: 'helvetica', style: 'bold', size: 7.5, color: LABEL, gap: 8 });
  write(faq.heading, { font: 'times', style: 'bold', size: 16, color: NAVY, leading: 1.3, gap: 14 });

  faq.questions.forEach((item) => {
    room(70);
    write(item.q, { font: 'times', style: 'bold', size: 11.5, color: NAVY, leading: 1.35, gap: 6 });
    write(item.a, { size: 9, leading: 1.6, gap: 4 });
    write(item.note, { font: 'helvetica', style: 'italic', size: 8.5, color: COPPER, leading: 1.4, gap: 18 });
  });

  // ── The foot of every page: the address the letter was promoted by ──
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setFillColor(...COPPER);
    doc.rect(MARGIN, PAGE_H - 62, CONTENT_W, 0.6, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...LABEL);
    doc.text(PUBLIC_ADDRESS, MARGIN, PAGE_H - 46);
    doc.text(`${page} / ${total}`, PAGE_W - MARGIN, PAGE_H - 46, { align: 'right' });
  }

  doc.save('top100-vote-invitation.pdf');
  return { pages: total };
}