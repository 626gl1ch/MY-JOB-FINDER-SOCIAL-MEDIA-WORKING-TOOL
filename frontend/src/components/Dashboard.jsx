import React, { useEffect, useState } from "react";
import { 
  Radio, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  Database,
  Facebook, 
  Instagram, 
  Linkedin, 
  Users, 
  Globe, 
  Cpu, 
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { api } from "../api";

function StatCard({ label, value, description, icon: Icon, colorClass = "text-[#00E5FF]" }) {
  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-300">
      {/* Background glow overlay */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/[0.02] rounded-full group-hover:scale-[2] transition-transform duration-700 ease-out" />
      
      <div className="flex items-center justify-between z-10 relative">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">{label}</span>
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-white/10 transition-colors backdrop-blur-md">
          <Icon size={18} className={colorClass} style={{ filter: "drop-shadow(0 0 8px currentColor)" }} />
        </div>
      </div>
      <div className="mt-6 z-10 relative">
        <h3 className="text-4xl font-display font-bold tracking-tight text-white">{value}</h3>
        <p className="text-xs text-[#52525B] mt-1.5 font-mono">{description}</p>
      </div>
    </div>
  );
}

const PLATFORM_META = {
  facebook_page: { name: "FB Page", icon: Facebook, color: "text-[#1877F2]", bg: "bg-[#1877F2]/10", border: "border-[#1877F2]/20" },
  instagram: { name: "Instagram", icon: Instagram, color: "text-[#E1306C]", bg: "bg-[#E1306C]/10", border: "border-[#E1306C]/20" },
  linkedin: { name: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10", border: "border-[#0A66C2]/20" },
  facebook_group: { name: "FB Groups", icon: Users, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/20" },
};

const CONNECTION_ITEMS = [
  { key: "fb", name: "Meta Graph API", type: "Official API", status: "active", icon: Facebook, scopes: "pages_manage_posts, instagram_basic", statusColor: "text-[#00E5FF]" },
  { key: "ig", name: "Instagram Graph", type: "Official API", status: "active", icon: Instagram, scopes: "instagram_content_publish", statusColor: "text-[#00E5FF]" },
  { key: "li", name: "LinkedIn OAuth", type: "Official API", status: "needs_setup", icon: Linkedin, scopes: "w_member_social, r_liteprofile", statusColor: "text-[#FF2A5F]" },
  { key: "pe", name: "Puppeteer Service", type: "Local Chrome Profile", status: "ready", icon: Users, scopes: "FB Group Autofill Browser", statusColor: "text-[#00E5FF]" },
  { key: "ai", name: "Gemini Brain", type: "Google Generative AI", status: "active", icon: Cpu, scopes: "gemini-2.5-flash (Free Tier)", statusColor: "text-[#D900FF]" },
];

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.listPosts()
      .then((data) => {
        if (data && data.length > 0) {
          setPosts(data);
        } else {
          setPosts(getMockPosts());
        }
        setLoading(false);
      })
      .catch(() => {
        setPosts(getMockPosts());
        setLoading(false);
      });
  }, []);

  const allVariants = posts.flatMap((p) => p.post_variants || []);
  const postedCount = allVariants.filter((v) => v.publish_status === "posted").length;
  const pendingCount = allVariants.filter((v) => v.publish_status === "pending").length;
  const failedCount = allVariants.filter((v) => v.publish_status === "failed").length;

  const filteredVariants = allVariants.filter((v) => {
    if (filter === "all") return true;
    return v.publish_status === filter;
  });

  return (
    <div className="relative min-h-screen">
      {/* Background glow filters */}
      <div className="glow-blob w-[600px] h-[600px] bg-[#D900FF]/10 -top-20 -left-20 opacity-60" />
      <div className="glow-blob w-[500px] h-[500px] bg-[#00E5FF]/10 top-40 right-0 opacity-40" />

      <div className="relative p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
        {/* On-air Section Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-4 py-2 rounded-full border border-[#00E5FF]/20 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
            <Radio size={14} className="pulse-dot rounded-full text-[#00E5FF]" />
            Command Center
          </div>
          <span className="text-xs font-mono text-[#52525B]">Last Updated: Just Now</span>
        </div>

        {/* Hero title */}
        <div className="space-y-3">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Everything you're broadcasting. <br />
            <span className="bg-gradient-to-r from-[#00E5FF] via-[#D900FF] to-[#FF2A5F] bg-clip-text text-transparent">
              One unified signal feed.
            </span>
          </h1>
          <p className="text-[#A1A1AA] text-base md:text-lg max-w-2xl font-light">
            Monitor API publication logs, trigger local Puppeteer automation runs, and audit content adaptations across all your active channels.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Posted Signals" 
            value={postedCount} 
            description="+4 from yesterday" 
            icon={TrendingUp} 
            colorClass="text-[#00E5FF]" 
          />
          <StatCard 
            label="Pending Queue" 
            value={pendingCount} 
            description="Scheduled automatically" 
            icon={Clock} 
            colorClass="text-[#D900FF]" 
          />
          <StatCard 
            label="Platform Failures" 
            value={failedCount} 
            description="Requires token refresh" 
            icon={AlertCircle} 
            colorClass="text-[#FF2A5F]" 
          />
          <StatCard 
            label="Content Vault" 
            value="14 Assets" 
            description="Images & brand mockups" 
            icon={Database} 
            colorClass="text-blue-400" 
          />
        </div>

        {/* Visual Analytics Chart & Connections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SVG Line Chart (2 cols) */}
          <div className="glass-panel rounded-3xl p-8 lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white tracking-wide">Broadcast Analytics</h3>
                <p className="text-xs text-[#52525B] font-mono mt-1">Simulated volume / engagement index</p>
              </div>
              <div className="flex gap-5 text-xs font-mono bg-white/[0.02] py-2 px-4 rounded-xl border border-white/5">
                <span className="flex items-center gap-2 text-[#00E5FF]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]" /> Reach Index
                </span>
                <span className="flex items-center gap-2 text-[#D900FF]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D900FF] shadow-[0_0_8px_rgba(217,0,255,0.8)]" /> Volume
                </span>
              </div>
            </div>

            {/* SVG area chart */}
            <div className="h-64 w-full relative pt-4">
              <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glow-reach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="glow-vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D900FF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D900FF" stopOpacity="0" />
                  </linearGradient>
                  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Reach Area Fill */}
                <path 
                  d="M0,130 C50,110 100,70 150,90 C200,110 250,50 300,40 C350,30 400,80 450,45 C480,25 500,20 500,20 L500,140 L0,140 Z" 
                  fill="url(#glow-reach)" 
                />
                
                {/* Reach Stroke */}
                <path 
                  d="M0,130 C50,110 100,70 150,90 C200,110 250,50 300,40 C350,30 400,80 450,45 C480,25 500,20 500,20" 
                  fill="none" 
                  stroke="#00E5FF" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  filter="url(#neon-glow)"
                  className="animate-draw-line"
                />

                {/* Volume Area Fill */}
                <path 
                  d="M0,145 C50,135 100,120 150,105 C200,90 250,100 300,80 C350,60 400,65 450,50 C480,40 500,35 500,35 L500,145 L0,145 Z" 
                  fill="url(#glow-vol)" 
                />

                {/* Volume Stroke */}
                <path 
                  d="M0,145 C50,135 100,120 150,105 C200,90 250,100 300,80 C350,60 400,65 450,50 C480,40 500,35 500,35" 
                  fill="none" 
                  stroke="#D900FF" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                  filter="url(#neon-glow)"
                />
              </svg>
              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] font-mono text-[#52525B] mt-4 px-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Platform Connections Status */}
          <div className="glass-panel rounded-3xl p-8 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">Platform Integrations</h3>
              <p className="text-xs text-[#52525B] font-mono mt-1">Active token validation states</p>
            </div>
            <div className="space-y-4">
              {CONNECTION_ITEMS.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#05050A]/40 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group shadow-inner">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2.5 rounded-xl bg-white/[0.04] text-[#A1A1AA] group-hover:text-white group-hover:scale-110 transition-all">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate">{c.name}</p>
                        <p className="text-[10px] font-mono text-[#52525B] truncate mt-0.5">{c.scopes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      <span className={`w-2 h-2 rounded-full ${c.status === "needs_setup" ? "bg-[#FF2A5F] pulse-dot-alert shadow-[0_0_8px_rgba(255,42,95,0.8)]" : "bg-[#00E5FF] pulse-dot shadow-[0_0_8px_rgba(0,229,255,0.8)]"}`} />
                      <span className={`text-[10px] font-mono font-medium ${c.statusColor}`}>{c.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Activity Feed */}
        <div className="glass-panel rounded-3xl p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">Signals Transmission Logs</h3>
              <p className="text-xs text-[#52525B] font-mono mt-1">Recent adaptive post logs</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-[#05050A] p-1.5 rounded-xl border border-white/5 text-[11px] font-mono shadow-inner">
              {["all", "posted", "pending", "failed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-4 py-1.5 rounded-lg transition-all capitalize ${
                    filter === st 
                      ? "bg-white/10 text-white font-medium border border-white/5 shadow-md" 
                      : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredVariants.slice(0, 10).map((v) => {
              const plat = PLATFORM_META[v.platform] || { name: "Unknown", icon: Globe, color: "text-white", bg: "bg-white/10", border: "border-white/20" };
              const Icon = plat.icon;
              const isExpanded = expandedPost === v.id;

              return (
                <div 
                  key={v.id} 
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? "bg-white/[0.04] border-white/10 shadow-lg" 
                      : "bg-[#05050A]/40 border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Summary Bar */}
                  <div 
                    onClick={() => setExpandedPost(isExpanded ? null : v.id)}
                    className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl ${plat.bg} ${plat.border} ${plat.color} shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <p className="text-[13px] text-white font-medium truncate flex-1 leading-relaxed">
                        {v.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`text-[10px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm ${
                        v.publish_status === "posted"
                          ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30"
                          : v.publish_status === "failed"
                          ? "bg-[#FF2A5F]/10 text-[#FF2A5F] border border-[#FF2A5F]/30"
                          : "bg-white/[0.04] text-[#A1A1AA] border border-white/10"
                      }`}>
                        {v.publish_status === "posted" && <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />}
                        {v.publish_status === "failed" && <div className="w-1.5 h-1.5 rounded-full bg-[#FF2A5F]" />}
                        {v.publish_status === "pending" && <div className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA]" />}
                        {v.publish_status}
                      </span>
                      <div className={`text-[#A1A1AA] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Detail */}
                  <div className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4 bg-black/20">
                      <div className="space-y-2">
                        <p className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider">Generated Variant Caption</p>
                        <p className="text-[13px] text-[#F8F9FA] leading-relaxed bg-[#05050A]/80 p-4 rounded-xl border border-white/5 font-mono whitespace-pre-wrap shadow-inner">
                          {v.content}
                        </p>
                      </div>

                      {v.hashtags && v.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {v.hashtags.map((tag) => (
                            <span key={tag} className="text-[11px] font-mono text-[#D900FF] bg-[#D900FF]/10 px-2.5 py-1 rounded-lg border border-[#D900FF]/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#52525B] gap-4 pt-3 border-t border-white/5 mt-2">
                        <span>Created: {new Date(v.created_at || Date.now()).toLocaleString()}</span>
                        {v.posted_at && <span>Broadcasted: {new Date(v.posted_at).toLocaleString()}</span>}
                        {v.error_message && (
                          <span className="text-[#FF2A5F] font-semibold flex items-center gap-1.5">
                            <AlertCircle size={12} /> {v.error_message}
                          </span>
                        )}
                        {v.platform_post_id && (
                          <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()} 
                            className="text-[#00E5FF] hover:text-white transition-colors flex items-center gap-1.5 bg-[#00E5FF]/10 px-3 py-1 rounded-lg border border-[#00E5FF]/20"
                          >
                            View Post <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredVariants.length === 0 && (
              <div className="text-center py-16 text-sm font-mono text-[#52525B] border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                No logs matching filter "{filter}". Head to the Composer to deploy variants.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function getMockPosts() {
  const defaultTime = new Date().toISOString();
  return [
    {
      id: "post-1",
      title: "SnipeJob Audit Launch",
      base_content: "Shipped a massive refactor for SnipeJob audit tool. Learned a lot about db connections and index sizes.",
      created_at: defaultTime,
      post_variants: [
        {
          id: "v-1",
          platform: "linkedin",
          content: "Shipped a major architecture audit and query optimization for SnipeJob this week. Key lesson: index sizes matter! Kept DB memory consumption under control by restructuring indexes on lookup tables. Read below on how we halved database load.",
          hashtags: ["buildinpublic", "database", "dev", "supabase"],
          publish_status: "posted",
          posted_at: defaultTime,
          platform_post_id: "li_12345"
        },
        {
          id: "v-2",
          platform: "facebook_page",
          content: "Just spent my afternoon auditing SnipeJob's database performance, and we just shaved off 50% query time! It's amazing what structuring your database indexes properly can do. Keeping things local and scaling cleanly. Check out the screenshot of the analytics logs below! 🛠️🚀",
          hashtags: ["glitch", "buildinpublic", "postgres"],
          publish_status: "posted",
          posted_at: defaultTime,
          platform_post_id: "fb_page_5432"
        },
        {
          id: "v-3",
          platform: "instagram",
          content: "SnipeJob performance update: halved database queries this afternoon! ⚡ Double click if you like clean indexing rules. Big build updates coming for the social media board next.",
          hashtags: ["developer", "postgres", "supabase", "solodev", "coder"],
          publish_status: "failed",
          error_message: "OAuth Token expired (Meta Session Error)"
        }
      ]
    },
    {
      id: "post-2",
      title: "Algo Trading Bot Update",
      base_content: "Backtest results on Bybit ETH perp look positive. 1.2 Profit factor with low drawdowns.",
      created_at: defaultTime,
      post_variants: [
        {
          id: "v-4",
          platform: "facebook_group",
          content: "What's up traders! Just finished running a 60-day backtest on Bybit ETH/USDT perp. The strategy focuses on stateful order blocks on 5m. Results: Profit factor 1.25, max drawdown 4.2%. Would anyone be interested in a walkthrough of the pine script or execution logic?",
          hashtags: ["trading", "algotrading", "bybit", "crypto"],
          publish_status: "pending"
        }
      ]
    }
  ];
}
