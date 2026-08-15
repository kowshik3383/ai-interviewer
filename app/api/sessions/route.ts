// app/api/sessions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const user = auth.user;

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { turns: true },
        },
      },
      take: 20,
    });

    return NextResponse.json({ sessions });
  } catch (err: any) {
    console.error("[API Sessions Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch past sessions" },
      { status: 500 }
    );
  }
}
