import React, { useState } from 'react';
import { KBArticle } from '@/entities/KBArticle';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Loader2, Pin, PinOff } from 'lucide-react';
import KBArticleForm from './KBArticleForm';

export default function KBArticleManager({ articles, onArticlesUpdate }) {
    const [showForm, setShowForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const { toast } = useToast();

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingArticle(null);
        onArticlesUpdate(); // Refresh data from parent
    };

    const handleEdit = (article) => {
        setEditingArticle(article);
        setShowForm(true);
    };

    const handleDelete = async (articleId) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        setProcessingId(articleId);
        try {
            await KBArticle.delete(articleId);
            toast({ title: "Success", description: "Article deleted." });
            onArticlesUpdate(); // Refresh data from parent
        } catch (error) {
            console.error("Failed to delete article:", error);
            toast({ variant: 'destructive', title: "Error", description: "Failed to delete article." });
        } finally {
            setProcessingId(null);
        }
    };

    const handleTogglePin = async (article) => {
        setProcessingId(article.id);
        try {
            await KBArticle.update(article.id, { is_pinned: !article.is_pinned });
            toast({ title: "Success", description: article.is_pinned ? "Article unpinned." : "Article pinned to top." });
            onArticlesUpdate();
        } catch (error) {
            console.error("Failed to toggle pin:", error);
            toast({ variant: 'destructive', title: "Error", description: "Failed to update article." });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--text)]">Knowledge Base Management</h2>
                <Button onClick={() => { setEditingArticle(null); setShowForm(true); }} className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Article
                </Button>
            </div>
            
            <div className="bg-transparent rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-black/5">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Pin</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {articles && articles.map(article => (
                            <tr key={article.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--text)]">{article.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-[var(--muted)]">{article.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        article.status === 'published' ? 'bg-green-100 text-green-800' : 
                                        article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {article.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleTogglePin(article)} 
                                        disabled={processingId === article.id}
                                        className={article.is_pinned ? 'text-yellow-500' : 'text-[var(--muted)]'}
                                    >
                                        {article.is_pinned ? <Pin className="w-4 h-4" fill="currentColor" /> : <PinOff className="w-4 h-4" />}
                                    </Button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(article)} className="border-[var(--border)] text-[var(--text)] hover:bg-white/10"><Edit className="w-4 h-4" /></Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(article.id)} disabled={processingId === article.id} className="border-red-500/20 text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {(!articles || articles.length === 0) && (
                    <div className="text-center p-8 text-[var(--muted)]">No articles found. Click "Add Article" to create one.</div>
                )}
            </div>

            {showForm && <KBArticleForm article={editingArticle} onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />}
        </div>
    );
}