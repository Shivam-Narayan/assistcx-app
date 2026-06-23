import { useEffect, useState } from "react";

/**
 * Debounce a value by a given delay.
 * @param value The value to debounce
 * @param delay Delay in ms
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
