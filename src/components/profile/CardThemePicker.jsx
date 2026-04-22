import { base44 } from '@/api/base44Client';
import { CARD_THEMES } from './cardThemes';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const themeList = Object.values(CARD_THEMES);

export default function CardThemePicker({ user, onUserUpdate }) {
  const current = user?.card_theme || 'navy';
  const { toast } = useToast();

  const handleSelect = async (themeId) => {
    if (themeId === current) return;
    await base44.auth.updateMe({ card_theme: themeId });
    onUserUpdate?.({ ...user, card_theme: themeId });
    toast({ title: 'Card theme updated!' });
  };

  return (
    <div className="flex gap-2">
      {themeList.map(t => (
        <button
          key={t.id}
          onClick={() => handleSelect(t.id)}
          className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${
            current === t.id ? 'border-[#c9a87c] shadow-md' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className="w-14 h-10 rounded-lg"
            style={{ background: t.preview }}
          />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t.label}</span>
          {current === t.id && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#c9a87c] flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}