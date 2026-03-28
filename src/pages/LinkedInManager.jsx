import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Check, X, Users, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ContactList from '@/components/linkedin/ContactList';
import InboxManagerChat from '@/components/linkedin/InboxManagerChat';

export default function LinkedInManager() {
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [error, setError] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const data = await base44.entities.LinkedInContact.list('-updated_date', 100);
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;
    setImporting(true);
    setError(null);
    try {
      const text = await csvFile.text();
      const result = await base44.functions.invoke('importLinkedInCSV', { csvContent: text });
      if (result.data?.success || result.success) {
        const contactsData = result.data?.contacts || result.contacts || [];
        setContacts(contactsData);
        setCsvFile(null);
        setShowImport(false);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e3a5a] to-[#0f2438] text-white px-6 py-4 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#D4A574] font-serif">LinkedIn Inbox Manager</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              <Users className="w-3 h-3 inline mr-1" />
              {contacts.length} contacts loaded
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchContacts}
              variant="outline"
              size="sm"
              className="gap-1.5 border-white/20 text-white hover:bg-white/10 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Button
              onClick={() => setShowImport(v => !v)}
              size="sm"
              className="gap-1.5 bg-[#D4A574] hover:bg-[#C19A6B] text-white text-xs"
            >
              <Upload className="w-3.5 h-3.5" /> Import CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Import Bar (collapsible) */}
      {showImport && (
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="max-w-[1400px] mx-auto flex items-center gap-4">
            <label
              htmlFor="csv-input"
              className="flex items-center gap-3 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#D4A574] transition-colors text-sm text-slate-600"
            >
              <Upload className="w-4 h-4 text-[#D4A574]" />
              {csvFile ? (
                <span className="flex items-center gap-1.5 text-green-700 font-medium">
                  <Check className="w-4 h-4" /> {csvFile.name}
                </span>
              ) : (
                'Choose CSV file'
              )}
            </label>
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              onChange={e => { setCsvFile(e.target.files?.[0] || null); setError(null); }}
              className="hidden"
            />
            <Button
              onClick={handleImportCSV}
              disabled={!csvFile || importing}
              className="bg-[#1e3a5a] hover:bg-[#0f2438] text-white gap-2"
              size="sm"
            >
              {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : 'Import'}
            </Button>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <X className="w-4 h-4" /> {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main 3-panel layout */}
      <div className="flex-1 min-h-0 max-w-[1400px] mx-auto w-full px-6 py-4 flex gap-4">

        {/* Left: Contact List */}
        <div className="w-72 flex-shrink-0 flex flex-col min-h-0">
          {loadingContacts ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Users className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">No contacts yet</p>
              <p className="text-xs text-slate-400 mt-1">Import a LinkedIn CSV to get started</p>
              <Button
                onClick={() => setShowImport(true)}
                size="sm"
                className="mt-4 bg-[#D4A574] hover:bg-[#C19A6B] text-white gap-2"
              >
                <Upload className="w-3.5 h-3.5" /> Import CSV
              </Button>
            </div>
          ) : (
            <ContactList
              contacts={contacts}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          )}
        </div>

        {/* Right: Agent Chat */}
        <div className="flex-1 min-h-0">
          <InboxManagerChat selectedContact={selectedContact} />
        </div>

      </div>
    </div>
  );
}