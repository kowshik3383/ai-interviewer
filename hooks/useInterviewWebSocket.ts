"use client";

// hooks/useInterviewWebSocket.ts
import { useEffect, useRef, useState, useCallback } from "react";

export interface LiveHint {
  hintText: string;
  suggestedFocus?: string;
  audioBase64?: string | null;
  timestamp: number;
}

interface UseInterviewWebSocketProps {
  sessionId: string;
  candidateName?: string;
  language?: string;
  difficulty?: string;
  onHintReceived?: (hint: LiveHint) => void;
}

export function useInterviewWebSocket({
  sessionId,
  candidateName = "Candidate",
  language = "javascript",
  difficulty = "mid",
  onHintReceived,
}: UseInterviewWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeHint, setActiveHint] = useState<LiveHint | null>(null);
  const [isAiObserving, setIsAiObserving] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSentCodeRef = useRef<string>("");
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio safely from Shunya Labs Base64 or fallback to Web Speech API
  const playSpeechAudio = useCallback((text: string, audioBase64?: string | null) => {
    if (typeof window === "undefined") return;

    if (audioBase64) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(audioBase64);
        audioRef.current = audio;
        setIsAudioPlaying(true);
        audio.onended = () => setIsAudioPlaying(false);
        audio.onerror = () => {
          // If Base64 playback fails, fallback to speech synthesis
          fallbackSpeechSynthesis(text);
        };
        audio.play().catch(() => fallbackSpeechSynthesis(text));
        return;
      } catch (err) {
        console.warn("Shunya audio play exception, falling back:", err);
      }
    }

    fallbackSpeechSynthesis(text);
  }, []);

  const fallbackSpeechSynthesis = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsAudioPlaying(true);
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Connect to WebSocket Server
  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;

    const wsUrl = `ws://${window.location.hostname}:3001?sessionId=${encodeURIComponent(
      sessionId
    )}&name=${encodeURIComponent(candidateName)}&lang=${encodeURIComponent(
      language
    )}&difficulty=${encodeURIComponent(difficulty)}`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    function connect() {
      try {
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setIsAiObserving(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "proactive_hint") {
              const newHint: LiveHint = {
                hintText: data.hintText,
                suggestedFocus: data.suggestedFocus,
                audioBase64: data.audioBase64,
                timestamp: Date.now(),
              };

              setActiveHint(newHint);
              onHintReceived?.(newHint);

              // Automatically speak hint with Shunya Labs Voice
              if (data.autoSpoken) {
                playSpeechAudio(data.hintText, data.audioBase64);
              }
            }
          } catch (err) {
            console.error("WS parse error:", err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Try reconnecting after 4s
          reconnectTimeout = setTimeout(connect, 4000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        console.warn("WebSocket init error:", err);
      }
    }

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [sessionId, candidateName, language, difficulty, onHintReceived, playSpeechAudio]);

  // Client-side fallback idle timer (if WebSocket server is offline)
  const triggerClientSideHint = useCallback(async (currentCode: string) => {
    try {
      const res = await fetch(`/api/interview/${sessionId}/live-hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentCode, idleDurationSeconds: 40 }),
      });
      if (res.ok) {
        const hint = await res.json();
        const newHint: LiveHint = {
          hintText: hint.hintText,
          suggestedFocus: hint.suggestedFocus,
          audioBase64: hint.audioBase64,
          timestamp: Date.now(),
        };
        setActiveHint(newHint);
        onHintReceived?.(newHint);
        playSpeechAudio(hint.hintText, hint.audioBase64);
      }
    } catch (err) {
      console.warn("Client fallback hint error:", err);
    }
  }, [sessionId, onHintReceived, playSpeechAudio]);

  // Stream live code changes
  const sendCodeStream = useCallback(
    (code: string) => {
      lastSentCodeRef.current = code;

      // 1. Send over WebSocket if connected
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "code_stream",
            code,
            timestamp: Date.now(),
          })
        );
      }

      // 2. Reset client-side idle tracker (40 seconds)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        // Trigger live proactive hint when candidate takes too much time or is stuck
        triggerClientSideHint(code);
      }, 40000);
    },
    [triggerClientSideHint]
  );

  const requestLiveHint = useCallback(
    (code: string) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "request_live_hint",
            code,
          })
        );
      } else {
        triggerClientSideHint(code);
      }
    },
    [triggerClientSideHint]
  );

  const dismissHint = useCallback(() => {
    setActiveHint(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  }, []);

  return {
    isConnected,
    isAiObserving,
    isAudioPlaying,
    activeHint,
    sendCodeStream,
    requestLiveHint,
    dismissHint,
    playSpeechAudio,
  };
}
