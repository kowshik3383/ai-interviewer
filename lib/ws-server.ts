// lib/ws-server.ts
import { WebSocketServer, WebSocket } from "ws";
import { analyzeLiveCodeAndGenerateHint } from "./hint-engine";
import prisma from "./db";

interface ClientConnection {
  ws: WebSocket;
  sessionId: string;
  candidateName: string;
  language: string;
  difficulty: string;
  currentCode: string;
  lastCodeActivity: number;
  hintCount: number;
  inactivityTimer?: NodeJS.Timeout;
}

const activeConnections = new Map<string, ClientConnection>();

export function setupWebSocketServer(port: number = 3001) {
  const wss = new WebSocketServer({ port });

  console.log(`[WebSocket Server] AI Interviewer Live WS Server listening on ws://localhost:${port}`);

  wss.on("connection", (ws: WebSocket, req) => {
    const url = new URL(req.url || "", `http://localhost:${port}`);
    const sessionId = url.searchParams.get("sessionId") || "default-session";
    const candidateName = url.searchParams.get("name") || "Candidate";
    const language = url.searchParams.get("lang") || "javascript";
    const difficulty = url.searchParams.get("difficulty") || "mid";

    const connectionId = `${sessionId}-${Date.now()}`;
    const client: ClientConnection = {
      ws,
      sessionId,
      candidateName,
      language,
      difficulty,
      currentCode: "",
      lastCodeActivity: Date.now(),
      hintCount: 0,
    };

    activeConnections.set(connectionId, client);

    // Send connection established confirmation
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "Real-time AI Interviewer WebSocket connection active. Live code visibility & voice enabled.",
        sessionId,
      })
    );

    // Setup Inactivity / Struggle Tracker Timer (checks every 15 seconds)
    const checkInactivityInterval = setInterval(async () => {
      if (ws.readyState !== WebSocket.OPEN) {
        clearInterval(checkInactivityInterval);
        return;
      }

      const idleDurationSeconds = Math.round((Date.now() - client.lastCodeActivity) / 1000);

      // If candidate has been working/paused for >= 40 seconds without recent hint
      if (idleDurationSeconds >= 40 && client.hintCount < 3) {
        client.hintCount += 1;
        client.lastCodeActivity = Date.now(); // reset activity so hints don't spam

        // Broadcast typing indicator
        ws.send(JSON.stringify({ type: "ai_thinking", message: "AI interviewer is reviewing your live code..." }));

        try {
          const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { turns: { orderBy: { createdAt: "desc" }, take: 2 } },
          });

          const lastQuestion = session?.turns.find((t) => t.role === "ai")?.content || `Coding problem in ${client.language}`;

          const hintResult = await analyzeLiveCodeAndGenerateHint({
            language: client.language,
            currentCode: client.currentCode,
            lastQuestion,
            difficulty: client.difficulty,
            idleDurationSeconds,
            candidateName: client.candidateName,
          });

          ws.send(
            JSON.stringify({
              type: "proactive_hint",
              hintText: hintResult.hintText,
              suggestedFocus: hintResult.suggestedFocus,
              audioBase64: hintResult.audioBase64,
              idleSeconds: idleDurationSeconds,
              autoSpoken: true,
            })
          );
        } catch (err: any) {
          console.warn("[WS Live Hint Warning]:", err.message);
        }
      }
    }, 15000);

    ws.on("message", async (rawMessage: string) => {
      try {
        const payload = JSON.parse(rawMessage.toString());

        switch (payload.type) {
          case "code_stream": {
            // Live code update from Monaco Editor
            client.currentCode = payload.code || "";
            client.lastCodeActivity = Date.now();
            break;
          }

          case "request_live_hint": {
            // Candidate explicitly requested hint via WebSocket
            client.lastCodeActivity = Date.now();
            ws.send(JSON.stringify({ type: "ai_thinking", message: "Analyzing your code logic..." }));

            const session = await prisma.session.findUnique({
              where: { id: sessionId },
              include: { turns: { orderBy: { createdAt: "desc" }, take: 2 } },
            });

            const lastQuestion = session?.turns.find((t) => t.role === "ai")?.content || "";

            const hintResult = await analyzeLiveCodeAndGenerateHint({
              language: client.language,
              currentCode: payload.code || client.currentCode,
              lastQuestion,
              difficulty: client.difficulty,
              idleDurationSeconds: 15,
              candidateName: client.candidateName,
            });

            ws.send(
              JSON.stringify({
                type: "proactive_hint",
                hintText: hintResult.hintText,
                suggestedFocus: hintResult.suggestedFocus,
                audioBase64: hintResult.audioBase64,
                autoSpoken: true,
              })
            );
            break;
          }

          case "ping": {
            ws.send(JSON.stringify({ type: "pong" }));
            break;
          }
        }
      } catch (err: any) {
        console.error("WS message error:", err);
      }
    });

    ws.on("close", () => {
      clearInterval(checkInactivityInterval);
      activeConnections.delete(connectionId);
    });
  });

  return wss;
}
