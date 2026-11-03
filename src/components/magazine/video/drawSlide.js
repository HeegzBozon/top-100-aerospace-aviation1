// One page of the issue, drawn as a frame.
//
// Two compositions, both of them the magazine's own: a picture held full-bleed under a
// scrim with the type set over its foot, or — when a page carries no picture — a cream
// plate of type with copper structure. The house mark, the folio and the issue's measure
// sit in the same place in every frame, so a run of frames reads as one publication.

const HEADING_FONT = '"Playfair Display", Georgia, serif';
const BODY_FONT = '"Montserrat", system-ui, -apple-system, sans-serif';

const VOID = '#070F1F';
const CREAM = '#FAF8F5';
const NAVY = '#1E3A5A';
const GOLD = '#C9A87C';
const COPPER = '#B87333';
// Rose gold does not carry on cream (2.11:1). Small labels on paper take the burnished
// copper the editorial surfaces already use for exactly this reason.
const LABEL_ON_CREAM = '#8F5C2C';

const track = (ctx, value) => {
  try { ctx.letterSpacing = value; } catch { /* not every engine takes it */ }
};

const wrapText = (ctx, text, maxWidth, maxLines) => {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || ctx.measureText(candidate).width <= maxWidth) line = candidate;
    else { lines.push(line); line = word; }
  });
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
  kept[maxLines - 1] = `${last.trim()}…`;
  return kept;
};

// The picture fills the frame and drifts: a slow push in over the page's beat, the way a
// camera holds on a still.
const drawPicture = (ctx, img, width, height, progress) => {
  const scale = Math.max(width / img.width, height / img.height) * (1 + 0.06 * progress);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2 - h * 0.02 * progress, w, h);
};

const scrim = (ctx, width, height) => {
  const head = ctx.createLinearGradient(0, 0, 0, height * 0.34);
  head.addColorStop(0, 'rgba(7,15,31,0.78)');
  head.addColorStop(1, 'rgba(7,15,31,0)');
  ctx.fillStyle = head;
  ctx.fillRect(0, 0, width, height * 0.34);

  const foot = ctx.createLinearGradient(0, height * 0.26, 0, height);
  foot.addColorStop(0, 'rgba(7,15,31,0)');
  foot.addColorStop(0.42, 'rgba(7,15,31,0.68)');
  foot.addColorStop(1, 'rgba(7,15,31,0.97)');
  ctx.fillStyle = foot;
  ctx.fillRect(0, height * 0.26, width, height * 0.74);
};

