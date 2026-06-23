import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsHeadersProps {
  activeTab: string;
  onValueChange: (value: string) => void;
  isAssistant?: boolean;
  enableKnowledgeFetching?: boolean;
}

export const TabsHeaders = ({
  activeTab,
  onValueChange,
  isAssistant = false,
  enableKnowledgeFetching,
}: TabsHeadersProps) => {
  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "content", label: "Content" },
    { value: "chunks", label: "Chunks" },
    { value: "metadata", label: "Metadata" },
    ...(enableKnowledgeFetching
      ? [{ value: "knowledge", label: "Knowledge" }]
      : []),
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={onValueChange}
      className={`w-full ${isAssistant ? "sm:shrink-0 sticky top-0 z-10 bg-background border-b mt-0" : "mt-2"}`}
    >
      <TabsList
        className={`w-full h-auto flex-wrap px-1 py-1 ${isAssistant ? "rounded-none!" : ""}`}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={`cursor-pointer ${isAssistant ? "h-auto lg:h-full px-2 py-0.5 md:px-4 md:py-2 " : "px-4 py-2"}`}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
