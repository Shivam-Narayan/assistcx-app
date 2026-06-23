import { EmptyState } from "@/components/empty-state/empty-state";
import useAxiosAuth from "@/lib/hook/useAxiosAuth"; // Assuming you have this hook
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Blocks } from "lucide-react";

export type MarkdownContentVariant = "integration" | "provider";

interface MarkdownContentProps {
  markdownContent: string | null;
  variant?: MarkdownContentVariant;
  emptyTitle?: string;
}

const MarkdownContent = ({
  markdownContent,
  variant = "integration",
  emptyTitle,
}: MarkdownContentProps) => {
  const isProvider = variant === "provider";
  const { loading } = useAxiosAuth();

  if (loading && !markdownContent) {
    return <div className="p-4">Loading content...</div>;
  }

  if (!markdownContent) {
    return (
      <EmptyState
        variant="card"
        title={
          emptyTitle ??
          (isProvider
            ? "No overview available for this provider."
            : "No content available for this integration.")
        }
        icon={Blocks}
      />
    );
  }

  return (
    <div
      className={
        isProvider
          ? "text-sm text-muted-foreground [&_.wmde-markdown]:!bg-transparent"
          : undefined
      }
    >
      <MarkdownPreview
        source={markdownContent}
        wrapperElement={{
          "data-color-mode": "light",
        }}
        components={{
          p: ({ node, ...props }) => (
            <p
              className={
                isProvider
                  ? "break-words leading-relaxed text-sm text-foreground/90"
                  : "break-word leading-relaxed"
              }
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              className={
                isProvider ? "break-words text-sm" : "break-word"
              }
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className={
                isProvider
                  ? "font-medium text-sm text-foreground mt-4 mb-2 break-words first:mt-0"
                  : "font-semibold text-2xl border-b pb-2 mt-8 mb-4 break-word"
              }
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className={
                isProvider
                  ? "font-medium text-sm text-foreground mt-3 mb-1.5 break-words"
                  : "font-semibold text-xl mt-6 mb-3 break-word"
              }
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className={
                isProvider
                  ? "list-disc ml-4 space-y-1.5 my-2"
                  : "list-disc ml-6 space-y-3 my-4"
              }
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className={
                isProvider
                  ? "text-primary underline break-words text-sm"
                  : "text-primary underline break-word"
              }
              {...props}
            />
          ),
          pre: ({ node, ...props }) => (
            <pre
              className={
                isProvider
                  ? "bg-background border p-2.5 rounded-md overflow-x-auto text-xs my-2"
                  : "bg-muted p-3 rounded-md overflow-x-auto text-sm"
              }
              {...props}
            />
          ),
        }}
      />
    </div>
  );
};

export default MarkdownContent;
