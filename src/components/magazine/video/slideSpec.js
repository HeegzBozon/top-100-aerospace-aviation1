// A page of the issue, read as a frame of film.
//
// The video export does not photograph the reader's screen: it composes each page again,
// in the magazine's own grammar — a picture held full-bleed under a scrim, or a cream
// plate of type — so the frames are sharp at 1080 wide whatever the reader's window was.
// One spec per page, and the compositor turns a spec into a frame.

const stripTags = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const firstBlock = (blocks, type) => blocks.find((block) => block.type === type && block.text);

// The pages of an issue, in order, as frames to draw.
export const buildSlideSpecs = ({ issue, pages = [], articles = [] }) => {
  const articleById = new Map(articles.map((article) => [article.id, article]));

  return pages.map((page) => {
    const blocks = page?.content_blocks || [];
    const article = articleById.get(page?.article_id) || null;

    // What the frame is built from, in the order the page itself prefers: its own full-bleed
    // plate, a rendered page, the first picture set on it, then the article's hero.
    const imageUrl = page?.background_image_url
      || page?.pdf_page_image_url
      || blocks.find((block) => block.type === 'image' && block.url)?.url
      || article?.hero_image_url
      || '';

    const quote = blocks.find((block) => block.type === 'pull_quote' && block.text);

    const kicker = stripTags(page?.chapter_label)
      || stripTags(firstBlock(blocks, 'kicker')?.text)
      || (page?.layout_type === 'cover' ? stripTags(issue?.cover_kicker || issue?.subtitle) : '')
      || stripTags(issue?.title);

    const heading = stripTags(firstBlock(blocks, 'heading')?.text)
      || stripTags(article?.title)
      || (page?.layout_type === 'cover' ? stripTags(issue?.title) : '');

    const body = stripTags(quote?.text)
      || stripTags(firstBlock(blocks, 'body')?.text)
      || stripTags(article?.teaser)
      || stripTags(article?.subtitle)
      || '';

    return {
      pageId: page?.id,
      folio: page?.page_number ?? 0,
      kicker,
      heading,
      body,
      attribution: stripTags(quote?.attribution),
      isQuote: Boolean(quote),
      imageUrl,
      // Filled in once the file has loaded: a picture that cannot be read is left out and
      // the frame is set as paper instead, so a broken link never stops a render.
      img: null,
    };
  });
};