import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Merge, AlertTriangle, User, Mail, Building, Globe, Star, Trophy } from 'lucide-react';
import { mergeNominees } from '@/functions/mergeNominees';
import { useToast } from "@/components/ui/use-toast";

export default function NomineeMergeModal({ nominees, onClose, onSuccess }) {
  const [primaryNomineeId, setPrimaryNomineeId] = useState('');
  const [mergeOptions, setMergeOptions] = useState({
    keepAllEmails: true,
    mergeScores: true,
    combineAchievements: true,
    keepBestPhoto: true,
    preserveVotes: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const primaryNominee = nominees.find(n => n.id === primaryNomineeId);
  const secondaryNominees = nominees.filter(n => n.id !== primaryNomineeId);

  const handleMerge = async () => {
    if (!primaryNomineeId) {
      toast({
        variant: "destructive",
        title: "Selection Required",
        description: "Please select which nominee should be the primary (kept) record.",
      });
      return;
    }

    if (nominees.length < 2) {
      toast({
        variant: "destructive", 
        title: "Not Enough Nominees",
        description: "You need at least 2 nominees selected to perform a merge.",
      });
      return;
    }

    const secondaryIds = nominees.filter(n => n.id !== primaryNomineeId).map(n => n.id);
    
    const confirmMessage = `This will merge ${secondaryIds.length} nominee${secondaryIds.length > 1 ? 's' : ''} into "${primaryNominee?.name}". The merged nominees will be permanently deleted. This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await mergeNominees({
        primaryNomineeId,
        secondaryNomineeIds: secondaryIds,
        mergeOptions
      });

      if (error || !data.success) {
        throw new Error(error?.message || data?.error || 'Merge failed');
      }

      toast({
        title: "Merge Successful",
        description: data.message,
      });

      onSuccess(data.mergedNominee);
      onClose();
    } catch (error) {
      console.error('Merge failed:', error);
      toast({
        variant: "destructive",
        title: "Merge Failed",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (nominees.length < 2) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Not Enough Nominees</h3>
            <p className="text-gray-600 mb-4">You need to select at least 2 nominees to perform a merge.</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Merge className="w-5 h-5" />
            Merge {nominees.length} Nominees
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will permanently merge multiple nominee records into one. The secondary nominees will be deleted and all their votes/data will be transferred to the primary nominee.
            </AlertDescription>
          </Alert>

          {/* Primary Nominee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Primary Nominee (this one will be kept)
            </label>
            <Select value={primaryNomineeId} onValueChange={setPrimaryNomineeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose which nominee to keep..." />
              </SelectTrigger>
              <SelectContent>
                {nominees.map(nominee => (
                  <SelectItem key={nominee.id} value={nominee.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{nominee.name}</span>
                      <span className="text-sm text-gray-500">({nominee.nominee_email})</span>
                      {nominee.elo_rating && (
                        <Badge variant="outline" className="text-xs">
                          ELO: {Math.round(nominee.elo_rating)}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Merge Preview */}
          {primaryNominee && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-green-700 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Primary (Kept)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{primaryNominee.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{primaryNominee.nominee_email}</span>
                  </div>
                  {primaryNominee.company && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{primaryNominee.company}</span>
                    </div>
                  )}
                  {primaryNominee.elo_rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">ELO: {Math.round(primaryNominee.elo_rating)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-red-700">
                    Secondary (Will be merged & deleted)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {secondaryNominees.map(nominee => (
                      <div key={nominee.id} className="p-2 bg-red-50 rounded">
                        <div className="font-medium text-sm">{nominee.name}</div>
                        <div className="text-xs text-gray-600">{nominee.nominee_email}</div>
                        {nominee.elo_rating && (
                          <div className="text-xs text-gray-600">ELO: {Math.round(nominee.elo_rating)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Merge Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Merge Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="keepAllEmails" 
                  checked={mergeOptions.keepAllEmails}
                  onCheckedChange={(checked) => setMergeOptions(prev => ({...prev, keepAllEmails: checked}))}
                />
                <label htmlFor="keepAllEmails" className="text-sm">
                  Keep all email addresses in secondary_emails field
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mergeScores" 
                  checked={mergeOptions.mergeScores}
                  onCheckedChange={(checked) => setMergeOptions(prev => ({...prev, mergeScores: checked}))}
                />
                <label htmlFor="mergeScores" className="text-sm">
                  Add scores together (ELO, Borda, vote counts, etc.)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="combineAchievements" 
                  checked={mergeOptions.combineAchievements}
                  onCheckedChange={(checked) => setMergeOptions(prev => ({...prev, combineAchievements: checked}))}
                />
                <label htmlFor="combineAchievements" className="text-sm">
                  Combine bio, achievements, and description fields
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="keepBestPhoto" 
                  checked={mergeOptions.keepBestPhoto}
                  onCheckedChange={(checked) => setMergeOptions(prev => ({...prev, keepBestPhoto: checked}))}
                />
                <label htmlFor="keepBestPhoto" className="text-sm">
                  Keep the best available photo/avatar
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="preserveVotes" 
                  checked={mergeOptions.preserveVotes}
                  onCheckedChange={(checked) => setMergeOptions(prev => ({...prev, preserveVotes: checked}))}
                />
                <label htmlFor="preserveVotes" className="text-sm">
                  Transfer all votes and endorsements to primary nominee
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleMerge} 
              disabled={isProcessing || !primaryNomineeId}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? (
                <>Processing Merge...</>
              ) : (
                <>
                  <Merge className="w-4 h-4 mr-2" />
                  Merge Nominees
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}