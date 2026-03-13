import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadFile } from '@/integrations/Core';
import { enrichProfileFromPdf } from '@/functions/enrichProfileFromPdf';
import { Linkedin, Loader2, FileUp, CheckCircle, AlertCircle, Sparkles, ArrowRight, Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function LinkedInPdfUpload({ nominee, onEnrichmentComplete, onComplete }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [enrichmentSuccess, setEnrichmentSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const isLoading = isUploading || isEnriching;

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Please select a PDF under 10MB.');
      return;
    }

    setFile(selectedFile);
    setError('');
    setUploadSuccess(false);
    setEnrichmentSuccess(false);
  };

  const handleEnrich = async () => {
    if (!file || !nominee) return;

    try {
      // Step 1: Upload the file
      setIsUploading(true);
      setError('');
      
      console.log('Uploading file:', file.name);
      const { file_url } = await UploadFile({ file });
      
      setUploadSuccess(true);
      setIsUploading(false);
      
      // Step 2: Enrich the profile
      setIsEnriching(true);
      
      console.log('Enriching profile with PDF:', file_url);
      const { data, error: enrichError } = await enrichProfileFromPdf({
        nominee_id: nominee.id,
        file_url: file_url
      });

      if (enrichError || !data.success) {
        throw new Error(data?.error || enrichError?.message || 'Failed to enrich profile');
      }

      console.log('Enrichment successful:', data);
      
      setEnrichmentSuccess(true);
      
      toast({
        title: "Profile Enriched! ✨",
        description: data.message || `Successfully populated ${data.extractedFields?.length || 'several'} profile fields.`,
      });

      // Pass the updated nominee back to parent
      if (onEnrichmentComplete) {
        onEnrichmentComplete(data.updatedNominee);
      }

    } catch (err) {
      console.error('Enrichment process failed:', err);
      setError(err.message || 'An error occurred during profile enrichment. Please try again.');
      toast({
        variant: "destructive",
        title: "Enrichment Failed",
        description: err.message || "Could not process your PDF. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setIsEnriching(false);
    }
  };

  return (
    <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Linkedin className="w-6 h-6 text-[var(--accent)]" />
          Enrich Your Profile
        </CardTitle>
        <CardDescription>
          Upload your LinkedIn Profile PDF to automatically populate your bio, job title, company, and social links. 
          This saves you time and ensures accuracy.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center hover:border-[var(--accent)] transition-colors">
          <div className="flex flex-col items-center gap-4">
            {!file ? (
              <>
                <Upload className="w-12 h-12 text-[var(--muted)]" />
                <div>
                  <p className="text-lg font-medium text-[var(--text)]">Select your LinkedIn PDF</p>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Go to LinkedIn → More → Save to PDF to download your profile
                  </p>
                </div>
                <Button asChild variant="outline" className="mt-2">
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <FileUp className="w-4 h-4 mr-2" />
                    Choose PDF File
                  </label>
                </Button>
              </>
            ) : (
              <>
                <CheckCircle className="w-12 h-12 text-green-500" />
                <div>
                  <p className="text-lg font-medium text-[var(--text)]">{file.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {(file.size / 1024 / 1024).toFixed(1)} MB • Ready to process
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    Change File
                  </label>
                </Button>
              </>
            )}
          </div>
        </div>

        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />

        {/* Progress Indicators */}
        {(uploadSuccess || isUploading) && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <span className="text-sm font-medium">
              {isUploading ? 'Uploading PDF...' : 'PDF uploaded successfully'}
            </span>
          </div>
        )}

        {(enrichmentSuccess || isEnriching) && (
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            {isEnriching ? (
              <Sparkles className="w-5 h-5 animate-pulse text-purple-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <span className="text-sm font-medium">
              {isEnriching ? 'AI analyzing your profile...' : 'Profile enriched successfully!'}
            </span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">How to get your LinkedIn PDF:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to your LinkedIn profile</li>
            <li>Click "More" in your profile section</li>
            <li>Select "Save to PDF"</li>
            <li>Download and upload the PDF here</li>
          </ol>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Button variant="ghost" onClick={onComplete} disabled={isLoading}>
          Skip for now
        </Button>
        <Button 
          onClick={handleEnrich} 
          disabled={!file || isLoading}
          className="bg-[var(--accent)] hover:bg-[var(--accent-2)]"
        >
          {isUploading && (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          )}
          {isEnriching && (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Enriching...
            </>
          )}
          {!isLoading && (
            <>
              Enrich &amp; Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}