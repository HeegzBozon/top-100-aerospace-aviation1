import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  X, 
  Loader2, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Eye, 
  Edit, 
  Save,
  RefreshCw,
  Brain,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  User,
  Award,
  Globe,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { enrichProfileFromPdf } from '@/functions/enrichProfileFromPdf';
import { generateNomineeContent } from '@/functions/generateNomineeContent';

export default function NomineeReviewWizard({ 
  nominee, 
  nominees = [], // Full list for navigation
  onClose, 
  onSuccess,
  onNavigate // Callback to switch nominees
}) {
  const [currentNominee, setCurrentNominee] = useState(nominee);
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Find current index for navigation
  const currentIndex = nominees.findIndex(n => n.id === currentNominee.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < nominees.length - 1;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'enrich', label: 'AI Enrichment', icon: Brain },
    { id: 'edit', label: 'Profile Editor', icon: Edit },
    { id: 'preview', label: 'Preview', icon: FileText }
  ];

  // Sync when nominee prop changes
  React.useEffect(() => {
    setCurrentNominee(nominee);
    setHasUnsavedChanges(false);
    setAiSuggestions({});
    setExtractedData(null);
  }, [nominee]);

  const navigateTo = (direction) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Discard and continue?')) return;
    }
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < nominees.length) {
      onNavigate?.(nominees[newIndex]);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Upload file using Base44 SDK
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(file_url);

      // Enrich profile from PDF
      const { data: result } = await enrichProfileFromPdf({
        nominee_id: currentNominee.id,
        file_url
      });

      if (result.success) {
        setCurrentNominee(result.updatedNominee);
        setExtractedData(result.extractedData);
        setHasUnsavedChanges(true);
        toast({
          title: "Profile Enriched!",
          description: "AI has successfully extracted and populated profile information.",
        });
        setActiveTab('enrich');
      }
    } catch (error) {
      console.error('Enrichment failed:', error);
      toast({
        variant: "destructive",
        title: "Enrichment Failed",
        description: error.message || "Could not process the uploaded file.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAiContent = async (field) => {
    setIsProcessing(true);
    try {
      const { data: result } = await generateNomineeContent({
        nominee_id: currentNominee.id,
        content_type: field
      });

      if (result.success) {
        setAiSuggestions(prev => ({
          ...prev,
          [field]: result.content
        }));
        toast({
          title: "AI Content Generated",
          description: `New ${field} suggestion created.`,
        });
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: "Could not generate content. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const acceptAiSuggestion = (field) => {
    setCurrentNominee(prev => ({
      ...prev,
      [field]: aiSuggestions[field]
    }));
    setAiSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[field];
      return newSuggestions;
    });
    setHasUnsavedChanges(true);
  };

  const handleFieldUpdate = (field, value) => {
    setCurrentNominee(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (andClose = true) => {
    setIsProcessing(true);
    try {
      await base44.entities.Nominee.update(currentNominee.id, {
        name: currentNominee.name,
        title: currentNominee.title,
        company: currentNominee.company,
        bio: currentNominee.bio,
        description: currentNominee.description,
        professional_role: currentNominee.professional_role,
        six_word_story: currentNominee.six_word_story,
        linkedin_profile_url: currentNominee.linkedin_profile_url,
        linkedin_follow_reason: currentNominee.linkedin_follow_reason,
        linkedin_proudest_achievement: currentNominee.linkedin_proudest_achievement,
        website_url: currentNominee.website_url,
        country: currentNominee.country,
        industry: currentNominee.industry,
        status: currentNominee.status
      });

      setHasUnsavedChanges(false);
      toast({
        title: "Profile Saved",
        description: "Nominee profile has been successfully updated.",
      });
      onSuccess?.();
      if (andClose) onClose();
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the profile. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = async (action) => {
    setIsProcessing(true);
    try {
      let newStatus = currentNominee.status;
      if (action === 'approve') newStatus = 'approved';
      else if (action === 'activate') newStatus = 'active';
      else if (action === 'reject') newStatus = 'rejected';

      await base44.entities.Nominee.update(currentNominee.id, { status: newStatus });
      setCurrentNominee(prev => ({ ...prev, status: newStatus }));
      toast({ title: `Nominee ${action}d` });
      onSuccess?.();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Action Failed', description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Nominee Overview
          </CardTitle>
          <CardDescription>
            Current profile status and basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-lg font-semibold">{currentNominee.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Badge className={
                currentNominee.status === 'approved' ? 'bg-green-100 text-green-700' :
                currentNominee.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }>
                {currentNominee.status || 'pending'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <p>{currentNominee.title || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Company</label>
              <p>{currentNominee.company || 'Not provided'}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <p className="text-sm text-gray-600 mt-1">
              {currentNominee.description || 'No description provided'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <p className="text-sm text-gray-600 mt-1">
              {currentNominee.bio ? currentNominee.bio.substring(0, 200) + '...' : 'No bio provided'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentNominee.bio ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-500">Bio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentNominee.six_word_story ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-500">Six-Word Story</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentNominee.linkedin_profile_url ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-500">LinkedIn</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEnrichmentTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Profile Enrichment
          </CardTitle>
          <CardDescription>
            Upload documents or generate AI content to enhance the nominee's profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Resume or LinkedIn PDF</h3>
              <p className="text-gray-600 mb-4">
                Upload a LinkedIn PDF export or resume to automatically extract profile information
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" disabled={isProcessing} className="cursor-pointer">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Choose File
                    </>
                  )}
                </Button>
              </label>
            </div>
          </div>

          {/* AI Content Generation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Professional Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateAiContent('bio')} 
                  disabled={isProcessing}
                  className="w-full"
                  variant="outline"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Bio
                </Button>
                {aiSuggestions.bio && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">AI Suggestion:</p>
                    <p className="text-sm italic">{aiSuggestions.bio.substring(0, 100)}...</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => acceptAiSuggestion('bio')}>
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAiSuggestions(prev => ({ ...prev, bio: undefined }))}>
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Six-Word Story</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateAiContent('six_word_story')} 
                  disabled={isProcessing}
                  className="w-full"
                  variant="outline"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Story
                </Button>
                {aiSuggestions.six_word_story && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">AI Suggestion:</p>
                    <p className="text-sm font-medium italic">"{aiSuggestions.six_word_story}"</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => acceptAiSuggestion('six_word_story')}>
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAiSuggestions(prev => ({ ...prev, six_word_story: undefined }))}>
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Extracted Data Display */}
          {extractedData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Extracted Information</CardTitle>
                <CardDescription>
                  Data automatically extracted from uploaded document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key}>
                      <label className="font-medium text-gray-700 capitalize">
                        {key.replace('_', ' ')}:
                      </label>
                      <p className="text-gray-600">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderEditTab = () => (
    <div className="space-y-4">
      {/* Basic Info */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700">Name *</label>
              <Input
                value={currentNominee.name || ''}
                onChange={(e) => handleFieldUpdate('name', e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Email</label>
              <Input
                value={currentNominee.nominee_email || ''}
                onChange={(e) => handleFieldUpdate('nominee_email', e.target.value)}
                className="h-9"
                type="email"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Title</label>
              <Input
                value={currentNominee.title || ''}
                onChange={(e) => handleFieldUpdate('title', e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Company</label>
              <Input
                value={currentNominee.company || ''}
                onChange={(e) => handleFieldUpdate('company', e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Country</label>
              <Input
                value={currentNominee.country || ''}
                onChange={(e) => handleFieldUpdate('country', e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Industry</label>
              <Input
                value={currentNominee.industry || ''}
                onChange={(e) => handleFieldUpdate('industry', e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Status</label>
              <Select value={currentNominee.status} onValueChange={(value) => handleFieldUpdate('status', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="finalist">Finalist</SelectItem>
                  <SelectItem value="winner">Winner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" /> Profile Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700">Who I Am (Description)</label>
            <Textarea
              value={currentNominee.description || ''}
              onChange={(e) => handleFieldUpdate('description', e.target.value)}
              rows={2}
              placeholder="A brief summary about the nominee"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">What I Do (Professional Role)</label>
            <Textarea
              value={currentNominee.professional_role || ''}
              onChange={(e) => handleFieldUpdate('professional_role', e.target.value)}
              rows={2}
              placeholder="What they do professionally"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Professional Bio</label>
            <Textarea
              value={currentNominee.bio || ''}
              onChange={(e) => handleFieldUpdate('bio', e.target.value)}
              rows={4}
              placeholder="Detailed professional biography..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Six-Word Story</label>
            <Input
              value={currentNominee.six_word_story || ''}
              onChange={(e) => handleFieldUpdate('six_word_story', e.target.value)}
              placeholder="Exactly six words that capture their essence"
              className="h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn & Social */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" /> LinkedIn & Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700">LinkedIn URL</label>
              <Input
                value={currentNominee.linkedin_profile_url || ''}
                onChange={(e) => handleFieldUpdate('linkedin_profile_url', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Website URL</label>
              <Input
                value={currentNominee.website_url || ''}
                onChange={(e) => handleFieldUpdate('website_url', e.target.value)}
                placeholder="https://..."
                className="h-9"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Why Follow Me on LinkedIn</label>
            <Textarea
              value={currentNominee.linkedin_follow_reason || ''}
              onChange={(e) => handleFieldUpdate('linkedin_follow_reason', e.target.value)}
              rows={2}
              placeholder="Why people should follow them"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Proudest Achievement / Best Post</label>
            <Textarea
              value={currentNominee.linkedin_proudest_achievement || ''}
              onChange={(e) => handleFieldUpdate('linkedin_proudest_achievement', e.target.value)}
              rows={2}
              placeholder="Their proudest achievement or most successful post"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Profile Preview
          </CardTitle>
          <CardDescription>
            How this nominee's profile will appear to voters and on the leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Nominee Preview Card */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {currentNominee.name ? currentNominee.name.charAt(0) : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{currentNominee.name || 'No Name'}</h3>
                  <p className="text-gray-600 text-sm">{currentNominee.title || 'No Title'}</p>
                  <p className="text-gray-500 text-xs">{currentNominee.company || 'No Company'}</p>
                </div>
              </div>
              
              {currentNominee.six_word_story && (
                <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <p className="text-sm font-medium text-center italic">"{currentNominee.six_word_story}"</p>
                </div>
              )}
              
              {currentNominee.description && (
                <p className="text-sm text-gray-700 mb-4">{currentNominee.description}</p>
              )}
              
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentNominee.country || 'Unknown Location'}
                </Badge>
                {currentNominee.industry && (
                  <Badge variant="outline" className="text-xs">
                    {currentNominee.industry}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    winner: 'bg-purple-100 text-purple-800 border-purple-200',
    finalist: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header with Navigation */}
        <DialogHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            {/* Nav Arrows */}
            {nominees.length > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateTo('prev')}
                  disabled={!hasPrev || isProcessing}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-500 min-w-[60px] text-center">
                  {currentIndex + 1} / {nominees.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateTo('next')}
                  disabled={!hasNext || isProcessing}
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                {currentNominee.avatar_url || currentNominee.photo_url ? (
                  <img 
                    src={currentNominee.avatar_url || currentNominee.photo_url} 
                    alt="" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {currentNominee.name?.charAt(0) || '?'}
                  </div>
                )}
                {currentNominee.name || 'Unnamed Nominee'}
                <Badge className={`${STATUS_COLORS[currentNominee.status]} text-xs ml-2`}>
                  {currentNominee.status}
                </Badge>
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                    Unsaved
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-sm text-gray-500">
                {currentNominee.title}{currentNominee.company ? ` at ${currentNominee.company}` : ''}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {currentNominee.status === 'pending' && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleQuickAction('approve')} disabled={isProcessing}>
                  <CheckCircle className="w-4 h-4 mr-1 text-blue-600" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleQuickAction('reject')} disabled={isProcessing}>
                  <X className="w-4 h-4 mr-1 text-red-600" /> Reject
                </Button>
              </>
            )}
            {currentNominee.status === 'approved' && (
              <Button size="sm" variant="outline" onClick={() => handleQuickAction('activate')} disabled={isProcessing}>
                <Award className="w-4 h-4 mr-1 text-green-600" /> Activate
              </Button>
            )}
            {currentNominee.linkedin_profile_url && (
              <a href={currentNominee.linkedin_profile_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'enrich' && renderEnrichmentTab()}
          {activeTab === 'edit' && renderEditTab()}
          {activeTab === 'preview' && renderPreviewTab()}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {currentNominee.updated_date ? new Date(currentNominee.updated_date).toLocaleDateString() : 'Never'}
            </span>
            {currentNominee.aura_score > 0 && (
              <span>Aura: {currentNominee.aura_score?.toFixed(0)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
              {hasUnsavedChanges ? 'Discard' : 'Close'}
            </Button>
            {hasUnsavedChanges && (
              <Button size="sm" onClick={() => handleSave(false)} disabled={isProcessing} variant="outline">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Save
              </Button>
            )}
            <Button size="sm" onClick={() => handleSave(true)} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save & Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}