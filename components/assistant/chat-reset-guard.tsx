"use client";

import { clearCollections } from "@/redux/assistant/chat/collection-slice";
import { clearAttchmentCollections } from "@/redux/assistant/chat/attachment-slice";
import { resetWebSearch } from "@/redux/assistant/chat/web-search-slice";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { CHAT, DASHBOARD } from "@/lib/assistant-urls";

const PRESERVED_ROUTES = [DASHBOARD, CHAT];

function isPreservedRoute(pathname: string) {
  return (
    PRESERVED_ROUTES.some((route) => pathname === route) ||
    pathname.startsWith("/assistant/chat/")
  );
}

export default function ChatResetGuard() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const prevPathname = useRef<string>(pathname);

  useEffect(() => {
    const prev = prevPathname.current;
    const curr = pathname;

    // If user is leaving the preserved zone into another route → clear
    if (prev && curr && isPreservedRoute(prev) && !isPreservedRoute(curr)) {
      console.log("clearing chat state due to route change:");
      dispatch(clearCollections());
      dispatch(clearAttchmentCollections());
      dispatch(resetWebSearch());
    }

    prevPathname.current = curr;
  }, [pathname, dispatch]);

  return null;
}
