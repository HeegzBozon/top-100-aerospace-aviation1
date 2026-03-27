import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Mail, Eye, Copy, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PackageEditor from '@/components/onboarding-admin/PackageEditor';
import EmailTemplateEditor from '@/components/onboarding-admin/EmailTemplateEditor';
import SendEmailModal from '@/components/onboarding-admin/SendEmailModal';
import { Link } from 'react-router-dom';

const STATUS_COLORS = { draft: 'bg-yellow-100 text-yellow-700', active: 'bg-green-100 text-green-700', archived: 'bg-slate-100 text-slate-500' };
const CAT_COLORS = { welcome: 'bg-blue-100 text-blue-700', follow_up: 'bg-purple-100 text-purple-700', payment_reminder: 'bg-amber-100 text-amber-700', kickoff: 'bg-green-100 text-green-700', custom: 'bg-slate-100 text-slate-600' };

export default function OnboardingAdmin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('packages');
  const [editingPkg, setEditingPkg] = useState(null); // null=list, 'new'=new form, obj=edit
  const [editingTpl, setEditingTpl] = useState(null);
  const [sendModal, setSendModal] = useState(null); // pkg to send for

  const { data: packages = [] } = useQuery({
    queryKey: ['onboarding-packages'],
    queryFn: () => base44.entities.OnboardingPackage.list('-created_date', 100),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date', 100),
  });

  const deletePkg = useMutation({
    mutationFn: (id) => base44.entities.OnboardingPackage.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding-packages'] }),
  });

  const deleteTpl = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-templates'] }),
  });

  const dupPkg = useMutation({
    mutationFn: (pkg) => base44.entities.OnboardingPackage.create({ ...pkg, id: undefined, name: `${pkg.name} (Copy)`, status: 'draft' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding-packages'] }),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Onboarding CMS</h1>
            <p className="text-slate-500 text-sm">Manage client onboarding packages & email templates</p>
          </div>
          <div className="flex gap-2">
            {tab === 'packages' && editingPkg === null && (
              <Button onClick={() => setEditingPkg('new')} className="gap-1.5">
                <Plus className="w-4 h-4" /> New Package
              </Button>
            )}
            {tab === 'templates' && editingTpl === null && (
              <Button onClick={() => setEditingTpl('new')} className="gap-1.5">
                <Plus className="w-4 h-4" /> New Template
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        {editingPkg === null && editingTpl === null && (
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-8">
            {([['packages', Package, 'Packages'], ['templates', FileText, 'Email Templates']] ).map(([key, TabIcon, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === key ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {TabIcon && <TabIcon className="w-4 h-4" />} {label}
              </button>
            ))}
          </div>
        )}

        {/* PACKAGES TAB */}
        {tab === 'packages' && (
          <>
            {editingPkg !== null ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <button onClick={() => setEditingPkg(null)} className="text-slate-400 hover:text-slate-600 text-sm">← Back</button>
                  <h2 className="font-bold text-slate-800">{editingPkg === 'new' ? 'New Package' : `Edit: ${editingPkg.name}`}</h2>
                </div>
                <PackageEditor
                  pkg={editingPkg === 'new' ? null : editingPkg}
                  onSave={() => { qc.invalidateQueries({ queryKey: ['onboarding-packages'] }); setEditingPkg(null); }}
                  onCancel={() => setEditingPkg(null)}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {packages.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No packages yet. Create your first one.</p>
                  </div>
                )}
                {packages.map(pkg => (
                  <div key={pkg.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-slate-800">{pkg.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[pkg.status]}`}>{pkg.status}</span>
                      </div>
                      <p className="text-slate-500 text-sm truncate">{pkg.description}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        ${pkg.deposit_amount?.toLocaleString()} deposit · ${pkg.total_amount?.toLocaleString()} total
                        {pkg.payment_installments?.length ? ` · ${pkg.payment_installments.length + 1} payments` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link to={`/onboarding?pkg=${pkg.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-1"><Eye className="w-3.5 h-3.5" /> Preview</Button>
                      </Link>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => setSendModal(pkg)}>
                        <Mail className="w-3.5 h-3.5" /> Send
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => dupPkg.mutate(pkg)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingPkg(pkg)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-400 hover:text-red-600" onClick={() => deletePkg.mutate(pkg.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TEMPLATES TAB */}
        {tab === 'templates' && (
          <>
            {editingTpl !== null ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <button onClick={() => setEditingTpl(null)} className="text-slate-400 hover:text-slate-600 text-sm">← Back</button>
                  <h2 className="font-bold text-slate-800">{editingTpl === 'new' ? 'New Template' : `Edit: ${editingTpl.name}`}</h2>
                </div>
                <EmailTemplateEditor
                  template={editingTpl === 'new' ? null : editingTpl}
                  onSave={() => { qc.invalidateQueries({ queryKey: ['email-templates'] }); setEditingTpl(null); }}
                  onCancel={() => setEditingTpl(null)}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map(tpl => (
                  <div key={tpl.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-slate-800">{tpl.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[tpl.category] || CAT_COLORS.custom}`}>{tpl.category?.replace('_', ' ')}</span>
                        {tpl.is_default && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">default</span>}
                      </div>
                      <p className="text-sm text-slate-600 truncate">{tpl.subject}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tpl.body}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setEditingTpl(tpl)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {!tpl.is_default && (
                        <Button variant="outline" size="sm" className="text-red-400 hover:text-red-600" onClick={() => deleteTpl.mutate(tpl.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {sendModal && (
        <SendEmailModal isOpen={!!sendModal} onClose={() => setSendModal(null)} pkg={sendModal} />
      )}
    </div>
  );
}