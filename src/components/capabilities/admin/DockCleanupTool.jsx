import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import { clearDockItems } from '@/functions/clearDockItems';
import { useToast } from '@/components/ui/use-toast';

export default function DockCleanupTool() {
  const [cleaning, setCleaning] = useState(false);
  const [cleaned, setCleaned] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setCleaning(true);
    try {
      const { data } = await clearDockItems();
      if (data.success) {
        setCleaned(true);
        toast({
          title: "Dock Cleaned Successfully",
          description: data.message,
        });
        // Reload the page to see changes
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Dock cleanup failed:', error);
      toast({
        variant: "destructive",
        title: "Cleanup Failed",
        description: error.message,
      });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Dock Cleanup Tool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Remove duplicate dock items and reset to clean configuration.
        </p>
        <Button 
          onClick={handleCleanup}
          disabled={cleaning || cleaned}
          className="w-full"
          variant={cleaned ? "default" : "destructive"}
        >
          {cleaning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Cleaning...
            </>
          ) : cleaned ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Cleaned Successfully
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Clean Dock Items
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}