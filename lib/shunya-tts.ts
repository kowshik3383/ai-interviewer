// lib/shunya-tts.ts

export interface ShunyaTTSOptions {
  text: string;
  voice?: string;
  language?: string;
  model?: string;
  speed?: number;
  format?: "mp3" | "wav";
}

export interface ShunyaTTSResponse {
  audioBase64: string | null;
  audioUrl?: string | null;
  voiceUsed: string;
  provider: "shunyalabs" | "browser-fallback";
}

/**
 * Generates high-fidelity AI speech using the Shunya Labs Voice Platform
 */
export async function generateShunyaSpeech(
  opts: ShunyaTTSOptions
): Promise<ShunyaTTSResponse> {
  const apiKey = process.env.SHUNYALABS_API_KEY || "***REMOVED***";
  const voice = opts.voice || process.env.SHUNYA_TTS_VOICE || "Varun";
  const language = opts.language || "en";
  const model = opts.model || process.env.SHUNYA_ASR_MODEL || "zero-indic";

  // Clean code blocks or symbols for speech synthesis
  const cleanText = opts.text
    .replace(/```[\s\S]*?```/g, "Code snippet provided in editor.")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#*_-]/g, " ")
    .trim();

  if (!cleanText) {
    return {
      audioBase64: null,
      voiceUsed: voice,
      provider: "browser-fallback",
    };
  }

  const endpoint = "https://tts.shunyalabs.ai/v1/audio/speech";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: cleanText,
        voice,
        language,
        model,
        response_format: opts.format || "mp3",
        speed: opts.speed || 1.0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return {
        audioBase64: `data:audio/mp3;base64,${base64}`,
        voiceUsed: voice,
        provider: "shunyalabs",
      };
    } else {
      const errorText = await res.text().catch(() => "");
      console.warn(`[Shunya Labs TTS Error] Status ${res.status}: ${errorText}`);
    }
  } catch (err: any) {
    console.warn(`[Shunya Labs TTS] Network error:`, err.message);
  }

  // Fallback return signal so frontend uses browser speech synthesis
  return {
    audioBase64: null,
    voiceUsed: voice,
    provider: "browser-fallback",
  };
}
