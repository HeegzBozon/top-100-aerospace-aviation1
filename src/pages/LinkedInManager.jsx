import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Mail, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ContactList from '@/components/linkedin/ContactList';
import ContactDetail from '@/components/linkedin/ContactDetail';

export default function LinkedInManager() {
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [error, setError] = useState(null);
  const [imported, setImported] = useState(false);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await base44.entities.LinkedInContact.list('-updated_date', 100);
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const text = await csvFile.text();
      console.log('CSV content length:', text.length);
      
      const result = await base44.functions.invoke('importLinkedInCSV', { csvContent: text });
      console.log('Import result:', result);
      
      if (result.data?.success || result.success) {
        const contactsData = result.data?.contacts || result.contacts || [];
        console.log('Imported contacts:', contactsData);
        setContacts(contactsData);
        setImported(true);
        setCsvFile(null);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e3a5a] to-[#0f2438] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 font-serif text-[#D4A574]">LinkedIn Contact Manager</h1>
          <p className="text-slate-300">Import, manage, and engage with your LinkedIn inbox</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {!imported ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-[#1e3a5a] mb-6">Import Contacts</h2>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="csv-input"
                />
                <label htmlFor="csv-input" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-[#D4A574] mx-auto mb-3" />
                  <p className="text-slate-700 font-semibold mb-1">Drop CSV or click to select</p>
                  <p className="text-sm text-slate-500">Export from LinkedIn using the provided format</p>
                </label>
              </div>

              {csvFile && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-700">{csvFile.name}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <Button
                onClick={handleImportCSV}
                disabled={!csvFile || loading}
                className="w-full bg-[#D4A574] text-white hover:bg-[#C19A6B] h-auto py-3 text-base font-semibold rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Contacts'
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-1">
              <ContactList 
                contacts={contacts} 
                selectedContact={selectedContact}
                onSelectContact={setSelectedContact}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedContact ? (
                <ContactDetail 
                  contact={selectedContact}
                  onUpdate={(updated) => {
                    setContacts(contacts.map(c => c.id === updated.id ? updated : c));
                  }}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center h-full flex items-center justify-center">
                  <p className="text-slate-600">Select a contact to view details and compose responses</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}