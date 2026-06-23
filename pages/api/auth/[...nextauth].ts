import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decodeJWT, refreshAccessToken } from "@/lib/auth-utils";

interface ExtendedUser extends User {
  accessToken?: string;
  refreshToken?: string;
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        sso_code: { label: "SSO Code", type: "text" },
        teams_token: { label: "Teams Token", type: "text" },
      },
      authorize: async (credentials) => {
        try {
          // Teams silent auth
          if (credentials?.teams_token) {
            const response = await fetch(
              `${process.env.NEXTAUTH_BACKEND}/auth/teams`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teams_token: credentials.teams_token }),
              },
            );

            if (!response.ok) return null;

            const data = await response.json();
            return {
              id: data.user_uuid,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            };
          }

          // SSO code exchange (from /sso-complete page)
          if (credentials?.sso_code) {
            const response = await fetch(
              `${process.env.NEXTAUTH_BACKEND}/auth/sso/exchange`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: credentials.sso_code }),
              },
            );

            if (!response.ok) return null;

            const data = await response.json();
            return {
              id: data.user_uuid,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            };
          }

          // Password auth
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const response = await fetch(
            `${process.env.NEXTAUTH_BACKEND}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            },
          );

          const data = await response.json();

          if (!response.ok || !data.user_uuid) {
            return null;
          }

          return {
            id: data.user_uuid,
            email: credentials.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Handle session update from client-side refresh
      if (trigger === "update" && session?.user) {
        const decoded = session.user.accessToken
          ? decodeJWT(session.user.accessToken)
          : null;

        return {
          ...token,
          accessToken: session.user.accessToken,
          refreshToken: session.user.refreshToken,
          user_id: session.user.id,
          accessTokenExpires: decoded?.exp ?? token.accessTokenExpires,
          error: undefined,
        };
      }

      // Initial sign in — store tokens
      if (user) {
        const extendedUser = user as ExtendedUser;
        const decoded = extendedUser.accessToken
          ? decodeJWT(extendedUser.accessToken)
          : null;

        return {
          ...token,
          accessToken: extendedUser.accessToken,
          refreshToken: extendedUser.refreshToken,
          user_id: extendedUser.id,
          accessTokenExpires: decoded?.exp,
        };
      }

      // Token not expired — return as-is (60s buffer before expiry)
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires * 1000 - 60_000
      ) {
        return token;
      }

      // Token expired or about to expire — refresh server-side
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.user_id ?? "";
        session.user.accessToken = token.accessToken ?? "";
        session.user.refreshToken = token.refreshToken ?? "";
      }
      // Surface refresh error to client so it can sign out
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
