import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CSVUpload({ onUpload }) {
  const fileInputRef = useRef(null);
  const [error, setError] = React.useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result;
        if (!csv || typeof csv !== 'string') throw new Error('Invalid file');

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
        onUpload(messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white"
    >
      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload CSV</h3>
      <p className="text-slate-600 mb-6">Expected columns: sender, message, date (any column names work)</p>
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="bg-slate-900 text-white hover:bg-slate-800"
      >
        Select CSV File
      </Button>

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
  );
}