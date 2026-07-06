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
  HelpCircle
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Command Center", icon: RadioTower },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "vault", label: "Content Vault", icon: FolderOpen },
  { id: "composer", label: "Composer", icon: PenSquare },
  { id: "scheduler", label: "Scheduler", icon: CalendarClock },
  { id: "groups", label: "Groups (Assisted)", icon: Users },
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
    <aside className="w-64 shrink-0 bg-[#0A0D15]/80 border-r border-white/5 backdrop-blur-2xl flex flex-col relative z-10">
      {/* Glow highlight inside sidebar */}
      <div className="absolute top-0 right-0 w-[1px] h-32 bg-gradient-to-b from-[#8B7CFF]/30 to-transparent" />
      
      {/* Header Logo */}
      <div className="px-6 py-7 flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#121622] border border-white/10 shadow-lg shadow-black/25">
          <div className="glow-blob w-8 h-8 bg-glow-signal opacity-40 absolute" />
          <div className="flex items-end gap-[3px] h-4 relative">
            <span className="w-[3px] h-2 bg-[#43FFB0] signal-bar" style={{ animationDelay: "0.1s" }} />
            <span className="w-[3px] h-3.5 bg-[#43FFB0] signal-bar" style={{ animationDelay: "0.3s" }} />
            <span className="w-[3px] h-5 bg-[#8B7CFF] signal-bar" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
        <div>
          <p className="font-display font-bold text-[15px] tracking-tight leading-none text-[#FFF]">
            GLITCH
          </p>
          <p className="text-[10px] font-mono text-[#8B7CFF] uppercase tracking-widest mt-1 font-semibold">
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
              className={`w-full relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.04] text-[#FFF] border border-white/5 shadow-inner"
                  : "text-[#8B93A7] hover:text-[#FFF] hover:bg-white/[0.02]"
              }`}
            >
              {isActive && (
                <>
                  <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b from-[#43FFB0] to-[#8B7CFF]" />
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#43FFB0] pulse-dot" />
                </>
              )}
              <Icon size={16} className={isActive ? "text-[#43FFB0]" : "text-[#8B93A7]"} />
              <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status Bar */}
      <div className="mx-4 my-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3.5 relative overflow-hidden">
        {demoMode && (
          <div className="absolute inset-0 bg-[#8B7CFF]/5 pointer-events-none" />
        )}
        
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <p className="text-[9px] font-mono text-[#5C6478] uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Shield size={10} className={demoMode ? "text-[#8B7CFF]" : "text-[#43FFB0]"} /> System Mode
          </p>
          {demoMode ? (
            <span className="text-[9px] font-mono font-bold text-[#8B7CFF] bg-[#8B7CFF]/10 px-2 py-0.5 rounded border border-[#8B7CFF]/20 uppercase">
              Demo
            </span>
          ) : (
            <span className="text-[9px] font-mono font-bold text-[#43FFB0] bg-[#43FFB0]/10 px-2 py-0.5 rounded border border-[#43FFB0]/20 uppercase">
              Local Live
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B93A7]">API Latency</span>
            <span className={`text-[10px] font-mono ${demoMode ? "text-[#8B7CFF]" : "text-[#43FFB0]"}`}>
              {latency}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B93A7]">Meta API</span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#43FFB0] pulse-dot`} />
              <span className="text-[10px] font-mono text-[#43FFB0]">configured</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B93A7]">LinkedIn API</span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#FF5C7A] pulse-dot-alert`} />
              <span className="text-[10px] font-mono text-[#FF5C7A]">needs setup</span>
            </span>
          </div>
        </div>

        <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[10px] text-[#5C6478]">
          <span className="font-mono">v1.2 (Local-First)</span>
          <span className="flex items-center gap-0.5 cursor-pointer hover:text-[#FFF] transition-colors">
            <HelpCircle size={10} /> guide
          </span>
        </div>
      </div>
    </aside>
  );
}
