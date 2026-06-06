import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = "default_mock_auth_secret_development_only_1234567890";
}

// In production, strip localhost out of NextAuth environment variables to allow dynamic host detection
if (process.env.NODE_ENV === "production") {
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes("localhost")) {
    console.log("[Auth] Production mode: Removing localhost NEXTAUTH_URL for dynamic host detection.");
    delete process.env.NEXTAUTH_URL;
  }
  if (process.env.AUTH_URL && process.env.AUTH_URL.includes("localhost")) {
    console.log("[Auth] Production mode: Removing localhost AUTH_URL for dynamic host detection.");
    delete process.env.AUTH_URL;
  }
}

const isDbConfigured = !!(
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL !== "" &&
  !process.env.DATABASE_URL.includes("username:password")
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: isDbConfigured
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
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
        const mockUser = {
          id: "sandbox_analyst_user_id_9999",
          name: "Sandbox Analyst",
          email: "analyst@threathunter-ai.local",
          image: null,
        };

        if (isDbConfigured) {
          try {
            // Check if mock user exists in DB, if not, create it to prevent foreign key errors on uploads/threats
            const existing = await db
              .select()
              .from(users)
              .where(eq(users.id, mockUser.id))
              .limit(1);

            if (existing.length === 0) {
              await db.insert(users).values({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                image: mockUser.image,
              });
              console.log("[Auth] Created sandbox analyst user in the database.");
            }
          } catch (e) {
            console.error("[Auth] Failed to ensure sandbox user exists in database:", e);
          }
        }

        return mockUser;
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
