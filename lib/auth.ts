// lib/auth.ts — server-side auth helpers (Node runtime).
import { NextResponse } from "next/server";
import { auth } from "../auth";
import prisma from "./db";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export { signIn, signOut, handlers } from "../auth";

/**
 * Returns the authenticated Google user, or null when there is no session.
 * Callers must treat null as "unauthenticated" (401/redirect).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const u = session?.user;
  if (!u?.email) return null;

  // Resolve to a real DB user row so sessions/turns link to a stable id.
  try {
    let dbUser = await prisma.user.findUnique({ where: { email: u.email } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: u.email,
          name: u.name || u.email.split("@")[0] || "Candidate",
          avatar: u.image,
        },
      });
    }
    return {
      id: dbUser.id,
      name: dbUser.name || u.name || "Candidate",
      email: dbUser.email,
      image: u.image || dbUser.avatar,
    };
  } catch (err) {
    console.warn("Could not resolve DB user, falling back to session identity:", err);
    return {
      id: (u.id as string) || u.email,
      name: u.name || "Candidate",
      email: u.email,
      image: u.image,
    };
  }
}

/**
 * Requires an authenticated user inside an API route.
 * Returns a 401 NextResponse when there is no session.
 */
export async function requireUser(): Promise<
  | { user: CurrentUser; response: null }
  | { user: null; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { user, response: null };
}

/**
 * Loads a session and verifies the caller owns it.
 * Returns a NextResponse on failure (404 missing / 403 forbidden).
 */
export async function requireOwnedSession(sessionId: string, userId: string) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Session not found" }, { status: 404 }),
    };
  }
  if (session.userId !== userId) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Forbidden: session does not belong to this user" },
        { status: 403 }
      ),
    };
  }
  return { session, response: null };
}
