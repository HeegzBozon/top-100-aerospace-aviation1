
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    Upload,
    FileText,
    Loader2,
    CheckCircle,
    ArrowRight,
    Database,
    Eye,
    EyeOff,
    Sparkles,
    Download,
    X,
    AlertTriangle
} from 'lucide-react';

import { InvokeLLM, UploadFile } from '@/integrations/Core';
import { parseCsvFile } from '@/functions/parseCsvFile';
import { batchUpdateNominees } from '@/functions/batchUpdateNominees'; // Import new batch function
import { Nominee } from '@/entities/Nominee';
import { User } from '@/entities/User';

export default function UniversalDataWizard({ onClose, onSuccess }) {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [file, setFile] = useState(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState('');
    const [extractedData, setExtractedData] = useState(null);
    const [sampleData, setSampleData] = useState([]);
    const [fieldMapping, setFieldMapping] = useState({});
    const [importMode, setImportMode] = useState('create');
    const [updateMatchField, setUpdateMatchField] = useState('nominee_email'); // New state for update matching

    const [isUploading, setIsUploading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [importResults, setImportResults] = useState(null);

    const [currentUser, setCurrentUser] = useState(null);

    const { toast } = useToast();

    React.useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
            } catch (error) {
                console.error('Failed to load current user:', error);
            }
        };
        loadCurrentUser();
    }, []);

    const targetEntities = {
        Nominee: [
            'name', 'nominee_email', 'description', 'title', 'company', 'country', 'industry',
            'linkedin_profile_url', 'bio', 'status', 'avatar_url', 'photo_url',
            'professional_role', 'linkedin_follow_reason', 'linkedin_proudest_achievement',
            'elo_rating', 'borda_score', 'community_borda_score', 'nominee_borda_score',
            'direct_vote_count', 'total_spotlights', 'rising_star_count', 'rock_star_count',
            'super_star_count', 'north_star_count', 'total_wins', 'total_losses',
            'win_percentage', 'clout', 'nominated_by',
            // NEW: Added fields for your CSV format
            'nomination_reason', 'organization', 'achievements'
        ],
        User: ['full_name', 'email', 'handle'],
        PairwiseVote: ['voter_email', 'winner_nominee_id', 'loser_nominee_id', 'season_id']
    };

    const handleFileUpload = async (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) {
            console.log('No file selected');
            return;
        }

        console.log('Selected file:', selectedFile.name, selectedFile.size, selectedFile.type);
        setFile(selectedFile);
        setIsUploading(true);

        try {
            // Validate file type
            const allowedTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/json'
            ];
            
            if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx|xls|json)$/i)) {
                throw new Error('Please upload a CSV, Excel (.xlsx, .xls), or JSON file.');
            }

            // Validate file size (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                throw new Error('File size must be less than 10MB.');
            }

            console.log('Uploading file to server...');
            const { file_url } = await UploadFile({ file: selectedFile });
            console.log('File uploaded successfully:', file_url);
            
            setUploadedFileUrl(file_url);
            setCurrentStep(2);
            toast({
                title: "File Uploaded",
                description: `File "${selectedFile.name}" successfully uploaded.`,
            });
        } catch (error) {
            console.error('Upload failed:', error);
            setFile(null); // Reset file on error
            toast({
                variant: "destructive", 
                title: "Upload Failed",
                description: error.message || 'Failed to upload file. Please try again.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleExtractData = async () => {
        if (!uploadedFileUrl) return;

        setIsExtracting(true);
        try {
            console.log('Calling backend to parse CSV file...');
            const { data: result, error } = await parseCsvFile({ file_url: uploadedFileUrl });

            if (error || !result.success) {
                throw new Error(error?.message || result.error || 'Backend CSV parsing failed.');
            }

            const extractedRecords = result.data;

            if (extractedRecords && extractedRecords.length > 0) {
                setExtractedData(extractedRecords);
                setSampleData(extractedRecords.slice(0, 5));
                await analyzeDataStructure(extractedRecords);
                setCurrentStep(3);
                toast({
                    title: "Data Extracted",
                    description: `Successfully extracted ${extractedRecords.length} records. Please map the fields below.`,
                });
            } else {
                throw new Error('No records were extracted from the file. It might be empty or malformed.');
            }
        } catch (error) {
            console.error('Data extraction failed:', error);
            toast({
                variant: "destructive",
                title: "Extraction Failed",
                description: error.message,
            });
        } finally {
            setIsExtracting(false);
        }
    };

    const analyzeDataStructure = async (dataToAnalyze) => {
        if (!dataToAnalyze || dataToAnalyze.length === 0) return;
        setIsAnalyzing(true);
        try {
            const sourceFields = Object.keys(dataToAnalyze[0] || {});
            const sampleRow = dataToAnalyze[0];

            // Enhanced prompt for the new CSV format
            const prompt = `Analyze this data structure for a TOP 100 Women in Aerospace CSV import and suggest field mappings.

Available target entities and fields:
${Object.entries(targetEntities).map(([entity, fields]) => `${entity}: ${fields.join(', ')}`).join('\n')}

Source data fields and sample values:
${sourceFields.map(field => `${field}: "${String(sampleRow[field] || '').substring(0, 100)}"`).join('\n')}

MAPPING RULES:
- "name" should map to Nominee.name
- "email" should map to Nominee.nominee_email
- "photo_url" should map to Nominee.photo_url
- "linkedin_url" should map to Nominee.linkedin_profile_url
- "finalScore" should map to Nominee.elo_rating
- "title" should map to Nominee.title
- "organization" should map to Nominee.company
- "bio" should map to Nominee.bio
- "achievements" should map to Nominee.achievements
- "country" should map to Nominee.country
- "industry" should map to Nominee.industry
- "nomination_reason" should map to Nominee.nomination_reason

Focus on the Nominee entity. Output should be JSON only.`;

            const aiResponse = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        mappings: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    sourceField: { type: "string" },
                                    targetEntity: { type: "string" },
                                    targetField: { type: "string" },
                                },
                                required: ["sourceField", "targetEntity", "targetField"]
                            }
                        }
                    },
                    required: ["mappings"]
                }
            });

            if (aiResponse && aiResponse.mappings) {
                const newMappings = {};
                aiResponse.mappings.forEach(mapping => {
                    if (targetEntities[mapping.targetEntity]?.includes(mapping.targetField)) {
                        newMappings[mapping.sourceField] = {
                            targetEntity: mapping.targetEntity,
                            targetField: mapping.targetField
                        };
                    }
                });
                setFieldMapping(newMappings);
                toast({ title: "Fields Analyzed", description: `Suggested ${Object.keys(newMappings).length} field mappings based on your CSV format.` });
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            toast({ variant: "destructive", title: "Analysis Failed", description: "Could not auto-map fields. You can map them manually." });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const updateFieldMapping = useCallback((sourceField, targetEntity, targetField) => {
        setFieldMapping(prev => ({
            ...prev,
            [sourceField]: { targetEntity, targetField }
        }));
    }, []);

    const removeFieldMapping = useCallback((sourceField) => {
        setFieldMapping(prev => {
            const newMapping = { ...prev };
            delete newMapping[sourceField];
            return newMapping;
        });
    }, []);

    const executeImport = async () => {
        if (!extractedData || !currentUser) {
            toast({ variant: "destructive", title: "Cannot Import", description: "Missing data or user session." });
            return;
        }

        setIsImporting(true);
        const recordsToProcess = [];
        const processingErrors = [];
        let finalImportResults = null;

        if (importMode === 'create') {
            for (const [index, row] of extractedData.entries()) {
                const nomineePayload = {};
                let hasNomineeData = false;

                for (const sourceField in row) {
                    if (fieldMapping[sourceField]) {
                        const { targetEntity, targetField } = fieldMapping[sourceField];
                        if (targetEntity === 'Nominee' && row[sourceField] !== null && row[sourceField] !== '' && row[sourceField] !== undefined) {
                            // Special handling for finalScore -> elo_rating
                            if (sourceField === 'finalScore' && targetField === 'elo_rating') {
                                const score = parseFloat(row[sourceField]);
                                if (!isNaN(score)) {
                                    nomineePayload[targetField] = score;
                                    hasNomineeData = true;
                                }
                            } else {
                                nomineePayload[targetField] = row[sourceField];
                                hasNomineeData = true;
                            }
                        }
                    }
                }

                if (hasNomineeData) {
                    nomineePayload.raw_nomination_data = row;
                    if (!nomineePayload.nominated_by) nomineePayload.nominated_by = currentUser.email;
                    if (!nomineePayload.status) nomineePayload.status = 'pending';

                    // Better name fallback logic
                    if (!nomineePayload.name) {
                        nomineePayload.name = nomineePayload.nominee_email || `Imported Row ${index + 1}`;
                    }

                    if (!nomineePayload.description && nomineePayload.bio) {
                        // Use bio as description if description is missing
                        nomineePayload.description = nomineePayload.bio.substring(0, 200) + (nomineePayload.bio.length > 200 ? '...' : '');
                    } else if (!nomineePayload.description) {
                        nomineePayload.description = 'Imported via Universal Data Wizard';
                    }

                    recordsToProcess.push(nomineePayload);
                } else {
                    processingErrors.push(`Row ${index + 2}: No nominee data found in mapped fields.`);
                }
            }

            finalImportResults = {
                totalRecords: extractedData.length,
                attempted: 0,
                successfulImports: 0,
                errors: 0,
                errorDetails: processingErrors,
                mode: 'create'
            };

            if (recordsToProcess.length > 0) {
                finalImportResults.attempted = recordsToProcess.length;
                try {
                    const bulkResult = await Nominee.bulkCreate(recordsToProcess);
                    finalImportResults.successfulImports = bulkResult?.length || recordsToProcess.length;
                    finalImportResults.errors = recordsToProcess.length - finalImportResults.successfulImports;
                    if (finalImportResults.errors > 0) {
                        finalImportResults.errorDetails.push(`${finalImportResults.errors} records failed during the bulk database operation.`);
                    }
                } catch (error) {
                    finalImportResults.errors = recordsToProcess.length;
                    finalImportResults.errorDetails.push(`Bulk import failed: ${error.message}`);
                }
            }

            setImportResults(finalImportResults);

        } else if (importMode === 'update') {
            // Enhanced update mode using the new batch function
            try {
                const updatesToProcess = [];

                for (const [index, row] of extractedData.entries()) {
                    const updatePayload = {};
                    let hasUpdateData = false;

                    for (const sourceField in row) {
                        if (fieldMapping[sourceField]) {
                            const { targetEntity, targetField } = fieldMapping[sourceField];
                            if (targetEntity === 'Nominee' && row[sourceField] !== null && row[sourceField] !== '' && row[sourceField] !== undefined) {
                                // Special handling for finalScore -> elo_rating
                                if (sourceField === 'finalScore' && targetField === 'elo_rating') {
                                    const score = parseFloat(row[sourceField]);
                                    if (!isNaN(score)) {
                                        updatePayload[targetField] = score;
                                        hasUpdateData = true;
                                    }
                                } else {
                                    updatePayload[targetField] = row[sourceField];
                                    hasUpdateData = true;
                                }
                            }
                        }
                    }

                    if (hasUpdateData) {
                        updatesToProcess.push(updatePayload);
                    }
                }

                if (updatesToProcess.length === 0) {
                    finalImportResults = {
                        totalRecords: extractedData.length,
                        attempted: 0,
                        successfulImports: 0,
                        errors: 0,
                        errorDetails: ['No valid update data found in the mapped fields.'],
                        mode: 'update'
                    };
                } else {
                    // Use the batch update function
                    const { data: batchResult, error } = await batchUpdateNominees({
                        updates: updatesToProcess,
                        matchField: updateMatchField
                    });

                    if (error || !batchResult.success) {
                        throw new Error(error?.message || batchResult?.error || 'Batch update failed.');
                    }

                    finalImportResults = {
                        totalRecords: extractedData.length,
                        attempted: batchResult.results.totalRequested,
                        successfulImports: batchResult.results.successful,
                        errors: batchResult.results.notFound + batchResult.results.errors,
                        errorDetails: batchResult.results.errorDetails,
                        mode: 'update'
                    };
                }
                setImportResults(finalImportResults);

            } catch (error) {
                console.error('Update mode failed:', error);
                finalImportResults = {
                    totalRecords: extractedData.length,
                    attempted: extractedData.length,
                    successfulImports: 0,
                    errors: extractedData.length,
                    errorDetails: [`Update mode failed: ${error.message}`],
                    mode: 'update'
                };
                setImportResults(finalImportResults);
            }
        }

        setCurrentStep(4);
        if (onSuccess && finalImportResults) onSuccess(finalImportResults);

        const totalErrors = finalImportResults?.errors || 0;
        if (totalErrors > 0) {
            toast({
                variant: "destructive",
                title: importMode === 'create' ? "Import Completed with Errors" : "Update Completed with Errors",
                description: `${importMode === 'create' ? 'Created' : 'Updated'} ${finalImportResults?.successfulImports || 0} nominees, but ${totalErrors} failed.`
            });
        } else {
            toast({
                title: importMode === 'create' ? "Import Complete" : "Update Complete",
                description: `Successfully ${importMode === 'create' ? 'created' : 'updated'} ${finalImportResults?.successfulImports || 0} nominees.`
            });
        }

        setIsImporting(false);
    };

    const renderFileUpload = () => (
        <div className="space-y-6">
            <div className="text-center">
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Your Data File</h3>
                <p className="text-gray-600 mb-4">Supported formats: CSV, Excel (.xlsx, .xls), JSON</p>
                <input
                    type="file"
                    id="file-upload-wizard"
                    onChange={handleFileUpload}
                    accept=".csv,.xlsx,.xls,.json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    disabled={isUploading}
                />
                {isUploading && (
                    <p className="text-sm text-gray-500 mt-2">Please wait while the file uploads...</p>
                )}
            </div>
            {isUploading && (
                <div className="flex items-center justify-center gap-2 text-indigo-600">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Uploading file...</span>
                </div>
            )}
            {file && !isUploading && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center"><FileText className="w-8 h-8 text-indigo-500 mr-3" />
                        <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                </div>
            )}
            {uploadedFileUrl && !isUploading && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">✅ File uploaded successfully! You can proceed to the next step.</p>
                </div>
            )}
        </div>
    );

    const renderDataExtraction = () => (
        <div className="space-y-6">
            <div className="text-center">
                <Database className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
                <h3 className="text-xl font-bold mb-2">Extract Data</h3>
                <p className="text-gray-600 mb-6">Lt. Perry will analyze your file and extract the data structure</p>
            </div>
            {!extractedData ? (
                <div className="text-center">
                    <Button onClick={handleExtractData} disabled={isExtracting || !uploadedFileUrl} className="bg-indigo-600 hover:bg-indigo-700">
                        {isExtracting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Extracting Data...</>) : (<><Sparkles className="w-4 h-4 mr-2" />Extract Data with Lt. Perry</>)}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <Alert><CheckCircle className="h-4 w-4" /><AlertDescription>Successfully extracted {extractedData.length} records from your file.</AlertDescription></Alert>
                    <Button onClick={() => setCurrentStep(3)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        <ArrowRight className="w-4 h-4 mr-2" />Continue to Field Mapping
                    </Button>
                </div>
            )}
        </div>
    );

    const renderFieldMapping = () => {
        if (!extractedData) {
            return <div className="text-center py-8 text-gray-500">No data available for mapping.</div>;
        }

        const sourceFields = Object.keys(extractedData[0] || {});

        if (sourceFields.length === 0) {
            return (
                <div className="text-center py-8 space-y-4">
                    <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>Could not find any column headers or data fields.</AlertDescription></Alert>
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>Upload a Different File</Button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Map Your Fields</h3>
                        <p className="text-gray-600">Match your data columns to the target fields. Perfect for photo URLs and ELO scores!</p>
                    </div>
                    <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                        {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {showPreview ? 'Hide' : 'Show'} Data Preview
                    </Button>
                </div>

                {showPreview && sampleData.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Data Preview (First {sampleData.length} Rows)</CardTitle></CardHeader>
                        <CardContent><div className="overflow-x-auto max-h-64">
                            <table className="min-w-full text-sm">
                                <thead><tr className="border-b">
                                    {sourceFields.map(field => <th key={field} className="text-left p-2 font-medium">{field}</th>)}
                                </tr></thead>
                                <tbody>{sampleData.map((row, idx) => (
                                    <tr key={idx} className="border-b">
                                        {sourceFields.map(field => <td key={field} className="p-2 truncate max-w-xs">{String(row[field] || '')}</td>)}
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div></CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Import Mode</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Import Mode
                                </label>
                                <Select value={importMode} onValueChange={setImportMode}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="create">Create New Records</SelectItem>
                                        <SelectItem value="update">Update Existing Records</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {importMode === 'update' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Match Records By
                                    </label>
                                    <Select value={updateMatchField} onValueChange={setUpdateMatchField}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="smart_match">Smart Match (Email → LinkedIn → Name)</SelectItem>
                                            <SelectItem value="nominee_email">Email Address Only</SelectItem>
                                            <SelectItem value="linkedin_profile_url">LinkedIn URL Only</SelectItem>
                                            <SelectItem value="name">Name Only (fuzzy matching)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {updateMatchField === 'smart_match' && 'Recommended! Tries email first, then LinkedIn URL, then fuzzy name matching for best results.'}
                                        {updateMatchField === 'name' && 'Name matching uses fuzzy logic to handle variations like "Dr. John Smith" vs "John Michael Smith".'}
                                        {updateMatchField === 'nominee_email' && 'Exact email address matching (case-insensitive).'}
                                        {updateMatchField === 'linkedin_profile_url' && 'LinkedIn URL matching (handles variations in formatting).'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Field Mappings</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => analyzeDataStructure(extractedData)} disabled={isAnalyzing}>{isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Auto-Map</Button>
                        </div>
                    </CardHeader>
                    <CardContent><div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                        {sourceFields.map(sourceField => (
                            <div key={sourceField} className="flex items-center gap-4 p-4 border rounded-lg">
                                <div className="flex-1 min-w-0 font-medium text-sm">{sourceField}</div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <div className="flex gap-2">
                                    <Select value={fieldMapping[sourceField]?.targetEntity || ''} onValueChange={(v) => updateFieldMapping(sourceField, v, '')}>
                                        <SelectTrigger className="w-32"><SelectValue placeholder="Entity" /></SelectTrigger>
                                        <SelectContent><SelectItem value={null}>None</SelectItem>{Object.keys(targetEntities).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Select value={fieldMapping[sourceField]?.targetField || ''} onValueChange={(v) => updateFieldMapping(sourceField, fieldMapping[sourceField]?.targetEntity, v)} disabled={!fieldMapping[sourceField]?.targetEntity}>
                                        <SelectTrigger className="w-48"><SelectValue placeholder="Field" /></SelectTrigger>
                                        <SelectContent>{fieldMapping[sourceField]?.targetEntity && targetEntities[fieldMapping[sourceField].targetEntity].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                                    </Select>
                                    {fieldMapping[sourceField] && <Button variant="ghost" size="icon" onClick={() => removeFieldMapping(sourceField)}><X className="w-4 h-4" /></Button>}
                                </div>
                            </div>
                        ))}
                    </div></CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                    <Button onClick={executeImport} disabled={isImporting || Object.keys(fieldMapping).length === 0} size="lg">{isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}Start Import</Button>
                </div>
            </div>
        );
    };

    const renderImportResults = () => {
        if (!importResults) return null;
        const isUpdateMode = importResults.mode === 'update';

        return (
            <div className="space-y-6 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">
                    {isUpdateMode ? 'Update Complete!' : 'Import Complete!'}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{importResults.totalRecords}</div>
                            <p className="text-sm text-gray-600">Records in File</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{importResults.successfulImports}</div>
                            <p className="text-sm text-gray-600">{isUpdateMode ? 'Updated' : 'Created'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{importResults.errors}</div>
                            <p className="text-sm text-gray-600">Errors</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{importResults.attempted}</div>
                            <p className="text-sm text-gray-600">Attempted</p>
                        </CardContent>
                    </Card>
                </div>

                {importResults.errorDetails && importResults.errorDetails.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-base text-left font-semibold text-red-700">Failure Details ({importResults.errorDetails.length})</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-left text-xs font-mono space-y-1 max-h-48 overflow-y-auto bg-red-50/50 p-3 rounded-md border border-red-200">
                                {importResults.errorDetails.map((error, index) => <div key={index} className="text-red-800 break-words">{error}</div>)}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-center gap-4 pt-6">
                    <Button onClick={() => setCurrentStep(1)}>Import Another File</Button>
                    <Button onClick={onClose} variant="outline">Close</Button>
                </div>
            </div>
        );
    };

    const steps = [
        { id: 1, title: 'Upload File', component: renderFileUpload },
        { id: 2, title: 'Extract Data', component: renderDataExtraction },
        { id: 3, title: 'Map Fields', component: renderFieldMapping },
        { id: 4, title: 'Import Results', component: renderImportResults }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8">
                <Progress value={(currentStep / totalSteps) * 100} className="w-full mb-4" />
                <div className="flex items-center justify-between">
                    {steps.map(step => (
                        <div key={step.id} className={`flex items-center text-sm font-medium ${step.id < currentStep ? 'text-green-600' : step.id === currentStep ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mr-2 ${step.id < currentStep ? 'bg-green-100 border-green-500' : step.id === currentStep ? 'bg-indigo-100 border-indigo-500' : 'bg-gray-100 border-gray-300'}`}>
                                {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
                            </div>
                            <span className="hidden sm:inline">{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>
            <Card><CardContent className="p-8">{steps.find(step => step.id === currentStep)?.component()}</CardContent></Card>
        </div>
    );
}
