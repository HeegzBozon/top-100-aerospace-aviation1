import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function CSVUpload({ onUpload }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const [driveFiles, setDriveFiles] = useState([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [showDrive, setShowDrive] = useState(false);

  useEffect(() => {
    const loadDriveFiles = async () => {
      setLoadingDrive(true);
      try {
        const response = await base44.functions.invoke('driveFiles', {});
        if (response.data?.files) setDriveFiles(response.data.files);
      } catch (err) {
        console.error('Failed to load Google Drive files', err);
      } finally {
        setLoadingDrive(false);
      }
    };
    
    if (showDrive) loadDriveFiles();
  }, [showDrive]);

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have header and at least one row');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const messages = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const message = {};
      headers.forEach((header, idx) => {
        message[header] = values[idx] || '';
      });
      if (Object.values(message).some(v => v)) messages.push(message);
    }

    if (messages.length === 0) throw new Error('No valid messages found');
    return messages;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result;
        if (!csv || typeof csv !== 'string') throw new Error('Invalid file');
        onUpload(parseCSV(csv));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  };

  const handleDriveFileSelect = async (file) => {
    setError('');
    try {
      const response = await base44.functions.invoke('driveFileContent', { fileId: file.id });
      if (!response.data?.content) throw new Error('Failed to load file');
      onUpload(parseCSV(response.data.content));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file from Drive');
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white"
      >
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload CSV</h3>
        <p className="text-slate-600 mb-6">Or load from Google Drive</p>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            Select Local File
          </Button>
          <Button
            onClick={() => setShowDrive(!showDrive)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" /> Google Drive
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>

      {showDrive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-slate-200 rounded-2xl p-6 bg-slate-50"
        >
          <h4 className="font-semibold text-slate-900 mb-4">Google Drive Files</h4>
          {loadingDrive ? (
            <div className="flex items-center gap-2 text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading files...
            </div>
          ) : driveFiles.length > 0 ? (
            <div className="space-y-2">
              {driveFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleDriveFileSelect(file)}
                  className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-900 transition-colors"
                >
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{new Date(file.createdTime).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No CSV files found in Google Drive</p>
          )}
        </motion.div>
      )}
    </div>
  );
}