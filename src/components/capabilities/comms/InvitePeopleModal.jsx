import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { UserPlus, Mail, Copy, Check, Loader2 } from "lucide-react";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

export default function InvitePeopleModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const inviteLink = window.location.origin;

  const handleInvite = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await base44.users.inviteUser(email.trim(), "user");
      setSuccess(true);
      setEmail("");
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <UserPlus className="w-5 h-5" />
            Invite people to TOP 100
          </DialogTitle>
          <DialogDescription>
            Invite colleagues and friends to join the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Invite */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
              Invite by email
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${brandColors.navyDeep}40` }} />
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
              </div>
              <Button 
                onClick={handleInvite}
                disabled={loading || !email.trim()}
                style={{ background: brandColors.navyDeep }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : success ? (
                  <Check className="w-4 h-4" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600">Invitation sent successfully!</p>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: `${brandColors.navyDeep}15` }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2" style={{ color: `${brandColors.navyDeep}50` }}>or</span>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
              Share invite link
            </label>
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="bg-gray-50"
              />
              <Button 
                variant="outline" 
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}