import { jsPDF } from 'jspdf';
import { base44 } from '@/api/base44Client';

// The files a reader takes away from an issue.
//
// Everything here is a real file, built in the browser and handed to the reader's own
// downloads: the issue set as a PDF that prints, and one honoree's details as a sheet. No
// button here is a promise — each one either produces the file or says why it could not.
// Nothing in these files is a number the institution measures with: a profile sheet carries
// her record as it is publicly printed, and her standing in the edition, and nothing else.

const NAVY = [30, 58, 90];
const NAVY_DEEP = [13, 31, 51];
const GOLD = [201, 168, 124];
const COPPER = [184, 115, 51];
const CREAM = [250, 248, 245];
const SAND = [212, 196, 168];
const INK = [58, 58, 58];
const MUTED = [122, 122, 122];

const INSTITUTION = 'TOP 100 Aerospace & Aviation';

export const issueProfilePath = (nomineeId) => `/profiles/${nomineeId}`;

export const issueReaderPath = (issueId) => `/magazine/${issueId}`;

const slug = (value) =>
  String(value || 'issue')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'issue';

const words = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const heading = (page = {}) =>
  (page.content_blocks || []).find((block) => block.type === 'heading' && block.text)?.text || page.chapter_label || '';

// The profile link, exactly as the platform prints a record: one canonical address.
export const profileUrl = (nomineeId) => `${window.location.origin}${issueProfilePath(nomineeId)}`;

// The link a reader hands out, and the clipboard behind it. Sharing is the reader's own
// act: the panel says what happened rather than assuming the sheet opened.
export async function shareLink({ title, path, text }) {
  const url = `${window.location.origin}${path}`;
  try {
    if (navigator.share) {
      await navigator.share({ title, text: text || title, url });
      return { ok: true, via: 'share', url };
    }
    await navigator.clipboard.writeText(url);
    return { ok: true, via: 'copied', url };
  } catch (error) {
    if (error?.name === 'AbortError') return { ok: false, reason: 'cancelled' };
    return { ok: false, reason: 'failed' };
  }
}

// A cream leaf, with the machine's margins already ruled.
function openLeaf(doc) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, width, height, 'F');
  return { width, height, margin: 20, measure: width - 40 };
}

function flow(doc, text, { x, y, measure, margin, height, size = 10, leading = 5.2, color = INK, font = 'normal' }) {
  const body = words(text);
  if (!body) return y;
  doc.setFont('helvetica', font);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  let cursor = y;
  doc.splitTextToSize(body, measure).forEach((line) => {
    if (cursor > height - margin) {
      doc.addPage();
      const leaf = openLeaf(doc);
      cursor = leaf.margin;
    }
    doc.text(line, x, cursor);
    cursor += leading;
  });
  return cursor;
}

/**
 * The issue, as a file the reader keeps: cover, contents, the editor's words, every page
 * in the order it prints, and the colophon. Set from the issue's own blocks — the same text
 * the reader has on the glass — so nothing in the PDF is invented.
 */
