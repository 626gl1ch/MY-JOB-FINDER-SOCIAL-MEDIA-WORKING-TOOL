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

function StatCard({ label, value, description, icon: Icon, colorClass = "text-[#43FFB0]" }) {
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-300">
      {/* Background glow overlay */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/[0.01] rounded-full group-hover:scale-150 transition-transform duration-500" />
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B93A7]">{label}</span>
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-white/10 transition-colors">
          <Icon size={16} className={colorClass} />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-display font-bold tracking-tight text-white">{value}</h3>
        <p className="text-[11px] text-[#5C6478] mt-1 font-mono">{description}</p>
      </div>
    </div>
  );
}

const PLATFORM_META = {
  facebook_page: { name: "FB Page", icon: Facebook, color: "text-[#1877F2]", bg: "bg-[#1877F2]/10", border: "border-[#1877F2]/20" },
  instagram: { name: "Instagram", icon: Instagram, color: "text-[#E1306C]", bg: "bg-[#E1306C]/10", border: "border-[#E1306C]/20" },
  linkedin: { name: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10", border: "border-[#0A66C2]/20" },
  facebook_group: { name: "FB Groups", icon: Users, color: "text-[#43FFB0]", bg: "bg-[#43FFB0]/10", border: "border-[#43FFB0]/20" },
};

const CONNECTION_ITEMS = [
  { key: "fb", name: "Meta Graph API", type: "Official API", status: "active", icon: Facebook, scopes: "pages_manage_posts, instagram_basic", statusColor: "text-[#43FFB0]" },
  { key: "ig", name: "Instagram Graph", type: "Official API", status: "active", icon: Instagram, scopes: "instagram_content_publish", statusColor: "text-[#43FFB0]" },
  { key: "li", name: "LinkedIn OAuth", type: "Official API", status: "needs_setup", icon: Linkedin, scopes: "w_member_social, r_liteprofile", statusColor: "text-[#FF5C7A]" },
  { key: "pe", name: "Puppeteer Service", type: "Local Chrome Profile", status: "ready", icon: Users, scopes: "FB Group Autofill Browser", statusColor: "text-[#43FFB0]" },
  { key: "ai", name: "Gemini Brain", type: "Google Generative AI", status: "active", icon: Cpu, scopes: "gemini-2.5-flash (Free Tier)", statusColor: "text-[#8B7CFF]" },
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
          // If database is empty, load rich mock data for visual experience
          setPosts(getMockPosts());
        }
        setLoading(false);
      })
      .catch(() => {
        // Fail-safe to mock data if API is offline
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
      <div className="glow-blob w-[500px] h-[500px] bg-[#8B7CFF]/5 -top-40 -left-20 opacity-70" />
      <div className="glow-blob w-[400px] h-[400px] bg-[#43FFB0]/4 top-20 right-0 opacity-50" />

      <div className="relative p-8 space-y-8 max-w-7xl mx-auto">
        {/* On-air Section Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-widest text-[#43FFB0] bg-[#43FFB0]/5 px-3 py-1.5 rounded-full border border-[#43FFB0]/15">
            <Radio size={12} className="pulse-dot rounded-full text-[#43FFB0]" />
            Command Center
          </div>
          <span className="text-xs font-mono text-[#5C6478]">Last Updated: Just Now</span>
        </div>

        {/* Hero title */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white leading-tight">
            Everything you're broadcasting. <br />
            <span className="bg-gradient-to-r from-[#43FFB0] via-[#8B7CFF] to-blue-500 bg-clip-text text-transparent">
              One unified signal feed.
            </span>
          </h1>
          <p className="text-[#8B93A7] text-sm max-w-xl">
            Monitor API publication logs, trigger local Puppeteer automation runs, and audit content adaptations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard 
            label="Posted Signals" 
            value={postedCount} 
            description="+4 from yesterday" 
            icon={TrendingUp} 
            colorClass="text-[#43FFB0]" 
          />
          <StatCard 
            label="Pending Queue" 
            value={pendingCount} 
            description="Scheduled automatically" 
            icon={Clock} 
            colorClass="text-[#8B7CFF]" 
          />
          <StatCard 
            label="Platform Failures" 
            value={failedCount} 
            description="Requires token refresh" 
            icon={AlertCircle} 
            colorClass="text-[#FF5C7A]" 
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SVG Line Chart (2 cols) */}
          <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Broadcast Analytics</h3>
                <p className="text-xs text-[#5C6478] font-mono">Simulated volume / engagement index</p>
              </div>
              <div className="flex gap-4 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-[#43FFB0]">
                  <span className="w-2 h-2 rounded bg-[#43FFB0]" /> Reach Index
                </span>
                <span className="flex items-center gap-1.5 text-[#8B7CFF]">
                  <span className="w-2 h-2 rounded bg-[#8B7CFF]" /> Volume
                </span>
              </div>
            </div>

            {/* SVG area chart */}
            <div className="h-56 w-full relative pt-4">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glow-reach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#43FFB0" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#43FFB0" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="glow-vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B7CFF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8B7CFF" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Reach Area Fill */}
                <path 
                  d="M0,130 C50,110 100,70 150,90 C200,110 250,50 300,40 C350,30 400,80 450,45 C480,25 500,20 500,20 L500,140 L0,140 Z" 
                  fill="url(#glow-reach)" 
                />
                
                {/* Reach Stroke */}
                <path 
                  d="M0,130 C50,110 100,70 150,90 C200,110 250,50 300,40 C350,30 400,80 450,45 C480,25 500,20 500,20" 
                  fill="none" 
                  stroke="#43FFB0" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
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
                  stroke="#8B7CFF" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                />
              </svg>
              {/* X Axis Labels */}
              <div className="flex justify-between text-[9px] font-mono text-[#5C6478] mt-2 px-1">
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
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Platform Integrations</h3>
              <p className="text-xs text-[#5C6478] font-mono">Active token validation states</p>
            </div>
            <div className="space-y-3">
              {CONNECTION_ITEMS.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/[0.03] text-[#8B93A7] group-hover:text-white transition-colors">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                        <p className="text-[9px] font-mono text-[#5C6478] truncate">{c.scopes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === "needs_setup" ? "bg-[#FF5C7A] pulse-dot-alert" : "bg-[#43FFB0] pulse-dot"}`} />
                      <span className={`text-[9px] font-mono font-medium ${c.statusColor}`}>{c.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Activity Feed */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Signals Transmission Logs</h3>
              <p className="text-xs text-[#5C6478] font-mono">Recent adaptive post logs</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#090C12] p-1 rounded-lg border border-white/5 text-[11px] font-mono">
              {["all", "posted", "pending", "failed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3 py-1 rounded-md transition-colors capitalize ${
                    filter === st 
                      ? "bg-white/5 text-white font-medium border border-white/5" 
                      : "text-[#8B93A7] hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredVariants.slice(0, 10).map((v) => {
              const plat = PLATFORM_META[v.platform] || { name: "Unknown", icon: Globe, color: "text-white", bg: "bg-white/10", border: "border-white/20" };
              const Icon = plat.icon;
              const isExpanded = expandedPost === v.id;

              return (
                <div 
                  key={v.id} 
                  className={`rounded-xl border transition-all duration-300 ${
                    isExpanded 
                      ? "bg-white/[0.03] border-white/10" 
                      : "bg-[#0C0F16]/40 border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Summary Bar */}
                  <div 
                    onClick={() => setExpandedPost(isExpanded ? null : v.id)}
                    className="flex items-center justify-between gap-4 px-4 py-3.5 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-lg ${plat.bg} ${plat.border} ${plat.color} shrink-0`}>
                        <Icon size={14} />
                      </div>
                      <p className="text-xs text-white font-medium truncate flex-1 leading-relaxed">
                        {v.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        v.publish_status === "posted"
                          ? "bg-[#43FFB0]/10 text-[#43FFB0] border border-[#43FFB0]/20"
                          : v.publish_status === "failed"
                          ? "bg-[#FF5C7A]/10 text-[#FF5C7A] border border-[#FF5C7A]/20"
                          : "bg-white/[0.04] text-[#8B93A7] border border-white/5"
                      }`}>
                        {v.publish_status}
                      </span>
                      <div className="text-[#8B93A7]">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3.5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono text-[#5C6478] uppercase tracking-wider">Generated Variant Caption</p>
                        <p className="text-xs text-[#E4E7EC] leading-relaxed bg-[#06080C]/40 p-3 rounded-lg border border-white/5 font-mono whitespace-pre-wrap">
                          {v.content}
                        </p>
                      </div>

                      {v.hashtags && v.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {v.hashtags.map((tag) => (
                            <span key={tag} className="text-[10px] font-mono text-[#8B7CFF] bg-[#8B7CFF]/5 px-2 py-0.5 rounded border border-[#8B7CFF]/15">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-[#5C6478] gap-3 pt-2">
                        <span>Created: {new Date(v.created_at || Date.now()).toLocaleString()}</span>
                        {v.posted_at && <span>Broadcasted: {new Date(v.posted_at).toLocaleString()}</span>}
                        {v.error_message && (
                          <span className="text-[#FF5C7A] font-semibold flex items-center gap-1">
                            <AlertCircle size={10} /> {v.error_message}
                          </span>
                        )}
                        {v.platform_post_id && (
                          <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()} 
                            className="text-[#43FFB0] hover:underline flex items-center gap-1.5"
                          >
                            View Post <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredVariants.length === 0 && (
              <div className="text-center py-16 text-xs text-[#5C6478] border border-dashed border-white/5 rounded-xl">
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
