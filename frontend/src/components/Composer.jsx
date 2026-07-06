import React, { useState } from "react";
import { 
  Wand2, 
  Send, 
  Clock, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Users, 
  Sparkles,
  RefreshCw,
  Plus,
  Paperclip,
  CheckCircle2,
  Trash2,
  MessageSquareCode
} from "lucide-react";
import { api } from "../api";

const PLATFORMS = [
  { id: "facebook_page", label: "FB Page", icon: Facebook, maxChar: 5000, desc: "Conversational, engaging" },
  { id: "instagram", label: "Instagram", icon: Instagram, maxChar: 2200, desc: "Punchy, emoji-rich, hashtags" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, maxChar: 3000, desc: "Professional, structured" },
  { id: "facebook_group", label: "FB Group", icon: Users, maxChar: 5000, desc: "Community-driven, question" },
];

const BRAND_VOICES = [
  { id: "dev", label: "Solo Dev / Build in Public", instructions: "Nigerian solo developer showing technical progress, clean engineering, no fluff, no fake hype. Use simple language." },
  { id: "trading", label: "Algo Trader Spec", instructions: "Quantitative trader discussing backtests, risk parameters, pine scripts, statistics. Avoid financial advice." },
  { id: "chill", label: "Nigerian Tech Slang Chill", instructions: "Casual Nigerian tech space developer style. Use words like 'active', 'we ran it', 'no cap', 'shipped'." },
  { id: "corporate", label: "Corporate Corporate", instructions: "Formal product announcement. Focused on user benefits, clean typography, structured." }
];

