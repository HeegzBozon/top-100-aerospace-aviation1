import React, { useState } from "react";
import { X, Wand2, PencilLine } from "lucide-react";
import { scriptBuilder } from "@/functions/scriptBuilder";
import ComposerStepUpload from "./ComposerStepUpload.jsx";
import ComposerStepReview from "./ComposerStepReview.jsx";
import SinglePostForm from "./SinglePostForm.jsx";

const STEP_MODE   = "mode";
const STEP_UPLOAD = "upload";
const STEP_LOADING= "loading";
const STEP_REVIEW = "review";
const STEP_SINGLE = "single";

export default function PostComposer({ channels, editingPost, userEmail, onClose }) {
  const [step, setStep] = useState(editingPost ? STEP_SINGLE : STEP_MODE);
  const [context, setContext] = useState(null);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [loadingError, setLoadingError] = useState("");

  const handleUploadNext = async (uploadContext) => {
    setContext(uploadContext);
    setStep(STEP_LOADING);
    setLoadingError("");
    try {
      const res = await scriptBuilder({
        raw_content: uploadContext.rawContent,
        title: uploadContext.title,
        objective: uploadContext.objective,
        platform: uploadContext.platform,
        post_count: uploadContext.postCount,
      });
      if (!res?.data?.posts?.length) throw new Error("No posts returned.");
      setGeneratedPosts(res.data.posts);
      setStep(STEP_REVIEW);
    } catch (e) {
      setLoadingError(e?.response?.data?.error || e.message || "AI generation failed.");
      setStep(STEP_UPLOAD);
    }
  };

  const handleDone = () => onClose();

  const stepTitle = {
    [STEP_MODE]:    "New Post",
    [STEP_UPLOAD]:  "Script Builder — Source",
    [STEP_LOADING]: "Generating Script…",
    [STEP_REVIEW]:  "Review & Approve Posts",
    [STEP_SINGLE]:  editingPost ? "Edit Post" : "New Post",
  }[step] || "Composer";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={stepTitle}
    >
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-semibold text-slate-900 text-lg">{stepTitle}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close composer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* Step: Mode Selection */}
          {step === STEP_MODE && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <button
                onClick={() => setStep(STEP_UPLOAD)}
                className="flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left group min-h-[140px]"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <Wand2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Script Builder</p>
                  <p className="text-sm text-slate-500 mt-0.5">Upload content, let AI generate up to 12 posts mapped to JJJH + AIDA + Hero's Journey.</p>
                </div>
              </button>

              <button
                onClick={() => setStep(STEP_SINGLE)}
                className="flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-left group min-h-[140px]"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <PencilLine className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Single Post</p>
                  <p className="text-sm text-slate-500 mt-0.5">Write and schedule one post manually to any connected channel.</p>
                </div>
              </button>
            </div>
          )}

          {/* Step: Upload / Configure */}
          {step === STEP_UPLOAD && (
            <ComposerStepUpload
              channels={channels}
              onNext={handleUploadNext}
            />
          )}

          {/* Step: Loading */}
          {step === STEP_LOADING && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center animate-pulse">
                <Wand2 className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-slate-800">Generating your script…</p>
                <p className="text-sm text-slate-500">Claude is mapping your content to JJJH + AIDA + Hero's Journey.</p>
                <p className="text-xs text-slate-400">This takes ~10–20 seconds.</p>
              </div>
              {loadingError && (
                <p className="text-sm text-red-500 text-center mt-2 max-w-sm">{loadingError}</p>
              )}
            </div>
          )}

          {/* Step: Review */}
          {step === STEP_REVIEW && (
            <ComposerStepReview
              posts={generatedPosts}
              context={context}
              userEmail={userEmail}
              onBack={() => setStep(STEP_UPLOAD)}
              onDone={handleDone}
            />
          )}

          {/* Step: Single post */}
          {step === STEP_SINGLE && (
            <SinglePostForm
              channels={channels}
              editingPost={editingPost}
              userEmail={userEmail}
              onClose={onClose}
              onBack={!editingPost ? () => setStep(STEP_MODE) : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}