import { ExternalLink, Newspaper } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function SpaceNewsCard({ article }) {
  const publishedAt = article.published_at ? parseISO(article.published_at) : null;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={`Read article: ${article.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-slate-800 overflow-hidden flex-shrink-0">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="w-8 h-8 text-slate-500" aria-hidden="true" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          {article.news_site && (
            <span className="text-xs font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full">
              {article.news_site}
            </span>
          )}
          {article.source && article.source !== 'SNAPI' && (
            <span className="text-xs font-semibold bg-indigo-600/80 text-white px-2 py-0.5 rounded-full">
              {article.source}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{article.summary}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          {publishedAt && (
            <time dateTime={article.published_at} className="text-xs text-gray-400">
              {format(publishedAt, 'MMM d, yyyy')}
            </time>
          )}
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600 transition-colors" aria-hidden="true" />
        </div>
      </div>
    </a>
  );
}