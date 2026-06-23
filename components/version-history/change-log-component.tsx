import React from "react";

interface DiffItem {
  path: string;
  value?: unknown;
  oldValue?: unknown;
  newValue?: unknown;
}

interface DiffResult {
  added: DiffItem[];
  removed: DiffItem[];
  changed: DiffItem[];
}

export function DiffCheckerComponent({ diff }: { diff: DiffResult }) {
  const [openSection, setOpenSection] = React.useState<string | null>("");

  const toggleSection = (sectionId: string) => {
    if (openSection === sectionId) {
      setOpenSection(null);
    } else {
      setOpenSection(sectionId);
    }
  };

  const totalChanges =
    diff.added.length + diff.removed.length + diff.changed.length;

  if (totalChanges === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>

        <div className="relative z-10">
          <p className="text-base font-semibold text-gray-900 mb-1">
            JSON(s) are identical
          </p>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            No differences detected between the compared JSON structures.
          </p>
        </div>
      </div>
    );
  }

  const DiffCard = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`bg-white rounded-lg border shadow-none overflow-hidden ${className}`}
    >
      {children}
    </div>
  );

  const AccordionSection = ({
    sectionId,
    title,
    count,
    children,
    variant = "default",
  }: {
    sectionId: string;
    title: string;
    count: number;
    children: React.ReactNode;
    variant?: "added" | "removed" | "changed" | "default";
  }) => {
    const isOpen = openSection === sectionId;

    const variantStyles = {
      added: "bg-green-50 border-green-200 border-l-green-400",
      removed: "bg-red-50 border-red-200 border-l-red-400",
      changed: "bg-blue-50 border-blue-200 border-l-blue-400",
      default: "bg-gray-50 border-gray-200 border-l-gray-400",
    };

    const headerStyles = {
      added: "bg-green-100 text-green-800 border-green-200 ",
      removed: "bg-red-100 text-red-800 border-red-200 ",
      changed: "bg-blue-100 text-blue-800 border-blue-200 ",
      default: "bg-gray-100 text-gray-800 border-gray-200 ",
    };

    return (
      <DiffCard className={`${variantStyles[variant]} border-l-4`}>
        <button
          onClick={() => toggleSection(sectionId)}
          className={`w-full px-4 py-3 font-semibold text-sm text-left flex items-center justify-between transition-colors cursor-pointer ${
            headerStyles[variant]
          } ${!isOpen ? "border-b-0" : "border-b"}`}
        >
          <span>
            {title} ({count})
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && <div className="p-4 space-y-3">{children}</div>}
      </DiffCard>
    );
  };

  const DiffItem = ({
    path,
    children,
  }: {
    path: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3 overflow-hidden">
        <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-700 flex-shrink-0">
          Key :
        </span>
        <code className="font-mono text-sm text-gray-800 px-2 py-1 rounded-md border border-gray-300 font-semibold bg-white break-all overflow-hidden">
          {path}
        </code>
      </div>

      {children}
    </div>
  );

  const CodeBlock = ({
    children,
    variant = "default",
  }: {
    children: React.ReactNode;
    variant?: "added" | "removed" | "old" | "new" | "default";
  }) => {
    const variantStyles = {
      added: "bg-green-50 border-green-200 text-green-900",
      removed: "bg-red-50 border-red-200 text-red-900",
      old: "bg-red-50 border-red-200 text-red-900",
      new: "bg-green-50 border-green-200 text-green-900",
      default: "bg-gray-50 border-gray-200 text-gray-900",
    };

    return (
      <pre
        className={`text-xs px-2 py-2 rounded-md border font-mono overflow-hidden whitespace-pre-wrap break-words ${variantStyles[variant]}`}
      >
        {children}
      </pre>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Summary Card */}
      <DiffCard className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3 text-gray-800 text-base">
          <span className="font-semibold whitespace-nowrap">
            {totalChanges} difference{totalChanges !== 1 && "s"}:
          </span>
          <span className="flex-1 text-center py-1 rounded-md bg-blue-100 text-blue-700 font-medium">
            {diff.changed.length} changed
          </span>
          <span className="flex-1 text-center py-1 rounded-md bg-green-100 text-green-700 font-medium">
            {diff.added.length} added
          </span>
          <span className="flex-1 text-center py-1 rounded-md bg-red-100 text-red-700 font-medium">
            {diff.removed.length} removed
          </span>
        </div>
      </DiffCard>

      {/* Changed Items */}
      {diff.changed.length > 0 && (
        <AccordionSection
          sectionId="changed"
          title="Changed"
          count={diff.changed.length}
          variant="changed"
        >
          {diff.changed.map((item, i) => (
            <DiffItem key={`changed-${i}`} path={item.path}>
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-semibold text-red-700 mb-1">
                    - Old Value:
                  </div>
                  <CodeBlock variant="old">
                    {JSON.stringify(item.oldValue, null, 2)}
                  </CodeBlock>
                </div>
                <div>
                  <div className="text-xs font-semibold text-green-700 mb-1">
                    + New Value:
                  </div>
                  <CodeBlock variant="new">
                    {JSON.stringify(item.newValue, null, 2)}
                  </CodeBlock>
                </div>
              </div>
            </DiffItem>
          ))}
        </AccordionSection>
      )}

      {/* Added Items */}
      {diff.added.length > 0 && (
        <AccordionSection
          sectionId="added"
          title="Added"
          count={diff.added.length}
          variant="added"
        >
          {diff.added.map((item, i) => (
            <DiffItem key={`added-${i}`} path={item.path}>
              <CodeBlock variant="added">
                {JSON.stringify(item.value, null, 2)}
              </CodeBlock>
            </DiffItem>
          ))}
        </AccordionSection>
      )}

      {/* Removed Items */}
      {diff.removed.length > 0 && (
        <AccordionSection
          sectionId="removed"
          title="Removed"
          count={diff.removed.length}
          variant="removed"
        >
          {diff.removed.map((item, i) => (
            <DiffItem key={`removed-${i}`} path={item.path}>
              <CodeBlock variant="removed">
                {JSON.stringify(item.value, null, 2)}
              </CodeBlock>
            </DiffItem>
          ))}
        </AccordionSection>
      )}
    </div>
  );
}
