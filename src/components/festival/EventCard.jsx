import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function EventCard({ title, description, ctaText, ctaLink, Icon, accentColor }) {
  return (
    <div className="h-full bg-[var(--card)]/60 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6 flex flex-col group">
      <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${accentColor}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-[var(--text)] mb-2">{title}</h3>
      <p className="text-[var(--muted)] mb-6 flex-grow">{description}</p>
      <Link to={ctaLink} className="mt-auto">
        <Button className="w-full bg-white/10 hover:bg-white/20 text-[var(--text)] transition-colors group-hover:text-white group-hover:bg-gradient-to-r from-gray-700 to-gray-800">
          {ctaText}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
}