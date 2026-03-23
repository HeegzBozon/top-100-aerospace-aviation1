import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';
import NomineeCard from '@/components/voting/NomineeCard';

export default function ProfilePreviewStep({ nominee, onFinish }) {
  return (
    <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          Profile Complete!
        </CardTitle>
        <CardDescription>
          Here's a preview of how your card will appear to voters. You can always come back to edit your profile later.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center py-8">
        <div className="w-full max-w-sm">
           <NomineeCard 
             nominee={nominee} 
             onVote={() => {}} // No-op for preview
             isVoting={false} 
             isDisabled={true} // Disable buttons in preview
           />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-3">
        <a href={createPageUrl(`ProfileView?id=${nominee.id}`)} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Public Profile
          </Button>
        </a>
        <Button onClick={onFinish}>
          Finish & View Passport
        </Button>
      </CardFooter>
    </Card>
  );
}