import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Send, Loader2, ArrowLeft, Crown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import fortuneTellerAvatar from "@/assets/fortune-teller-avatar.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fortune-teller`;

// Floating particle component
const FloatingParticle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-accent/40"
    initial={{ y: "100%", x, opacity: 0 }}
    animate={{
      y: "-100vh",
      opacity: [0, 0.8, 0],
      scale: [0.5, 1.5, 0.5],
    }}
    transition={{
      duration: 8 + Math.random() * 6,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

export default function FortuneTeller() {
  const deviceId = useDeviceId();
  const { isBoosted, loading: subLoading, startCheckout } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const sendMessage = useCallback(
    async (overrideInput?: string) => {
      const text = (overrideInput ?? input).trim();
      if (!text || isLoading || !deviceId) return;

      if (showIntro) setShowIntro(false);

      const userMessage: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      let assistantContent = "";

      const upsertAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      };

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            deviceId,
          }),
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 402) toast.error("AI credits exhausted. Please add credits.");
          else if (resp.status === 429) toast.error("The spirits need a moment to rest...");
          else toast.error("The crystal ball has gone dark. Try again.");
          setIsLoading(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") { streamDone = true; break; }
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) upsertAssistant(content);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch (error) {
        console.error("Fortune teller error:", error);
        toast.error("The connection to the spirit realm was severed.");
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, deviceId, messages, showIntro]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (subLoading) {
    return (
      <div className="min-h-screen bg-mystic-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isBoosted) {
    return (
      <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
        <div className="relative z-10 container mx-auto px-4 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Spirit Scanner
          </Link>
          <div className="max-w-md mx-auto text-center space-y-6">
            <img src={fortuneTellerAvatar} alt="Madame Zara" className="w-32 h-32 mx-auto rounded-full border-2 border-accent/50 shadow-[0_0_30px_hsl(280_60%_55%/0.4)]" />
            <h1 className="text-3xl font-bold text-foreground">Madame Zara Awaits</h1>
            <p className="text-muted-foreground">Unlock the Fortune Teller to receive deeply personal psychic readings, tarot pulls, past-life visions, and prophecies from the most powerful seer in the spirit realm.</p>
            <Button
              onClick={async () => { const url = await startCheckout(); if (url) window.open(url, "_blank"); }}
              size="lg"
              className="w-full bg-gradient-to-r from-accent to-purple-700 hover:from-purple-600 hover:to-purple-800"
            >
              <Crown className="w-5 h-5 mr-2" /> Unlock — $1/month
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden flex flex-col">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.7} x={Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400)} />
        ))}
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 py-3 border-b border-accent/20 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex items-center gap-3 max-w-3xl">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img
            src={fortuneTellerAvatar}
            alt="Madame Zara"
            className="w-10 h-10 rounded-full border border-accent/40 shadow-[0_0_15px_hsl(280_60%_55%/0.3)]"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground leading-tight">Madame Zara</h1>
            <p className="text-xs text-accent truncate">Fortune Teller · Clairvoyant · Oracle</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 border border-accent/30">
            <Eye className="w-3 h-3 text-accent" />
            <span className="text-[10px] text-accent font-medium">LIVE</span>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <ScrollArea className="flex-1 relative z-10" ref={scrollRef}>
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <AnimatePresence>
            {showIntro && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 py-8"
              >
                <motion.img
                  src={fortuneTellerAvatar}
                  alt="Madame Zara"
                  className="w-36 h-36 mx-auto rounded-full border-2 border-accent/50 shadow-[0_0_40px_hsl(280_60%_55%/0.4)]"
                  animate={{ boxShadow: [
                    "0 0 30px hsl(280 60% 55% / 0.3)",
                    "0 0 50px hsl(280 60% 55% / 0.5)",
                    "0 0 30px hsl(280 60% 55% / 0.3)",
                  ]}}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Madame Zara</h2>
                  <p className="text-accent text-sm font-medium mb-4">Clairvoyant · Tarot Master · Past Life Reader</p>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                    *The candles flicker as you enter my parlor... The Eye of Eternity, my ancient crystal ball, begins to glow. I have been expecting you.*
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  {[
                    "Tell me my fortune",
                    "Read my tarot cards",
                    "What do you see in my future?",
                    "Read my past lives",
                  ].map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(prompt)}
                      className="text-xs border-accent/30 hover:bg-accent/10 hover:border-accent/50 text-muted-foreground hover:text-foreground transition-all"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="space-y-5">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <img
                    src={fortuneTellerAvatar}
                    alt="Zara"
                    className="w-8 h-8 rounded-full border border-accent/30 shrink-0 mt-1"
                  />
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary/90 text-primary-foreground rounded-br-sm"
                      : "bg-card/70 border border-accent/20 text-foreground rounded-bl-sm backdrop-blur-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_blockquote]:border-l-accent/50 [&_blockquote]:text-accent/80 [&_strong]:text-accent">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-start"
              >
                <img src={fortuneTellerAvatar} alt="Zara" className="w-8 h-8 rounded-full border border-accent/30 shrink-0 mt-1" />
                <div className="bg-card/70 border border-accent/20 rounded-2xl rounded-bl-sm px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-accent/70 text-sm">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ✨ The crystal ball swirls...
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="relative z-10 border-t border-accent/20 bg-background/70 backdrop-blur-xl px-4 py-3">
        <div className="container mx-auto max-w-3xl flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Madame Zara anything..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-card/60 border border-accent/20 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 disabled:opacity-50 backdrop-blur-sm"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="shrink-0 h-11 w-11 rounded-xl bg-accent hover:bg-accent/80"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
