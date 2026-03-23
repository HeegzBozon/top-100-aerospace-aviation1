import { useState, useEffect } from 'react';
import { Nominee } from '@/entities/Nominee';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Search, Loader2, CheckCircle, Camera } from 'lucide-react';

export default function NomineePhotoUploadWizard() {
  const [nominees, setNominees] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [unmatchedFiles, setUnmatchedFiles] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadNominees();
  }, []);

  const loadNominees = async () => {
    try {
      const allNominees = await Nominee.list('-created_date', 1000);
      setNominees(allNominees);
    } catch (error) {
      console.error('Error loading nominees:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load nominees' });
    }
  };

  const normalizeFileName = (fileName) => {
    return fileName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toLowerCase()
      .replace(/\([^)]*\)/g, '') // Remove parentheses and content
      .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  };

  const matchNomineeByName = (fileName) => {
    const normalized = normalizeFileName(fileName);
    
    // Try exact match first
    let match = nominees.find(n => {
      const nomineeName = normalizeFileName(n.name);
      return nomineeName === normalized;
    });
    
    if (match) return match;
    
    // Try partial match (filename contains name or vice versa)
    match = nominees.find(n => {
      const nomineeName = normalizeFileName(n.name);
      return normalized.includes(nomineeName) || nomineeName.includes(normalized);
    });
    
    if (match) return match;
    
    // Try matching individual name parts (first/last name)
    const nameParts = normalized.split(' ').filter(p => p.length > 2);
    match = nominees.find(n => {
      const nomineeNameParts = normalizeFileName(n.name).split(' ').filter(p => p.length > 2);
      return nomineeNameParts.every(part => nameParts.includes(part));
    });
    
    return match;
  };

  const aiMatchNominee = async (fileName) => {
    try {
      const normalized = normalizeFileName(fileName);
      const nomineeNames = nominees.map(n => n.name).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Match this photo filename to a nominee name. Be flexible with:
- Accents and special characters (Adéla = Adela)
- Parentheses (maiden names, nicknames)
- Hyphens and middle names
- Spacing variations

Filename: "${fileName}"
Original: "${normalized}"

Nominee List:
${nomineeNames}

Find the BEST matching nominee name. Consider:
- Name similarity (fuzzy matching)
- Common name variations
- Partial matches (first + last name)

Return the EXACT matching name from the list, or "NO_MATCH" if truly no match exists.`,
        response_json_schema: {
          type: "object",
          properties: {
            match: { type: "string" },
            confidence: { type: "string" }
          }
        }
      });

      const data = response.data || response;
      if (data.match === "NO_MATCH") return null;
      return nominees.find(n => n.name === data.match);
    } catch (error) {
      console.error('AI matching failed:', error);
      return null;
    }
  };

  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    await processBulkUpload(files);
  };

  const processBulkUpload = async (files) => {
    setUploading(true);
    setUploadResults(null);
    setUploadProgress({ current: 0, total: files.length });

    const results = {
      success: [],
      failed: [],
      unmatched: [],
      duplicates: [],
      aiMatched: []
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: files.length });

      try {
        let nominee = matchNomineeByName(file.name);
        let usedAI = false;
        
        if (!nominee) {
          nominee = await aiMatchNominee(file.name);
          usedAI = !!nominee;
        }
        
        if (!nominee) {
          results.unmatched.push(file.name);
          setUnmatchedFiles(prev => [...prev, file]);
          continue;
        }

        // Check for duplicates
        if (nominee.avatar_url) {
          results.duplicates.push({ 
            name: file.name, 
            nominee: nominee.name,
            existing: nominee.avatar_url 
          });
          continue;
        }

        // Upload file to Base44 storage
        const uploadResponse = await base44.integrations.Core.UploadFile({ file });
        
        console.log(`Upload response for ${file.name}:`, uploadResponse);
        
        // Extract file_url from response
        const fileUrl = uploadResponse?.file_url || uploadResponse?.data?.file_url;
        
        if (!fileUrl) {
          console.error(`No file_url in response for ${file.name}:`, uploadResponse);
          throw new Error(`No file URL returned from upload - Response: ${JSON.stringify(uploadResponse)}`);
        }

        await Nominee.update(nominee.id, { avatar_url: fileUrl });
        
        const successItem = { name: file.name, nominee: nominee.name };
        if (usedAI) {
          results.aiMatched.push(successItem);
        }
        results.success.push(successItem);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        results.failed.push({ 
          name: file.name, 
          error: error?.response?.data?.error || error?.message || 'Unknown error' 
        });
      }
    }

    setUploadResults(results);
    setUploading(false);

    toast({
      title: 'Bulk Upload Complete',
      description: `${results.success.length} uploaded, ${results.duplicates.length} skipped (existing), ${results.failed.length} failed`
    });

    if (results.success.length > 0) {
      await loadNominees();
    }
  };

  const handleRetryUnmatched = async () => {
    if (unmatchedFiles.length === 0) {
      toast({ title: 'No unmatched files to retry' });
      return;
    }

    toast({ 
      title: 'Retrying Upload', 
      description: `Processing ${unmatchedFiles.length} unmatched files with enhanced AI matching...` 
    });

    setUnmatchedFiles([]);
    await processBulkUpload(unmatchedFiles);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Bulk Photo Upload</h2>
            <p className="text-sm text-[var(--muted)]">Upload multiple photos - filenames match to nominee names</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--accent)]">{nominees.length}</p>
          <p className="text-xs text-[var(--muted)]">Nominees Loaded</p>
        </div>
      </div>

      {/* Upload Section */}
      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--accent)] transition-colors bg-[var(--card)]">
        <div className="flex flex-col items-center justify-center py-8">
          {uploading ? (
            <>
              <Loader2 className="w-16 h-16 text-[var(--accent)] animate-spin mb-4" />
              <p className="text-lg font-semibold text-[var(--text)] mb-2">Uploading Photos...</p>
              <p className="text-sm text-[var(--muted)]">
                {uploadProgress.current} of {uploadProgress.total} processed
              </p>
              <div className="w-64 h-2 bg-[var(--border)] rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] transition-all duration-300"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            </>
          ) : uploadResults ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-lg font-semibold text-green-600 mb-2">Upload Complete!</p>
              <div className="flex gap-4 text-sm flex-wrap justify-center">
                <span className="text-green-600">✓ {uploadResults.success.length} Success</span>
                {uploadResults.aiMatched.length > 0 && (
                  <span className="text-blue-600">🤖 {uploadResults.aiMatched.length} AI Matched</span>
                )}
                <span className="text-purple-600">⊗ {uploadResults.duplicates.length} Duplicates</span>
                <span className="text-red-600">✗ {uploadResults.failed.length} Failed</span>
                <span className="text-yellow-600">? {uploadResults.unmatched.length} Unmatched</span>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-[var(--accent)] mb-4" />
              <p className="mb-2 text-lg font-semibold text-[var(--text)]">
                Drop 203 Photos Here
              </p>
              <p className="text-sm text-[var(--muted)] mb-2">or click to browse</p>
              <p className="text-xs text-[var(--muted)] max-w-md text-center">
                Filenames should match nominee names (e.g., "Jane Doe.jpg" → Jane Doe)
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleBulkUpload}
          disabled={uploading}
          multiple
        />
      </label>

      {uploadResults && (
        <Button
          onClick={() => setUploadResults(null)}
          className="w-full"
        >
          Upload More Photos
        </Button>
      )}

      {/* Results Details */}
      {uploadResults && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Success */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Success ({uploadResults.success.length})
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {uploadResults.success.map((item, i) => (
                  <div key={i} className="text-xs text-green-700">
                    {item.nominee} ← {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Duplicates */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Duplicates ({uploadResults.duplicates.length})
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {uploadResults.duplicates.map((item, i) => (
                  <div key={i} className="text-xs text-purple-700">
                    {item.nominee} (has photo)
                  </div>
                ))}
              </div>
            </div>

            {/* Failed */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Failed ({uploadResults.failed.length})
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {uploadResults.failed.map((item, i) => (
                  <div key={i} className="text-xs text-red-700">
                    {item.name} - {item.error}
                  </div>
                ))}
              </div>
            </div>

            {/* Unmatched */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-yellow-900 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Unmatched ({uploadResults.unmatched.length})
                </h3>
                {uploadResults.unmatched.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetryUnmatched}
                    disabled={uploading}
                    className="text-xs"
                  >
                    🔄 Retry with AI
                  </Button>
                )}
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {uploadResults.unmatched.map((name, i) => (
                  <div key={i} className="text-xs text-yellow-700">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Matches Highlight */}
          {uploadResults.aiMatched.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                🤖 AI-Matched ({uploadResults.aiMatched.length})
              </h3>
              <p className="text-xs text-blue-700 mb-2">These files were matched using AI when exact matching failed:</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {uploadResults.aiMatched.map((item, i) => (
                  <div key={i} className="text-xs text-blue-700">
                    {item.nominee} ← {item.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}