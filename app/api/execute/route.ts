// app/api/execute/route.ts
import { NextResponse } from "next/server";
import { executeCode } from "@/lib/sandbox";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { language = "javascript", code = "", stdin = "" } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code content must be provided as a non-empty string" },
        { status: 400 }
      );
    }

    const result = await executeCode(language, code, stdin);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API Execute Error]:", err);
    return NextResponse.json(
      {
        stdout: "",
        stderr: err.message || "Code execution failed",
        exit_code: 1,
        status: "runtime_error",
      },
      { status: 500 }
    );
  }
}