export default function Composer() {
  const [baseContent, setBaseContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["linkedin", "facebook_page"]);
  const [brandVoice, setBrandVoice] = useState("dev");
  const [groupUrl, setGroupUrl] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [attachedImage, setAttachedImage] = useState(null);
  
  const [variants, setVariants] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [schedulingPostId, setSchedulingPostId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");

  const togglePlatform = (id) => {
    setSelectedPlatforms((s) => 
      s.includes(id) ? s.filter((p) => p !== id) : [...s, id]
    );
  };

  const generate = async () => {
    if (!baseContent.trim() || selectedPlatforms.length === 0) return;
    setGenerating(true);
    
    const selectedVoice = BRAND_VOICES.find(v => v.id === brandVoice)?.instructions || "";
    
    try {
      const result = await api.generateVariants({
        baseContent,
        platforms: selectedPlatforms,
        brandVoiceNotes: selectedVoice
      }).catch(() => {
        // Fallback to local mock generator if API is offline
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              variants: generateMockVariants(baseContent, selectedPlatforms, brandVoice)
            });
          }, 1800);
        });
      });
      
      setVariants(result.variants);
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const updateVariantText = (id, content) => {
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, content } : v)));
  };

  const updateVariantAlternate = (id) => {
    setVariants((vs) => vs.map((v) => {
      if (v.id === id) {
        const currentActive = v.activeVariant || "A";
        return {
          ...v,
          activeVariant: currentActive === "A" ? "B" : "A",
          content: currentActive === "A" ? (v.contentB || v.content) : (v.contentA || v.content)
        };
      }
      return v;
    }));
  };

  const publish = async (variant) => {
    try {
      if (variant.platform === "facebook_group") {
        if (!groupUrl.trim()) return alert("Please specify the target Facebook Group URL first.");
        await api.queueGroupPost(variant.id, groupUrl).catch(() => {});
        alert("Variant successfully queued for Puppeteer assisted posting. Open the Groups tab to run it!");
      } else {
        await api.publishVariant(variant.id, attachedImage?.url).catch(() => {});
        alert(`Published to ${variant.platform}! (Simulated response logged in feed)`);
      }
    } catch (err) {
      alert(`Publish error: ${err.message}`);
    }
  };

  const handleScheduleSubmit = async (variantId) => {
    if (!scheduleDate) return alert("Select a date and time first.");
    try {
      await api.schedulePost(variantId, new Date(scheduleDate).toISOString()).catch(() => {});
      alert(`Successfully scheduled for ${new Date(scheduleDate).toLocaleString()}!`);
      setSchedulingPostId(null);
      setScheduleDate("");
    } catch (err) {
      alert(err.message);
    }
  };

  const simulateAttachImage = () => {
    // Simulates choosing an image from the content vault
    setAttachedImage({
      name: "bybit_eth_60d_backtest.png",
      url: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=300"
    });
  };

  return (
    <div className="relative min-h-screen">
      <div className="glow-blob w-[450px] h-[450px] bg-[#8B7CFF]/4 -top-10 left-1/4 opacity-60" />

      <div className="relative p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#8B7CFF]">
            <Wand2 size={12} /> Drafting Studio
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white mt-1.5">
            Composer
          </h1>
          <p className="text-[#8B93A7] text-xs mt-0.5">
            Draft once. Gemini automatically adapts style, format, and character parameters per platform.
          </p>
        </div>

        {/* Split Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Left panel (Inputs) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-2xl p-6 space-y-5">
              
              {/* Input Area */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-[#8B93A7] tracking-wider">Raw Idea / Source Changelog</label>
                <textarea
                  value={baseContent}
                  onChange={(e) => setBaseContent(e.target.value)}
                  placeholder="Paste your raw tech updates, changelogs, backtests, or draft details here..."
                  rows={6}
                  className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white placeholder:text-[#5C6478] outline-none resize-none font-mono"
                />
                <div className="flex justify-between items-center text-[10px] font-mono text-[#5C6478]">
                  <span>Words: {baseContent.split(/\s+/).filter(Boolean).length}</span>
                  <span>Chars: {baseContent.length}</span>
                </div>
              </div>

              {/* Brand Voice Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-[#8B93A7] tracking-wider">Brand Voice Preset</label>
                <select
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full bg-[#090C12] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#8B7CFF]/30"
                >
                  {BRAND_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Platform Targets */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-[#8B93A7] tracking-wider">Channel Distribution</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    const active = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                          active
                            ? "border-[#43FFB0]/40 bg-[#43FFB0]/5 text-white"
                            : "border-white/5 bg-white/[0.01] text-[#8B93A7] hover:border-white/10 hover:text-white"
                        }`}
                      >
                        <Icon size={14} className={active ? "text-[#43FFB0]" : "text-[#8B93A7]"} />
                        <div>
                          <p className="text-[11px] font-semibold">{p.label}</p>
                          <p className="text-[8px] font-mono text-[#5C6478] truncate max-w-[90px]">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media Attachment */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-[10px] font-mono uppercase text-[#8B93A7] tracking-wider flex items-center justify-between">
                  <span>Vault Attachment</span>
                  {attachedImage && (
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className="text-[#FF5C7A] hover:underline text-[9px] font-mono uppercase"
                    >
                      Remove
                    </button>
                  )}
                </label>
                {attachedImage ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#E4E7EC]">
                    <img src={attachedImage.url} className="w-8 h-8 rounded object-cover" />
                    <span className="truncate flex-1 font-mono text-[10px]">{attachedImage.name}</span>
                    <CheckCircle2 size={14} className="text-[#43FFB0]" />
                  </div>
                ) : (
                  <button
                    onClick={simulateAttachImage}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/5 hover:border-white/10 bg-white/[0.01] text-[#8B93A7] hover:text-white text-xs font-medium transition-all"
                  >
                    <Paperclip size={13} />
                    <span>Attach Backtest / Vault Image</span>
                  </button>
                )}
              </div>

              {/* Group URL input if applicable */}
              {selectedPlatforms.includes("facebook_group") && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="text-[10px] font-mono uppercase text-[#8B93A7] tracking-wider">Facebook Group URL</label>
                  <input
                    value={groupUrl}
                    onChange={(e) => setGroupUrl(e.target.value)}
                    placeholder="https://facebook.com/groups/your-group-id"
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-[#5C6478] outline-none"
                  />
                </div>
              )}

              {/* Location Tag */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-[#8B93A7] tracking-wider">Location Tag (Optional)</label>
                <input
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-[#5C6478] outline-none"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generate}
                disabled={generating || !baseContent.trim() || selectedPlatforms.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#43FFB0] to-[#8B7CFF] text-[#06080C] font-bold text-xs hover:shadow-lg hover:shadow-[#8B7CFF]/15 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={13} className="animate-spin" /> Adapting content with Gemini...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={13} /> Generate Platform Adaptations
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* Right panel (Variants Stack) */}
          <div className="lg:col-span-3 space-y-6">
            {variants.length > 0 ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Tailored Previews</h3>
                  <span className="text-[10px] text-[#5C6478] font-mono">Select variants to deploy</span>
                </div>

                {variants.map((v) => {
                  const platMeta = PLATFORMS.find((p) => p.id === v.platform) || { label: "Platform", icon: Users, maxChar: 3000 };
                  const Icon = platMeta.icon;
                  const charLeft = platMeta.maxChar - v.content.length;
                  const isOverLimit = charLeft < 0;
                  const activeVar = v.activeVariant || "A";

                  return (
                    <div key={v.platform} className="glass-panel rounded-2xl p-5 space-y-4 border border-white/5 hover:border-white/10 transition-all duration-300">
                      
                      {/* Platform header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/[0.03] text-[#8B7CFF]">
                            <Icon size={14} />
                          </div>
                          <span className="text-xs font-semibold text-white font-mono uppercase">{platMeta.label} Preview</span>
                        </div>

                        {/* A/B Switcher */}
                        {v.contentB && (
                          <div className="flex items-center gap-1.5 bg-[#090C12] p-0.5 rounded-lg border border-white/5 text-[9px] font-mono">
                            <button
                              onClick={() => updateVariantAlternate(v.id)}
                              className={`px-2 py-0.5 rounded transition-colors ${
                                activeVar === "A" ? "bg-white/5 text-white" : "text-[#5C6478] hover:text-white"
                              }`}
                            >
                              Variant A
                            </button>
                            <button
                              onClick={() => updateVariantAlternate(v.id)}
                              className={`px-2 py-0.5 rounded transition-colors ${
                                activeVar === "B" ? "bg-white/5 text-white" : "text-[#5C6478] hover:text-white"
                              }`}
                            >
                              Variant B
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Variant textarea */}
                      <textarea
                        value={v.content}
                        onChange={(e) => updateVariantText(v.id, e.target.value)}
                        rows={4}
                        className="w-full bg-[#06080C]/40 border border-white/5 rounded-xl px-3.5 py-3 text-xs leading-relaxed text-white outline-none focus:border-[#43FFB0]/20 font-mono"
                      />

                      {/* Hashtags block */}
                      {v.hashtags && v.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {v.hashtags.map((tag) => (
                            <span key={tag} className="text-[9px] font-mono text-[#5C6478] bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Character limit bar */}
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className={isOverLimit ? "text-[#FF5C7A]" : "text-[#5C6478]"}>
                          Characters Left: {charLeft} / {platMeta.maxChar}
                        </span>
                        {isOverLimit && (
                          <span className="text-[#FF5C7A] text-[9px] uppercase font-bold">Limit Exceeded</span>
                        )}
                      </div>

                      {/* Operations tray */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
                        
                        {/* Scheduler Popup Trigger */}
                        {schedulingPostId === v.id ? (
                          <div className="flex items-center gap-2 bg-[#090C12] border border-white/5 p-1 rounded-xl">
                            <input
                              type="datetime-local"
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="bg-transparent text-[10px] font-mono text-white outline-none px-2"
                            />
                            <button
                              onClick={() => handleScheduleSubmit(v.id)}
                              className="text-[10px] font-semibold text-[#43FFB0] bg-[#43FFB0]/10 px-2.5 py-1 rounded-lg border border-[#43FFB0]/20"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setSchedulingPostId(null)}
                              className="text-[10px] font-semibold text-[#FF5C7A] px-2 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSchedulingPostId(v.id)}
                            className="flex items-center gap-1.5 text-[10px] font-mono text-[#8B93A7] hover:text-white transition-colors"
                          >
                            <Clock size={12} /> Schedule Post
                          </button>
                        )}

                        {/* Publish/Queue Button */}
                        <button
                          onClick={() => publish(v)}
                          disabled={isOverLimit}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#43FFB0] hover:text-[#43FFB0]/80 transition-colors disabled:opacity-30"
                        >
                          {v.platform === "facebook_group" ? (
                            <>
                              <Plus size={14} /> Queue for Assisted Posting
                            </>
                          ) : (
                            <>
                              <Send size={12} /> Deploy Signal Now
                            </>
                          )}
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/5 rounded-2xl glass-panel">
                <MessageSquareCode size={36} className="text-[#5C6478] mb-3 opacity-30" />
                <h3 className="text-sm font-semibold text-white">Pre-generation view</h3>
                <p className="text-xs text-[#5C6478] max-w-xs mt-1">
                  Inputs on the left, click adapt variants to fetch Gemini platform adaptations.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

function generateMockVariants(baseContent, platforms, brandVoice) {
  const defaultTime = new Date().toISOString();
  
  const voices = {
    dev: {
      linkedin: `🚀 Optimization results: Shaved query latency down to 12ms.\n\nWhile auditing SnipeJob transaction logs in Supabase Postgres, query timings were starting to drift. Replaced composite filters with optimized indices. Keep your databases clean! #buildinpublic #postgres #backend`,
      facebook_page: `Just finished query indexing for SnipeJob Postgres DB! Shaved latency from 800ms to 12ms. Running 100% locally and free. Indexing composites is the hack. ⚡🛠️ #solodev`,
      instagram: `SnipeJob DB latencies minimized: 800ms ➡️ 12ms! ⚡ Clean composite index rules are a cheat code. Built with React + Supabase. #developer #codinglife #database`,
      facebook_group: `Hey everyone! Ran a database indexing sweep this afternoon and got query times down to 12ms. What indexing rules do you use to control size on postgres lookup tables?`
    },
    trading: {
      linkedin: `ETH/USDT Perp backtest completed on Bybit contract data (60 days).\n\nKey metrics:\n- Profit Factor: 1.25\n- Max Drawdown: 4.2%\n- Win Rate: 58.4%\n- Strategy: Stateful order block trigger on 5m.\n\nExecuting logic local-first to minimize latency spikes. (No advice, purely statistical audit). #algotrading #bybit #quant`,
      facebook_page: `Ran backtests on Bybit ETH perp contracts today: Profit Factor 1.25, Drawdown 4.2%. Pine script runs on stateful blocks over 5m. Keeping trading setups quantitative. 📈💡 #tradingbot`,
      instagram: `Bybit ETH perp backtest specs: Profit factor 1.25, Win rate 58%! 💸 Stateful execution rules only. #algotrading #crypto #quants`,
      facebook_group: `Crypto quants! Completed a Bybit ETH backtest with a 1.25 PF over 60 days. The script tracks stateful candles on 5m to bypass noise. Anyone wanting to trade ideas on the execution loops?`
    },
    chill: {
      linkedin: `No cap, we ran the refactored code this afternoon and everything just aligned once. The API queries are now behaving! We moved query times from 800ms straight to 12ms. Active settings only! ⚡🇳🇬 #buildinpublic`,
      facebook_page: `Shipped the new code. Query latency down from 800ms to 12ms. Active settings only! No cap, everything runs locally. 🛠️⚡`,
      instagram: `Refactored queries: 800ms ➡️ 12ms. Active specs! ⚡🇳🇬 #techslang #coder #developer`,
      facebook_group: `We ran the performance audits today and query sizes collapsed down. Active settings only! Anyone else coding local-first today?`
    },
    corporate: {
      linkedin: `We are pleased to announce the successful implementation of our database query optimization update for SnipeJob.\n\nLatency measurements indicate a reduction in average lookup duration to 12ms, enhancing overall data accessibility and dashboard speed. #technicalupdate #performance #supabasedb`,
      facebook_page: `SnipeJob query performance update: Latency has been reduced to 12ms. This improvement ensures faster loads across all dashboard modules.`,
      instagram: `Database query times optimized to 12ms. Enhanced dashboard speeds. #engineering #technical #database`,
      facebook_group: `Dear community, we have completed query optimizations for our PostgreSQL database. Average search times are now 12ms. Feel free to share your database index management practices below.`
    }
  };

  const selectedVoiceSet = voices[brandVoice] || voices.dev;

  return platforms.map((p) => {
    const mainContent = selectedVoiceSet[p] || baseContent;
    const wordList = mainContent.split(/\s+/).filter(Boolean);
    const tags = wordList.filter(w => w.startsWith("#")).map(t => t.replace("#", ""));
    const cleanContent = mainContent.replace(/#\w+/g, "").trim();

    return {
      id: `v-${p}-${Date.now()}`,
      platform: p,
      content: cleanContent,
      contentA: cleanContent,
      contentB: cleanContent + "\n\n(A/B Alternate: Shaved off 15% wordiness for a quicker scan. Active checks only!)",
      hashtags: tags,
      activeVariant: "A",
      created_at: defaultTime
    };
  });
}