export const drawSlide = (ctx, spec, { width, height, progress = 0, overall = 0, vertical = false, folio = '' }) => {
  const margin = Math.round(width * (vertical ? 0.085 : 0.062));
  const contentW = width - margin * 2;
  const onPicture = Boolean(spec.img);

  const kickerSize = vertical ? 30 : 24;
  const headingSize = vertical ? (spec.isQuote ? 62 : 82) : (spec.isQuote ? 54 : 70);
  const bodySize = vertical ? 33 : 31;
  const gapAfterKicker = vertical ? 46 : 34;
  const gapAfterHeading = vertical ? 34 : 26;

  ctx.clearRect(0, 0, width, height);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  if (onPicture) {
    ctx.fillStyle = VOID;
    ctx.fillRect(0, 0, width, height);
    drawPicture(ctx, spec.img, width, height, progress);
    scrim(ctx, width, height);
  } else {
    // A page with no picture is set as paper: cream ground, navy type, copper structure.
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, width, height);
  }

  // The text arrives with the frame rather than sitting on it from the first instant.
  const fade = Math.min(1, Math.max(0, (progress - 0.04) / 0.18));

  // Measure the stack before it is placed, so a long page grows upwards from its foot
  // instead of running off the bottom.
  const headingText = spec.isQuote ? spec.body : spec.heading;
  const subText = spec.isQuote ? (spec.attribution ? `— ${spec.attribution}` : '') : spec.body;

  ctx.font = `${spec.isQuote ? 'italic ' : ''}700 ${headingSize}px ${HEADING_FONT}`;
  const headingLines = headingText ? wrapText(ctx, headingText, contentW, vertical ? 5 : 3) : [];

  ctx.font = `${bodySize}px ${BODY_FONT}`;
  const bodyLines = subText ? wrapText(ctx, subText, contentW, vertical ? 3 : 2) : [];

  const headingLead = headingSize * 1.12;
  const bodyLead = bodySize * 1.55;
  const kickerLead = kickerSize * 2.1;

  const headingBlock = headingLines.length * headingLead;
  const bodyBlock = bodyLines.length * bodyLead;
  const kickerBlock = spec.kicker ? kickerLead : 0;
  const stackHeight = kickerBlock + headingBlock + (bodyBlock ? gapAfterHeading + bodyBlock : 0);

  // Where the stack's foot falls: above the house mark and the folio.
  const footBand = vertical ? 176 : 122;
  let y;

  if (onPicture) {
    y = height - footBand - stackHeight;
  } else {
    // On paper the composition is set from the head, with the type given room to breathe.
    y = (vertical ? height * 0.2 : height * 0.22) - kickerBlock;
  }

  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(0, (1 - fade) * (vertical ? 26 : 18));

  if (spec.kicker) {
    // The rule above the kicker: copper on paper, a hair of gold over a picture.
    ctx.fillStyle = onPicture ? GOLD : COPPER;
    ctx.globalAlpha = fade * (onPicture ? 0.9 : 1);
    ctx.fillRect(margin, y - kickerSize * 0.9, margin * 1.5, 3);
    ctx.globalAlpha = fade;

    ctx.font = `600 ${kickerSize}px ${BODY_FONT}`;
    track(ctx, vertical ? '6px' : '5px');
    ctx.fillStyle = onPicture ? GOLD : LABEL_ON_CREAM;
    ctx.fillText(String(spec.kicker).toUpperCase(), margin, y + kickerSize);
    track(ctx, '0px');
    y += kickerLead;
  }

  if (headingLines.length) {
    ctx.font = `${spec.isQuote ? 'italic ' : ''}700 ${headingSize}px ${HEADING_FONT}`;
    ctx.fillStyle = onPicture ? CREAM : NAVY;
    headingLines.forEach((line, i) => {
      ctx.fillText(line, margin, y + headingSize + i * headingLead);
    });
    y += headingBlock;
  }

  if (bodyLines.length) {
    y += gapAfterHeading;
    ctx.font = `${bodySize}px ${BODY_FONT}`;
    ctx.fillStyle = onPicture ? 'rgba(250,248,245,0.82)' : 'rgba(30,58,90,0.76)';
    bodyLines.forEach((line, i) => {
      ctx.fillText(line, margin, y + bodySize + i * bodyLead);
    });
  }

  ctx.restore();

  // The foot of every frame: the house mark, the folio, and the issue's own measure.
  const footY = height - (vertical ? 104 : 72);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  ctx.font = `${vertical ? 21 : 17}px ${BODY_FONT}`;
  track(ctx, vertical ? '5px' : '4px');
  ctx.fillStyle = onPicture ? 'rgba(201,168,124,0.92)' : 'rgba(30,58,90,0.5)';
  ctx.fillText('TOP 100 · AEROSPACE & AVIATION', margin, footY);
  track(ctx, '0px');

  ctx.textAlign = 'right';
  ctx.font = `${vertical ? 25 : 21}px ${BODY_FONT}`;
  ctx.fillStyle = onPicture ? 'rgba(250,248,245,0.72)' : 'rgba(30,58,90,0.5)';
  ctx.fillText(folio, width - margin, footY);
  ctx.textAlign = 'left';

  const ruleY = height - (vertical ? 52 : 38);
  ctx.fillStyle = onPicture ? 'rgba(250,248,245,0.16)' : 'rgba(30,58,90,0.12)';
  ctx.fillRect(margin, ruleY, contentW, 3);
  ctx.fillStyle = COPPER;
  ctx.fillRect(margin, ruleY, contentW * Math.min(1, Math.max(0, overall)), 3);
};