export function downloadIssuePdf({ issue = {}, pages = [], articles = [] } = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 20;
  const measure = width - margin * 2;

  // ── Cover ──
  doc.setFillColor(...NAVY_DEEP);
  doc.rect(0, 0, width, height, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, height * 0.3, width, 1.2, 'F');

  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(words(issue.cover_kicker || 'The Edition').toUpperCase(), margin, height * 0.26);

  doc.setTextColor(250, 248, 245);
  doc.setFontSize(30);
  const titleLines = doc.splitTextToSize(words(issue.title || INSTITUTION), measure);
  doc.text(titleLines, margin, height * 0.37);

  let coverY = height * 0.37 + titleLines.length * 11.5 + 4;
  if (issue.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(...GOLD);
    const subLines = doc.splitTextToSize(words(issue.subtitle), measure);
    doc.text(subLines, margin, coverY);
    coverY += subLines.length * 7;
  }

  const credits = issue.cover_credits || {};
  const creditLine = [
    credits.subject && `Subject · ${credits.subject}`,
    credits.photographer && `Photography · ${credits.photographer}`,
    credits.writer && `Words · ${credits.writer}`,
  ]
    .filter(Boolean)
    .join('     ');

  if (creditLine) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(creditLine, margin, height - margin - 8);
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(INSTITUTION, margin, height - margin);
  doc.text(
    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    width - margin,
    height - margin,
    { align: 'right' },
  );

  // ── Contents ──
  const landmarks = pages
    .map((page, index, all) => ({ page, number: page.page_number || index + 1, all }))
    .filter(({ page }) => heading(page));

  doc.addPage();
  let y = openLeaf(doc).margin + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text('Contents', margin, y);
  y += 3;
  doc.setDrawColor(...GOLD);
  doc.line(margin, y, width - margin, y);
  y += 9;

  doc.setFontSize(10);
  landmarks.forEach(({ page, number }) => {
    if (y > height - margin) {
      doc.addPage();
      y = openLeaf(doc).margin;
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text(String(number).padStart(3, '0'), margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(words(heading(page)), measure - 26)[0], margin + 14, y);
    doc.setTextColor(...MUTED);
    doc.setFontSize(8.5);
    doc.text(page.layout_type === 'profile' ? 'Profile' : '', width - margin, y, { align: 'right' });
    doc.setFontSize(10);
    y += 7;
  });

  // ── The editor's words ──
  if (words(issue.preface)) {
    doc.addPage();
    const leaf = openLeaf(doc);
    let prefaceY = leaf.margin + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text('PREFACE', margin, prefaceY);
    prefaceY += 8;
    prefaceY = flow(doc, issue.preface, {
      x: margin,
      y: prefaceY,
      measure,
      margin,
      height,
      size: 11,
      leading: 6,
      color: INK,
    });
  }

  // ── Every page, in the order it prints ──
  pages.forEach((page, index) => {
    const blocks = page.content_blocks || [];
    if (!blocks.length) return;

    doc.addPage();
    openLeaf(doc);
    let cursor = margin + 4;

    const room = (needed) => {
      if (cursor + needed > height - margin - 6) {
        // The page's own blocks carry on overleaf; the folio line stays with each leaf.
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(`${INSTITUTION} · ${index + 2}`, margin, height - 10);
        doc.addPage();
        openLeaf(doc);
        cursor = margin + 4;
      }
    };

    blocks.forEach((block) => {
      const text = words(block.text);
      if (!text && block.type !== 'spacer' && block.type !== 'divider') return;

      if (block.type === 'spacer') {
        cursor += 6;
        return;
      }

      if (block.type === 'divider') {
        room(8);
        doc.setDrawColor(...SAND);
        doc.line(margin, cursor, width - margin, cursor);
        cursor += 7;
        return;
      }

      if (block.type === 'kicker') {
        room(8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COPPER);
        doc.text(text.toUpperCase(), margin, cursor);
        cursor += 7;
        return;
      }

      if (block.type === 'heading') {
        room(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(block.level === 1 ? 20 : 14);
        doc.setTextColor(...NAVY);
        doc.splitTextToSize(text, measure).forEach((line) => {
          room(9);
          doc.text(line, margin, cursor);
          cursor += block.level === 1 ? 9 : 7;
        });
        cursor += 2;
        return;
      }

      if (block.type === 'byline') {
        room(7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text(text, margin, cursor);
        cursor += 7;
        return;
      }

      if (block.type === 'pull_quote') {
        room(14);
        doc.setDrawColor(...GOLD);
        doc.line(margin, cursor, margin, cursor + 8);
        cursor = flow(doc, text, {
          x: margin + 5,
          y: cursor + 3,
          measure: measure - 5,
          margin,
          height,
          size: 12,
          leading: 6.4,
          color: COPPER,
          font: 'italic',
        });
        if (words(block.attribution)) {
          cursor += 1;
          cursor = flow(doc, `— ${words(block.attribution)}`, {
            x: margin + 5,
            y: cursor,
            measure: measure - 5,
            margin,
            height,
            size: 9,
            leading: 5.4,
            color: MUTED,
          });
        }
        cursor += 4;
        return;
      }

      if (block.type === 'image') {
        if (words(block.caption)) {
          cursor += 1;
          cursor = flow(doc, words(block.caption), {
            x: margin,
            y: cursor,
            measure,
            margin,
            height,
            size: 8.5,
            leading: 5,
            color: MUTED,
            font: 'italic',
          });
        }
        return;
      }

      // Body copy, and anything else that reads as prose.
      cursor = flow(doc, text, { x: margin, y: cursor, measure, margin, height, size: 10, leading: 5.4 });
      cursor += 3;
    });

    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(`${INSTITUTION} · ${index + 2}`, margin, height - 10);
  });

  // ── Colophon ──
  if (words(issue.colophon)) {
    doc.addPage();
    const leaf = openLeaf(doc);
    let closeY = leaf.margin + 4;
    doc.setDrawColor(...GOLD);
    doc.line(margin, closeY, width - margin, closeY);
    closeY += 9;
    flow(doc, issue.colophon, { x: margin, y: closeY, measure, margin, height, size: 10, leading: 5.6, color: MUTED });
  }

  const filename = `${slug(issue.title)}.pdf`;
  doc.save(filename);
  return { filename, pages: doc.getNumberOfPages() };
}

/**
 * One honoree's details, as a sheet: her record as it is publicly printed, where she stands
 * in the edition, and the canonical address of her profile. The record is read at the moment
 * the press is made, so the sheet carries what is true then.
 */
export async function downloadProfileSheet({ entry = {}, issue = {}, pageNumber } = {}) {
  let record = null;
  if (entry.nomineeId) {
    try {
      record = await base44.entities.Nominee.get(entry.nomineeId);
    } catch {
      record = null;
    }
  }

  const name = words(entry.name || record?.name || 'Honoree');
  const role = words(record?.title || record?.professional_role || entry.stand || '');
  const company = words(record?.company || record?.organization || '');
  const where = [words(record?.city), words(record?.country)].filter(Boolean).join(', ');
  const discipline = words(record?.discipline || record?.industry || '').replace(/_/g, ' ');
  const story = words(record?.six_word_story);
  const about = words(record?.bio || record?.bio_extended || record?.description || record?.impact_summary);
  const linkedin = words(record?.linkedin_profile_url || record?.website_url);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 20;
  const measure = width - margin * 2;

  openLeaf(doc);

  // The masthead band, as the institution prints it.
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, width, 46, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 46, width, 1.4, 'F');

  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`${INSTITUTION.toUpperCase()} · PROFILE`, margin, 15);

  doc.setTextColor(250, 248, 245);
  doc.setFontSize(19);
  doc.splitTextToSize(name.toUpperCase(), measure).slice(0, 2).forEach((line, i) => {
    doc.text(line, margin, 26 + i * 8);
  });

  let y = 58;

  const pair = (label, value) => {
    if (!value) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COPPER);
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.splitTextToSize(value, measure).forEach((line) => {
      y += 5.4;
      doc.text(line, margin, y);
    });
    y += 7;
  };

  pair('Stand', [role, company].filter(Boolean).join(' · '));
  pair('Based', where);
  pair('Discipline', discipline);
  if (story) pair('In six words', `“${story}”`);
  pair('About', about);

  const standing = [
    issue.title && `Published in ${issue.title}`,
    pageNumber ? `Portrait on p ${pageNumber}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  pair('In this edition', standing);
  pair('Profile', entry.nomineeId ? profileUrl(entry.nomineeId) : '');
  pair('LinkedIn', linkedin);

  doc.setDrawColor(...SAND);
  doc.line(margin, height - margin - 8, width - margin, height - margin - 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(`Taken from ${INSTITUTION} on ${new Date().toLocaleDateString('en-US')}`, margin, height - margin);

  const filename = `${slug(name)}-profile.pdf`;
  doc.save(filename);
  return { filename, name };
}