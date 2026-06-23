"use client";

import { EmptyState } from "@/components/empty-state/empty-state";
import Loader from "@/components/loader";
import { Card } from "@/components/ui/card";
import * as url from "@/helper/url-helper";
import { RootState } from "@/redux/store";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Changelog = () => {
  const backendUrl = useSelector(
    (state: RootState) => state.configReducer.backendUrl,
  );
  const [logInfo, setLogInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function getLogData() {
    const changeLogUrl = `${backendUrl}/${url.CHANGE_LOG}`;
    try {
      const response = await fetch(changeLogUrl);
      if (!response.ok) {
        console.error(`Failed to fetch data: ${response.statusText}`);
        setLogInfo(null);
        return;
      }

      const data = await response.json();
      setLogInfo(data.content);
    } catch (error) {
      console.error("Error fetching changelog data:", error);
      setLogInfo(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (backendUrl) getLogData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="" />
      </div>
    );
  }

  if (!logInfo) {
    return <EmptyState variant="fullpage" title="No log found" icon={Layers} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-5 px-3">
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-4xl font-semibold">AssistCX Changelog</h1>
      </div>
      <div className="space-y-6">
        {logInfo?.split("\n## ")?.map((section, index) => {
          if (index === 0) return null; // Skip the main heading
          const [version, ...content] = section?.split("\n");
          return (
            <Card key={version} className="p-5">
              <div className="mb-2">
                <h2 className="text-3xl pb-4 font-semibold">{version}</h2>
              </div>
              <MarkdownPreview
                wrapperElement={{
                  "data-color-mode": "light",
                }}
                aria-hidden={true}
                source={content.join("\n")}
                components={{
                  h2: ({ children, ...props }) => (
                    <h2 className="font-semibold" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 className="font-medium" {...props}>
                      {children}
                    </h3>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="ml-6" {...props}>
                      {children}
                    </ul>
                  ),
                  li: ({ children, ...props }) => (
                    <li
                      className="list-disc text-base font-normal leading-relaxed"
                      {...props}
                    >
                      {children}
                    </li>
                  ),
                }}
                style={{
                  fontSize: "18px",
                }}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Changelog;
