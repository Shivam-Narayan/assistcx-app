"use client";

import TextareaWithActions from "@/components/textarea-with-action";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";

interface FeedbackProps {
  setIsFeedback: () => void;
  onSubmit: (feedbackText: string) => void;
  placeholder?: string;
  tips?: string;
  actionLabel?: string;
}

export const Feedback: React.FC<FeedbackProps> = ({
  setIsFeedback,
  onSubmit,
  placeholder = "Enter your feedback...",
  tips = "Provide feedback to resume the agent's task execution.",
  actionLabel = "Submit",
}) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    onSubmit(trimmedPrompt); // 👈 delegate to parent
    setPrompt(""); // reset local state
  };

  return (
    <div className="bg-background/80 backdrop-blur-xl rounded-t-xl">
      <Card className="rounded-b-none rounded-xl py-0 gap-0">
        <CardContent className="px-4 py-4">
          <div className="flex flex-col gap-2">
            <TextareaWithActions
              mode="normal"
              value={prompt}
              onChange={setPrompt}
              placeholder={placeholder}
              maxLength={1000}
              onCancel={() => {
                setPrompt("");
                setIsFeedback();
              }}
              onSave={handleSubmit}
              actionLabel={actionLabel}
            />
            <p className="text-xs text-muted-foreground">{tips}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
