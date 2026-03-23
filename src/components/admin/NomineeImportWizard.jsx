
import { useState, useEffect } from 'react';
import { Nominee } from '@/entities/Nominee';
import { Season } from '@/entities/Season';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { FileSpreadsheet, Database, PlayCircle, CheckCircle,
  Loader2, Settings, Plus, Eye
} from 'lucide-react';

export default function NomineeImportWizard({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [detectedFields, setDetectedFields] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Add this state
  const [importResults, setImportResults] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [quickCreateMode, setQuickCreateMode] = useState(false);
  const [quickNominees, setQuickNominees] = useState([{ name: '', email: '', title: '', company: '' }]);

  const { toast } = useToast();

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      const allSeasons = await Season.list('-created_date');
      setSeasons(allSeasons);
      const activeSeason = allSeasons.find(s => s.status === 'active');
      if (activeSeason) {
        setSelectedSeason(activeSeason.id);
      }
    } catch (error) {
      console.error('Error loading seasons:', error);
    }
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      const validTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel']; // common mime types for csv/json
      const validExtensions = ['.json', '.csv'];
      const fileExtension = uploadedFile.name.toLowerCase().slice(uploadedFile.name.lastIndexOf('.'));

      if (validTypes.includes(uploadedFile.type) || validExtensions.includes(fileExtension)) {
        setFile(uploadedFile);
        setParsedData(null);
        setDetectedFields([]);
        setFieldMapping({});
        setImportResults(null);
        toast({
          title: "File Ready",
          description: `${uploadedFile.name} has been selected and is ready to be analyzed.`,
          className: "bg-green-100 text-green-800"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a JSON or CSV file.",
        });
      }
    }
  };

  const analyzeFile = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a file first.",
      });
      return;
    }

    setIsAnalyzing(true); // Start loading state

    try {
      const fileContent = await file.text();
      const isCsv = file.name.toLowerCase().endsWith('.csv');

      let data;
      let fields = [];

      if (isCsv) {
        const lines = fileContent.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
          throw new Error("CSV file appears to be empty");
        }

        // Parse CSV headers - handle quoted fields properly
        const parseCSVLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
        fields = headers;

        // Parse CSV data
        data = lines.slice(1).map(line => {
          const values = parseCSVLine(line).map(v => v.replace(/"/g, ''));
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        }).filter(row => {
          // Filter out completely empty rows
          return Object.values(row).some(value => value.trim() !== '');
        });
      } else {
        data = JSON.parse(fileContent);
        if (!Array.isArray(data)) {
          throw new Error("JSON file must contain an array of objects");
        }
        if (data.length > 0) {
          fields = Object.keys(data[0]);
        }
      }

      if (data.length === 0) {
        throw new Error("No valid data found in file");
      }

      setParsedData(data);
      setDetectedFields(fields);

      // Smart mapping for nominee fields
      const initialMapping = {};
      fields.forEach(field => {
        const lowerField = field.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ');

        // Enhanced smart mapping
        if (lowerField.includes('name') && !lowerField.includes('email') && !lowerField.includes('company')) {
          initialMapping[field] = 'name';
        } else if (lowerField.includes('email')) {
          initialMapping[field] = 'nominee_email';
        } else if (lowerField.includes('title') || lowerField.includes('position') || lowerField.includes('role')) {
          initialMapping[field] = 'title';
        } else if (lowerField.includes('company') || lowerField.includes('organization') || lowerField.includes('employer')) {
          initialMapping[field] = 'company';
        } else if (lowerField.includes('country') || lowerField.includes('nation')) {
          initialMapping[field] = 'country';
        } else if (lowerField.includes('industry') || lowerField.includes('sector')) {
          initialMapping[field] = 'industry';
        } else if (lowerField.includes('linkedin')) {
          initialMapping[field] = 'linkedin_profile_url';
        } else if (lowerField.includes('bio') || lowerField.includes('description') || lowerField.includes('about')) {
          initialMapping[field] = 'bio';
        } else if (lowerField.includes('avatar') || lowerField.includes('image') || lowerField.includes('photo')) {
          initialMapping[field] = 'avatar_url';
        } else if (lowerField.includes('website') || lowerField.includes('url')) {
          initialMapping[field] = 'website_url';
        } else if (lowerField.includes('department') || lowerField.includes('team')) {
          initialMapping[field] = 'department';
        }
        // Score-related fields
        else if (lowerField.includes('borda')) {
          initialMapping[field] = 'borda_score';
        } else if (lowerField.includes('elo')) {
          initialMapping[field] = 'elo_rating';
        } else if (lowerField.includes('starpower') || lowerField.includes('star power')) {
          initialMapping[field] = 'starpower_score';
        } else if (lowerField.includes('direct') && lowerField.includes('vote')) {
          initialMapping[field] = 'direct_vote_count';
        } else if (lowerField.includes('spotlight')) {
          initialMapping[field] = 'total_spotlights';
        } else if (lowerField.includes('wins')) {
          initialMapping[field] = 'total_wins';
        } else if (lowerField.includes('losses')) {
          initialMapping[field] = 'total_losses';
        }
      });

      setFieldMapping(initialMapping);
      setCurrentStep(2);

      toast({
        title: "File Analyzed Successfully",
        description: `Found ${fields.length} fields in ${data.length} records. Review the mapping below.`,
      });

    } catch (error) {
      console.error('File analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the file. Please check the format and try again.",
      });
    } finally {
      setIsAnalyzing(false); // End loading state
    }
  };

  const updateFieldMapping = (sourceField, targetField) => {
    setFieldMapping(prev => ({
      ...prev,
      [sourceField]: targetField
    }));
  };

  const startImport = async () => {
    if (!parsedData || !selectedSeason) {
      toast({
        variant: "destructive",
        title: "Missing Data",
        description: "Please ensure you have analyzed a file and selected a season.",
      });
      return;
    }

    const mappedFields = Object.values(fieldMapping).filter(field => field && field !== 'skip');
    if (mappedFields.length === 0) {
      toast({
        variant: "destructive",
        title: "No Fields Mapped",
        description: "Please map at least one field before importing.",
      });
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      for (let i = 0; i < parsedData.length; i++) {
        const sourceRecord = parsedData[i];

        try {
          // Map the source data to nominee fields
          const nomineeData = {};

          for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
            if (targetField && targetField !== 'skip' && sourceRecord.hasOwnProperty(sourceField)) {
              let value = sourceRecord[sourceField];

              // Handle numeric fields: clean and convert
              if (['borda_score', 'elo_rating', 'starpower_score', 'direct_vote_count',
                   'total_spotlights', 'total_wins', 'total_losses', 'clout', 'win_percentage'].includes(targetField)) {
                if (typeof value === 'string') {
                  value = value.replace(/,/g, ''); // Remove commas
                  const numValue = parseFloat(value);
                  value = isNaN(numValue) ? 0 : numValue;
                } else if (typeof value !== 'number') {
                  value = 0; // Default for non-numeric or empty
                }
              }

              nomineeData[targetField] = value;
            }
          }

          // Set required defaults
          if (!nomineeData.name) nomineeData.name = `Nominee ${i + 1} (No Name)`;
          if (!nomineeData.bio) nomineeData.bio = 'Imported nominee';
          if (!nomineeData.nominated_by) nomineeData.nominated_by = 'admin@import.com';
          if (!nomineeData.status) nomineeData.status = 'pending';

          // Add season if selected
          if (selectedSeason) {
            nomineeData.season_id = selectedSeason;
          }

          // Create the nominee
          await Nominee.create(nomineeData);
          successCount++;

        } catch (recordError) {
          console.error(`Error processing record ${i + 1}:`, recordError);
          errorCount++;
          errors.push(`Row ${i + 1}: ${recordError.message}`);
        }
      }

      setImportResults({
        total: parsedData.length,
        successful: successCount,
        failed: errorCount,
        errors: errors.slice(0, 10) // Show first 10 errors
      });

      setCurrentStep(3);

      if (successCount > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${successCount} nominees. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
        });

        if (onSuccess) {
          // Pass a simple indication of success rather than fetching all new nominees
          onSuccess(Array(successCount).fill(null).map((_, i) => ({ name: `Imported Nominee ${i + 1}` })));
        }
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "No nominees were successfully imported. Please check your data and try again.",
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "An unexpected error occurred during import.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const addQuickNominee = () => {
    setQuickNominees([...quickNominees, { name: '', email: '', title: '', company: '' }]);
  };

  const removeQuickNominee = (index) => {
    setQuickNominees(quickNominees.filter((_, i) => i !== index));
  };

  const updateQuickNominee = (index, field, value) => {
    const updated = quickNominees.map((nominee, i) =>
      i === index ? { ...nominee, [field]: value } : nominee
    );
    setQuickNominees(updated);
  };

  const createQuickNominees = async () => {
    if (!selectedSeason) {
      toast({
        variant: "destructive",
        title: "No Season Selected",
        description: "Please select a season for the nominees.",
      });
      return;
    }

    const validNominees = quickNominees.filter(n => n.name.trim());

    if (validNominees.length === 0) {
      toast({
        variant: "destructive",
        title: "No Valid Nominees",
        description: "Please provide at least one nominee with a name.",
      });
      return;
    }

    setIsImporting(true);
    let successCount = 0;

    try {
      for (const nominee of validNominees) {
        try {
          const nomineeData = {
            name: nominee.name.trim(),
            nominee_email: nominee.email.trim() || null,
            title: nominee.title.trim() || null,
            company: nominee.company.trim() || null,
            bio: 'Manually added nominee', // Using 'bio' as per smart mapping for consistency
            nominated_by: 'admin@manual.com',
            status: 'pending'
          };

          if (selectedSeason) {
            nomineeData.season_id = selectedSeason;
          }

          await Nominee.create(nomineeData);
          successCount++;

        } catch (error) {
          console.error('Error creating nominee:', error);
        }
      }

      toast({
        title: "Nominees Created!",
        description: `Successfully created ${successCount} nominees.`,
      });

      if (onSuccess) {
        // Pass a simple indication of success rather than fetching all new nominees
        onSuccess(Array(successCount).fill(null).map((_, i) => ({ name: `Quick Nominee ${i + 1}` })));
      }

    } catch (error) {
      console.error('Quick create error:', error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Failed to create nominees.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <Database className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Import Nominees</h2>
        <p className="text-gray-600">Choose how you'd like to add nominees to the system.</p>
      </div>

      {/* Season Selection */}
      <div className="max-w-md mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Season *
        </label>
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a season..." />
          </SelectTrigger>
          <SelectContent>
            {seasons.map(season => (
              <SelectItem key={season.id} value={season.id}>
                {season.name} ({season.status})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Import Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Import */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Import from File</h3>
          <p className="text-gray-600 text-sm mb-4">Upload a CSV or JSON file with nominee data</p>

          <Input
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            className="mb-4"
          />

          {file && (
            <div className="mb-4">
              <Badge className="bg-green-100 text-green-800">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Badge>
            </div>
          )}

          <Button
            onClick={analyzeFile}
            disabled={!file || !selectedSeason || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Analyze File
              </>
            )}
          </Button>
        </div>

        {/* Quick Create */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Quick Create</h3>
          <p className="text-gray-600 text-sm mb-4">Manually add nominees one by one</p>

          <Button
            onClick={() => setQuickCreateMode(true)}
            disabled={!selectedSeason}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Quick Create
          </Button>
        </div>
      </div>

      {/* Quick Create Form */}
      {quickCreateMode && (
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Quick Create Nominees</h4>
            <Button size="sm" onClick={addQuickNominee}>
              <Plus className="w-4 h-4 mr-1" />
              Add Another
            </Button>
          </div>

          <div className="space-y-4">
            {quickNominees.map((nominee, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <Input
                  placeholder="Name *"
                  value={nominee.name}
                  onChange={(e) => updateQuickNominee(index, 'name', e.target.value)}
                  className="bg-white"
                />
                <Input
                  placeholder="Email"
                  value={nominee.email}
                  onChange={(e) => updateQuickNominee(index, 'email', e.target.value)}
                  className="bg-white"
                />
                <Input
                  placeholder="Title"
                  value={nominee.title}
                  onChange={(e) => updateQuickNominee(index, 'title', e.target.value)}
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Company"
                    value={nominee.company}
                    onChange={(e) => updateQuickNominee(index, 'company', e.target.value)}
                    className="bg-white flex-1"
                  />
                  {quickNominees.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeQuickNominee(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setQuickCreateMode(false)}>
              Cancel
            </Button>
            <Button onClick={createQuickNominees} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Nominees
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <Settings className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Map Your Fields</h2>
        <p className="text-gray-600">Match your file columns to nominee fields.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-medium text-blue-800 mb-2">File Summary:</div>
        <div className="text-sm text-blue-700">
          Found {detectedFields.length} fields in {parsedData?.length || 0} records
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {detectedFields.map(sourceField => (
          <div key={sourceField} className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="flex-1 min-w-0">
              <span className="font-medium">{sourceField}</span>
              <div className="text-xs text-gray-500">
                Sample: {parsedData?.[0]?.[sourceField] || 'N/A'}
              </div>
            </div>
            <div className="flex-shrink-0">
              <Select
                value={fieldMapping[sourceField] || ''}
                onValueChange={(value) => updateFieldMapping(sourceField, value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Skip field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Skip this field</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="nominee_email">Email</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="bio">Description / Bio</SelectItem>
                  <SelectItem value="linkedin_profile_url">LinkedIn URL</SelectItem>
                  <SelectItem value="avatar_url">Avatar URL</SelectItem>
                  <SelectItem value="website_url">Website URL</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="borda_score">Borda Score</SelectItem>
                  <SelectItem value="elo_rating">ELO Rating</SelectItem>
                  <SelectItem value="starpower_score">Starpower Score</SelectItem>
                  <SelectItem value="direct_vote_count">Direct Vote Count</SelectItem>
                  <SelectItem value="total_spotlights">Total Spotlights</SelectItem>
                  <SelectItem value="total_wins">Total Wins</SelectItem>
                  <SelectItem value="total_losses">Total Losses</SelectItem>
                  <SelectItem value="win_percentage">Win Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          Back
        </Button>
        <Button onClick={startImport} disabled={isImporting || Object.keys(fieldMapping).length === 0}>
          {isImporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Import
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Import Complete!</h2>
        <p className="text-gray-600">Your nominees have been successfully imported.</p>
      </div>

      {importResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
            <div className="text-sm text-blue-700">Total Processed</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
            <div className="text-sm text-green-700">Successfully Imported</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => {
          if (onSuccess && importResults?.successful > 0) { // Only call onSuccess if there were successful imports
            onSuccess(Array(importResults.successful).fill(null).map((_, i) => ({ name: `Imported Nominee ${i + 1}` }))); // Pass placeholder data
          }
          onClose();
        }}>
          Finish & Review Nominees
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
}
