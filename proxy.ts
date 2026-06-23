import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ACCESS_DENIED } from "./helper/url-helper";
import {
  canView,
  isAssistantOnlyUser,
  isRootUserFromDecodedToken,
  parsePermissions,
} from "./lib/permissions";
import { DASHBOARD, LOGIN, PROFILE } from "./lib/urls";
import { decodeJWT } from "./lib/auth-utils";

export { decodeJWT } from "./lib/auth-utils";

const ASSISTANT_HOME = "/assistant";

const secret = process.env.NEXTAUTH_SECRET;

const ROUTE_PRIORITY = [
  DASHBOARD,
  "/inbox",
  "/agents",
  "/tools",
  "/knowledge",
  "/data-tables",
  "/integrations",
  "/connections",
  "/settings",
  "/issues",
  PROFILE,
];

export const SETTINGS_ROUTE_PRIORITY = [
  "/settings/mailbox-polling",
  "/settings/data-template",
  "/settings/class-group",
  "/settings/manage-user",
  "/settings/api-keys",
  "/settings/account",
];

export const getFirstAvailableRoute = (
  accessControl: string[],
  decodedToken?: Record<string, unknown> | null,
): string => {
  if (!accessControl || accessControl.length === 0) {
    if (isRootUserFromDecodedToken(decodedToken ?? null)) {
      return DASHBOARD;
    }
    if (isAssistantOnlyUser(decodedToken ?? null)) {
      return ASSISTANT_HOME;
    }
    return ACCESS_DENIED;
  }

  for (const route of ROUTE_PRIORITY) {
    if (accessControl.includes(route)) return route;

    if (route === "/settings") {
      const firstSettings = accessControl.find((r) =>
        r.startsWith("/settings/"),
      );
      if (firstSettings) return firstSettings;
    }
  }

  return accessControl[0] || PROFILE;
};

export const getDefaultSettingsRoute = (accessControl: string[]): string => {
  for (const route of SETTINGS_ROUTE_PRIORITY) {
    if (accessControl.includes(route)) {
      return route;
    }
  }
  return SETTINGS_ROUTE_PRIORITY[0];
};

/**
 * Route-level access check using the token's access_control array
 */
function isPathAllowed(
  path: string,
  accessControl: string[],
  decodedToken?: Record<string, unknown> | null,
): boolean {
  if (path === PROFILE || path.startsWith(`${PROFILE}/`)) return true;

  if (path === ASSISTANT_HOME || path.startsWith(`${ASSISTANT_HOME}/`)) {
    const perms = parsePermissions(decodedToken?.["permissions"]);
    if (canView(perms, "assistant")) return true;
  }

  if (!accessControl || accessControl.length === 0) {
    if (isRootUserFromDecodedToken(decodedToken ?? null)) {
      return true;
    }
    if (isAssistantOnlyUser(decodedToken ?? null)) {
      return (
        path === ACCESS_DENIED ||
        path.startsWith(`${ACCESS_DENIED}/`) ||
        path === ASSISTANT_HOME ||
        path.startsWith(`${ASSISTANT_HOME}/`)
      );
    }
    return path === ACCESS_DENIED || path.startsWith(`${ACCESS_DENIED}/`);
  }

  if (accessControl.includes(path)) return true;

  const segments = path.split("/");
  if (segments.length > 2) {
    const parentPath = "/" + segments[1];
    if (accessControl.includes(parentPath)) return true;
  }

  if (path.startsWith("/settings/") && accessControl.includes(path)) {
    return true;
  }

  return false;
}

const SSO_COMPLETE = "/sso-complete";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret,
    cookieName: "next-auth.session-token",
  });

  // Allow /sso-complete without auth (redirect from backend SSO callback)
  if (req.nextUrl.pathname === SSO_COMPLETE) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname === LOGIN) {
    if (token) {
      const url = req.nextUrl.clone();
      const accessToken: any = token.accessToken
        ? decodeJWT(token.accessToken)
        : undefined;
      const accessControl: string[] = accessToken?.access_control || [];
      url.pathname = getFirstAvailableRoute(accessControl, accessToken);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token) {
    const url = req.nextUrl.clone();
    const { pathname, search } = req.nextUrl;
    url.pathname = LOGIN;
    if (pathname !== "/") {
      url.searchParams.set("callbackUrl", pathname + search);
    }
    return NextResponse.redirect(url);
  }

  const url = req.nextUrl.clone();
  const accessToken: any = token.accessToken
    ? decodeJWT(token.accessToken)
    : undefined;
  const accessControl: string[] = accessToken?.access_control || [];

  if (isPathAllowed(url.pathname, accessControl, accessToken)) {
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/settings/")) {
    const isValidSettingsRoute = SETTINGS_ROUTE_PRIORITY.includes(url.pathname);

    if (!isValidSettingsRoute) {
      return NextResponse.next();
    }

    url.pathname = ACCESS_DENIED;
    return NextResponse.redirect(url);
  }

  url.pathname = getFirstAvailableRoute(accessControl, accessToken);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/sso-complete",
    "/assistant",
    "/assistant/:path*",
    "/inbox/:path*",
    "/agents",
    "/agents/manage-agent",
    "/agents/agent-builder",
    "/tools",
    "/settings/:path*",
    "/profile",
    "/knowledge",
    "/data-tables",
    "/data-tables/:path*",
    "/integrations",
    "/connections",
    "/knowledge/manage-files",
    "/settings/mailbox-polling",
    "/settings/manage-user",
    "/settings/api-keys",
    "/issues",
  ],
} satisfies { matcher: string[] };
