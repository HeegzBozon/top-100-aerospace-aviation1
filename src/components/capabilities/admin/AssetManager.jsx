import { useState } from 'react';
import { Asset } from '@/entities/Asset';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Copy, 
  Trash2, 
  Image, 
  Video, 
  FileText, 
  File,
  Check,
  Loader2,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const typeIcons = {
  image: Image,
  video: Video,
  document: FileText,
  other: File
};

const typeColors = {
  image: 'bg-blue-100 text-blue-700',
  video: 'bg-purple-100 text-purple-700',
  document: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700'
};

function getAssetType(mimeType) {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';
  if (mimeType?.includes('pdf') || mimeType?.includes('document')) return 'document';
  return 'other';
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function AssetCard({ asset, onDelete }) {
  const [copied, setCopied] = useState(false);
  const Icon = typeIcons[asset.type] || File;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {/* Preview */}
        <div className="aspect-video bg-slate-100 relative overflow-hidden">
          {asset.type === 'image' ? (
            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
          ) : asset.type === 'video' ? (
            <video src={asset.url} className="w-full h-full object-cover" muted />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-12 h-12 text-slate-400" />
            </div>
          )}
          <Badge className={`absolute top-2 right-2 ${typeColors[asset.type]}`}>
            {asset.type}
          </Badge>
        </div>

        <CardContent className="p-3">
          <h4 className="font-medium text-sm truncate mb-1">{asset.name}</h4>
          <p className="text-xs text-slate-500 mb-3">{formatFileSize(asset.file_size)}</p>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 text-xs"
              onClick={copyUrl}
            >
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              onClick={() => onDelete(asset.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AssetManager() {
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => Asset.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Asset.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] })
  });

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Check file sizes before upload
    const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed the 10MB limit and cannot be uploaded:\n\n${oversizedFiles.map(f => `• ${f.name} (${formatFileSize(f.size)})`).join('\n')}\n\nPlease compress or resize these files and try again.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const assetType = getAssetType(file.type);
        
        await Asset.create({
          name: file.name,
          type: assetType,
          url: file_url,
          file_size: file.size,
          mime_type: file.type
        });
      } catch (error) {
        console.error('Upload failed:', file.name, error);
        alert(`Failed to upload "${file.name}". File may be too large or in an unsupported format.`);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['assets'] });
    setUploading(false);
    e.target.value = '';
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Asset Manager</h2>
          <p className="text-sm text-slate-500">Upload and manage images, videos, and files</p>
        </div>
        
        <label className="cursor-pointer">
          <input 
            type="file" 
            multiple 
            className="hidden" 
            onChange={handleUpload}
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <Button disabled={uploading} asChild>
            <span>
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Upload Files'}
            </span>
          </Button>
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          {['all', 'image', 'video', 'document'].map((type) => (
            <Button
              key={type}
              size="sm"
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No assets yet. Upload your first file!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredAssets.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}