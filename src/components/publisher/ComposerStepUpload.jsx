import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, FileText, X, Wand2, ChevronRight } from "lucide-react";
import { PLATFORM_CONFIG } from "./publisherConfig";

const ACCEPTED = [".md", ".txt", ".pdf"];
const MAX_BYTES = 500_000; // 500 KB

export default function ComposerStepUpload({ channels, onNext }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [postCount, setPostCount] = useState(4);
  const [selectedPlatform, setSelectedPlatform] = useState("linkedin");
  const [selectedChannelIds, setSelectedChannelIds] = useState([]);
  const [error, setError] = useState("");

  const connectedChannels = channels.filter(c => c.connection_status === "connected" && c.is_active);

  const parseFile = useCallback(async (file) => {
    setError("");
    if (file.size > MAX_BYTES) {
      setError("File too large (max 500 KB).");
      return;
    }
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError("Only .md, .txt, and .pdf files are supported.");
      return;
    }
    const text = await file.text();
    setFileName(file.name);
    setRawContent(text.slice(0, 8000));

    // Auto-detect title from first heading or filename
    const firstHeading = text.match(/^#+ (.+)/m);
    if (firstHeading) setTitle(firstHeading[1].trim());
    else setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) parseFile(file);
  };

  const handleToggleChannel = (id) => {
    setSelectedChannelIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const canProceed = rawContent.trim().length > 20 && title.trim() && selectedChannelIds.length > 0;

  return (
    <div className="space-y-5">
      {/* File Drop Zone */}
      <div>
        <Label className="mb-2 block">Source Material</Label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slate-300 bg-slate-50"
          }`}
        >
          {fileName ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700">{fileName}</span>
              <button
                onClick={() => { setFileName(""); setRawContent(""); setTitle(""); }}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-500">Drop a <strong>.md</strong>, <strong>.txt</strong>, or <strong>.pdf</strong> file here</p>
              <label className="inline-block cursor-pointer">
                <span className="text-xs text-indigo-500 hover:underline font-medium">Browse file</span>
                <input type="file" accept=".md,.txt,.pdf" className="sr-only" onChange={handleFileInput} />
              </label>
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      {/* Paste fallback */}
      <div>
        <Label htmlFor="raw_content" className="mb-2 flex items-center justify-between">
          <span>Content {!fileName && <span className="text-red-500">*</span>}</span>
          <span className="text-xs text-slate-400 font-normal">{rawContent.length} / 8000 chars</span>
        </Label>
        <Textarea
          id="raw_content"
          placeholder="Or paste your content, notes, outline, or talking points here…"
          value={rawContent}
          onChange={e => setRawContent(e.target.value.slice(0, 8000))}
          className="min-h-[120px] resize-none text-sm"
        />
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title" className="mb-2 block">Title / Subject <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          placeholder="e.g. TOP 100 Aerospace Season 4 Launch"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* Objective (OKR) */}
      <div>
        <Label htmlFor="objective" className="mb-2 block">
          Objective <span className="text-xs text-slate-400 font-normal">(OKR free-text)</span>
        </Label>
        <Input
          id="objective"
          placeholder="e.g. Grow LinkedIn followers by 20% this quarter"
          value={objective}
          onChange={e => setObjective(e.target.value)}
        />
      </div>

      {/* Platform + Post Count */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="platform" className="mb-2 block">Platform</Label>
          <select
            id="platform"
            value={selectedPlatform}
            onChange={e => setSelectedPlatform(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] bg-white"
          >
            {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="post_count" className="mb-2 block">
            # of Posts <span className="text-xs text-slate-400 font-normal">(1–12)</span>
          </Label>
          <input
            id="post_count"
            type="number"
            min={1}
            max={12}
            value={postCount}
            onChange={e => setPostCount(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Channel selection */}
      <div>
        <Label className="mb-2 block">Publish to <span className="text-red-500">*</span></Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {connectedChannels.map(channel => {
            const cfg = PLATFORM_CONFIG[channel.platform];
            const isSelected = selectedChannelIds.includes(channel.id);
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => handleToggleChannel(channel.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left min-h-[56px] ${
                  isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg?.bg}`}>
                  {cfg && <cfg.Icon className={`w-4 h-4 ${cfg.color}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{channel.channel_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{channel.channel_type} · {channel.platform}</p>
                </div>
              </button>
            );
          })}
          {connectedChannels.length === 0 && (
            <p className="text-sm text-amber-600 col-span-2">No connected channels. Add channels in the Channels tab first.</p>
          )}
        </div>
      </div>

      <Button
        onClick={() => onNext({ rawContent, title, objective, platform: selectedPlatform, postCount, selectedChannelIds })}
        disabled={!canProceed}
        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 min-h-[44px]"
      >
        <Wand2 className="w-4 h-4" />
        Generate Script with AI
        <ChevronRight className="w-4 h-4 ml-auto" />
      </Button>
    </div>
  );
}