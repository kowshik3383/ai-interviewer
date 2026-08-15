// lib/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "",
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "guest-login",
      name: "Guest Login",
      credentials: {
        name: { label: "Your Name", type: "text", placeholder: "e.g. Kowshik" },
        email: { label: "Email Address", type: "email", placeholder: "candidate@example.com" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.trim().toLowerCase() || "candidate@example.com";
        const name = (credentials?.name as string)?.trim() || "Candidate";

        // Create or find user in database
        try {
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name,
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
              },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatar,
          };
        } catch (err) {
          console.error("Database user fetch/create error:", err);
          return {
            id: "guest-user-" + Date.now(),
            name,
            email,
            image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
          };
        }
      },
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

export async function getCurrentUser() {
  try {
    const session = await auth();
    if (session?.user) {
      return {
        id: session.user.id || "guest-1",
        name: session.user.name || "Kowshik",
        email: session.user.email || "candidate@example.com",
        image: session.user.image,
      };
    }
  } catch (err) {
    console.warn("Could not retrieve session from auth():", err);
  }

  // Default fallback user for instant interview testing
  return {
    id: "candidate-default",
    name: "Kowshik",
    email: "candidate@example.com",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=Kowshik",
  };
}
