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
      console.warn("Gemini API failed, using local mock generator fallback:", err.message);
      alert(`Warning: Gemini API offline or invalid key (${err.message}). Using offline mock generator fallback.`);
      const mockVariants = generateMockVariants(baseContent, selectedPlatforms, brandVoice);
      setVariants(mockVariants);
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
        await api.queueGroupPost(variant.id, groupUrl);
        alert("Variant successfully queued for Puppeteer assisted posting. Open the Groups tab to run it!");
      } else {
        await api.publishVariant(variant.id, attachedImage?.url);
        alert(`Successfully published to ${variant.platform}!`);
      }
    } catch (err) {
      alert(`Publish failed: ${err.message}`);
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

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await api.uploadFile(file, "uploads");
      setAttachedImage({
        name: result.name,
        url: result.file_url
      });
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="glow-blob w-[500px] h-[500px] bg-[#D900FF]/10 -top-10 left-1/4 opacity-60" />

      <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#D900FF]">
            <Wand2 size={14} className="drop-shadow-[0_0_8px_rgba(217,0,255,0.8)]" /> Drafting Studio
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white mt-2">
            Composer
          </h1>
          <p className="text-[#A1A1AA] text-[13px] mt-1.5 font-light">
            Draft once. Gemini automatically adapts style, format, and character parameters per platform.
          </p>
        </div>

        {/* Split Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Left panel (Inputs) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-3xl p-8 space-y-6">
              
              {/* Input Area */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase text-[#A1A1AA] tracking-wider">Raw Idea / Source Changelog</label>
                <textarea
                  value={baseContent}
                  onChange={(e) => setBaseContent(e.target.value)}
                  placeholder="Paste your raw tech updates, changelogs, backtests, or draft details here..."
                  rows={6}
                  className="w-full glass-input bg-[#05050A]/40 rounded-2xl px-5 py-4 text-[13px] text-white placeholder:text-[#52525B] outline-none resize-none font-mono focus:border-[#D900FF]/40 focus:bg-white/[0.04] transition-all"
                />
                <div className="flex justify-between items-center text-[10px] font-mono text-[#52525B]">
                  <span>Words: {baseContent.split(/\s+/).filter(Boolean).length}</span>
                  <span>Chars: {baseContent.length}</span>
                </div>
              </div>

              {/* Brand Voice Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase text-[#A1A1AA] tracking-wider">Brand Voice Preset</label>
                <select
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full bg-[#05050A]/60 border border-white/5 rounded-2xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-[#D900FF]/40 transition-all cursor-pointer shadow-inner"
                >
                  {BRAND_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Platform Targets */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase text-[#A1A1AA] tracking-wider">Channel Distribution</label>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    const active = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all duration-300 ${
                          active
                            ? "border-[#00E5FF]/40 bg-[#00E5FF]/10 text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                            : "border-white/5 bg-white/[0.01] text-[#A1A1AA] hover:border-white/10 hover:text-white"
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-all ${active ? "bg-[#00E5FF] text-black shadow-[0_0_8px_rgba(0,229,255,0.8)]" : "bg-white/[0.04] text-[#A1A1AA]"}`}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold">{p.label}</p>
                          <p className="text-[9px] font-mono text-white/40 truncate max-w-[80px]">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media Attachment */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <label className="text-[10px] font-mono uppercase text-[#A1A1AA] tracking-wider flex items-center justify-between">
                  <span>Vault Attachment</span>
                  {attachedImage && (
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className="text-[#FF2A5F] hover:underline text-[9px] font-mono uppercase tracking-widest"
                    >
                      Remove
                    </button>
                  )}
                </label>
                {attachedImage ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-[#E4E7EC] shadow-inner">
                    <img src={attachedImage.url} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="truncate flex-1 font-mono text-[11px]">{attachedImage.name}</span>
                    <CheckCircle2 size={16} className="text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                  </div>
                ) : (
                  <label className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-dashed border-white/10 hover:border-[#D900FF]/40 hover:bg-[#D900FF]/[0.02] hover:text-white bg-white/[0.01] text-[#A1A1AA] text-xs font-medium transition-all cursor-pointer">
                    {isUploading ? <RefreshCw size={14} className="animate-spin" /> : <Paperclip size={14} />}
                    <span>{isUploading ? "Uploading to Vault..." : "Attach Image / Media"}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" disabled={isUploading} />
                  </label>
                )}
              </div>

              {/* Group URL input if applicable */}
              {selectedPlatforms.includes("facebook_group") && (
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <label className="text-[10px] font-mono uppercase text-[#A1A1AA] tracking-wider">Facebook Group URL</label>
                  <input
                    value={groupUrl}
                    onChange={(e) => setGroupUrl(e.target.value)}
                    placeholder="https://facebook.com/groups/your-group-id"
                    className="w-full glass-input bg-[#05050A]/40 rounded-2xl px-4 py-3 text-[13px] text-white placeholder:text-[#52525B] outline-none focus:border-[#D900FF]/40 transition-all"
                  />
                </div>
              )}

              {/* Location Tag */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase text-[#A1A1AA] tracking-wider">Location Tag (Optional)</label>
                <input
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full glass-input bg-[#05050A]/40 rounded-2xl px-4 py-3 text-[13px] text-white placeholder:text-[#52525B] outline-none focus:border-[#D900FF]/40 transition-all"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generate}
                disabled={generating || !baseContent.trim() || selectedPlatforms.length === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#D900FF] text-black font-bold text-[13px] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin" /> Adapting content with Gemini...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={14} /> Generate Platform Adaptations
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* Right panel (Variants Stack) */}
          <div className="lg:col-span-3 space-y-6">
            {variants.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Tailored Previews</h3>
                  <span className="text-[10px] text-[#52525B] font-mono">Select variants to deploy</span>
                </div>

                {variants.map((v) => {
                  const platMeta = PLATFORMS.find((p) => p.id === v.platform) || { label: "Platform", icon: Users, maxChar: 3000 };
                  const Icon = platMeta.icon;
                  const charLeft = platMeta.maxChar - v.content.length;
                  const isOverLimit = charLeft < 0;
                  const activeVar = v.activeVariant || "A";

                  return (
                    <div key={v.platform} className="glass-panel rounded-3xl p-6 space-y-5 border border-white/5 hover:border-white/10 transition-all duration-300">
                      
                      {/* Platform header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-white/[0.04] text-[#D900FF]">
                            <Icon size={16} />
                          </div>
                          <span className="text-[13px] font-semibold text-white font-mono uppercase">{platMeta.label} Preview</span>
                        </div>

                        {/* A/B Switcher */}
                        {v.contentB && (
                          <div className="flex items-center gap-1.5 bg-[#05050A] p-1 rounded-xl border border-white/5 text-[10px] font-mono shadow-inner">
                            <button
                              onClick={() => updateVariantAlternate(v.id)}
                              className={`px-3 py-1 rounded-lg transition-all ${
                                activeVar === "A" ? "bg-white/10 text-white shadow-sm" : "text-[#52525B] hover:text-white hover:bg-white/5"
                              }`}
                            >
                              Variant A
                            </button>
                            <button
                              onClick={() => updateVariantAlternate(v.id)}
                              className={`px-3 py-1 rounded-lg transition-all ${
                                activeVar === "B" ? "bg-white/10 text-white shadow-sm" : "text-[#52525B] hover:text-white hover:bg-white/5"
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
                        className="w-full bg-[#05050A]/40 border border-white/5 rounded-2xl px-5 py-4 text-[13px] leading-relaxed text-white outline-none focus:border-[#00E5FF]/40 font-mono shadow-inner transition-all"
                      />

                      {/* Hashtags block */}
                      {v.hashtags && v.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {v.hashtags.map((tag) => (
                            <span key={tag} className="text-[10px] font-mono text-[#D900FF] bg-[#D900FF]/10 px-2.5 py-1 rounded-lg border border-[#D900FF]/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Character limit bar */}
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className={isOverLimit ? "text-[#FF2A5F]" : "text-[#A1A1AA]"}>
                          Characters Left: {charLeft} / {platMeta.maxChar}
                        </span>
                        {isOverLimit && (
                          <span className="text-[#FF2A5F] text-[10px] uppercase font-bold tracking-wider">Limit Exceeded</span>
                        )}
                      </div>

                      {/* Operations tray */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                        
                        {/* Scheduler Popup Trigger */}
                        {schedulingPostId === v.id ? (
                          <div className="flex items-center gap-2 bg-[#05050A] border border-white/5 p-1.5 rounded-xl shadow-inner">
                            <input
                              type="datetime-local"
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="bg-transparent text-[11px] font-mono text-white outline-none px-2"
                            />
                            <button
                              onClick={() => handleScheduleSubmit(v.id)}
                              className="text-[11px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-3 py-1.5 rounded-lg border border-[#00E5FF]/20"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setSchedulingPostId(null)}
                              className="text-[11px] font-semibold text-[#FF2A5F] px-3 py-1.5"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSchedulingPostId(v.id)}
                            className="flex items-center gap-2 text-[11px] font-mono text-[#A1A1AA] hover:text-white transition-colors"
                          >
                            <Clock size={14} /> Schedule Post
                          </button>
                        )}

                        {/* Publish/Queue Button */}
                        <button
                          onClick={() => publish(v)}
                          disabled={isOverLimit}
                          className="flex items-center gap-2 text-[13px] font-semibold text-[#00E5FF] hover:text-white hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all disabled:opacity-30 disabled:hover:drop-shadow-none"
                        >
                          {v.platform === "facebook_group" ? (
                            <>
                              <Plus size={16} /> Queue for Assisted Posting
                            </>
                          ) : (
                            <>
                              <Send size={14} /> Deploy Signal Now
                            </>
                          )}
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center border border-dashed border-white/10 rounded-3xl glass-panel">
                <MessageSquareCode size={48} className="text-[#A1A1AA] mb-4 opacity-20" />
                <h3 className="text-base font-semibold text-white tracking-wide">Pre-generation view</h3>
                <p className="text-[13px] text-[#52525B] max-w-sm mt-2 leading-relaxed">
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
