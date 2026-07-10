import React, { useState } from "react";
import {
  RadioTower,
  MessageSquare,
  FolderOpen,
  PenSquare,
  Menu,
  X,
  CalendarClock,
  Users,
  Settings as SettingsIcon,
  BookOpen
} from "lucide-react";

const MAIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: RadioTower },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "composer", label: "Composer", icon: PenSquare },
  { id: "vault", label: "Vault", icon: FolderOpen },
];

const MORE_NAV = [
  { id: "scheduler", label: "Scheduler", icon: CalendarClock },
  { id: "groups", label: "Groups", icon: Users },
  { id: "playbook", label: "Playbook", icon: BookOpen },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function MobileNav({ active, onChange }) {
  const [showMore, setShowMore] = useState(false);

  const handleSelect = (id) => {
    onChange(id);
    setShowMore(false);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex flex-col justify-end p-4 pb-24 animate-in fade-in duration-200">
          <div className="bg-[#0A0A14]/80 border border-white/10 rounded-2xl p-2 space-y-1 mb-2 shadow-2xl backdrop-blur-xl">
            <div className="px-3 py-2 text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest border-b border-white/5 mb-2">
              More Tools
            </div>
            {MORE_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "bg-[#00E5FF]/10 text-[#00E5FF] font-medium drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#05050A]/70 border-t border-white/10 backdrop-blur-2xl pb-safe pt-1 px-2 flex justify-between items-center">
        {MAIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-14 gap-1 rounded-xl transition-colors ${
                isActive ? "text-[#00E5FF]" : "text-[#A1A1AA]"
              }`}
            >
              <Icon size={20} className={isActive ? "drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" : ""} />
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex flex-col items-center justify-center w-16 h-14 gap-1 rounded-xl transition-colors ${
            showMore ? "text-white" : "text-[#A1A1AA]"
          }`}
        >
          {showMore ? <X size={20} /> : <Menu size={20} />}
          <span className="text-[9px] font-medium tracking-wide">More</span>
        </button>
      </nav>
    </>
  );
}
