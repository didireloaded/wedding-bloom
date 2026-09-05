import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Sparkles, Minimize2, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIChatAssistantProps {
  weddingId?: string;
  isAdmin?: boolean;
}

const AIChatAssistant = ({ weddingId, isAdmin = false }: AIChatAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Sign in required");
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-wedding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: "chat_assistant",
          ...(weddingId ? { weddingId } : {}),
          question: input.trim(),
          history: newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
          isDashboard: true,
          isAdmin,
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
          } catch {
            /* partial */
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      updateAssistant(message === "Sign in required" ? "Please sign in to use the wedding assistant." : message || "Sorry, I couldn't process that. Please try again.");
    }
    setLoading(false);
  };

  const quickQuestions = isAdmin
    ? [
        "Overview of all weddings",
        "Which weddings need attention?",
        "Total guests across all events",
        "Compare RSVP rates",
      ]
    : [
        "How many guests confirmed?",
        "Any dietary restrictions?",
        "Who hasn't RSVP'd yet?",
        "What's the guest breakdown?",
      ];

  return (
    <div className={`overflow-hidden rounded-[24px] border border-border bg-background ${expanded ? "fixed inset-4 z-50 shadow-2xl" : ""}`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-wedding-gold" />
          <h3 className="font-body text-xs tracking-[0.15em] uppercase">
            {isAdmin ? "Owner assistant" : "Wedding assistant"}
          </h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-muted rounded-full transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          {expanded ? (
            <Minimize2 className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Maximize2 className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <div
        ref={scrollRef}
        className={`overflow-y-auto p-4 space-y-3 ${expanded ? "h-[calc(100%-140px)]" : "h-[280px]"}`}
      >
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1} />
            <p className="font-body text-sm text-muted-foreground mb-4">
              {isAdmin
                ? "Ask me about any of your weddings"
                : "Ask me anything about your wedding"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-2 border border-border/50 font-body text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 ${
                  m.role === "user" ? "bg-foreground text-background" : "bg-muted"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="font-body text-sm prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="font-body text-sm">{m.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={isAdmin ? "Ask about any wedding..." : "Ask about your wedding..."}
          className="flex-1 bg-transparent border border-foreground/20 px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground min-h-[44px]"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-2 bg-foreground text-background min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIChatAssistant;
