import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, AlertCircle, HelpCircle, ArrowRight } from "lucide-react";
import { api } from "../api";

const SUGGESTIONS = [
  { label: "Brainstorm 5 ideas for a trading bot updates post", prompt: "Give me 5 punchy content ideas explaining my progress building my Bybit crypto trading bot. Focus on stateful executions." },
  { label: "Draft a LinkedIn post about SnipeJob DB audits", prompt: "Write a professional LinkedIn post about optimizing a Postgres database in Supabase, halving query times. Keep it technical." },
  { label: "Translate draft to Nigerian English/Igbo-slang chill", prompt: "Rewrite this draft in a very relaxed, Nigerian-tech-space developer style (e.g., using terms like 'no cap', 'we ran it', 'active'): 'I shipped the refactored code today.'" },
  { label: "Generate trading risk disclaimer", prompt: "Write a concise, professional financial risk disclaimer for my trading strategy posts. Direct and legally clean." },
];

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.getChatHistory()
      .then((data) => {
        if (data && data.length > 0) {
          setMessages(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;
    
    if (!textToSend) setInput("");

    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    try {
      const response = await api.sendChat(text).catch(() => {
        // Mock reply fallback if local server API is offline
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ reply: getMockReply(text) });
          }, 1500);
        });
      });
      setMessages((m) => [...m, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (promptText) => {
    send(promptText);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Ambient gradient */}
      <div className="glow-blob w-[500px] h-[500px] bg-[#D900FF]/10 top-0 left-0 opacity-50" />

      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 relative z-10 flex items-center justify-between bg-black/20 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#D900FF]">
            <Sparkles size={14} className="text-[#D900FF] pulse-dot drop-shadow-[0_0_8px_rgba(217,0,255,0.8)]" /> AI Assistant
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white mt-2">
            Talk to Gemini Brain
          </h1>
          <p className="text-[#A1A1AA] text-[13px] mt-1 font-light">
            Brainstorm tech topics, refine platform captions, or adapt logs into updates.
          </p>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6 space-y-6 relative z-10">
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto space-y-10 pt-12">
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-[#D900FF]/10 border border-[#D900FF]/20 text-[#D900FF] shadow-[0_0_15px_rgba(217,0,255,0.3)]">
                <Sparkles size={28} />
              </div>
              <h2 className="text-2xl font-display font-semibold text-white">What are we building today?</h2>
              <p className="text-[13px] text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
                Ask Gemini to draft specific variants, write alt text, or brainstorm algo-trading logs.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SUGGESTIONS.map((s, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSuggestionClick(s.prompt)}
                  className="glass-panel rounded-2xl p-5 cursor-pointer hover:border-[#D900FF]/30 hover:bg-[#D900FF]/[0.02] hover:shadow-[0_0_15px_rgba(217,0,255,0.1)] transition-all duration-300 group flex flex-col justify-between"
                >
                  <p className="text-[13px] font-medium text-[#E4E7EC] group-hover:text-white leading-relaxed">
                    {s.label}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D900FF] mt-4 group-hover:translate-x-1.5 transition-transform">
                    Send prompt <ArrowRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-6 py-4 text-[13px] leading-relaxed shadow-lg ${
                m.role === "user"
                  ? "bg-gradient-to-tr from-[#00E5FF] to-[#D900FF] text-black font-semibold border border-white/10"
                  : "glass-panel text-[#E4E7EC] font-mono border border-white/5 whitespace-pre-wrap drop-shadow-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-panel rounded-2xl px-6 py-4 flex items-center gap-2 border border-white/5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#D900FF] animate-bounce shadow-[0_0_8px_rgba(217,0,255,0.8)]" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-[#D900FF] animate-bounce shadow-[0_0_8px_rgba(217,0,255,0.8)]" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-[#D900FF] animate-bounce shadow-[0_0_8px_rgba(217,0,255,0.8)]" style={{ animationDelay: "300ms" }} />
              <span className="text-[11px] font-mono text-[#A1A1AA] ml-3">Gemini is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Tray */}
      <div className="px-8 py-6 border-t border-white/5 relative z-10 bg-[#05050A]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-2 pl-6 focus-within:border-[#D900FF]/40 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_15px_rgba(217,0,255,0.1)] transition-all duration-300">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your content prompt here..."
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[#52525B] text-white py-2"
          />
          <button 
            onClick={() => send()} 
            className="p-3 rounded-xl bg-gradient-to-tr from-[#00E5FF]/10 to-[#D900FF]/10 border border-white/5 text-white hover:border-[#D900FF]/30 hover:shadow-[0_0_15px_rgba(217,0,255,0.3)] transition-all duration-300 disabled:opacity-30 disabled:hover:border-white/5 disabled:hover:shadow-none" 
            disabled={loading || !input.trim()}
          >
            <Send size={18} className="text-white drop-shadow-md" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getMockReply(userPrompt) {
  const promptLower = userPrompt.toLowerCase();
  
  if (promptLower.includes("trading") || promptLower.includes("bybit")) {
    return `Here are 5 content ideas for your algo trading updates:

1. **The Order Block Trigger**: Explain why stateful execution on 5m is safer than checking conditions on a single candle. (Tone: Educational, Tech-heavy).
2. **Backtesting vs Live Reality**: Share the stats comparing your Bybit backtests (1.25 PF) vs live latency offsets on your local CPU.
3. **Guardrails & Disclaimers**: Write about how your code handles automatic trade termination when position sizes exceed safe leverage bounds.
4. **My Bot Setup**: Post a photo of your terminal log outputs and explain the node.js cron loops checking Bybit WebSocket streams.
5. **IG/LinkedIn contrast**: Discuss how LinkedIn wants the logic breakdown, while Instagram likes a screenshot showing the clean profit factor statistic.

Would you like me to draft a LinkedIn variant for any of these?`;
  }
  
  if (promptLower.includes("linkedin") || promptLower.includes("postgres") || promptLower.includes("indexing")) {
    return `Here is a LinkedIn draft about the SnipeJob performance audit:

---
🚀 Optimizing database indexing doesn't just cut query times — it keeps your cloud bills at zero.

During my afternoon audit of SnipeJob (running on Supabase Postgres), I realized my lookups on \`audit_events\` were slowing down as transaction logs scaled.

The Fix:
1. Replaced generic b-tree indexing with a composite index on \`(account_id, created_at DESC)\`.
2. Restructured search scopes to avoid unnecessary sequential scans.
3. Shaved query latency from 860ms down to 12ms.

Takeaway: Before scaling cloud hardware, audit your database queries. A simple index restructuring is completely free and often solves the lag.

#buildinpublic #solodeveloper #postgres #database #backend
---`;
  }

  if (promptLower.includes("nigerian") || promptLower.includes("slang") || promptLower.includes("chill")) {
    return `No cap, we ran the refactored code this afternoon and everything just aligned once. The API queries are now behaving! We moved query times from 800ms straight to 12ms. Active settings only! ⚡🇳🇬`;
  }

  if (promptLower.includes("disclaimer")) {
    return `⚠️ **Trading Risk Disclaimer:**
The strategy backtests shown reflect historical performance under ideal simulation parameters. Trading cryptocurrencies involves substantial risk and leverage can lead to rapid capital loss. This bot is for personal development and testing purposes only. Past performance does not guarantee future results. Make your own calculations.`;
  }

  return `I've analyzed your prompt: "${userPrompt}"

As your Glitch Broadcast assistant, here is a quick direct take:
- To optimize this for LinkedIn: Lead with a bold, technical result and structure with clear line breaks.
- To optimize this for Instagram: Shorten it by 60%, add a visual screenshot description, and place 5 hashtags.
- To optimize this for Facebook Pages: Keep the tone friendly and end with a question to drive comments.

What should we edit next?`;
}
