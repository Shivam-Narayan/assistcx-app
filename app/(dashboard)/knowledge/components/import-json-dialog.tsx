"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  KnowledgeTopicItem,
  normalizeFieldName,
  SmartFieldItem,
  validateKnowledgeTopicsJson,
  validateSmartFieldsJson,
} from "@/lib/schemas/knowledge-schemas";
import { AlertCircle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ImportType = "smart_fields" | "knowledge_topics";

const LABELS: Record<
  ImportType,
  { title: string; description: string; placeholder: string }
> = {
  smart_fields: {
    title: "Import Fields",
    description:
      "Paste a JSON array of smart field objects. Each object should include a name, description, data_type, and optional keywords.",
    placeholder:
      '[\n  { "name": "field_name", "description": "...", "data_type": "text", "keywords": [] }\n]',
  },
  knowledge_topics: {
    title: "Import Topics",
    description:
      "Paste a JSON array of topic objects. Each object should include a name, description, and optional keywords.",
    placeholder:
      '[\n  { "name": "topic_name", "description": "...", "keywords": [] }\n]',
  },
};

const LINE_PX = 24;
const EDITOR_PAD_PX = 16;

function trimJsonBounds(s: string): { start: number; end: number } {
  let a = 0;
  let b = s.length;
  while (a < b && /\s/.test(s[a])) a++;
  while (b > a && /\s/.test(s[b - 1])) b--;
  return { start: a, end: b };
}

function getJsonParseError(str: string): string | null {
  const { start, end } = trimJsonBounds(str);
  const trimmed = str.slice(start, end);
  if (!trimmed) return null;

  try {
    JSON.parse(trimmed);
    return null;
  } catch (e) {
    const err = e as Error;
    const msg = err.message || "Invalid JSON syntax.";
    const posMatch = msg.match(/position (\d+)/i);
    const posInTrimmed = posMatch ? parseInt(posMatch[1], 10) : -1;
    if (posInTrimmed >= 0 && posInTrimmed <= trimmed.length) {
      const absPos = start + Math.min(posInTrimmed, trimmed.length);
      const before = str.slice(0, absPos);
      const line = before.split("\n").length;
      const lastNl = before.lastIndexOf("\n");
      const col = absPos - lastNl - 1;
      let friendlyMsg = "Invalid JSON format";

      // Colon error
      if (msg.includes("Expected ':'") || msg.includes("after property name")) {
        friendlyMsg = "Missing colon (:) after key";
      }

      // Comma / bracket
      else if (
        msg.includes("Expected ',' or '}'") ||
        msg.includes("Expected ',' or ']'")
      ) {
        friendlyMsg = "Missing comma or bracket";
      }

      // Unexpected token
      else if (msg.includes("Unexpected token")) {
        friendlyMsg = "Unexpected character found";
      }

      // Incomplete JSON
      else if (msg.includes("Unexpected end")) {
        friendlyMsg = "Incomplete JSON structure";
      }

      return `Line ${line}: ${friendlyMsg}`;
    }
    return `Invalid JSON format`;
  }
}

function getSyntaxErrorLineCol(
  value: string,
): { line: number; column: number } | null {
  const { start, end } = trimJsonBounds(value);
  const trimmed = value.slice(start, end);
  if (!trimmed) return null;
  try {
    JSON.parse(trimmed);
    return null;
  } catch (e) {
    const posMatch = (e as Error).message.match(/position (\d+)/i);
    const posInTrimmed = posMatch ? parseInt(posMatch[1], 10) : 0;
    const clamped = Math.min(Math.max(0, posInTrimmed), trimmed.length);
    const absPos = start + clamped;
    const before = value.slice(0, absPos);
    const line = before.split("\n").length;
    const lastNl = before.lastIndexOf("\n");
    return { line, column: absPos - lastNl - 1 };
  }
}

interface ImportJsonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ImportType;
  onImport: (items: SmartFieldItem[] | KnowledgeTopicItem[]) => void;
  existingNames?: string[];
  existingData?: SmartFieldItem[] | KnowledgeTopicItem[];
}

const LINE_CLASS =
  "h-6 shrink-0 text-right font-mono text-xs tabular-nums leading-6 text-muted-foreground select-none";

