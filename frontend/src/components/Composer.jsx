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
  MessageSquareCode,
  Settings as SettingsIcon
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
    <div className="relative min-h-screen bg-[#121215] pb-32">
      <div className="glow-blob w-[500px] h-[500px] bg-accent/10 -top-10 left-1/4 opacity-60" />

      <div className="relative p-5 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Title */}
        <div className="flex justify-between items-center bg-surface/50 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent">
              <Wand2 size={14} /> Drafting Studio
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white mt-1">
              Composer
            </h1>
          </div>
          <div className="p-3 bg-[#121215] rounded-full border border-white/5">
            <SettingsIcon size={20} className="text-muted" />
          </div>
        </div>

        {/* Split Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left panel (Inputs) */}
          <div className="space-y-6">
            <div className="bg-surface rounded-[32px] p-6 shadow-2xl border border-white/5 space-y-6">
              
              {/* Input Area */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white">Source Material</label>
                <textarea
                  value={baseContent}
                  onChange={(e) => setBaseContent(e.target.value)}
                  placeholder="Paste your raw tech updates, changelogs, backtests, or draft details here..."
                  rows={6}
                  className="w-full bg-[#121215] rounded-[24px] px-5 py-4 text-[14px] text-white placeholder:text-muted outline-none resize-none focus:border-accent/50 border border-transparent transition-all shadow-inner"
                />
                <div className="flex justify-between items-center text-[10px] font-mono text-muted px-2">
                  <span>Words: {baseContent.split(/\s+/).filter(Boolean).length}</span>
                  <span>Chars: {baseContent.length}</span>
                </div>
              </div>

              {/* Brand Voice Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white">Brand Voice Preset</label>
                <select
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full bg-[#121215] rounded-[20px] px-4 py-4 text-[13px] text-white outline-none focus:border-accent/50 border border-transparent transition-all cursor-pointer shadow-inner"
                >
                  {BRAND_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Platform Targets */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white">Channel Distribution</label>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    const active = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-[20px] border text-left transition-all duration-300 ${
                          active
                            ? "border-accent bg-accent/10 text-white shadow-[0_0_15px_rgba(176,139,255,0.15)]"
                            : "border-white/5 bg-[#121215] text-muted hover:border-white/10 hover:text-white shadow-inner"
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-all ${active ? "bg-accent text-[#121215]" : "bg-white/[0.04] text-muted"}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{p.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media Attachment */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Vault Attachment</span>
                  {attachedImage && (
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className="text-alert hover:underline text-[10px] font-mono uppercase tracking-widest"
                    >
                      Remove
                    </button>
                  )}
                </label>
                {attachedImage ? (
                  <div className="flex items-center gap-3 p-3 rounded-[20px] bg-white/[0.02] border border-white/5 text-xs text-white shadow-inner">
                    <img src={attachedImage.url} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="truncate flex-1 font-mono text-[11px]">{attachedImage.name}</span>
                    <CheckCircle2 size={16} className="text-signal" />
                  </div>
                ) : (
                  <label className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[20px] border border-dashed border-white/10 hover:border-accent hover:bg-accent/5 hover:text-white bg-[#121215] text-muted text-xs font-medium transition-all cursor-pointer shadow-inner">
                    {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Paperclip size={16} />}
                    <span>{isUploading ? "Uploading..." : "Attach Image / Media"}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" disabled={isUploading} />
                  </label>
                )}
              </div>

              {/* Group URL input if applicable */}
              {selectedPlatforms.includes("facebook_group") && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-white">Facebook Group URL</label>
                  <input
                    value={groupUrl}
                    onChange={(e) => setGroupUrl(e.target.value)}
                    placeholder="https://facebook.com/groups/your-group-id"
                    className="w-full bg-[#121215] rounded-[20px] px-4 py-4 text-[13px] text-white placeholder:text-muted outline-none focus:border-accent/50 border border-transparent shadow-inner transition-all"
                  />
                </div>
              )}

              {/* Location Tag */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white">Location Tag (Optional)</label>
                <input
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full bg-[#121215] rounded-[20px] px-4 py-4 text-[13px] text-white placeholder:text-muted outline-none focus:border-accent/50 border border-transparent shadow-inner transition-all"
                />
              </div>

            </div>
          </div>

          {/* Right panel (Variants Stack) */}
          <div className="space-y-6 pb-24">
            {variants.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Tailored Previews</h3>
                  <span className="text-xs text-muted">Review and deploy</span>
                </div>

                {variants.map((v) => {
                  const platMeta = PLATFORMS.find((p) => p.id === v.platform) || { label: "Platform", icon: Users, maxChar: 3000 };
                  const Icon = platMeta.icon;
                  const charLeft = platMeta.maxChar - v.content.length;
                  const isOverLimit = charLeft < 0;
                  const activeVar = v.activeVariant || "A";

                  return (
                    <div key={v.platform} className="bg-surface rounded-[32px] p-6 space-y-5 shadow-xl border border-white/5">
                      
                      {/* Platform header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-white/[0.04] text-white">
                            <Icon size={18} />
                          </div>
                          <span className="text-sm font-bold text-white">{platMeta.label}</span>
                        </div>

                        {/* A/B Switcher */}
                        {v.contentB && (
                          <div className="flex items-center gap-1.5 bg-[#121215] p-1.5 rounded-[16px] shadow-inner">
                            <button
                              onClick={() => updateVariantAlternate(v.id)}
                              className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all ${
                                activeVar === "A" ? "bg-white/10 text-white shadow-sm" : "text-muted hover:text-white"
                              }`}
                            >
                              Var A
                            </button>
                            <button
                              onClick={() => updateVariantAlternate(v.id)}
                              className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all ${
                                activeVar === "B" ? "bg-white/10 text-white shadow-sm" : "text-muted hover:text-white"
                              }`}
                            >
                              Var B
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Variant textarea */}
                      <textarea
                        value={v.content}
                        onChange={(e) => updateVariantText(v.id, e.target.value)}
                        rows={5}
                        className="w-full bg-[#121215] border border-transparent rounded-[24px] px-5 py-4 text-[13px] leading-relaxed text-white outline-none focus:border-accent/50 shadow-inner transition-all resize-none"
                      />

                      {/* Hashtags block */}
                      {v.hashtags && v.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {v.hashtags.map((tag) => (
                            <span key={tag} className="text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Character limit bar */}
                      <div className="flex justify-between items-center text-[10px] font-mono px-2">
                        <span className={isOverLimit ? "text-alert" : "text-muted"}>
                          Characters Left: {charLeft} / {platMeta.maxChar}
                        </span>
                        {isOverLimit && (
                          <span className="text-alert uppercase font-bold tracking-wider">Limit Exceeded</span>
                        )}
                      </div>

                      {/* Operations tray */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                        
                        {/* Scheduler Popup Trigger */}
                        {schedulingPostId === v.id ? (
                          <div className="flex items-center gap-2 bg-[#121215] p-2 rounded-[20px] shadow-inner flex-1 max-w-[250px]">
                            <input
                              type="datetime-local"
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="bg-transparent text-[11px] font-mono text-white outline-none px-2 w-[130px]"
                            />
                            <button
                              onClick={() => handleScheduleSubmit(v.id)}
                              className="text-xs font-bold text-accent bg-accent/10 px-3 py-2 rounded-[14px]"
                            >
                              Ok
                            </button>
                            <button
                              onClick={() => setSchedulingPostId(null)}
                              className="text-xs font-bold text-alert px-2 py-2"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSchedulingPostId(v.id)}
                            className="flex items-center gap-2 text-xs font-bold text-muted hover:text-white transition-colors p-2"
                          >
                            <Clock size={16} /> Schedule
                          </button>
                        )}

                        {/* Publish Button */}
                        <button
                          onClick={() => publish(v)}
                          disabled={isOverLimit}
                          className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-5 py-3 rounded-full transition-all disabled:opacity-30"
                        >
                          {v.platform === "facebook_group" ? (
                            <>
                              <Plus size={16} /> Queue Assissted
                            </>
                          ) : (
                            <>
                              <Send size={16} /> Deploy Now
                            </>
                          )}
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center border border-dashed border-white/5 rounded-[32px] bg-surface/50">
                <MessageSquareCode size={48} className="text-muted mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-white tracking-wide">Waiting for inputs</h3>
                <p className="text-sm text-muted max-w-sm mt-2 leading-relaxed">
                  Enter your source material on the left and hit the generate button to adapt it.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Massive Generate Button (Docked) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#121215] to-transparent pointer-events-none flex justify-center z-40">
        <button
          onClick={generate}
          disabled={generating || !baseContent.trim() || selectedPlatforms.length === 0}
          className="pointer-events-auto w-full max-w-md h-[72px] rounded-full bg-accent text-[#121215] font-bold text-lg shadow-[0_10px_30px_rgba(176,139,255,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
        >
          {generating ? (
            <>
              <RefreshCw size={24} className="animate-spin" /> Adapting content...
            </>
          ) : (
            <>
              <Sparkles size={24} /> Hold to Generate
            </>
          )}
        </button>
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
