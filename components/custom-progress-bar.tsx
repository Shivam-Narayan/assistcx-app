import React, { useEffect, useRef, useState } from "react";
import { Progress } from "./ui/progress";

interface CustomProgressBarProps {
  downloadProgress: number;
  status: string;
}

const CustomProgressBar = ({
  downloadProgress,
  status,
}: CustomProgressBarProps) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (downloadProgress === 0) {
      setProgress(0);
      return;
    }

    // Clear any previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = Math.min(prev + 5, downloadProgress); // Increase in steps of 5
        if (nextProgress >= downloadProgress) {
          clearInterval(intervalRef.current!);
        }
        return nextProgress;
      });
    }, 100); // every 100ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [downloadProgress]);

  return (
    <div
      id="toast-bottom-left"
      className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-primary divide-x rtl:divide-x-reverse rounded-lg shadow-sm right-5 bottom-5 border-2 border-border bg-background"
      role="alert"
    >
      <div className="w-full">
        <div className="flex justify-between text-base font-semibold mb-2">
          <span>{status}...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
};

export default CustomProgressBar;
