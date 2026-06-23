"use client";

import { errorMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth, { axiosAuth } from "@/lib/hook/useAxiosAuth";
import { InfoIcon, Plug } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Props {
  providerKey: string;
  selectedConnection: string;
  onConnectionChange: (connectionId: string) => void;
  disabled?: boolean;
}

interface Connection {
  id: string;
  name: string;
  is_active: boolean;
  provider_key?: string;
  auth_schema_key?: string;
  is_default?: boolean;
}

const ToolConnectionSelector = ({
  providerKey,
  selectedConnection,
  onConnectionChange,
  disabled,
}: Props) => {
  const { loading } = useAxiosAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  const getConnections = useCallback(async () => {
    if (loading) return;

    try {
      setConnectionsLoading(true);

      const result = await axiosAuth.get(`${url.PROVIDER}/${providerKey}`);

      if (result.status === 200) {
        setConnections(result.data.connections || []);
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setConnectionsLoading(false);
    }
  }, [providerKey, loading]);

  useEffect(() => {
    getConnections();
  }, [getConnections]);

  const connectionOptions = useMemo(
    () => [
      { id: "default", name: "Default", is_active: true },
      ...connections.filter((item) => item.is_active),
    ],
    [connections],
  );

  return (
    <div className="border-t py-2 px-4 border-border/50 bg-muted/50">
      <div
        className="flex flex-row items-center justify-between gap-4"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5" />
          <span className="text-base text-opacity-80 cursor-help">
            Connection
          </span>
          <HoverCard>
            <div className="flex flex-row items-center justify-start gap-2">
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="h-auto w-auto has-[>svg]:px-0 cursor-pointer flex-shrink-0 focus:outline-none focus:ring-0 p-0"
                  aria-label="Connection"
                  tabIndex={-1}
                >
                  <InfoIcon
                    className="w-4 h-4 cursor-pointer"
                    strokeWidth={1.5}
                  />
                </Button>
              </HoverCardTrigger>
            </div>
            <HoverCardContent className="w-80 p-3.5 z-[100]">
              <div className="flex space-x-3">
                <div className="space-y-1">
                  <p
                    className="text-sm text-secondary-foreground"
                    dangerouslySetInnerHTML={{
                      __html:
                        "The default connection is used by default for all tool operations. Select a different connection only if a specific account or configuration is required.",
                    }}
                  />
                </div>
              </div>{" "}
            </HoverCardContent>
          </HoverCard>
        </div>

        <Select
          value={selectedConnection}
          onValueChange={onConnectionChange}
          disabled={disabled || connectionsLoading}
        >
          <SelectTrigger className="w-auto min-w-[180px]">
            <SelectValue placeholder="Select Connection" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {connectionOptions.map((connection) => (
                <SelectItem key={connection.id} value={connection.id}>
                  {connection.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ToolConnectionSelector;
