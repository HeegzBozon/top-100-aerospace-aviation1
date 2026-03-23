
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Ensure styles are loaded
import { KBArticle } from '@/entities/KBArticle';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { X, Loader2 } from 'lucide-react';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

export default function KBArticleForm({ article, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    category: article?.category || 'General',
    type: article?.type || 'article',
    status: article?.status || 'draft',
    tags: article?.tags?.join(', ') || '',
  });
  const [content, setContent] = useState(article?.content || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: slugify(newTitle)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await User.me();
      const articleData = {
        ...formData,
        content,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        author_name: user.full_name || user.email,
        publish_date: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (article) {
        await KBArticle.update(article.id, articleData);
        toast({ title: "Success", description: "Article updated successfully." });
      } else {
        await KBArticle.create(articleData);
        toast({ title: "Success", description: "Article created successfully." });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving article:", error);
      toast({ variant: 'destructive', title: "Error", description: `Failed to save article: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">{article ? 'Edit Article' : 'Create New Article'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="font-medium">Title</label>
            <Input value={formData.title} onChange={handleTitleChange} placeholder="Article Title" required />
          </div>
          <div>
            <label className="font-medium">Slug</label>
            <Input value={formData.slug} onChange={(e) => setFormData(p => ({...p, slug: e.target.value}))} placeholder="URL-friendly-slug" required />
          </div>
          <div className="h-96 pb-10">
            <label className="font-medium">Content</label>
            <ReactQuill theme="snow" value={content} onChange={setContent} modules={quillModules} className="h-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <label className="font-medium">Category</label>
              <Select value={formData.category} onValueChange={v => setFormData(p => ({...p, category: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Getting Started">Getting Started</SelectItem>
                  <SelectItem value="Voting & Ranking">Voting & Ranking</SelectItem>
                  <SelectItem value="Features">Features</SelectItem>
                  <SelectItem value="Quests & Rewards">Quests & Rewards</SelectItem>
                  <SelectItem value="Release Notes">Release Notes</SelectItem>
                  <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium">Type</label>
              <Select value={formData.type} onValueChange={v => setFormData(p => ({...p, type: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                  <SelectItem value="release_note">Release Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium">Status</label>
              <Select value={formData.status} onValueChange={v => setFormData(p => ({...p, status: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="font-medium">Tags (comma-separated)</label>
            <Input value={formData.tags} onChange={(e) => setFormData(p => ({...p, tags: e.target.value}))} placeholder="e.g. login, vote, pairwise" />
          </div>
        </form>
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (article ? 'Save Changes' : 'Create Article')}
          </Button>
        </div>
      </div>
    </div>
  );
}
