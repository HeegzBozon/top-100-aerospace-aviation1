import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Copy, FlaskConical, CheckCircle2, XCircle } from 'lucide-react';

const roleColors = {
  'qa-engineer': 'bg-green-100 text-green-800',
  'principal-engineer': 'bg-purple-100 text-purple-800',
  'staff-engineer': 'bg-blue-100 text-blue-800',
  'senior-engineer': 'bg-indigo-100 text-indigo-800',
  'junior-engineer': 'bg-slate-100 text-slate-700',
  'scrum-master': 'bg-orange-100 text-orange-800',
  'product-owner': 'bg-rose-100 text-rose-800',
  'art-conductor': 'bg-amber-100 text-amber-800',
  'chief-of-staff': 'bg-violet-100 text-violet-800',
  'custom': 'bg-gray-100 text-gray-700',
};

export default function SkillCard({ skill, onEdit, onDelete, onDuplicate, onToggle }) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-4 transition-opacity ${!skill.is_active ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-slate-900 truncate">{skill.display_name}</span>
            {skill.tdd_enforced && (
              <span title="TDD Enforced">
                <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              </span>
            )}
          </div>
          <code className="text-xs text-slate-400 font-mono">{skill.name} v{skill.version || '1.0.0'}</code>
        </div>
        <Switch
          checked={!!skill.is_active}
          onCheckedChange={onToggle}
          aria-label={`Toggle ${skill.display_name}`}
        />
      </div>

      {/* Role Badge */}
      <Badge className={`text-xs w-fit ${roleColors[skill.persona_role] || roleColors.custom}`}>
        {skill.persona_role}
      </Badge>

      {/* Description */}
      <p className="text-sm text-slate-500 line-clamp-2 flex-1">{skill.description}</p>

      {/* Output Format */}
      {skill.output_format && (
        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <p className="text-xs font-mono text-slate-600 truncate">{skill.output_format}</p>
        </div>
      )}

      {/* Tags */}
      {skill.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skill.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
          {skill.tags.length > 4 && (
            <span className="text-[10px] text-slate-400">+{skill.tags.length - 4} more</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <Button size="sm" variant="outline" onClick={onEdit} className="flex-1 gap-1.5 min-h-[36px]">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Button>
        <Button size="sm" variant="outline" onClick={onDuplicate} className="min-h-[36px]" title="Duplicate">
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={onDelete} className="min-h-[36px] text-red-500 hover:text-red-700 hover:border-red-300" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}