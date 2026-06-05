import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = "default_mock_auth_secret_development_only_1234567890";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_google_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_google_secret",
    }),
    Credentials({
      id: "credentials",
      name: "Sandbox Credentials",
      credentials: {
        username: { label: "Operator Code", type: "text" },
        password: { label: "Security PIN", type: "password" },
      },
      async authorize() {
        // Return mock analyst for development bypass
        return {
          id: "sandbox_analyst_user_id_9999",
          name: "Sandbox Analyst",
          email: "analyst@threathunter-ai.local",
          image: null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
