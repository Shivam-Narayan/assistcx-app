"use client";
import { AgentCardsActions, AgentCardsActionsRef } from "./agent-cards";
import Loading from "./loading";
import { Suspense, useRef, useState } from "react";
import Toolbar from "./toolbar";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function AgentsPage() {
  const isHeaderStuck = useHeaderStuck();
  const agentCardsRef = useRef<AgentCardsActionsRef>(null);
  const [activeTab, setActiveTab] = useState("active");
  const handleRefreshAgents = () => {
    agentCardsRef.current?.refreshAgents();
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col py-6 gap-6 overflow-x-hidden">
        <div
          className={`px-6 sticky top-0 bg-background z-10 ${isHeaderStuck ? "border-b bg-background py-4" : ""
            }`}
        >
          <Toolbar
            refreshData={handleRefreshAgents}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="px-6">
          <Tabs value={activeTab}>
            <TabsContent value="active">
              <AgentCardsActions ref={agentCardsRef} activeTab={activeTab} />
            </TabsContent>
            <TabsContent value="archived">
              <AgentCardsActions ref={agentCardsRef} activeTab={activeTab} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Suspense>
  );
}
