import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface WeddingChatAssistantProps {
  weddingId: string;
  weddingData?: unknown;
  events?: unknown[];
  gallery?: unknown[];
  updates?: unknown[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showMobileLauncher: boolean;
}

const WeddingChatAssistant = ({ weddingId, open, onOpenChange, showMobileLauncher }: WeddingChatAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-wedding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "chat_assistant",
          weddingId,
          question: input.trim(),
          history: newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const payload = await resp.json().catch(() => null);
        throw new Error(payload?.error || "Assistant request failed");
      }
      if (!resp.body) throw new Error("Assistant response was empty");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) updateAssistant(c);
          } catch { /* partial */ }
        }
      }
    } catch (error) {
      updateAssistant(error instanceof Error ? error.message : "Sorry, I couldn't process that. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Close wedding assistant" : "Open wedding assistant"}
        className={`fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-foreground text-background items-center justify-center shadow-lg hover:scale-105 transition-transform md:bottom-6 md:right-6 ${showMobileLauncher || open ? "flex" : "hidden md:flex"}`}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 right-4 z-50 flex max-h-[65vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[24px] border border-white/15 bg-[#1d1d1d] text-white shadow-2xl sm:right-6 sm:w-96 md:bottom-24"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/15 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#ff6245]" />
              <h3 className="font-body text-base font-semibold">Wedding assistant</h3>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-8 h-8 mx-auto text-[#ff6245] mb-3" strokeWidth={1} />
                  <p className="font-body text-sm text-white/75">Ask me anything about the wedding!</p>
                  <div className="mt-4 space-y-2">
                    {["What time is the ceremony?", "Where is the venue?", "Is there parking?"].map((q) => (
                      <button key={q} onClick={() => { setInput(q); }} className="block w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left font-body text-xs text-white/80 transition-colors hover:bg-white/10">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-[#ff6245] text-black" : "bg-white/10 text-white"}`}>
                    {m.role === "assistant" ? (
                      <div className="font-body text-sm prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="font-body text-sm">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/15 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask a question..."
                className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 font-body text-sm text-white placeholder:text-white/50 focus:border-[#ff6245] focus:outline-none"
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()} aria-label="Send message" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[#ff6245] p-2 text-black disabled:opacity-30">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WeddingChatAssistant;
