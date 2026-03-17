import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Linkedin, User, Building2, ChevronRight, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { linkedInConnectChannel } from "@/functions/linkedInConnectChannel";

/**
 * LinkedInConnectButton
 * Handles the full Phase 3 OAuth connect flow for LinkedIn personal + business channels.
 * onConnected(channel) is called after successful channel creation.
 */
export default function LinkedInConnectButton({ onConnected }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("pick"); // pick | orgs | loading | success | error
  const [orgs, setOrgs] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [connectedChannel, setConnectedChannel] = useState(null);

  const reset = () => {
    setStep("pick");
    setOrgs([]);
    setErrorMsg("");
    setConnectedChannel(null);
  };

  const handleOpen = () => {
    reset();
    setOpen(true);
  };

  const connectPersonal = async () => {
    setStep("loading");
    const res = await linkedInConnectChannel({ channel_type: "personal" });
    if (res?.data?.success) {
      setConnectedChannel(res.data.channel);
      setStep("success");
      onConnected?.(res.data.channel);
    } else {
      setErrorMsg(res?.data?.error || "Failed to connect personal profile");
      setStep("error");
    }
  };

  const fetchOrgs = async () => {
    setStep("loading");
    const res = await linkedInConnectChannel({ channel_type: "business" });
    if (res?.data?.organizations) {
      if (res.data.organizations.length === 0) {
        setErrorMsg("No LinkedIn Pages found where you have Administrator access.");
        setStep("error");
      } else {
        setOrgs(res.data.organizations);
        setStep("orgs");
      }
    } else {
      setErrorMsg(res?.data?.error || "Failed to fetch organization pages");
      setStep("error");
    }
  };

  const connectOrg = async (org) => {
    setStep("loading");
    const res = await linkedInConnectChannel({ channel_type: "business", org_id: org.id });
    if (res?.data?.success) {
      setConnectedChannel(res.data.channel);
      setStep("success");
      onConnected?.(res.data.channel);
    } else {
      setErrorMsg(res?.data?.error || "Failed to connect organization page");
      setStep("error");
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 min-h-[44px]"
      >
        <Linkedin className="w-4 h-4" />
        Connect LinkedIn
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); reset(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-700" />
              Connect LinkedIn
            </DialogTitle>
            <DialogDescription>
              Choose which type of LinkedIn account to connect.
            </DialogDescription>
          </DialogHeader>

          {/* Pick account type */}
          {step === "pick" && (
            <div className="space-y-3 pt-2">
              <button
                onClick={connectPersonal}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group min-h-[72px]"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">Personal Profile</p>
                  <p className="text-sm text-slate-500">Post as yourself on LinkedIn</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
              </button>

              <button
                onClick={fetchOrgs}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group min-h-[72px]"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">Company / Organization Page</p>
                  <p className="text-sm text-slate-500">Post on behalf of a LinkedIn Page</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
              </button>
            </div>
          )}

          {/* Loading */}
          {step === "loading" && (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-600">Connecting to LinkedIn…</p>
            </div>
          )}

          {/* Org picker */}
          {step === "orgs" && (
            <div className="space-y-2 pt-2">
              <p className="text-sm text-slate-600 mb-3">Select the page to connect:</p>
              {orgs.map(org => (
                <button
                  key={org.id}
                  onClick={() => connectOrg(org)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left min-h-[56px]"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-blue-700" />
                  </div>
                  <span className="font-medium text-slate-800">{org.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                </button>
              ))}
              <button
                onClick={() => setStep("pick")}
                className="w-full text-sm text-slate-500 hover:text-slate-700 pt-2 underline"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="py-10 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="font-semibold text-slate-800">Channel connected!</p>
              <p className="text-sm text-slate-500">{connectedChannel?.channel_name}</p>
              <Button onClick={() => setOpen(false)} className="mt-2 min-h-[44px]">Done</Button>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="font-semibold text-slate-700">Something went wrong</p>
              <p className="text-sm text-slate-500 max-w-xs">{errorMsg}</p>
              <Button variant="outline" onClick={() => setStep("pick")} className="mt-2 min-h-[44px]">
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}