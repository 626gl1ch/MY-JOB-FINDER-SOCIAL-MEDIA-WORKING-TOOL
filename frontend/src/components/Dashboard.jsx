import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Clock, 
  BookOpen, 
  Settings as SettingsIcon, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Search
} from "lucide-react";
import { api } from "../api";

// Quick action button component
function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 bg-surface hover:bg-surfaceHover border border-white/5 rounded-3xl p-5 transition-all shadow-lg active:scale-95"
    >
      <div className="bg-[#121215] p-3 rounded-2xl shadow-inner">
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-xs font-medium text-white">{label}</span>
    </button>
  );
}

// Activity Item component
function ActivityItem({ variant }) {
  const isPosted = variant.publish_status === "posted";
  const isFailed = variant.publish_status === "failed";
  const isPending = variant.publish_status === "pending";

  const StatusIcon = isPosted ? CheckCircle2 : (isFailed ? AlertCircle : Clock3);
  const statusColor = isPosted ? "text-signal" : (isFailed ? "text-alert" : "text-muted");
  const bgColor = isPosted ? "bg-signal/10" : (isFailed ? "bg-alert/10" : "bg-white/5");

  return (
    <div className="flex items-center justify-between p-4 bg-surface border border-white/5 rounded-[24px] shadow-sm mb-3 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${bgColor} ${statusColor}`}>
          <StatusIcon size={20} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-[300px] capitalize">
            {variant.platform.replace('_', ' ')}
          </h4>
          <p className="text-xs text-muted mt-1 truncate max-w-[200px] sm:max-w-[300px]">
            {variant.content}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-sm font-bold ${statusColor} capitalize`}>
          {variant.publish_status}
        </span>
        <span className="text-[10px] text-muted mt-1">
          {new Date(variant.created_at || Date.now()).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="relative min-h-screen bg-[#121215] p-5 md:p-8 max-w-4xl mx-auto space-y-8 pb-32">
      {/* Top Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs text-muted">Welcome back,</p>
            <h1 className="text-lg font-bold text-white">Broadcast Pro</h1>
          </div>
        </div>
        <button className="w-12 h-12 rounded-full bg-surface border border-white/5 flex items-center justify-center text-white shadow-lg">
          <Search size={20} />
        </button>
      </header>

      {/* Main Hero Card (Gradient) */}
      <section>
        <div className="w-full bg-accent-gradient rounded-[32px] p-8 shadow-[0_20px_40px_-15px_rgba(176,139,255,0.4)] relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Broadcasts</p>
              <h2 className="text-5xl font-display font-bold text-white tracking-tight">{allVariants.length}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center">
              <TrendingUp size={20} className="text-white mb-1" />
              <span className="text-xs font-bold text-white">+{postedCount}</span>
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-6 relative z-10">
            <div>
              <p className="text-white/70 text-xs">Active Queue</p>
              <p className="text-white font-bold text-lg">{pendingCount}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-white/70 text-xs">Reach Index</p>
              <p className="text-white font-bold text-lg">98.5%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <div className="flex justify-between items-end mb-4 px-2">
          <h3 className="text-lg font-bold text-white tracking-tight">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <ActionButton icon={Plus} label="New Post" onClick={() => window.dispatchEvent(new CustomEvent('nav-change', {detail: 'composer'}))} />
          <ActionButton icon={Clock} label="Queue" onClick={() => window.dispatchEvent(new CustomEvent('nav-change', {detail: 'scheduler'}))} />
          <ActionButton icon={BookOpen} label="Playbook" onClick={() => window.dispatchEvent(new CustomEvent('nav-change', {detail: 'playbook'}))} />
          <ActionButton icon={SettingsIcon} label="Settings" onClick={() => window.dispatchEvent(new CustomEvent('nav-change', {detail: 'settings'}))} />
        </div>
      </section>

      {/* Activity Feed */}
      <section>
        <div className="flex justify-between items-end mb-4 px-2">
          <h3 className="text-lg font-bold text-white tracking-tight">Recent Activity</h3>
          <button className="text-xs font-bold text-accent hover:text-white transition-colors">See All</button>
        </div>
        <div className="space-y-1">
          {allVariants.slice(0, 8).map((v) => (
            <ActivityItem key={v.id} variant={v} />
          ))}
          {allVariants.length === 0 && (
            <div className="text-center py-10 bg-surface rounded-[24px] border border-white/5">
              <p className="text-muted text-sm">No recent activity.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function getMockPosts() {
  const defaultTime = new Date().toISOString();
  return [
    {
      id: "post-1",
      created_at: defaultTime,
      post_variants: [
        { id: "v-1", platform: "linkedin", content: "Shipped a major architecture audit...", publish_status: "posted", created_at: defaultTime },
        { id: "v-2", platform: "facebook_page", content: "Just spent my afternoon auditing...", publish_status: "posted", created_at: defaultTime },
        { id: "v-3", platform: "instagram", content: "SnipeJob performance update...", publish_status: "failed", created_at: defaultTime }
      ]
    },
    {
      id: "post-2",
      created_at: defaultTime,
      post_variants: [
        { id: "v-4", platform: "facebook_group", content: "What's up traders! Just finished...", publish_status: "pending", created_at: defaultTime }
      ]
    }
  ];
}
