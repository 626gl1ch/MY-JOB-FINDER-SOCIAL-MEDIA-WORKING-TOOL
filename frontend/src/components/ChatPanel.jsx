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
      <div className="glow-blob w-[400px] h-[400px] bg-[#8B7CFF]/5 top-0 left-10 opacity-60" />

      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#8B7CFF]">
            <Sparkles size={12} className="text-[#8B7CFF]" /> AI Assistant
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white mt-1.5">
            Talk to Gemini Brain
          </h1>
          <p className="text-[#8B93A7] text-xs mt-0.5">
            Brainstorm tech topics, refine platform captions, or adapt logs into updates.
          </p>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6 space-y-6 relative z-10">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto space-y-8 pt-10">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[#8B7CFF]">
                <Sparkles size={24} />
              </div>
              <h2 className="text-lg font-display font-semibold text-white">What are we building today?</h2>
              <p className="text-xs text-[#8B93A7] max-w-sm mx-auto">
                Ask Gemini to draft specific variants, write alt text, or brainstorm algo-trading logs.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUGGESTIONS.map((s, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSuggestionClick(s.prompt)}
                  className="glass-panel rounded-xl p-4 cursor-pointer hover:border-[#8B7CFF]/30 hover:bg-[#121622]/40 transition-all duration-300 group flex flex-col justify-between"
                >
                  <p className="text-xs font-semibold text-[#E4E7EC] group-hover:text-white leading-relaxed">
                    {s.label}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#8B7CFF] mt-3 group-hover:translate-x-1 transition-transform">
                    Send prompt <ArrowRight size={10} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-xs leading-relaxed shadow-lg ${
                m.role === "user"
                  ? "bg-gradient-to-tr from-[#43FFB0] to-[#8B7CFF] text-[#06080C] font-semibold border border-white/10"
                  : "glass-panel text-[#E4E7EC] font-mono border border-white/5 whitespace-pre-wrap"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-panel rounded-2xl px-5 py-3.5 flex items-center gap-2 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF] animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-[10px] font-mono text-[#5C6478] ml-2">Gemini is writing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Tray */}
      <div className="px-8 py-5 border-t border-white/5 relative z-10 bg-[#06080C]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 focus-within:border-[#8B7CFF]/30 transition-all duration-200">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your content prompt here..."
            className="flex-1 bg-transparent outline-none text-xs placeholder:text-[#5C6478] text-white"
          />
          <button 
            onClick={() => send()} 
            className="p-2 rounded-xl bg-white/[0.04] border border-white/5 text-[#8B7CFF] hover:text-white hover:bg-[#8B7CFF] hover:border-[#8B7CFF] transition-all disabled:opacity-30 disabled:hover:bg-white/[0.04] disabled:hover:text-[#8B7CFF]" 
            disabled={loading || !input.trim()}
          >
            <Send size={14} />
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
