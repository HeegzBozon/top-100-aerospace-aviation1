import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Type, Heading, AlignLeft, Image, Quote, Minus, MoveVertical, User } from 'lucide-react';
import { MAGAZINE_PALETTE as P, PAGE_LAYOUTS, CONTENT_BLOCK_TYPES, layoutLabel } from '@/components/magazine/magazineConfig';

const BLOCK_ICONS = { Type, Heading, AlignLeft, Image, Quote, Minus, MoveVertical, User };

export default function PageComposer({ issue, pages, articles, onCreate, onUpdate, onDelete }) {
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id || null);
  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const sections = issue.sections || [];

  const handleCreate = async () => {
    const res = await onCreate({
      page_number: pages.length + 1,
      layout_type: 'article',
      content_blocks: [],
    });
    setSelectedPageId(res.id);
  };

  const addBlock = async (type) => {
    if (!selectedPage) return;
    const newBlock = { type, text: '', level: 2 };
    await onUpdate(selectedPage.id, {
      content_blocks: [...(selectedPage.content_blocks || []), newBlock],
    });
  };

  const updateBlock = async (idx, field, value) => {
    if (!selectedPage) return;
    const blocks = [...(selectedPage.content_blocks || [])];
    blocks[idx] = { ...blocks[idx], [field]: value };
    await onUpdate(selectedPage.id, { content_blocks: blocks });
  };

  const removeBlock = async (idx) => {
    if (!selectedPage) return;
    const blocks = (selectedPage.content_blocks || []).filter((_, i) => i !== idx);
    await onUpdate(selectedPage.id, { content_blocks: blocks });
  };

  const moveBlock = async (idx, dir) => {
    if (!selectedPage) return;
    const blocks = [...(selectedPage.content_blocks || [])];
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    [blocks[idx], blocks[target]] = [blocks[target], blocks[idx]];
    await onUpdate(selectedPage.id, { content_blocks: blocks });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Page List */}
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-serif" style={{ color: P.navy }}>Pages ({pages.length})</h3>
          <button onClick={handleCreate} className="mag-btn-primary text-xs px-3 py-1.5"><Plus className="w-3.5 h-3.5 inline mr-1" /> Add</button>
        </div>
        <div className="space-y-1.5 max-h-[70vh] overflow-y-auto">
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => setSelectedPageId(page.id)}
              className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all"
              style={{
                background: selectedPageId === page.id ? P.navy : '#fff',
                border: `1px solid ${selectedPageId === page.id ? P.navy : 'rgba(30,58,90,0.08)'}`,
              }}
            >
              <span className="text-xs font-mono w-7 text-center" style={{ color: selectedPageId === page.id ? P.gold : 'rgba(30,58,90,0.4)' }}>
                {String(page.page_number).padStart(2, '0')}
              </span>
              <span className="text-xs flex-1 truncate" style={{ color: selectedPageId === page.id ? P.cream : P.navy }}>
                {layoutLabel(page.layout_type)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}
                className="p-0.5 rounded-full opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" style={{ color: selectedPageId === page.id ? 'rgba(250,248,245,0.4)' : 'rgba(30,58,90,0.3)' }} />
              </button>
            </div>
          ))}
          {!pages.length && <p className="text-xs text-center py-8" style={{ color: 'rgba(30,58,90,0.4)' }}>No pages yet.</p>}
        </div>
      </div>

      {/* Block Editor */}
      <div className="lg:col-span-2">
        {selectedPage ? (
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
            {/* Page Settings */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(30,58,90,0.6)' }}>Layout</label>
                <select
                  value={selectedPage.layout_type}
                  onChange={(e) => onUpdate(selectedPage.id, { layout_type: e.target.value })}
                  className="mag-input"
                >
                  {PAGE_LAYOUTS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(30,58,90,0.6)' }}>Section</label>
                <select
                  value={selectedPage.section_id || ''}
                  onChange={(e) => onUpdate(selectedPage.id, { section_id: e.target.value })}
                  className="mag-input"
                >
                  <option value="">Unassigned</option>
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(30,58,90,0.6)' }}>Background Image URL</label>
              <input
                value={selectedPage.background_image_url || ''}
                onChange={(e) => onUpdate(selectedPage.id, { background_image_url: e.target.value })}
                className="mag-input"
                placeholder="https://..."
              />
            </div>

            {selectedPage.layout_type === 'chapter_divider' && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(30,58,90,0.6)' }}>Chapter Label</label>
                  <input
                    value={selectedPage.chapter_label || ''}
                    onChange={(e) => onUpdate(selectedPage.id, { chapter_label: e.target.value })}
                    className="mag-input"
                    placeholder="e.g. Profiles"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(30,58,90,0.6)' }}>Chapter Number</label>
                  <input
                    type="number"
                    value={selectedPage.chapter_number || ''}
                    onChange={(e) => onUpdate(selectedPage.id, { chapter_number: Number(e.target.value) })}
                    className="mag-input"
                  />
                </div>
              </div>
            )}

            {/* Content Blocks */}
            <div className="mb-4">
              <p className="text-xs font-medium mb-3" style={{ color: 'rgba(30,58,90,0.6)' }}>Content Blocks</p>
              <div className="space-y-2">
                {(selectedPage.content_blocks || []).map((block, idx) => {
                  const Icon = BLOCK_ICONS[block.type] || Type;
                  return (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(30,58,90,0.03)' }}>
                      <div className="flex flex-col pt-1">
                        <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0} className="text-[10px] disabled:opacity-20"><ChevronUp className="w-3 h-3" style={{ color: P.navy }} /></button>
                        <button onClick={() => moveBlock(idx, 1)} disabled={idx === (selectedPage.content_blocks || []).length - 1} className="text-[10px] disabled:opacity-20"><ChevronDown className="w-3 h-3" style={{ color: P.navy }} /></button>
                      </div>
                      <Icon className="w-3.5 h-3.5 mt-1.5 flex-shrink-0" style={{ color: P.gold }} />
                      <div className="flex-1 space-y-1.5">
                        {block.type === 'image' ? (
                          <>
                            <input value={block.url || ''} onChange={(e) => updateBlock(idx, 'url', e.target.value)} placeholder="Image URL" className="mag-input text-xs" />
                            <input value={block.caption || ''} onChange={(e) => updateBlock(idx, 'caption', e.target.value)} placeholder="Caption (optional)" className="mag-input text-xs" />
                          </>
                        ) : block.type === 'pull_quote' ? (
                          <>
                            <textarea value={block.text || ''} onChange={(e) => updateBlock(idx, 'text', e.target.value)} placeholder="Quote text..." rows={2} className="mag-input text-xs" />
                            <input value={block.attribution || ''} onChange={(e) => updateBlock(idx, 'attribution', e.target.value)} placeholder="Attribution" className="mag-input text-xs" />
                          </>
                        ) : block.type === 'heading' ? (
                          <div className="flex gap-2">
                            <input value={block.text || ''} onChange={(e) => updateBlock(idx, 'text', e.target.value)} placeholder="Heading text..." className="mag-input text-xs flex-1" />
                            <select value={block.level || 2} onChange={(e) => updateBlock(idx, 'level', Number(e.target.value))} className="mag-input text-xs w-16">
                              <option value={1}>H1</option>
                              <option value={2}>H2</option>
                              <option value={3}>H3</option>
                            </select>
                          </div>
                        ) : block.type === 'spacer' || block.type === 'divider' ? (
                          <p className="text-xs italic" style={{ color: 'rgba(30,58,90,0.4)' }}>{block.type === 'spacer' ? '— spacer —' : '— divider —'}</p>
                        ) : (
                          <textarea value={block.text || ''} onChange={(e) => updateBlock(idx, 'text', e.target.value)} placeholder={`${block.type} text...`} rows={block.type === 'body' ? 4 : 2} className="mag-input text-xs" />
                        )}
                      </div>
                      <button onClick={() => removeBlock(idx)} className="p-1 rounded-full hover:bg-red-50">
                        <Trash2 className="w-3 h-3" style={{ color: 'rgba(30,58,90,0.4)' }} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* Add block buttons */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {CONTENT_BLOCK_TYPES.map((bt) => {
                  const Icon = BLOCK_ICONS[bt.icon] || Type;
                  return (
                    <button
                      key={bt.key}
                      onClick={() => addBlock(bt.key)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-full transition-all hover:opacity-80"
                      style={{ background: 'rgba(30,58,90,0.05)', color: P.navy, border: '1px solid rgba(30,58,90,0.1)' }}
                    >
                      <Icon className="w-3 h-3" /> {bt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
            <p className="text-sm" style={{ color: 'rgba(30,58,90,0.5)' }}>Select a page to edit its content blocks.</p>
          </div>
        )}
      </div>

      <style>{`
        .mag-input {
          width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border-radius: 0.5rem;
          background: #fff; border: 0; outline: 1px solid rgba(30,58,90,0.15); color: ${P.navy};
        }
        .mag-input:focus { outline: 2px solid ${P.gold}; }
        .mag-btn-primary {
          display: inline-flex; align-items: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
          border-radius: 9999px; background: ${P.navy}; color: ${P.cream}; border: 0; cursor: pointer; transition: opacity 0.2s;
        }
        .mag-btn-primary:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}