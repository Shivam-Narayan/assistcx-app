import { useCallback, useEffect, useRef, useState } from "react";

export interface Size {
  width: number;
  height: number;
}

export function useResizeObserver<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T | null>,
  Size
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    for (const entry of entries) {
      // Use borderBoxSize for more accurate dimensions on absolute elements
      const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];
      setSize({ width, height });
    }
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(handleResize);
    observer.observe(ref.current);

    // Force an initial measurement
    const rect = ref.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    return () => observer.disconnect();
  }, [handleResize]);

  return [ref, size];
}
