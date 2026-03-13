import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot } from 'lucide-react';

const markdownComponents = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-700">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="my-2 space-y-1 pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 space-y-1 pl-4 list-decimal">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex gap-2 items-start text-slate-700">
      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
      <span>{children}</span>
    </li>
  ),
  h1: ({ children }) => (
    <h1 className="text-base font-bold text-slate-900 mb-1 mt-3 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-bold text-slate-900 mb-1 mt-3 first:mt-0 uppercase tracking-wide">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-slate-800 mb-1 mt-2 first:mt-0">{children}</h3>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-amber-600 underline underline-offset-2 hover:text-amber-700 transition-colors"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="bg-slate-100 text-slate-700 text-xs px-1.5 py-0.5 rounded font-mono">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-amber-400 pl-3 my-2 text-slate-600 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-slate-200" />,
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-0.5 shadow-sm bg-gradient-to-br from-[#0a1628] to-[#1a2f5a]"
          aria-hidden="true"
        >
          <Bot className="w-4 h-4 text-amber-400" />
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-[#0a1628] to-[#1a2f5a] text-white rounded-br-none'
            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-md'
        }`}
      >
        {isUser ? (
          <p className="leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}