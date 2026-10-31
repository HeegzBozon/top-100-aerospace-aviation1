import {
  CAPABILITY_LABELS,
  OFFERING_LABELS,
  DISCIPLINE_LABELS,
  availabilityOption,
} from '@/components/profile/intent/intentConfig';

// The standardized dossier: one page, composed only from the verified public record.
// No email address, no contact detail, no field that is not already published on the
// profile — a visitor who downloads this has exactly what the deck shows them, set in
// a form they can forward. Composed in the browser, so no server file is produced.

const NAVY = [30, 58, 90];
const DEEP = [22, 41, 63];
const COPPER = [184, 115, 51];
const GOLD = [201, 168, 124];
const INK = [40, 48, 58];
const MUTED = [110, 122, 138];

const PAGE_W = 595.28; // A4 portrait, points
const MARGIN = 52;
const CONTENT_W = PAGE_W - MARGIN * 2;

function linesFor(doc, text, width, size, style) {
  doc.setFontSize(size);
  doc.setFont('helvetica', style || 'normal');
  return doc.splitTextToSize(String(text || ''), width);
}

export async function exportProfileDossier({ nominee, settings }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const name = nominee?.name || 'Fellow';
  const title = nominee?.title || nominee?.professional_role || '';
  const company = nominee?.company || nominee?.organization || '';
  const discipline = DISCIPLINE_LABELS[nominee?.discipline || settings?.domain_accent] || '';
  const country = nominee?.country || '';

  let y = 0;

  // Masthead band
  doc.setFillColor(...DEEP);
  doc.rect(0, 0, PAGE_W, 116, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, 34, 26, 2, 'F');

  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOP 100 AEROSPACE & AVIATION', MARGIN, 30);
  doc.text('STANDARDIZED DOSSIER', PAGE_W - MARGIN, 30, { align: 'right' });

  doc.setTextColor(250, 248, 245);
  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.text(name, MARGIN, 74);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const standing = [title, company].filter(Boolean).join('  ·  ');
  doc.text(doc.splitTextToSize(standing || discipline || 'Verified Fellow', CONTENT_W), MARGIN, 94);

  y = 148;

  const sectionHead = (label) => {
    if (y > 730) {
      doc.addPage();
      y = MARGIN + 20;
    }
    doc.setTextColor(...COPPER);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(String(label).toUpperCase(), MARGIN, y);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y + 5, PAGE_W - MARGIN, y + 5);
    y += 20;
  };

  const paragraph = (text, size = 10, color = INK) => {
    const lines = linesFor(doc, text, CONTENT_W, size);
    for (const line of lines) {
      if (y > 770) {
        doc.addPage();
        y = MARGIN + 20;
      }
      doc.setTextColor(...color);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.text(line, MARGIN, y);
      y += size * 1.5;
    }
    y += 8;
  };

  const meta = [
    discipline && `Domain — ${discipline}`,
    country && `Based in ${country}`,
    nominee?.verified_status && nominee.verified_status !== 'unverified' && 'Credential — verified',
  ].filter(Boolean);
  if (meta.length) paragraph(meta.join('   |   '), 9.5, MUTED);

  const record =
    nominee?.impact_summary || nominee?.bio_extended || nominee?.bio || nominee?.description || '';
  if (record) {
    sectionHead('The record');
    paragraph(record, 10);
  }

  const career = (nominee?.career_history || []).filter((role) => role?.company_name || role?.role_title).slice(0, 5);
  if (career.length) {
    sectionHead('Career');
    for (const role of career) {
      const head = [role.role_title, role.company_name].filter(Boolean).join(', ');
      paragraph(head, 10, INK);
      if (role.description) paragraph(role.description, 9, MUTED);
    }
  }

  if (settings?.intent_hire_enabled) {
    sectionHead('Open to work');
    const state = availabilityOption('hire', settings.hire_availability);
    if (state) paragraph(state.label, 10, INK);
    if (settings.hire_pitch) paragraph(settings.hire_pitch, 10);
    const capabilities = (settings.hire_capabilities || []).map((key) => CAPABILITY_LABELS[key]).filter(Boolean);
    if (capabilities.length) paragraph(capabilities.join('  ·  '), 9, MUTED);
  }

  if (settings?.intent_commercial_enabled) {
    sectionHead('Open to engagement');
    const state = availabilityOption('commercial', settings.commercial_engagements);
    if (state) paragraph(state.label, 10, INK);
    if (settings.commercial_pitch) paragraph(settings.commercial_pitch, 10);
    const offerings = (settings.commercial_offerings || []).map((key) => OFFERING_LABELS[key]).filter(Boolean);
    if (offerings.length) paragraph(offerings.join('  ·  '), 9, MUTED);
  }

  const skills = (nominee?.skills || []).slice(0, 12);
  if (skills.length) {
    sectionHead('Skills');
    paragraph(skills.join('  ·  '), 9, MUTED);
  }

  // Foot rule + attribution. No address is printed anywhere on this document.
  const footY = 806;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, footY - 16, PAGE_W - MARGIN, footY - 16);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'Composed from the verified public record at top100aero.space. Contact is made through the profile, never by address.',
    MARGIN,
    footY - 4
  );
  if (nominee?.id) {
    doc.text(`top100aero.space/profiles/${nominee.id}`, PAGE_W - MARGIN, footY + 8, { align: 'right' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  doc.save(`${slug || 'fellow'}-dossier.pdf`);
}