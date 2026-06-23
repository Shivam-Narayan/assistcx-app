"use client";

import { setSelectedAttchmentCollections } from "@/redux/assistant/chat/attachment-slice";
import { setSelectedCollections } from "@/redux/assistant/chat/collection-slice";
import {
  resetWebSearch,
  setWebSearchEnabled,
} from "@/redux/assistant/chat/web-search-slice";
import { useAppSelector } from "@/redux/store";
import { useEffect } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { KnowledgeCollectionMenu } from "@/components/assistant/knowledge-collection-menu";
import WebSearch from "./web-search";
import { usePathname, useRouter } from "next/navigation";
import { DASHBOARD } from "@/lib/assistant-urls";

export default function CollectionMenuTrigger() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const selected = useAppSelector((state) => state.collectionReducer.selected);
  const isNewChatPage = pathname === DASHBOARD;
  const selectedAttchment = useAppSelector(
    (state) => state.attachmentReducer.selected,
  );

  useEffect(() => {
    if (selectedAttchment !== null) {
      dispatch(setSelectedCollections(null));
    }
  }, [selectedAttchment, dispatch]);

  return (
    <KnowledgeCollectionMenu
      selected={selected}
      onSelectionChange={(items) => {
        if (items !== null && items.length > 0 && selectedAttchment !== null) {
          dispatch(setSelectedAttchmentCollections(null));
          toast.info("Switched to Knowledge mode", {
            description: "Previously selected files have been cleared.",
            id: "mode-switch",
          });
        }

        dispatch(setSelectedCollections(items));

        if (items == null || items.length === 0) {
          dispatch(setWebSearchEnabled(true));
        }
        if (!isNewChatPage) {
          setTimeout(() => router.push(DASHBOARD), 0);
        }
      }}
      onClearAll={() => {
        dispatch(setSelectedCollections(null));
        dispatch(resetWebSearch());
        if (!isNewChatPage) {
          setTimeout(() => router.push(DASHBOARD), 0);
        }
      }}
      webSearchSlot={<WebSearch />}
      maxSelection={1}
    />
  );
}
