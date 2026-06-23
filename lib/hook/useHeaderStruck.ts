import { useEffect, useState } from "react";

/**
 * Hook to detect if the header should be "stuck" based on scroll position
 * @param threshold - The scroll position threshold (default: 0)
 * @returns boolean indicating if the header should be stuck
 */
export function useHeaderStuck(threshold: number = 0): boolean {
  const [isHeaderStuck, setIsHeaderStuck] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsHeaderStuck(true);
      } else {
        setIsHeaderStuck(false);
      }
    };

    // Add event listener
    window.addEventListener("scroll", handleScroll);

    // Initial check for scroll position on load
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isHeaderStuck;
}
