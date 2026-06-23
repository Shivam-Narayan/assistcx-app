"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import type { ImportResult } from "../types/table-types";
import { ImportIllustration } from "../constants/illustrations";

type ImportPhase = "creating_columns" | "importing" | "done";

export interface ImportProgressState {
  phase: ImportPhase;
  result: ImportResult | null;
  columnCreationFailed?: boolean;
}

interface ImportProgressViewProps {
  state: ImportProgressState;
  fileName: string;
  onBack: () => void;
}

function LoadingState({
  phase,
  fileName,
}: {
  phase: ImportPhase;
  fileName: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12">
      <ImportIllustration />

      <div className="text-center">
        <p className="text-sm font-medium">
          {phase === "creating_columns"
            ? "Creating columns..."
            : "Importing data..."}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{fileName}</p>
      </div>

      <div className="mt-2 flex items-center gap-3">
        {["creating_columns", "importing"].map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                phase === step
                  ? "bg-primary text-primary-foreground"
                  : phase === "importing" && idx === 0
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {phase === "importing" && idx === 0 ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                idx + 1
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {idx === 0 ? "Columns" : "Import"}
            </span>
            {idx === 0 && <div className="mx-1 h-px w-6 bg-border" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessState({
  result,
  onBack,
}: {
  result: ImportResult;
  onBack: () => void;
}) {
  const hasPartialErrors = result.failed > 0;

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-6">
      <div
        className={cn(
          "rounded-full p-2",
          hasPartialErrors ? "bg-amber-50" : "bg-green-50",
        )}
      >
        {hasPartialErrors ? (
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">
          {hasPartialErrors
            ? "Import completed with errors"
            : "Import successful"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {result.inserted} {result.inserted === 1 ? "row" : "rows"} imported
          {hasPartialErrors && `, ${result.failed} failed`}
        </p>
      </div>

      {hasPartialErrors && <ErrorList errors={result.errors} />}

      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="mt-2 cursor-pointer"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to import
      </Button>
    </div>
  );
}

function FailureState({
  result,
  columnCreationFailed,
  onBack,
}: {
  result: ImportResult | null;
  columnCreationFailed?: boolean;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-6">
      <div className="rounded-full bg-red-50 p-2">
        <XCircle className="h-5 w-5 text-red-500" />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">
          {columnCreationFailed ? "Column creation failed" : "Import failed"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {columnCreationFailed
            ? "Could not create columns. Please check your configuration and try again."
            : `0 rows imported, ${result?.failed ?? 0} failed`}
        </p>
      </div>

      {result && result.errors.length > 0 && (
        <ErrorList errors={result.errors} />
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="mt-2 cursor-pointer"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to import
      </Button>
    </div>
  );
}

function ErrorList({ errors }: { errors: string[] }) {
  return (
    <div className="w-full rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {errors.length} {errors.length === 1 ? "error" : "errors"}
        </span>
      </div>

      <div className="max-h-80 space-y-1.5 overflow-y-auto p-2">
        {errors.map((error, idx) => (
          <div
            key={`${error}-${idx}`}
            className="flex items-start gap-1.5 rounded-md bg-background px-2 py-1.5 text-xs"
          >
            <AlertTriangle className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber-500" />
            <p className="min-w-0 text-muted-foreground">{error}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImportProgressView({
  state,
  fileName,
  onBack,
}: ImportProgressViewProps) {
  const { phase, result, columnCreationFailed } = state;

  if (phase !== "done") {
    return <LoadingState phase={phase} fileName={fileName} />;
  }

  if (columnCreationFailed) {
    return (
      <FailureState result={result} columnCreationFailed onBack={onBack} />
    );
  }

  if (
    result &&
    result.inserted === 0 &&
    (result.failed > 0 || result.errors.length > 0)
  ) {
    return <FailureState result={result} onBack={onBack} />;
  }

  if (result && result.inserted > 0) {
    return <SuccessState result={result} onBack={onBack} />;
  }

  return <FailureState result={null} columnCreationFailed onBack={onBack} />;
}
