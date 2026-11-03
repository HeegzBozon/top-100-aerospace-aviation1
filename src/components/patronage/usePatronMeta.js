import { useEffect } from 'react';

// Page-level metadata, set and removed on mount so a surface never leaves a title behind.
// The desk is internal: it carries noindex and no canonical, because nothing on it is for a
// crawler to keep.
export default function usePatronMeta({ title, description, path = '/patronage', noindex = false }) {
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
      add('meta', { name: 'description', content: description });
      add('link', { rel: 'canonical', href: `https://top100aero.space${path}` });
      add('meta', { property: 'og:title', content: title });
      add('meta', { property: 'og:description', content: description });
      add('meta', { property: 'og:type', content: 'website' });
      add('meta', { property: 'og:url', content: `https://top100aero.space${path}` });
    }

    return () => {
      document.title = previousTitle;
      tags.forEach((tag) => tag.remove());
    };
  }, [title, description, path, noindex]);
}