export function ImportJsonDialog({
  open,
  onOpenChange,
  type,
  onImport,
  existingNames = [],
  existingData = [],
}: ImportJsonDialogProps) {
  const [pasteValue, setPasteValue] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [perItemErrors, setPerItemErrors] = useState<
    Array<{ index: number; message: string }>
  >([]);

  const labels = LABELS[type];

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setPasteValue(JSON.stringify(existingData ?? [], null, 2));
      setImportError(null);
      setPerItemErrors([]);
    }
    prevOpenRef.current = open;
  }, [open, existingData]);

  const liveValidation = useMemo(() => {
    const trimmed = pasteValue.trim();
    if (!trimmed)
      return {
        syntaxError: null,
        perItem: [] as Array<{ index: number; message: string }>,
      };
    const syntaxError = getJsonParseError(pasteValue);
    if (syntaxError) return { syntaxError, perItem: [] };
    if (type === "smart_fields") {
      const result = validateSmartFieldsJson(trimmed);
      return {
        syntaxError: null,
        perItem: result.errors.filter((e) => e.index >= 0),
      };
    }
    const result = validateKnowledgeTopicsJson(trimmed);
    return {
      syntaxError: null,
      perItem: result.errors.filter((e) => e.index >= 0),
    };
  }, [pasteValue, type]);

  const syntaxLineCol = useMemo(() => {
    if (!pasteValue.trim()) return null;
    return getSyntaxErrorLineCol(pasteValue);
  }, [pasteValue]);

  const { lineCount, maxLineLen, innerHeightPx, taWidthCh } = useMemo(() => {
    const lines = pasteValue.length === 0 ? [""] : pasteValue.split("\n");
    const n = Math.max(1, lines.length);
    const maxLen = lines.reduce((m, l) => Math.max(m, l.length), 0);
    const contentH = EDITOR_PAD_PX + n * LINE_PX;
    const innerH = Math.max(280, contentH);
    return {
      lineCount: n,
      maxLineLen: maxLen,
      innerHeightPx: innerH,
      taWidthCh: Math.max(maxLen + 6, 52),
    };
  }, [pasteValue]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setPasteValue("");
        setImportError(null);
        setPerItemErrors([]);
      }
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const handleImport = useCallback(() => {
    const trimmed = pasteValue.trim();
    if (!trimmed) {
      setImportError("Paste JSON content first.");
      return;
    }

    setImportError(null);
    setPerItemErrors([]);

    if (type === "smart_fields") {
      const result = validateSmartFieldsJson(trimmed);
      if (result.errors.some((e) => e.index === -1)) {
        setImportError(
          result.errors.find((e) => e.index === -1)?.message ?? "Invalid JSON.",
        );
        setPerItemErrors(result.errors.filter((e) => e.index >= 0));
        return;
      }
      setPerItemErrors(
        result.errors.map((e) => ({ index: e.index, message: e.message })),
      );

      const nameMap = new Map<string, number[]>();

      result.valid.forEach((item, index) => {
        const key = normalizeFieldName(item.name);

        if (!nameMap.has(key)) {
          nameMap.set(key, []);
        }

        nameMap.get(key)!.push(index);
      });

      const duplicateItems = Array.from(nameMap.entries())
        .filter(([_, indexes]) => indexes.length > 1)
        .map(([name, indexes]) => ({
          name,
          indexes,
        }));

      if (duplicateItems.length > 0) {
        setImportError(
          duplicateItems
            .map(
              (d) =>
                `Field "${d.name}" is duplicated at items ${d.indexes
                  .map((i) => i + 1)
                  .join(", ")}`,
            )
            .join(" | "),
        );

        return;
      }
      onImport(result.valid);
      handleOpenChange(false);
      return;
    }

    const result = validateKnowledgeTopicsJson(trimmed);
    if (result.errors.some((e) => e.index === -1)) {
      setImportError(
        result.errors.find((e) => e.index === -1)?.message ?? "Invalid JSON.",
      );
      setPerItemErrors(result.errors.filter((e) => e.index >= 0));
      return;
    }
    setPerItemErrors(
      result.errors.map((e) => ({ index: e.index, message: e.message })),
    );

    const nameMap = new Map<string, number[]>();

    result.valid.forEach((item, index) => {
      const key = normalizeFieldName(item.name);

      if (!nameMap.has(key)) {
        nameMap.set(key, []);
      }

      nameMap.get(key)!.push(index);
    });

    const duplicateItems = Array.from(nameMap.entries())
      .filter(([_, indexes]) => indexes.length > 1)
      .map(([name, indexes]) => ({
        name,
        indexes,
      }));

    if (duplicateItems.length > 0) {
      setImportError(
        duplicateItems
          .map(
            (d) =>
              `Field "${d.name}" is duplicated at items ${d.indexes
                .map((i) => i + 1)
                .join(", ")}`,
          )
          .join(" | "),
      );

      return;
    }
    onImport(result.valid);
    handleOpenChange(false);
    return;
  }, [type, pasteValue, existingNames, onImport, handleOpenChange]);

  const showLiveSyntax =
    pasteValue.trim().length > 0 && liveValidation.syntaxError;
  const showLivePerItem =
    pasteValue.trim().length > 0 && liveValidation.perItem.length > 0;
  const errorLine = syntaxLineCol?.line ?? null;

  function isEmptyJsonArray(value: string): boolean {
    if (!value.trim()) return true;

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) && parsed.length === 0;
    } catch {
      return false;
    }
  }
  const isEmpty = isEmptyJsonArray(pasteValue);

  const getErrorMessage = () => {
    if (showLiveSyntax && liveValidation.syntaxError) {
      return liveValidation.syntaxError;
    }

    if (importError) {
      return importError;
    }

    if (showLivePerItem && liveValidation.perItem.length > 0) {
      const e = liveValidation.perItem[0];
      return `Item ${e.index + 1}: ${e.message}`;
    }

    if (!showLivePerItem && perItemErrors.length > 0) {
      const e = perItemErrors[0];
      return `${e.index >= 0 ? `Item ${e.index + 1}: ` : ""}${e.message}`;
    }

    return null;
  };

  const errorMessage = getErrorMessage();
  const disableButton =
    isEmpty ||
    !pasteValue.trim() ||
    !!liveValidation.syntaxError ||
    liveValidation.perItem.length > 0;
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 flex flex-col gap-4 overflow-hidden sm:max-w-4xl">
        <DialogHeader className="sticky top-0 z-10 flex flex-row justify-between items-start space-y-0 bg-background px-6 pt-6">
          <div className="w-full flex flex-col gap-2">
            <DialogTitle className="flex items-center text-xl">
              {labels.title}
            </DialogTitle>
            <DialogDescription>{labels.description}</DialogDescription>
          </div>
          <DialogClose>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary"
              aria-label="Close"
            >
              <X />
            </div>
          </DialogClose>
        </DialogHeader>

        <div className="px-6 flex flex-col gap-3">
          <Card className="overflow-hidden py-0 shadow-sm">
            <CardContent className="flex flex-col gap-0 p-0">
              {/* One scroll viewport: line numbers + textarea move together */}
              <div className="max-h-[min(52vh,440px)] min-h-[280px] overflow-auto rounded-t-xl border-b border-border/60 bg-muted/20">
                <div
                  className="flex w-max min-w-full"
                  style={{ minHeight: innerHeightPx }}
                >
                  <div
                    className="w-11 shrink-0 border-r border-border/60 bg-muted/40 py-2 pl-2 pr-1"
                    style={{ minHeight: innerHeightPx }}
                    aria-hidden
                  >
                    {Array.from({ length: lineCount }, (_, i) => {
                      const lineNum = i + 1;
                      const isErrorLine =
                        showLiveSyntax && errorLine === lineNum;
                      return (
                        <div key={i} className={LINE_CLASS}>
                          <span
                            className={cn(
                              isErrorLine &&
                                "text-red-600 bg-red-100 font-semibold px-0.5 rounded-sm",
                            )}
                            title={
                              isErrorLine && liveValidation.syntaxError
                                ? liveValidation.syntaxError
                                : undefined
                            }
                          >
                            {lineNum}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className="relative box-border min-h-0 min-w-0 flex-1"
                    style={{
                      minWidth: `${taWidthCh}ch`,
                      minHeight: innerHeightPx,
                    }}
                  >
                    <Textarea
                      id="import-json-paste"
                      placeholder={labels.placeholder}
                      value={pasteValue}
                      onChange={(e) => setPasteValue(e.target.value)}
                      spellCheck={false}
                      style={{ height: innerHeightPx, width: "100%" }}
                      className="box-border min-h-0 w-full resize-none overflow-hidden rounded-none border-0 bg-transparent py-2 pr-3 pl-3 font-mono text-sm leading-6 text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 whitespace-pre"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-t border-border/60 px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {lineCount} line{lineCount !== 1 ? "s" : ""}
                  </span>
                  {showLiveSyntax && syntaxLineCol && (
                    <span className="text-muted-foreground">
                      · gutter marks{" "}
                      <span className="font-mono text-foreground">
                        L{syntaxLineCol.line}
                      </span>
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 text-xs leading-snug sm:text-right">
                  {errorMessage && (
                    <p className="text-destructive" title={errorMessage}>
                      {errorMessage}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter className="flex items-center justify-end gap-3 px-6 pb-4 ">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            className="cursor-pointer"
            disabled={disableButton}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
