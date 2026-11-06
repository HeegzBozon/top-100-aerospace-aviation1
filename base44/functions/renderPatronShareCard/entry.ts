import { createClientFromRequest } from 'npm:@base44/sdk@0.8.56';
import { Stagehand } from 'npm:@browserbasehq/stagehand@3.7.3';

// One-off renderer for the media kit's 1200x630 share card.
//
// The card is artwork, not a surface: it is drawn once, written to
// public/og-patronage-media-kit.png and served from the app's own origin, so a social
// crawler reads a print-quality plate rather than a crop of a page. This function is the
// press that made it — it is not called at runtime and can be retired once the plate is
// in the repository.
const CARD = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative;
    background:
      radial-gradient(120% 90% at 8% 0%, #24456a 0%, #16293f 46%, #070c16 100%),
      #070c16;
    color: #faf8f5;
    font-family: "Montserrat", system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 58px 68px 54px;
  }
  /* A fine field of stars: the plate reads as the same sky the masthead prints on. */
  .sky {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(rgba(250,248,245,0.34) 1px, transparent 1.4px),
      radial-gradient(rgba(201,168,124,0.30) 1px, transparent 1.4px);
    background-size: 46px 46px, 83px 83px;
    background-position: 0 0, 21px 27px;
    opacity: 0.5;
    pointer-events: none;
  }
  .glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(62% 78% at 82% 22%, rgba(201,168,124,0.18) 0%, rgba(201,168,124,0) 62%);
    pointer-events: none;
  }
  .row { display: flex; align-items: center; justify-content: space-between; position: relative; }
  .wordmark {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.34em;
    text-transform: uppercase;
    color: #faf8f5;
  }
  .year {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.30em;
    text-transform: uppercase;
    color: rgba(201,168,124,0.85);
  }
  .head { position: relative; max-width: 880px; }
  .label {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #c9a87c;
  }
  .label::before {
    content: "";
    width: 42px;
    height: 1px;
    background: #b87333;
    display: block;
  }
  h1 {
    margin-top: 22px;
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 400;
    font-size: 78px;
    line-height: 1.02;
    letter-spacing: -0.01em;
    color: #faf8f5;
  }
  h1 em { font-style: italic; color: #e8cf9e; }
  .rule { margin-top: 26px; width: 118px; height: 2px; background: #b87333; }
  .sub {
    margin-top: 20px;
    font-family: "Playfair Display", Georgia, serif;
    font-style: italic;
    font-size: 26px;
    color: rgba(250,248,245,0.88);
  }
  .foot { position: relative; display: flex; align-items: flex-end; justify-content: space-between; }
  .facts {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(250,248,245,0.62);
    line-height: 1.9;
  }
  .facts b { color: #c9a87c; font-weight: 700; }
  .href {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.10em;
    color: #c9a87c;
  }
</style>
</head>
<body>
  <div class="sky"></div>
  <div class="glow"></div>

  <div class="row">
    <span class="wordmark">TOP 100 Aerospace &amp; Aviation</span>
    <span class="year">MMXXVI &middot; The Publication</span>
  </div>

  <div class="head">
    <span class="label">Patron of Record</span>
    <h1>Patronage &amp; the<br />2026 Media Kit</h1>
    <div class="rule"></div>
    <p class="sub">Attribution, never placement.</p>
  </div>

  <div class="foot">
    <p class="facts"><b>6,400+</b> aerospace subscribers &middot; verified audience &middot; no placement for sale</p>
    <p class="href">top100aero.space/mediakit</p>
  </div>
</body>
</html>`;

export default async function (req) {
  const base44 = createClientFromRequest(req);
  let user;
  try {
    user = await base44.auth.me();
  } catch (_) {
    user = null;
  }
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await base44.asServiceRole.browser.getSession();
  let stagehand;
  try {
    const { baseURL, token, headers } = base44.asServiceRole.aiGateway.connection();
    stagehand = new Stagehand({
      env: 'LOCAL',
      localBrowserLaunchOptions: { cdpUrl: session.connectionUrl },
      model: { modelName: 'openai/gpt_6_luna', apiKey: token, baseURL, headers, openaiEndpointFormat: 'chat' },
      disablePino: true,
    });
    await stagehand.init();

    const page = stagehand.context.pages()[0];
    await page.goto('data:text/html;charset=utf-8,' + encodeURIComponent(CARD), {
      waitUntil: 'networkidle',
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    // The plate is cut to the card, not to the browser's window: a 1200x630 clip is the
    // artwork itself, whoever is rendering it.
    const shot = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });

    const file = new File([shot], 'og-patronage-media-kit.png', { type: 'image/png' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadPublicFile({ file });

    return Response.json({ ok: true, file_url, bytes: shot.length });
  } finally {
    await stagehand?.close().catch(() => {});
    await session.end();
  }
}