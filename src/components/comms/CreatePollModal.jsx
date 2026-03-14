import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export default function CreatePollModal({ open, onClose, onCreate }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [duration, setDuration] = useState(""); // hours

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCreate = () => {
    const validOptions = options.filter(o => o.trim());
    if (!question.trim() || validOptions.length < 2) return;

    const pollData = {
      question: question.trim(),
      options: validOptions.map((text, i) => ({
        id: `opt_${Date.now()}_${i}`,
        text: text.trim(),
        votes: []
      })),
      allow_multiple: allowMultiple,
      is_anonymous: isAnonymous,
      ends_at: duration ? new Date(Date.now() + parseInt(duration) * 60 * 60 * 1000).toISOString() : null
    };

    onCreate(pollData);
    
    // Reset form
    setQuestion("");
    setOptions(["", ""]);
    setAllowMultiple(false);
    setIsAnonymous(false);
    setDuration("");
    onClose();
  };

  const isValid = question.trim() && options.filter(o => o.trim()).length >= 2;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
            Create Poll
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Question</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question..."
              className="bg-[var(--card)]"
            />
          </div>

          {/* Options */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Options</Label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="bg-[var(--card)]"
                  />
                  {options.length > 2 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeOption(i)}
                      className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={addOption}
                className="mt-2 text-[var(--accent)]"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Option
              </Button>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-3 pt-2 border-t border-[var(--border)]">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">Allow multiple selections</span>
              <button
                type="button"
                onClick={() => setAllowMultiple(!allowMultiple)}
                className={cn(
                  "w-10 h-6 rounded-full transition-colors relative",
                  allowMultiple ? "bg-[var(--accent)]" : "bg-gray-300"
                )}
              >
                <span className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  allowMultiple ? "left-5" : "left-1"
                )} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">Anonymous voting</span>
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={cn(
                  "w-10 h-6 rounded-full transition-colors relative",
                  isAnonymous ? "bg-[var(--accent)]" : "bg-gray-300"
                )}
              >
                <span className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  isAnonymous ? "left-5" : "left-1"
                )} />
              </button>
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Duration (hours)</span>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="No limit"
                className="w-24 bg-[var(--card)]"
                min="1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleCreate} 
              disabled={!isValid}
              className="bg-[var(--accent)] hover:bg-[var(--accent)]/90"
            >
              Create Poll
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}