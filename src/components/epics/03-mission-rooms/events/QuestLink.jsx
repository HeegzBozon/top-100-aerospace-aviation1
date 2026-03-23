import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function QuestLink({ title, description, Icon, href }) {
  return (
    <Link to={href}>
      <div className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-transparent hover:border-[var(--border)] rounded-lg p-4 transition-all">
        <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[var(--accent-2)]" />
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-[var(--text)]">{title}</h4>
          <p className="text-sm text-[var(--muted)]">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--text)] transition-colors" />
      </div>
    </Link>
  );
}