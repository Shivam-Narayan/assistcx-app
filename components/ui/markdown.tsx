"use client";

import { cn } from "@/lib/utils";
import { marked } from "marked";
import React, {
  memo,
  useId,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
  ReactNode,
  ReactElement,
  JSX,
} from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock, CodeBlockCode } from "./code-block";
import { CitationTooltip } from "../assistant/citation-tooltip";
import { SourceDocument } from "@/app/assistant/chat/_components/types";

export type MarkdownSize = "sm" | "base";

export type MarkdownProps = {
  children: string;
  id?: string;
  className?: string;
  components?: Partial<Components>;
  citations?: SourceDocument[] | Record<string, SourceDocument[]>;
  enableCitations?: boolean;
  size?: MarkdownSize;
};

function parseCitations(
  text: string,
  citations?: SourceDocument[] | Record<string, SourceDocument[]>,
): (string | ReactElement)[] {
  const parts: (string | ReactElement)[] = [];
  const regex = /\[(\d+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let buffer: { number: string; index: number }[] = [];

  function flushBuffer() {
    if (buffer.length === 0) return;

    if (buffer.length <= 3) {
      // show all directly
      buffer.forEach(({ number, index }) => {
        parts.push(
          <CitationTooltip
            key={`citation-${index}-${number}`}
            number={number}
            citations={citations || {}}
          />,
        );
      });
    } else {
      // show first 3 then collapse
      buffer.slice(0, 3).forEach(({ number, index }) => {
        parts.push(
          <CitationTooltip
            key={`citation-${index}-${number}`}
            number={number}
            citations={citations || {}}
          />,
        );
      });

      const moreNumbers = buffer.slice(3).map((b) => b.number);
      parts.push(
        <CitationTooltip
          key={`citation-more-${buffer[3].index}`}
          number={`+${moreNumbers.length} more`}
          citations={citations || {}}
          extraNumbers={moreNumbers}
        />,
      );
    }
    buffer = [];
  }

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      // flush text before citation
      flushBuffer();
      parts.push(text.slice(lastIndex, match.index));
    }
    buffer.push({ number: match[1], index: match.index });
    lastIndex = regex.lastIndex;

    // check if next character is not another `[...]` (i.e., end of sequence)
    const nextChar = text[lastIndex];
    if (nextChar !== "[") {
      flushBuffer();
    }
  }

  if (lastIndex < text.length) {
    flushBuffer();
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

const processNode = (
  node: ReactNode,
  citations?: SourceDocument[] | Record<string, SourceDocument[]>,
  enableCitations: boolean = false,
): ReactNode => {
  if (!enableCitations) return node;

  if (typeof node === "string") {
    return parseCitations(node, citations);
  }

  if (
    isValidElement(node) &&
    (node.props as { children?: ReactNode })?.children
  ) {
    const propsWithChildren = node.props as { children?: ReactNode };
    return cloneElement(
      node,
      typeof node.props === "object" && node.props ? { ...node.props } : {},
      Children.map(propsWithChildren.children, (child) =>
        processNode(child, citations, enableCitations),
      ),
    );
  }

  return node;
};

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

function extractLanguage(className?: string): string {
  const match = className?.match(/language-(\w+)/);
  return match ? match[1] : "plaintext";
}

const createTextComponent = <T extends keyof JSX.IntrinsicElements>(
  Tag: T,
  className: string,
  citations?: SourceDocument[] | Record<string, SourceDocument[]>,
  enableCitations: boolean = false,
): React.FC<React.ComponentPropsWithoutRef<T>> => {
  const Component = ({
    children,
    ...props
  }: React.PropsWithChildren<React.ComponentPropsWithoutRef<T>>) => {
    return React.createElement(
      Tag,
      {
        className,
        ...props,
      } as React.ComponentPropsWithoutRef<T>,
      Children.map(children, (child) =>
        processNode(child, citations, enableCitations),
      ),
    );
  };

  Component.displayName = `Markdown${Tag}`;
  return Component;
};

// Size-dependent class maps — styling is based on size only, not citations
const sizeClasses = {
  base: {
    h1: "text-2xl font-semibold my-2",
    h2: "font-semibold text-xl my-2 mt-4",
    h3: "text-lg font-semibold my-2 mt-4",
    h4: "text-base font-semibold my-2",
    h5: "text-sm font-medium my-2",
    h6: "text-xs font-medium my-2",
    p: "leading-relaxed text-base mb-3 whitespace-pre-line",
    li: "mb-1",
  },
  sm: {
    h1: "text-lg font-semibold my-2",
    h2: "font-semibold text-base my-2 mt-3",
    h3: "text-sm font-semibold my-2 mt-3",
    h4: "text-sm font-semibold my-1",
    h5: "text-xs font-medium my-1",
    h6: "text-xs font-medium my-1",
    p: "leading-relaxed text-sm mb-2 whitespace-pre-line",
    li: "mb-0.5 text-sm",
  },
};

// Static components that don't depend on citations or size
const staticComponents: Partial<Components> = {
  strong: ({ children, ...props }) => (
    <strong className="font-bold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-muted-foreground" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-muted pl-3 sm:pl-4 italic text-muted-foreground my-4"
      {...props}
    >
      {children}
    </blockquote>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
  pre: ({ children }) => <>{children}</>,
  a: ({ children, href, ...props }) => {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        className="text-primary hover:underline"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
};

const getDynamicComponents = (
  citations?: SourceDocument[] | Record<string, SourceDocument[]>,
  enableCitations: boolean = false,
  size: MarkdownSize = "base",
): Partial<Components> => {
  const s = sizeClasses[size];

  return {
    h1: createTextComponent("h1", s.h1, citations, enableCitations),
    h2: createTextComponent("h2", s.h2, citations, enableCitations),
    h3: createTextComponent("h3", s.h3, citations, enableCitations),
    h4: createTextComponent("h4", s.h4, citations, enableCitations),
    h5: createTextComponent("h5", s.h5, citations, enableCitations),
    h6: createTextComponent("h6", s.h6, citations, enableCitations),
    p: createTextComponent("p", s.p, citations, enableCitations),
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-5 [&_ul]:pl-4 [&_ol]:pl-4" {...props}>
        {Children.map(children, (child) =>
          processNode(child, citations, enableCitations),
        )}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-5 [&_ul]:pl-4 [&_ol]:pl-4" {...props}>
        {Children.map(children, (child) =>
          processNode(child, citations, enableCitations),
        )}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className={s.li} {...props}>
        {Children.map(children, (child) =>
          processNode(child, citations, enableCitations),
        )}
      </li>
    ),
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full border-collapse border border-border my-4",
            size === "sm" ? "text-sm" : "text-base",
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-muted/50 border-b border-border" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th
        className={cn(
          "px-3 py-2 text-left font-semibold border border-border",
          size === "sm" ? "text-sm" : "text-base",
        )}
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        className={cn(
          "px-3 py-2 border border-border",
          size === "sm" ? "text-sm" : "text-base",
        )}
        {...props}
      >
        {children}
      </td>
    ),
    code: function CodeComponent({ className, children, ...props }) {
      const isInline = !className?.includes("language-");

      if (isInline) {
        return (
          <span
            className={cn(
              "bg-muted px-1 py-0.5 rounded font-mono text-xs sm:text-sm",
              className,
            )}
            {...props}
          >
            {children}
          </span>
        );
      }

      const language = extractLanguage(className);

      return (
        <CodeBlock className={className}>
          <CodeBlockCode code={String(children)} language={language} />
        </CodeBlock>
      );
    },
  };
};

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components,
  }: {
    content: string;
    components?: Partial<Components>;
  }) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content,
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

function MarkdownComponent({
  children,
  id,
  className,
  components,
  citations,
  enableCitations = false,
  size = "base",
}: MarkdownProps) {
  const generatedId = useId();
  const blockId = id ?? generatedId;

  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children]);

  const mergedComponents = useMemo(
    () => ({
      ...staticComponents,
      ...getDynamicComponents(citations, enableCitations, size),
      ...components,
    }),
    [components, citations, enableCitations, size],
  );

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
          components={mergedComponents}
        />
      ))}
    </div>
  );
}

const Markdown = memo(MarkdownComponent);
Markdown.displayName = "Markdown";

export { Markdown };
