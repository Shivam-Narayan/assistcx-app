import {
  usePathname,
  useRouter,
  useSelectedLayoutSegments,
} from "next/navigation";

import { getSidebarTabs } from "@/components/assistant/sidebar-tabs";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import { LOGOUT, USER_DETAILS } from "@/helper/url-helper";
import { handleUserDetails } from "@/redux/assistant/common/user-details-slice";
import { AppDispatch } from "@/redux/store";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { decodeJWT } from "../auth-utils";
import {
  canView,
  isAssistantOnlyUser,
  parsePermissions,
  UserPermissions,
} from "../permissions";
import useAxiosAuth from "./useAxiosAuth";

import * as messages from "@/lib/constants";
import { clearAttchmentCollections } from "@/redux/assistant/chat/attachment-slice";
import { clearCollections } from "@/redux/assistant/chat/collection-slice";
import { resetWebSearch } from "@/redux/assistant/chat/web-search-slice";
export function useSidebar({
  isMobile,
  isSidebarCollapse,
  isSidebarOpen,
}: {
  isMobile: boolean;
  isSidebarCollapse: boolean;
  isSidebarOpen: boolean;
}) {
  const segments = useSelectedLayoutSegments() ?? [];
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { axiosAuth, loading } = useAxiosAuth();
  const router = useRouter();
  const [initials, setInitials] = useState<string | null>();
  const iconSize = isMobile ? 20 : isSidebarCollapse ? 22 : 20;
  const sidebarWidth = isMobile ? "w-64" : isSidebarCollapse ? "w-18" : "w-52";
  const sidebarPosition = isMobile
    ? `fixed transform transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : "transform translate-x-0";
  const mobileShadow = isMobile ? "shadow-xl" : "";
  const isCollapsed = isSidebarCollapse && !isMobile;

  const { permissions, assistantOnlyUser } = useMemo(() => {
    if (!session?.user?.accessToken) {
      return {
        permissions: null as UserPermissions | null,
        assistantOnlyUser: false,
      };
    }
    const decoded = decodeJWT(session.user.accessToken) as Record<
      string,
      unknown
    >;
    return {
      permissions: parsePermissions(decoded["permissions"]),
      assistantOnlyUser: isAssistantOnlyUser(decoded),
    };
  }, [session?.user?.accessToken]);

  const isSessionReady =
    status === "authenticated" && !!session?.user?.accessToken;

  const hasAssistantAccess =
    isSessionReady &&
    !!permissions &&
    (permissions.isRoot || canView(permissions, "assistant"));

  const getUserDetails = async (userUUID: any) => {
    if (!loading && userUUID) {
      try {
        let result = await axiosAuth.get(`${USER_DETAILS}`);
        if (result?.status === 200) {
          let userInfo = result?.data;
          dispatch(handleUserDetails(userInfo));
          if (userInfo?.first_name != null && userInfo?.last_name != null) {
            const contactInitials = userInfo.first_name.charAt(0).toUpperCase();
            setInitials(contactInitials);
          } else {
            const contactInitials = userInfo.email.charAt(0).toUpperCase();
            setInitials(contactInitials);
          }
        }
      } catch (error) {
        console.log(error);
        errorMessageHandler(error);
      }
    }
  };

  useEffect(() => {
    if (session && session?.user?.id != undefined) {
      getUserDetails(session?.user?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const tabs = useMemo(() => {
    if (!hasAssistantAccess) return [];

    return getSidebarTabs({
      iconSize,
      segments,
    });
  }, [segments, iconSize, hasAssistantAccess]);
  const logoutUser = async () => {
    if (!loading) {
      try {
        const result = await axiosAuth.post(LOGOUT);
        if (result?.status === 200) {
          successMessageHandler(messages.logout_successfully);
          setTimeout(() => {
            signOut({ callbackUrl: "/login" });
          }, 1000);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  const resetChatState = () => {
    dispatch(clearCollections());
    dispatch(clearAttchmentCollections());
    dispatch(resetWebSearch());
  };
  return {
    tabs,
    sidebarWidth,
    sidebarPosition,
    mobileShadow,
    isCollapsed,
    initials,
    logoutUser,
    resetChatState,
    iconSize,
    isSessionReady,
    assistantOnlyUser,
    router,
    segments,
    pathname,
  };
}
