// app/api/tts/route.ts
import { NextResponse } from "next/server";
import { generateShunyaSpeech } from "@/lib/shunya-tts";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text = "", voice = "Varun", language = "en", speed = 1.0 } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const speechResult = await generateShunyaSpeech({
      text,
      voice,
      language,
      speed,
    });

    return NextResponse.json(speechResult);
  } catch (err: any) {
    console.error("[API TTS Error]:", err);
    return NextResponse.json(
      {
        audioBase64: null,
        voiceUsed: "Varun",
        provider: "browser-fallback",
        error: err.message,
      },
      { status: 200 }
    );
  }
}
