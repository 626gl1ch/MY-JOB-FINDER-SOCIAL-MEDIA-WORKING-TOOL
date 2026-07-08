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
} from "lucide-react";

const MAIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: RadioTower },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "composer", label: "Composer", icon: PenSquare },
  { id: "vault", label: "Vault", icon: FolderOpen },
];

const MORE_NAV = [
  { id: "scheduler", label: "Scheduler", icon: CalendarClock },
  { id: "groups", label: "Groups (Desktop)", icon: Users },
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
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-4 pb-24 animate-in fade-in duration-200">
          <div className="bg-[#0A0D15] border border-white/10 rounded-2xl p-2 space-y-1 mb-2">
            <div className="px-3 py-2 text-[10px] font-mono text-[#8B93A7] uppercase tracking-widest border-b border-white/5 mb-2">
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
                      ? "bg-[#43FFB0]/10 text-[#43FFB0] font-medium"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0D15]/90 border-t border-white/10 backdrop-blur-xl pb-safe pt-1 px-2 flex justify-between items-center">
        {MAIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-14 gap-1 rounded-xl transition-colors ${
                isActive ? "text-[#43FFB0]" : "text-[#8B93A7]"
              }`}
            >
              <Icon size={20} className={isActive ? "drop-shadow-[0_0_8px_rgba(67,255,176,0.5)]" : ""} />
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex flex-col items-center justify-center w-16 h-14 gap-1 rounded-xl transition-colors ${
            showMore ? "text-white" : "text-[#8B93A7]"
          }`}
        >
          {showMore ? <X size={20} /> : <Menu size={20} />}
          <span className="text-[9px] font-medium tracking-wide">More</span>
        </button>
      </nav>
    </>
  );
}
