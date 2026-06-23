import { JWT } from "next-auth/jwt";

export interface DecodedJWT {
  exp: number;
  [key: string]: any;
}

export const decodeJWT = (token: string): DecodedJWT => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    Buffer.from(base64, "base64")
      .toString()
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
};

/**
 * Server-side token refresh — called from NextAuth JWT callback.
 * Uses NEXTAUTH_BACKEND env var (not Redux store, since this runs server-side).
 */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_BACKEND}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.refreshToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Refresh failed");

    const data = await response.json();
    const decoded = decodeJWT(data.access_token);

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      accessTokenExpires: decoded.exp,
      user_id: data.user_uuid ?? token.user_id,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
