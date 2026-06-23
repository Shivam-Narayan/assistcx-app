import { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";
import { truncate } from "@/lib/utils";

const ToolsFooter = ({ tools }: { tools: any[] }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState(tools.length);

  useEffect(() => {
    const calculateVisible = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      let usedWidth = 0;
      let count = 0;
      // Define +N more approx width
      const reserveMoreWidth = 80;

      for (let i = 0; i < tools.length; i++) {
        const badgeEl = badgeRefs.current[i];
        if (!badgeEl) continue;

        const badgeWidth = badgeEl.offsetWidth + 8;

        // If hidden tools exist then reserve space for +N more tools
        const remainingTools = tools.length - (i + 1);
        const reserve = remainingTools > 0 ? reserveMoreWidth : 0;

        if (usedWidth + badgeWidth + reserve <= containerWidth) {
          usedWidth += badgeWidth;
          count++;
        } else {
          break;
        }
      }
      if (count < tools.length) {
        count = Math.max(1, count - 1);
      }
      setVisibleCount(count);
    };

    requestAnimationFrame(() => calculateVisible());

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => calculateVisible());
    });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [tools]);

  const hiddenCount = tools.length - visibleCount;

  return (
    <div
      ref={containerRef}
      className="flex flex-nowrap gap-2 p-0 relative w-full overflow-visible"
    >
      {/* Hidden badges for measuring width dont removed this div */}
      <div className="absolute opacity-0 pointer-events-none flex flex-nowrap gap-2">
        {tools.map((tool, index) => (
          <div
            key={index}
            ref={(el: HTMLDivElement | null) => {
              badgeRefs.current[index] = el;
            }}
            className="shrink-0"
          >
            <Badge
              variant="outline"
              className="bg-white dark:bg-slate-800 border"
            >
              {tool.name}
            </Badge>
          </div>
        ))}
      </div>

      {/* Visible badges */}
      {tools.slice(0, visibleCount).map((tool, index) => (
        <Badge
          key={index}
          variant="outline"
          className="bg-white dark:bg-slate-800 border shrink-0 max-w-[280px]"
        >
          <span className="truncate block">{tool.name}</span>
        </Badge>
      ))}

      {/* +N more */}
      {hiddenCount > 0 && (
        <div
          className="relative group shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Badge
            variant="outline"
            className="bg-white dark:bg-slate-800 border"
          >
            +{hiddenCount} more
          </Badge>

          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col gap-2 rounded-md shadow-sm p-2 z-50 text-sm min-w-[230px] max-h-40 overflow-y-auto bg-white dark:bg-slate-800 border"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {tools.slice(visibleCount).map((tool, i) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-white dark:bg-slate-800 border"
              >
                <span>{truncate(tool.name, 35)}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsFooter;
