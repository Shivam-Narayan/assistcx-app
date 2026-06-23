import { useEffect, useRef } from "react";

interface UseDebouncedObserverProps {
  root: HTMLElement | null;
  targets: HTMLElement[];
  delay?: number;
  margin?: string;
  threshold?: number | number[];
  onActiveChange: (id: string | null) => void;
  skip?: boolean; // e.g. when user is manually scrolling
  currentActiveId?: string | null;
}

export function useDebouncedObserver({
  root,
  targets,
  delay = 150,
  margin = "0px 0px -15% 0px", // Changed to detect when start enters viewport
  threshold = 0.1,
  skip = false,
  currentActiveId,
  onActiveChange,
}: UseDebouncedObserverProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!root || targets.length === 0 || skip) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
          const viewportTop = root.scrollTop + 80;

          let closestId: string | null = null;
          let closestDistance = Infinity;

          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const targetTop = (entry.target as HTMLElement).offsetTop;
            const distance = Math.abs(targetTop - viewportTop);

            if (distance < closestDistance) {
              closestDistance = distance;
              closestId = entry.target.id;
            }
          });

          if (closestId && closestId !== currentActiveId) {
            onActiveChange(closestId);
          }
        }, delay);
      },
      {
        root,
        threshold,
        rootMargin: margin,
      }
    );

    targets.forEach((el) => el && observer.observe(el));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      targets.forEach((el) => el && observer.unobserve(el));
      observer.disconnect();
    };
  }, [
    root,
    targets,
    delay,
    margin,
    threshold,
    skip,
    currentActiveId,
    onActiveChange,
  ]);

  // Fallback detection for initial load
  useEffect(() => {
    if (!root || targets.length === 0 || skip || currentActiveId) return;
    const viewportTop = root.scrollTop + 80; // Same offset as above
    const viewportBottom = viewportTop + root.clientHeight;

    let closestId: string | null = null;
    let closestDistance = Infinity;

    for (const target of targets) {
      if (!target.id) continue;

      const targetTop = target.offsetTop;
      const targetBottom = targetTop + target.offsetHeight;

      // Check if target is in or near viewport
      if (
        targetBottom > viewportTop - 100 &&
        targetTop < viewportBottom + 100
      ) {
        const distance = Math.abs(targetTop - viewportTop);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = target.id;
        }
      }
    }

    if (closestId && closestDistance < root.clientHeight * 1.5) {
      onActiveChange(closestId);
    }
  }, [targets, root, currentActiveId, onActiveChange, skip]);
}
