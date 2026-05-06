import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewsletterCTA({ title, body, buttonLabel, to, external = false }) {
  const content = (
    <Button className="mt-6 rounded-full bg-[#c9a87c] px-7 font-bold text-slate-950 hover:bg-[#b89463]">
      {buttonLabel} <ArrowUpRight className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-[2rem] border border-[#c9a87c]/30 bg-gradient-to-br from-[#c9a87c]/15 to-slate-900 p-7 md:p-10">
      <h3 className="text-2xl font-bold text-white md:text-3xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h3>
      <p className="mt-4 text-base leading-8 text-slate-300 md:text-lg">{body}</p>
      {external ? (
        <a href={to} target="_blank" rel="noopener noreferrer">{content}</a>
      ) : (
        <Link to={to}>{content}</Link>
      )}
    </div>
  );
}