// auth.ts — NextAuth configuration (Edge-safe, no Prisma/Node APIs).
// Imported by middleware.ts (Edge) and lib/auth.ts (Node) so the config is shared.
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "",
  session: { strategy: "jwt" },
  trustedHosts: [
    "ai-interviewer-ten-delta.vercel.app",
    "kowshik-valipireddy.pages.dev",
  ],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
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
  pages: {
    signIn: "/login",
  },
});
