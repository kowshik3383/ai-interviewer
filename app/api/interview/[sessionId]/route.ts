// app/api/interview/[sessionId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { sessionId } = await params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        turns: {
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (err: any) {
    console.error("[API Get Session Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load session details" },
      { status: 500 }
    );
  }
}
