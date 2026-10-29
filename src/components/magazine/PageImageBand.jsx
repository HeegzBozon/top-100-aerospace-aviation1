import React from 'react';

// A photograph set into a profile page's body: as wide as the leaf, cropped to a band,
// with the caption set beneath it in the margin rather than over the picture — a plate
// composed into the read, not a card floating in it.
export default function PageImageBand({ block }) {
  if (!block?.url) return null;
  return (
    <figure className="-mx-5 sm:-mx-7 my-5">
      <img
        src={block.url}
        alt={block.caption || ''}
        className="w-full h-44 sm:h-60 object-cover"
        loading="lazy"
      />
      {block.caption && (
        <figcaption
          className="px-5 sm:px-7 pt-2 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: 'rgba(30,58,90,0.45)' }}
        >
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}