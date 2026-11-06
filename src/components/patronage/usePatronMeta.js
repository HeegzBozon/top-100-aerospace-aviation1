import { useEffect } from 'react';
import {
  SHARE_ORIGIN,
  SHARE_TITLE,
  SHARE_DESCRIPTION,
  SHARE_TWITTER_DESCRIPTION,
  SHARE_IMAGE_PATH,
  SHARE_IMAGE_WIDTH,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_ALT,
  SHARE_SITE_NAME,
  SHARE_TWITTER_SITE,
  sharePathFor,
} from '@/components/patronage/patronShareCard';

// Page-level metadata, set and removed on mount so a surface never leaves a title behind.
//
// The media kit is the one surface in the house a buyer is asked to open from a feed, so
// it carries a full share card — Open Graph and X both — rather than a title and a line.
// The copy, the artwork and its dimensions all come from patronShareCard, so the tags
// here and the static mirror in public/mediakit describe the same offer.
//
// The desk is internal: it carries noindex and no canonical, because nothing on it is for
// a crawler to keep.
export default function usePatronMeta({ title, description, path, noindex = false }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const tags = [];

    const add = (tagName, attributes) => {
      const element = document.createElement(tagName);
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
      document.head.appendChild(element);
      tags.push(element);
    };

    if (noindex) {
      add('meta', { name: 'robots', content: 'noindex, nofollow' });
    } else {
      // Whichever of the two doors the reader is standing on: /patronage hands over to
      // /mediakit, so a preview should never claim an address that redirects away.
      const canonicalPath = path || sharePathFor(window.location.pathname);
      const canonical = `${SHARE_ORIGIN}${canonicalPath}`;
      const image = `${SHARE_ORIGIN}${SHARE_IMAGE_PATH}`;

      add('meta', { name: 'description', content: description });
      add('link', { rel: 'canonical', href: canonical });

      add('meta', { property: 'og:type', content: 'website' });
      add('meta', { property: 'og:url', content: canonical });
      add('meta', { property: 'og:title', content: title });
      add('meta', { property: 'og:description', content: description });
      add('meta', { property: 'og:site_name', content: SHARE_SITE_NAME });
      add('meta', { property: 'og:locale', content: 'en_US' });
      add('meta', { property: 'og:image', content: image });
      add('meta', { property: 'og:image:type', content: 'image/png' });
      add('meta', { property: 'og:image:width', content: String(SHARE_IMAGE_WIDTH) });
      add('meta', { property: 'og:image:height', content: String(SHARE_IMAGE_HEIGHT) });
      add('meta', { property: 'og:image:alt', content: SHARE_IMAGE_ALT });

      add('meta', { name: 'twitter:card', content: 'summary_large_image' });
      add('meta', { name: 'twitter:site', content: SHARE_TWITTER_SITE });
      add('meta', { name: 'twitter:title', content: title });
      add('meta', { name: 'twitter:description', content: SHARE_TWITTER_DESCRIPTION });
      add('meta', { name: 'twitter:image', content: image });
      add('meta', { name: 'twitter:image:alt', content: SHARE_IMAGE_ALT });
    }

    return () => {
      document.title = previousTitle;
      tags.forEach((tag) => tag.remove());
    };
  }, [title, description, path, noindex]);
}

export { SHARE_TITLE, SHARE_DESCRIPTION };