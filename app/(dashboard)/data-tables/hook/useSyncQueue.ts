"use client";

import { useCallback, useRef, useState } from "react";

export type SyncStatus = "idle" | "saving" | "saved" | "error";

export interface SyncMutation {
  id: string;
  execute: () => Promise<any>;
  onSuccess?: (result: any) => void;
  revert?: () => void;
  dedupKey?: string;
}

const MAX_RETRIES = 2;
const RETRY_DELAYS = [500, 1500];
const SAVED_DISPLAY_MS = 2000;

function isTransientError(error: any): boolean {
  const status = error?.response?.status;
  if (!status) return true; // Network error (no response)
  return status >= 500;
}

/**
 * FIFO mutation queue with retry, dedup, and revert support.
 * Processes mutations sequentially to preserve ordering.
 */
export function useSyncQueue() {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [pendingCount, setPendingCount] = useState(0);

  const queueRef = useRef<SyncMutation[]>([]);
  const processingRef = useRef(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSavedTimer = () => {
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
  };

  const showSaved = () => {
    setStatus("saved");
    clearSavedTimer();
    savedTimerRef.current = setTimeout(() => {
      setStatus("idle");
      savedTimerRef.current = null;
    }, SAVED_DISPLAY_MS);
  };

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    if (queueRef.current.length === 0) return;

    processingRef.current = true;
    clearSavedTimer();
    setStatus("saving");

    while (queueRef.current.length > 0) {
      const mutation = queueRef.current[0];
      let success = false;
      let result: any = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          result = await mutation.execute();
          // API functions return null/false on handled errors (toast already shown)
          if (result === null || result === false) {
            success = false;
            break;
          }
          success = true;
          break;
        } catch (error: any) {
          if (!isTransientError(error) || attempt === MAX_RETRIES) {
            break;
          }
          await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
        }
      }

      queueRef.current.shift();
      setPendingCount(queueRef.current.length);

      if (success) {
        mutation.onSuccess?.(result);
      } else {
        mutation.revert?.();
        setStatus("error");
        processingRef.current = false;
        // Continue processing remaining queue items after a brief pause
        if (queueRef.current.length > 0) {
          setTimeout(() => processQueue(), 0);
        }
        return;
      }
    }

    processingRef.current = false;
    showSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enqueue = useCallback(
    (mutation: SyncMutation) => {
      // Dedup: replace pending mutation with the same dedupKey
      if (mutation.dedupKey) {
        const idx = queueRef.current.findIndex(
          (m) => m.dedupKey === mutation.dedupKey,
        );
        if (idx !== -1) {
          queueRef.current[idx] = mutation;
          return;
        }
      }

      queueRef.current.push(mutation);
      setPendingCount(queueRef.current.length);
      clearSavedTimer();
      setStatus("saving");
      processQueue();
    },
    [processQueue],
  );

  const flush = useCallback(async () => {
    // Wait for current processing to finish
    while (processingRef.current || queueRef.current.length > 0) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }, []);

  return {
    status,
    pendingCount,
    enqueue,
    flush,
  };
}
