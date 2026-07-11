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
  { id: "dashboard", label: "Dashboard", icon: RadioTower },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "vault", label: "Vault", icon: FolderOpen },
  { id: "composer", label: "Composer", icon: PenSquare },
  { id: "scheduler", label: "Scheduler", icon: CalendarClock },
  { id: "groups", label: "Groups", icon: Users },
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
    <aside className="hidden md:flex w-64 shrink-0 bg-surface border-r border-white/5 flex-col relative z-10 m-3 rounded-[32px] h-[calc(100vh-24px)] shadow-2xl">
      {/* Glow highlight inside sidebar */}
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      
      {/* Header Logo */}
      <div className="px-7 py-8 flex items-center gap-3">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-squircle bg-[#121215] border border-white/5 shadow-inner">
          <div className="glow-blob w-8 h-8 bg-glow-pulse opacity-50 absolute" />
          <RadioTower size={20} className="text-accent drop-shadow-[0_0_8px_rgba(176,139,255,0.6)]" />
        </div>
        <div>
          <p className="font-display font-bold text-[16px] tracking-tight leading-none text-white">
            Broadcast
          </p>
          <p className="text-[10px] text-muted uppercase tracking-wider mt-1 font-medium">
            Workspace
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full relative flex items-center gap-3.5 px-4 py-3.5 rounded-[20px] text-[13px] font-medium transition-all duration-300 ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              {isActive && (
                <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
              )}
              <Icon size={18} className={isActive ? "text-accent" : "text-muted"} />
              <span className={isActive ? "font-semibold text-white" : ""}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status Bar */}
      <div className="mx-4 my-4 p-5 rounded-[24px] bg-[#121215] border border-white/5 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <p className="text-[10px] text-muted uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Shield size={12} className={demoMode ? "text-accent" : "text-signal"} /> System
          </p>
          {demoMode ? (
            <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md uppercase">
              Demo
            </span>
          ) : (
            <span className="text-[9px] font-bold text-signal bg-signal/10 px-2 py-0.5 rounded-md uppercase">
              Live
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">API Latency</span>
            <span className={`text-[11px] font-mono ${demoMode ? "text-accent" : "text-signal"}`}>
              {latency}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Meta API</span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-signal pulse-dot`} />
              <span className="text-[11px] font-mono text-signal">configured</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">LinkedIn API</span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-alert pulse-dot-alert`} />
              <span className="text-[11px] font-mono text-alert">needs setup</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
