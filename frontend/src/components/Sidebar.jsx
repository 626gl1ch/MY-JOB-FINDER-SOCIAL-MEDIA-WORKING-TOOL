import React, { useEffect, useState } from "react";
import {
  RadioTower,
  MessageSquare,
  FolderOpen,
  PenSquare,
  CalendarClock,
  Users,
  Settings as SettingsIcon,
  Shield,
  HelpCircle,
  BookOpen
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Command Center", icon: RadioTower },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "vault", label: "Content Vault", icon: FolderOpen },
  { id: "composer", label: "Composer", icon: PenSquare },
  { id: "scheduler", label: "Scheduler", icon: CalendarClock },
  { id: "groups", label: "Groups (Assisted)", icon: Users },
  { id: "playbook", label: "Playbook", icon: BookOpen },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ active, onChange }) {
  const [demoMode, setDemoMode] = useState(false);
  const [latency, setLatency] = useState("Checking...");

  useEffect(() => {
    const checkBackend = async () => {
      const start = Date.now();
      try {
        const res = await fetch("http://localhost:8787/api/health");
        if (res.ok) {
          setLatency(`${Date.now() - start}ms`);
          setDemoMode(false);
        } else {
          throw new Error();
        }
      } catch (_) {
        setLatency("Offline");
        setDemoMode(true);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="hidden md:flex w-64 shrink-0 glass-panel border-r border-white/5 flex-col relative z-10 m-2 rounded-2xl h-[calc(100vh-16px)]">
      {/* Glow highlight inside sidebar */}
      <div className="absolute top-0 right-0 w-[1px] h-32 bg-gradient-to-b from-[#D900FF]/30 to-transparent" />
      
      {/* Header Logo */}
      <div className="px-6 py-7 flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#10101F] border border-white/10 shadow-lg shadow-black/50">
          <div className="glow-blob w-8 h-8 bg-glow-signal opacity-50 absolute" />
          <div className="flex items-end gap-[3px] h-4 relative">
            <span className="w-[3px] h-2 bg-[#00E5FF] signal-bar" style={{ animationDelay: "0.1s" }} />
            <span className="w-[3px] h-3.5 bg-[#00E5FF] signal-bar" style={{ animationDelay: "0.3s" }} />
            <span className="w-[3px] h-5 bg-[#D900FF] signal-bar" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
        <div>
          <p className="font-display font-bold text-[15px] tracking-tight leading-none text-[#FFF]">
            GLITCH
          </p>
          <p className="text-[10px] font-mono text-[#D900FF] uppercase tracking-widest mt-1 font-semibold">
            BROADCAST
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                isActive
                  ? "bg-white/[0.06] text-[#FFF] border border-white/5 shadow-inner"
                  : "text-[#A1A1AA] hover:text-[#FFF] hover:bg-white/[0.03]"
              }`}
            >
              {isActive && (
                <>
                  <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b from-[#00E5FF] to-[#D900FF] shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#00E5FF] pulse-dot" />
                </>
              )}
              <Icon size={16} className={isActive ? "text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" : "text-[#A1A1AA]"} />
              <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status Bar */}
      <div className="mx-4 my-4 p-4 rounded-xl bg-black/40 border border-white/5 space-y-3.5 relative overflow-hidden backdrop-blur-md">
        {demoMode && (
          <div className="absolute inset-0 bg-[#D900FF]/5 pointer-events-none" />
        )}
        
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <p className="text-[9px] font-mono text-[#52525B] uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Shield size={10} className={demoMode ? "text-[#D900FF]" : "text-[#00E5FF]"} /> System Mode
          </p>
          {demoMode ? (
            <span className="text-[9px] font-mono font-bold text-[#D900FF] bg-[#D900FF]/10 px-2 py-0.5 rounded border border-[#D900FF]/20 uppercase">
              Demo
            </span>
          ) : (
            <span className="text-[9px] font-mono font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20 uppercase drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">
              Local Live
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#A1A1AA]">API Latency</span>
            <span className={`text-[10px] font-mono ${demoMode ? "text-[#D900FF]" : "text-[#00E5FF]"}`}>
              {latency}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#A1A1AA]">Meta API</span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#00E5FF] pulse-dot`} />
              <span className="text-[10px] font-mono text-[#00E5FF]">configured</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#A1A1AA]">LinkedIn API</span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#FF2A5F] pulse-dot-alert`} />
              <span className="text-[10px] font-mono text-[#FF2A5F]">needs setup</span>
            </span>
          </div>
        </div>

        <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[10px] text-[#52525B]">
          <span className="font-mono">v2.0 (Premium)</span>
          <span className="flex items-center gap-0.5 cursor-pointer hover:text-[#FFF] transition-colors">
            <HelpCircle size={10} /> guide
          </span>
        </div>
      </div>
    </aside>
  );
}
