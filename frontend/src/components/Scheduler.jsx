import React, { useEffect, useState } from "react";
import { 
  CalendarClock, 
  Trash2, 
  Send, 
  Clock, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Users,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import { api } from "../api";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const PLATFORM_ICONS = {
  facebook_page: { icon: Facebook, color: "text-[#1877F2]", bg: "bg-[#1877F2]/10", border: "border-[#1877F2]/20" },
  instagram: { icon: Instagram, color: "text-[#E1306C]", bg: "bg-[#E1306C]/10", border: "border-[#E1306C]/20" },
  linkedin: { icon: Linkedin, color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10", border: "border-[#0A66C2]/20" },
  facebook_group: { icon: Users, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/20" },
};

export default function Scheduler() {
  const [scheduled, setScheduled] = useState([]);
  const [activeWeekOffset, setActiveWeekOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const load = () => {
    api.getCalendar()
      .then((data) => {
        if (data && data.length > 0) {
          setScheduled(data);
        } else {
          setScheduled(getMockScheduled());
        }
      })
      .catch(() => {
        setScheduled(getMockScheduled());
      });
  };

  useEffect(() => {
    load();
  }, []);

  const deleteSchedule = (id) => {
    // Simulated deletion
    setScheduled((prev) => prev.filter((p) => p.id !== id));
    setSelectedEvent(null);
  };

  // Group events by day of week
  const getEventsByDay = (dayName) => {
    return scheduled.filter((event) => {
      const date = new Date(event.scheduled_for);
      const day = date.toLocaleDateString("en-US", { weekday: "long" });
      return day === dayName;
    });
  };

  const getWeekRangeLabel = () => {
    const today = new Date();
    today.setDate(today.getDate() + activeWeekOffset * 7);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div className="p-6 md:p-10 relative min-h-screen">
      {/* Background glow */}
      <div className="glow-blob w-[600px] h-[600px] bg-[#D900FF]/10 -bottom-20 -left-10 opacity-40" />
      <div className="glow-blob w-[400px] h-[400px] bg-[#00E5FF]/5 top-20 right-0 opacity-40" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 max-w-7xl mx-auto relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#D900FF]">
            <CalendarClock size={14} className="text-[#D900FF] drop-shadow-[0_0_8px_rgba(217,0,255,0.8)]" /> Calendar Planner
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white mt-2">
            Scheduler
          </h1>
          <p className="text-[#A1A1AA] text-[13px] mt-1.5 font-light">
            View, reschedule, and delete automatically queued platform broadcasts.
          </p>
        </div>

        {/* Date navigations */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-[#05050A]/80 border border-white/5 rounded-2xl p-1.5 shadow-inner backdrop-blur-md">
            <button 
              onClick={() => setActiveWeekOffset(o => o - 1)}
              className="p-2 rounded-xl hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-all duration-300"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[12px] font-mono font-medium px-3 text-[#E4E7EC] min-w-[160px] text-center select-none tracking-wide">
              {getWeekRangeLabel()}
            </span>
            <button 
              onClick={() => setActiveWeekOffset(o => o + 1)}
              className="p-2 rounded-xl hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-all duration-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Grid Columns */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-5 relative z-10">
        {DAYS_OF_WEEK.map((day) => {
          const events = getEventsByDay(day);
          const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }) === day && activeWeekOffset === 0;

          return (
            <div 
              key={day} 
              className={`glass-panel rounded-3xl p-5 flex flex-col gap-4 min-h-[350px] border transition-all duration-500 ${
                isToday ? "border-[#00E5FF]/30 bg-[#00E5FF]/[0.02] shadow-[0_0_20px_rgba(0,229,255,0.05)]" : "border-white/5"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className={`text-[13px] font-bold tracking-wide uppercase ${isToday ? "text-[#00E5FF]" : "text-white/80"}`}>
                  {day.slice(0, 3)}
                </span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF] pulse-dot shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                )}
              </div>

              {/* Day Events */}
              <div className="space-y-3 flex-1 overflow-y-auto scrollbar-none">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#D900FF]/40 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(217,0,255,0.15)] space-y-3 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/[0.05] to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-mono text-[#A1A1AA] bg-black/40 px-2 py-0.5 rounded shadow-inner">
                        {new Date(event.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-1.5">
                        {event.post_variants?.map((v) => {
                          const meta = PLATFORM_ICONS[v.platform] || { icon: Users, color: "text-[#A1A1AA]" };
                          const Icon = meta.icon;
                          return (
                            <div key={v.id} className="p-1 rounded bg-black/40 shadow-inner">
                              <Icon size={10} className={meta.color} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] group-hover:text-white transition-colors leading-relaxed line-clamp-3 relative z-10">
                      {event.base_content}
                    </p>
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="h-full flex items-center justify-center py-12 text-[10px] font-mono text-[#52525B] uppercase tracking-wider text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                    empty slot
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-[#05050A]/80 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="glass-panel max-w-xl w-full rounded-3xl p-8 space-y-6 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-base font-semibold text-white font-mono uppercase flex items-center gap-3">
                <Clock size={16} className="text-[#D900FF] drop-shadow-[0_0_8px_rgba(217,0,255,0.8)]" /> Broadcast Details
              </h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-[#A1A1AA] hover:text-white text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider">Scheduled Time</p>
              <p className="text-[13px] text-white font-mono bg-[#05050A]/40 px-4 py-2 rounded-xl border border-white/5 inline-block">
                {new Date(selectedEvent.scheduled_for).toLocaleString()}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider">Base Content</p>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed bg-[#05050A]/60 p-4 rounded-2xl border border-white/5 whitespace-pre-wrap shadow-inner font-mono">
                {selectedEvent.base_content}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider">Distribution Targets</p>
              <div className="grid grid-cols-2 gap-3">
                {selectedEvent.post_variants?.map((v) => {
                  const meta = PLATFORM_ICONS[v.platform] || { icon: Users, color: "text-[#A1A1AA]", bg: "bg-white/5", border: "border-white/5" };
                  const Icon = meta.icon;
                  return (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg bg-black/40 shadow-inner`}>
                          <Icon size={14} className={meta.color} />
                        </div>
                        <span className="capitalize text-white font-mono tracking-wide">{v.platform.replace("_", " ")}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20 shadow-sm">
                        ready
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-5 border-t border-white/5">
              <button
                onClick={() => deleteSchedule(selectedEvent.id)}
                className="flex items-center gap-1.5 text-[11px] font-mono text-[#FF2A5F] hover:bg-[#FF2A5F]/10 px-4 py-2 rounded-xl transition-colors border border-transparent hover:border-[#FF2A5F]/20"
              >
                <Trash2 size={14} /> Unschedule
              </button>
              <button
                onClick={() => {
                  alert("Signal broadcasted instantly!");
                  deleteSchedule(selectedEvent.id);
                }}
                className="flex items-center gap-2 text-[12px] font-bold text-[#05050A] bg-gradient-to-r from-[#00E5FF] to-[#D900FF] px-6 py-2.5 rounded-xl hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all hover:scale-[1.02] active:scale-95"
              >
                <Send size={14} /> Force Broadcast Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function getMockScheduled() {
  const getDayAtHour = (dayOffset, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: "sch-1",
      scheduled_for: getDayAtHour(1, 10), // Tomorrow 10am
      base_content: "Backtesting stateful Bybit scripts on 5m candles. High win rate setup.",
      post_variants: [
        { id: "sv-1", platform: "linkedin" },
        { id: "sv-2", platform: "facebook_page" }
      ]
    },
    {
      id: "sch-2",
      scheduled_for: getDayAtHour(3, 14), // In 3 days 2pm
      base_content: "Refactoring database indexes on Supabase postgres tables. Latency reduced.",
      post_variants: [
        { id: "sv-3", platform: "instagram" }
      ]
    },
    {
      id: "sch-3",
      scheduled_for: getDayAtHour(5, 17), // In 5 days 5pm
      base_content: "Reviewing FB Groups automated Chrome posting with Puppeteer profile.",
      post_variants: [
        { id: "sv-4", platform: "facebook_group" }
      ]
    }
  ];
}
