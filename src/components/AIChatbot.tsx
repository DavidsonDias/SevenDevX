/**
 * 🤖 AIChatbot - Assistente Virtual Inteligente
 * SevenDevX Enterprise Edition
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  Sparkles,
  Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/i18n/LanguageContext";
import { getOrCreateSafeId } from "@/utils/safeStorage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

// Generate unique visitor ID
const getVisitorId = (): string => {
  return getOrCreateSafeId("sevendevx_visitor_id", "visitor", "local");
};

// Generate session ID
const getSessionId = (): string => {
  return getOrCreateSafeId("sevendevx_session_id", "session", "session");
};

export const AIChatbot = () => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const isAdminCtx = pathname.startsWith("/admin") || pathname.startsWith("/profile");
  // Public: float right above WhatsApp button (WA at bottom-6 + h-14 ⇒ ~bottom-24)
  // Admin: float above mobile bottom nav / coexist with center FAB
  const buttonPosClass = isAdminCtx
    ? "right-4 md:right-6 bottom-[120px] md:bottom-24"
    : "right-6 bottom-24 md:bottom-24";
  const chatPosClass = isAdminCtx
    ? "bottom-[110px] right-4 md:bottom-6 md:right-6"
    : "bottom-24 right-4 md:bottom-24 md:right-6";
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasShaken = useRef(false);
  const lastScrollTop = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show button after delay + trigger shake
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonVisible(true);
      if (!hasShaken.current) {
        hasShaken.current = true;
        setShouldShake(true);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll: show on scroll down, hide on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop.current) {
        setButtonVisible(true);
        if (!hasShaken.current) {
          hasShaken.current = true;
          setShouldShake(true);
        }
      } else {
        setButtonVisible(false);
      }
      lastScrollTop.current = Math.max(scrollTop, 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Olá! 👋 Sou a **7AI**, assistente virtual da SevenDevX.\n\nComo posso ajudar você hoje? Posso responder sobre:\n\n- 🌐 Desenvolvimento Web\n- 📱 Aplicativos\n- 💼 Consultoria\n- 📊 Orçamentos",
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Prepare messages for API
    const apiMessages = [...messages, userMessage]
      .filter(m => m.id !== "welcome")
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId,
          visitorId: getVisitorId(),
        }),
      });

      // Get conversation ID from header
      const newConvId = response.headers.get("X-Conversation-Id");
      if (newConvId && !conversationId) {
        setConversationId(newConvId);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = `assistant_${Date.now()}`;

      // Add empty assistant message
      setMessages(prev => [...prev, {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }]);

      let textBuffer = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line by line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        role: "assistant",
        content: "Desculpe, estou com dificuldades técnicas. 😔\n\nVocê pode entrar em contato pelo WhatsApp: **+55 31 98474-0625**",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && buttonVisible && (
          <motion.div
            className={`fixed ${buttonPosClass} z-[48] flex items-center gap-3 pb-[env(safe-area-inset-bottom)]`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Tooltip - desktop only */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:block pointer-events-none whitespace-nowrap rounded-lg bg-black/90 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Fale com a 7AI
                </motion.span>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setIsOpen(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              animate={shouldShake
                ? { rotate: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.6, ease: "easeInOut" } }
                : { rotate: 0 }
              }
              onAnimationComplete={() => setShouldShake(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Abrir chat com IA"
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.3)] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-shadow duration-300 hover:shadow-[0_4px_30px_rgba(255,255,255,0.5)]"
            >
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full animate-[ai-pulse_2s_ease-out_infinite] bg-white" />

              <Bot className="relative z-10 w-6 h-6" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white z-10"
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : "500px"
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-[110px] right-4 md:bottom-6 md:right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-black border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">7AI Assistant</h3>
                  <p className="text-xs text-white/60">Online • SevenDevX</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label={isMinimized ? "Expandir" : "Minimizar"}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Fechar chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" 
                          ? "bg-white text-black" 
                          : "bg-white/10"
                      }`}>
                        {message.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-white text-black"
                          : "bg-white/10"
                      }`}>
                        <div className="text-sm prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        <span className="text-[10px] opacity-50 mt-1 block">
                          {message.timestamp.toLocaleTimeString("pt-BR", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white/10 rounded-xl px-4 py-3">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="w-2 h-2 bg-white/60 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-2 h-2 bg-white/60 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-2 h-2 bg-white/60 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      disabled={isLoading}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/40 disabled:opacity-50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="bg-white text-black p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Enviar mensagem"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                  <p className="text-[10px] text-white/40 mt-2 text-center">
                    Powered by 7AI • SevenDevX
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
