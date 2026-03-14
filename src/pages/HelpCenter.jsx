import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Loader2, Search, BookOpen, Eye, Tag, FileText, ArrowUpDown, Filter, Pin
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

// A simple debounce hook if not available
const useDebounceValue = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


export default function HelpCenter() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [filterType, setFilterType] = useState('all');
    const debouncedSearchTerm = useDebounceValue(searchTerm, 300);

    const { data: articles = [], isLoading: loading } = useQuery({
        queryKey: ['kb-articles'],
        queryFn: async () => {
            const allPublished = await base44.entities.KBArticle.filter({ status: 'published' }, '-publish_date');
            return allPublished;
        },
    });
    
    const filteredArticles = articles
        .filter(article => {
            const matchesSearch = debouncedSearchTerm ? (
                article.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                article.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                article.tags?.join(' ').toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            ) : true;
            
            const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
            const matchesType = filterType === 'all' || article.type === filterType;
            
            return matchesSearch && matchesCategory && matchesType;
        })
        .sort((a, b) => {
            // Pinned articles always come first
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            
            // Then sort by selected method
            if (sortBy === 'recent') {
                return new Date(b.publish_date || b.created_date) - new Date(a.publish_date || a.created_date);
            } else if (sortBy === 'popular') {
                return (b.views || 0) - (a.views || 0);
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });
    
    const categories = [...new Set(articles.map(a => a.category))];
    const articlesByCategory = categories.map(category => ({
        category,
        count: articles.filter(a => a.category === category).length
    }));


    return (
        <div className="min-h-screen bg-white">
            {/* Wikipedia-style Header */}
            <div className="border-b" style={{ borderColor: `${brandColors.navyDeep}20` }}>
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                                <BookOpen className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
                                <span className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                                    TOP 100 Wiki
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${brandColors.navyDeep}60` }} />
                                <Input
                                    type="search"
                                    placeholder="Search knowledge base..."
                                    className="pl-10 h-9 text-sm border"
                                    style={{ borderColor: `${brandColors.navyDeep}30` }}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto flex">
                {/* Left Sidebar - Navigation */}
                <aside className="w-64 flex-shrink-0 p-6 border-r" style={{ borderColor: `${brandColors.navyDeep}10` }}>
                    <div className="space-y-6 sticky top-4">
                        <div>
                            <h3 className="text-xs font-bold uppercase mb-3" style={{ color: `${brandColors.navyDeep}60` }}>
                                Navigation
                            </h3>
                            <nav className="space-y-1">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                                        selectedCategory === 'all' ? 'font-semibold' : ''
                                    }`}
                                    style={{
                                        background: selectedCategory === 'all' ? `${brandColors.goldPrestige}15` : 'transparent',
                                        color: selectedCategory === 'all' ? brandColors.goldPrestige : brandColors.navyDeep
                                    }}
                                >
                                    All Articles
                                </button>
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase mb-3" style={{ color: `${brandColors.navyDeep}60` }}>
                                Categories
                            </h3>
                            <nav className="space-y-1">
                                {articlesByCategory.map(({ category, count }) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between ${
                                            selectedCategory === category ? 'font-semibold' : ''
                                        }`}
                                        style={{
                                            background: selectedCategory === category ? `${brandColors.goldPrestige}15` : 'transparent',
                                            color: selectedCategory === category ? brandColors.goldPrestige : brandColors.navyDeep
                                        }}
                                    >
                                        <span>{category}</span>
                                        <Badge variant="outline" className="text-xs">{count}</Badge>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 p-6">
                    {/* Sort & Filter Bar */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: `${brandColors.navyDeep}10` }}>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
                                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4" style={{ color: `${brandColors.navyDeep}60` }} />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="text-sm border rounded px-3 py-1"
                                    style={{ borderColor: `${brandColors.navyDeep}30`, color: brandColors.navyDeep }}
                                >
                                    <option value="all">All Types</option>
                                    <option value="article">Articles</option>
                                    <option value="release_note">Release Notes</option>
                                    <option value="faq">FAQs</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-4 h-4" style={{ color: `${brandColors.navyDeep}60` }} />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-sm border rounded px-3 py-1"
                                    style={{ borderColor: `${brandColors.navyDeep}30`, color: brandColors.navyDeep }}
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="title">A-Z</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin" style={{ color: brandColors.goldPrestige }} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredArticles.map(article => (
                                <Link
                                    key={article.id}
                                    to={createPageUrl(`Article?id=${article.id}`)}
                                    className="block p-4 rounded border hover:shadow-md transition-all group bg-white relative"
                                    style={{ 
                                        borderColor: article.is_pinned ? brandColors.goldPrestige : `${brandColors.navyDeep}10`,
                                        borderWidth: article.is_pinned ? '2px' : '1px'
                                    }}
                                >
                                    {article.is_pinned && (
                                        <div className="absolute top-3 right-3">
                                            <Pin className="w-4 h-4" style={{ color: brandColors.goldPrestige }} fill={brandColors.goldPrestige} />
                                        </div>
                                    )}
                                    <div className="flex items-start justify-between mb-2 pr-8">
                                        <h3 className="text-lg font-semibold group-hover:underline" style={{ color: brandColors.goldPrestige }}>
                                            {article.title}
                                        </h3>
                                        {article.type === 'release_note' && (
                                            <Badge style={{ background: brandColors.skyBlue, color: 'white' }}>
                                                Release
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm mb-3 line-clamp-2" style={{ color: `${brandColors.navyDeep}80` }}
                                        dangerouslySetInnerHTML={{ __html: article.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...' }}
                                    />
                                    <div className="flex items-center gap-4 text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
                                        <span>{article.category}</span>
                                        <span>{article.views || 0} views</span>
                                    </div>
                                </Link>
                            ))}
                            {filteredArticles.length === 0 && (
                                <div className="text-center py-12">
                                    <Search className="w-12 h-12 mx-auto mb-4" style={{ color: `${brandColors.navyDeep}30` }} />
                                    <p className="text-lg font-medium mb-2" style={{ color: brandColors.navyDeep }}>
                                        No articles found
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}