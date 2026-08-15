"use client";

// components/chat/ChatContainer.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  PhoneOff,
  User,
  Bot,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Keyboard,
  X,
} from "lucide-react";

export interface MessageTurn {
  id?: string;
  role: "ai" | "candidate" | "system";
  content: string;
  score?: number | null;
  evalNotes?: string | null;
  actionTaken?: string | null;
  followUpType?: string | null;
  modelUsed?: string | null;
  codeSnapshot?: string | null;
  createdAt?: string | Date;
}

interface ChatContainerProps {
  turns: MessageTurn[];
  isLoading: boolean;
  onSendMessage: (text: string) => Promise<void>;
  onWrapUpEarly?: () => void;
  onRequestHint?: () => void;
  candidateName?: string;
  currentStage?: string;
  modelUsed?: string;
  isWsConnected?: boolean;
}

export default function ChatContainer({
  turns,
  isLoading,
  onSendMessage,
  onWrapUpEarly,
  onRequestHint,
  candidateName = "Candidate",
  currentStage,
  modelUsed,
  isWsConnected = false,
}: ChatContainerProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, isLoading, liveTranscript]);

  // Start speech recognition safely
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isRecording) return;
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch {
      // Ignore if already active
    }
  }, [isRecording]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isRecording) return;
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch {
      // Ignore
    }
  }, [isRecording]);

  // Cleanly stop all playing audio and speech synthesis
  const stopAllAudio = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // Handle Speech Output (Shunya Labs Voice with browser fallback)
  const speakText = useCallback(
    async (text: string, onEndedCallback?: () => void) => {
      if (typeof window === "undefined") return;

      stopListening();
      stopAllAudio();
      setIsSpeaking(true);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: "Varun", language: "en" }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioBase64) {
            const audio = new Audio(data.audioBase64);
            audioPlayerRef.current = audio;
            audio.onended = () => {
              setIsSpeaking(false);
              audioPlayerRef.current = null;
              onEndedCallback?.();
            };
            audio.onerror = () => {
              fallbackSpeak(text, onEndedCallback);
            };
            await audio.play();
            return;
          }
        }
      } catch (err) {
        console.warn("Shunya TTS call note:", err);
      }

      fallbackSpeak(text, onEndedCallback);
    },
    [stopListening, stopAllAudio]
  );

  const fallbackSpeak = (text: string, onEndedCallback?: () => void) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/```[\s\S]*?```/g, "Code written in the editor.");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEndedCallback?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEndedCallback?.();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
      onEndedCallback?.();
    }
  };

  // Setup Web Speech API for voice recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const currentSpoken = finalTranscript || interimTranscript;
          if (currentSpoken) {
            setLiveTranscript(currentSpoken);
            setInputText(currentSpoken);

            // Silence auto-send detection (send after 2.2s of silence in phone call mode)
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (currentSpoken.trim().length > 3 && !isLoading) {
                const messageToSend = currentSpoken.trim();
                setLiveTranscript("");
                setInputText("");
                stopListening();
                onSendMessage(messageToSend);
              }
            }, 2200);
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isLoading, onSendMessage, stopListening]);

  // When a new AI message arrives, speak it out loud automatically like a phone call
  const lastTurn = turns[turns.length - 1];
  const lastSpokenTurnIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastTurn || lastTurn.role !== "ai" || isLoading) return;
    const currentId = lastTurn.id || `${turns.length}-${lastTurn.content.slice(0, 30)}`;

    if (lastSpokenTurnIdRef.current !== currentId) {
      lastSpokenTurnIdRef.current = currentId;

      // Speak AI response, then automatically open mic for candidate response like a phone call
      speakText(lastTurn.content, () => {
        if (isCallActive) {
          setTimeout(() => {
            startListening();
          }, 350);
        }
      });
    }
  }, [lastTurn, turns.length, isLoading, isCallActive, speakText, startListening]);

  const toggleMic = () => {
    if (isRecording) {
      stopListening();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    } else {
      stopAllAudio();
      startListening();
    }
  };

  const handleManualSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim() || liveTranscript.trim();
    if (!textToSend || isLoading) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopListening();
    stopAllAudio();
    setInputText("");
    setLiveTranscript("");
    await onSendMessage(textToSend);
  };

  const handleQuickAction = async (prompt: string) => {
    if (isLoading) return;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopListening();
    stopAllAudio();
    await onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#ffffff] rounded-2xl border border-[#e8e5e0] shadow-sm overflow-hidden relative">
      {/* Phone Call Status Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#f7f5f2] border-b border-[#e8e5e0] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1b1b1b] text-[#fffafa] shadow-2xs">
              <PhoneCall className="h-4 w-4" />
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-[#ffffff]"></span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1b1b1b] flex items-center gap-1.5">
              <span>Technical Lead Interviewer</span>
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-[#71717a]">
              <span className="font-mono text-[#059669] font-bold">
                {formatDuration(callDuration)}
              </span>
              <span>•</span>
              <span>
                {isSpeaking
                  ? "Interviewer Speaking..."
                  : isRecording
                  ? "Listening to you..."
                  : "Live Voice Call"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showTextInput
                ? "bg-[#1b1b1b] text-[#fffafa] border-[#1b1b1b]"
                : "bg-[#ffffff] text-[#71717a] hover:text-[#1b1b1b] border-[#e8e5e0]"
            }`}
            title="Toggle keyboard text input"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>

          {onWrapUpEarly && (
            <button
              onClick={onWrapUpEarly}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#e11d48] bg-[#fff1f2] hover:bg-[#ffe4e6] rounded-xl border border-[#fecdd3] transition-all active:scale-[0.98]"
              title="End meeting and generate scorecard"
            >
              <PhoneOff className="h-3 w-3" />
              <span>End Meet</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages / Conversation Transcript */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3 space-y-3 bg-[#fffafa]">
        {turns.map((turn, idx) => {
          const isAi = turn.role === "ai";
          const turnId = turn.id || `turn-${idx}`;

          return (
            <div
              key={turnId}
              className={`flex flex-col ${isAi ? "items-start" : "items-end"} space-y-1`}
            >
              {/* Sender Name */}
              <div className="flex items-center gap-1 px-1 text-[10px] font-semibold text-[#71717a]">
                {isAi ? (
                  <>
                    <Bot className="h-3 w-3 text-[#2563eb]" />
                    <span className="text-[#1b1b1b]">Interviewer</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#1b1b1b]">{candidateName}</span>
                    <User className="h-3 w-3 text-[#059669]" />
                  </>
                )}
              </div>

              {/* Speech Bubble */}
              <div
                className={`group relative max-w-[92%] sm:max-w-[88%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-2xs transition-all ${
                  isAi
                    ? "bg-[#ffffff] text-[#1b1b1b] border border-[#e8e5e0] rounded-tl-xs"
                    : "bg-[#1b1b1b] text-[#fffafa] rounded-tr-xs shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {turn.content}
                </div>

                {isAi && (
                  <div className="mt-2 flex items-center justify-between border-t border-[#f0ede8] pt-1.5 text-xs">
                    <button
                      onClick={() => speakText(turn.content)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-[#71717a] hover:text-[#1b1b1b] transition-colors"
                      title="Replay speech audio"
                    >
                      <Volume2 className="h-3 w-3 text-[#2563eb]" />
                      <span>Replay Voice</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Interim Transcript when Candidate is Speaking */}
        {isRecording && liveTranscript && (
          <div className="flex flex-col items-end space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-1 px-1 text-[10px] font-semibold text-[#059669]">
              <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse" />
              <span>Speaking live...</span>
            </div>
            <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-[#f4f2ee] text-[#1b1b1b] border border-[#e8e5e0] p-3 text-xs shadow-2xs italic">
              &ldquo;{liveTranscript}&rdquo;
            </div>
          </div>
        )}

        {/* AI Analyzing Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs bg-[#ffffff] border border-[#e8e5e0] px-3.5 py-2 text-[#52525b] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1b1b1b] animate-bounce"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#1b1b1b] animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#1b1b1b] animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] ml-1 font-medium">Interviewer is analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Conversational Chips */}
      <div className="px-3 py-1.5 bg-[#f7f5f2] border-t border-[#e8e5e0] flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        <button
          type="button"
          onClick={() => handleQuickAction("Could you please repeat the question or explain with an example?")}
          disabled={isLoading}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#ffffff] hover:bg-[#ebe8e1] text-[#1b1b1b] border border-[#e8e5e0] text-[10px] font-medium transition-colors flex items-center gap-1 shadow-2xs shrink-0"
        >
          <HelpCircle className="h-3 w-3 text-[#2563eb]" />
          <span>Could you repeat that?</span>
        </button>
        <button
          type="button"
          onClick={() => onRequestHint ? onRequestHint() : handleQuickAction("Can you give me a slight hint on the approach?")}
          disabled={isLoading}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#ffffff] hover:bg-[#ebe8e1] text-[#1b1b1b] border border-[#e8e5e0] text-[10px] font-medium transition-colors flex items-center gap-1 shadow-2xs shrink-0"
        >
          <Lightbulb className="h-3 w-3 text-[#d97706]" />
          <span>Request Hint</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction("I'm finished with my answer and ready for the next topic.")}
          disabled={isLoading}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#ffffff] hover:bg-[#ebe8e1] text-[#1b1b1b] border border-[#e8e5e0] text-[10px] font-medium transition-colors flex items-center gap-1 shadow-2xs shrink-0"
        >
          <ArrowRight className="h-3 w-3 text-[#059669]" />
          <span>Ready for Next Topic</span>
        </button>
      </div>

      {/* Optional Text Input Drawer */}
      {showTextInput && (
        <div className="p-2.5 bg-[#ffffff] border-t border-[#e8e5e0] shrink-0">
          <form
            onSubmit={handleManualSend}
            className="w-full flex items-center gap-1.5 animate-in fade-in duration-200"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your response here..."
              className="flex-1 rounded-xl bg-[#f7f5f2] border border-[#e8e5e0] px-3 py-2 text-xs text-[#1b1b1b] placeholder-[#8c8a82] focus:border-[#1b1b1b] focus:bg-[#ffffff] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-3.5 py-2 rounded-xl bg-[#1b1b1b] text-[#fffafa] text-xs font-bold hover:bg-[#333333] disabled:opacity-50 transition-all shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* FIXED BOTTOM-RIGHT CORNER: Tap to Speak Answer / Voice Mic Controller */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#ffffff]/95 backdrop-blur-md p-1.5 rounded-full border border-[#e8e5e0] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <button
          type="button"
          onClick={toggleMic}
          disabled={isLoading}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-full font-bold text-xs shadow-md transition-all active:scale-[0.98] ${
            isRecording
              ? "bg-[#e11d48] text-[#fffafa] animate-pulse ring-4 ring-rose-300"
              : isSpeaking
              ? "bg-[#2563eb] text-[#fffafa] ring-4 ring-blue-200"
              : "bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa]"
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="h-4 w-4" />
              <span>Listening (Tap to Finish)</span>
            </>
          ) : isSpeaking ? (
            <>
              <Volume2 className="h-4 w-4 animate-pulse" />
              <span>Interviewer Speaking...</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>Tap to Speak Answer</span>
            </>
          )}
        </button>

        {/* Quick Send button if candidate has spoken words or typed */}
        {(liveTranscript || inputText) && !isLoading && (
          <button
            type="button"
            onClick={() => handleManualSend()}
            className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-[#059669] hover:bg-[#047857] text-[#fffafa] text-xs font-bold shadow-md transition-all active:scale-[0.98]"
            title="Send spoken answer now"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </button>
        )}
      </div>
    </div>
  );
}
