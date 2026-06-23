import React, { useEffect, useRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Markdown, MarkdownSize } from "./ui/markdown";

interface ContentViewerWithSearchProps {
  content: string;
  search: string;
  currentIndex?: number;
  SyntaxHighlighterContent: boolean;
  language?: "json" | "xml" | "text";
  size?: MarkdownSize;
  scrollRoot?: HTMLElement | HTMLDivElement | null;
}

const ContentViewerWithSearch: React.FC<ContentViewerWithSearchProps> = ({
  content,
  search,
  currentIndex = 0,
  SyntaxHighlighterContent = false,
  language,
  size = "sm",
  scrollRoot = null,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollRoot ?? containerRef.current;

    if (!container) return;
    const oldMarks = Array.from(container.querySelectorAll("mark"));
    oldMarks.forEach((m) => {
      const parent = m.parentNode;
      if (parent)
        parent.replaceChild(document.createTextNode(m.textContent || ""), m);
    });

    if (!search.trim()) return;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: (node: any) => {
        if (!node.nodeValue || !node.nodeValue.trim())
          return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest("mark"))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    } as any);

    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    //Build one continuous text
    const nodeStartOffsets: number[] = [];
    let concatText = "";
    for (let i = 0; i < textNodes.length; i++) {
      nodeStartOffsets[i] = concatText.length;
      concatText += textNodes[i].nodeValue || "";
    }

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapeRegex(search), "gi");

    const matches: Array<{ start: number; end: number }> = [];
    let m;
    while ((m = regex.exec(concatText)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length });
      if (m.index === regex.lastIndex) regex.lastIndex++;
    }

    if (!matches.length) return;

    const findNodeForOffset = (offset: number) => {
      let lo = 0,
        hi = nodeStartOffsets.length - 1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const start = nodeStartOffsets[mid];
        const end = start + (textNodes[mid].nodeValue?.length || 0);
        if (offset < start) hi = mid - 1;
        else if (offset >= end) lo = mid + 1;
        else return { nodeIndex: mid, offsetInNode: offset - start };
      }
      const last = nodeStartOffsets.length - 1;
      return {
        nodeIndex: last,
        offsetInNode: textNodes[last].nodeValue?.length || 0,
      };
    };

    matches
      .slice()
      .reverse()
      .forEach(({ start, end }) => {
        const startPos = findNodeForOffset(start);
        const endPos = findNodeForOffset(end - 1);

        const startNode = textNodes[startPos.nodeIndex];
        const endNode = textNodes[endPos.nodeIndex];
        const startOffset = startPos.offsetInNode;
        const endOffset = end - nodeStartOffsets[endPos.nodeIndex];

        const range = document.createRange();
        try {
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);
        } catch {
          return;
        }

        const extracted = range.extractContents();
        const mark = document.createElement("mark");
        mark.className = "bg-yellow-200 text-black rounded-sm";
        mark.appendChild(extracted);
        range.insertNode(mark);
      });

    const getScrollParent = (el: HTMLElement | null): HTMLElement | null => {
      let parent = el?.parentElement || null;

      while (parent) {
        const overflowY = window.getComputedStyle(parent).overflowY;

        if (overflowY === "auto" || overflowY === "scroll") {
          return parent;
        }

        parent = parent.parentElement;
      }

      return null;
    };

    const allMarks = Array.from(container.querySelectorAll("mark"));

    if (allMarks.length && currentIndex >= 0) {
      const active = allMarks[currentIndex % allMarks.length];

      if (active) {
        allMarks.forEach((m) => m.classList.remove("bg-yellow-400"));

        active.classList.add("bg-yellow-400");

        requestAnimationFrame(() => {
          const root = scrollRoot || getScrollParent(active);

          if (!root) {
            active.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            return;
          }

          const rootRect = root.getBoundingClientRect();
          const activeRect = active.getBoundingClientRect();

          const offset =
            activeRect.top -
            rootRect.top +
            root.scrollTop -
            root.clientHeight / 2;

          root.scrollTo({
            top: offset,
            behavior: "smooth",
          });
        });
      }
    }
  }, [search, content, currentIndex]);

  return (
    <div ref={containerRef}>
      {SyntaxHighlighterContent ? (
        <SyntaxHighlighter
          language={language}
          style={docco}
          wrapLongLines
          wrapLines
          customStyle={{
            padding: "0.75rem",
            margin: "0",
            fontSize: "0.85rem",
            background: "transparent",
            border: "1px solid #e5e7eb",
            borderRadius: "0.375rem",
            height: "100%",
            overflowY: "auto",
          }}
          codeTagProps={{
            style: {
              fontFamily: "inherit",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            },
          }}
        >
          {content}
        </SyntaxHighlighter>
      ) : (
        <Markdown size={size}>{content}</Markdown>
      )}
    </div>
  );
};

export default ContentViewerWithSearch;
