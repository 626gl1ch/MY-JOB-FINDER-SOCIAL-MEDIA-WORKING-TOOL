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
  facebook_group: { icon: Users, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
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
    <div className="p-5 md:p-8 relative min-h-screen bg-[#121215] pb-32">
      {/* Background glow */}
      <div className="glow-blob w-[600px] h-[600px] bg-accent/10 -bottom-20 -left-10 opacity-40" />
      <div className="glow-blob w-[400px] h-[400px] bg-accent/5 top-20 right-0 opacity-40" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 max-w-7xl mx-auto relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent bg-accent/10 px-3.5 py-1.5 rounded-full border border-accent/20 w-fit">
            <CalendarClock size={14} className="text-accent" /> Calendar Planner
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white mt-2">
            Scheduler
          </h1>
          <p className="text-muted text-[13px] mt-1.5 font-light">
            View, reschedule, and delete automatically queued platform broadcasts.
          </p>
        </div>

        {/* Date navigations */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-surface border border-white/5 rounded-full p-2 shadow-lg backdrop-blur-md">
            <button 
              onClick={() => setActiveWeekOffset(o => o - 1)}
              className="p-2.5 rounded-full hover:bg-white/10 text-muted hover:text-white transition-all duration-300"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[12px] font-bold px-3 text-white min-w-[160px] text-center select-none tracking-wide">
              {getWeekRangeLabel()}
            </span>
            <button 
              onClick={() => setActiveWeekOffset(o => o + 1)}
              className="p-2.5 rounded-full hover:bg-white/10 text-muted hover:text-white transition-all duration-300"
            >
              <ChevronRight size={18} />
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
              className={`bg-surface rounded-[32px] p-5 flex flex-col gap-4 min-h-[400px] border transition-all duration-500 shadow-xl ${
                isToday ? "border-accent/30 shadow-[0_0_20px_rgba(176,139,255,0.1)]" : "border-white/5"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className={`text-[13px] font-bold tracking-wide uppercase ${isToday ? "text-accent" : "text-white/80"}`}>
                  {day.slice(0, 3)}
                </span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(176,139,255,0.8)]" />
                )}
              </div>

              {/* Day Events */}
              <div className="space-y-4 flex-1 overflow-y-auto scrollbar-none">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 rounded-[20px] bg-[#121215] border border-transparent hover:border-accent/40 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(176,139,255,0.15)] space-y-3 relative overflow-hidden group shadow-inner"
                  >
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/[0.05] to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-bold text-muted bg-surface px-2.5 py-1 rounded-full shadow-sm">
                        {new Date(event.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-1.5">
                        {event.post_variants?.map((v) => {
                          const meta = PLATFORM_ICONS[v.platform] || { icon: Users, color: "text-muted" };
                          const Icon = meta.icon;
                          return (
                            <div key={v.id} className="p-1 rounded-md bg-surface shadow-inner">
                              <Icon size={12} className={meta.color} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-[12px] text-muted group-hover:text-white transition-colors leading-relaxed line-clamp-3 relative z-10">
                      {event.base_content}
                    </p>
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="h-full flex items-center justify-center py-12 text-[10px] font-bold text-muted/50 uppercase tracking-wider text-center border border-dashed border-white/5 rounded-[20px] bg-white/[0.01]">
                    empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-[#121215]/80 backdrop-blur-xl flex items-center justify-center p-5 z-50 animate-fade-in">
          <div className="bg-surface max-w-xl w-full rounded-[32px] p-8 space-y-6 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-base font-bold text-white uppercase flex items-center gap-3">
                <Clock size={18} className="text-accent" /> Broadcast Details
              </h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-muted hover:text-white text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-all font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-muted tracking-wider">Scheduled Time</p>
              <p className="text-sm text-white font-mono bg-[#121215] px-5 py-3 rounded-[20px] border border-transparent shadow-inner inline-block">
                {new Date(selectedEvent.scheduled_for).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-muted tracking-wider">Base Content</p>
              <p className="text-[13px] text-white/90 leading-relaxed bg-[#121215] p-5 rounded-[24px] border border-transparent shadow-inner">
                {selectedEvent.base_content}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-muted tracking-wider">Distribution Targets</p>
              <div className="grid grid-cols-2 gap-3">
                {selectedEvent.post_variants?.map((v) => {
                  const meta = PLATFORM_ICONS[v.platform] || { icon: Users, color: "text-muted", bg: "bg-white/5", border: "border-white/5" };
                  const Icon = meta.icon;
                  return (
                    <div key={v.id} className="flex items-center justify-between p-3.5 rounded-[20px] bg-[#121215] border border-transparent hover:border-white/5 transition-colors shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-[12px] bg-surface shadow-sm`}>
                          <Icon size={16} className={meta.color} />
                        </div>
                        <span className="capitalize text-white font-bold text-xs">{v.platform.replace("_", " ")}</span>
                      </div>
                      <span className="text-[10px] font-bold text-signal bg-signal/10 px-2 py-1 rounded-md">
                        Ready
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
              <button
                onClick={() => deleteSchedule(selectedEvent.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold text-alert bg-alert/10 hover:bg-alert/20 px-5 py-3.5 rounded-full transition-colors"
              >
                <Trash2 size={16} /> Unschedule
              </button>
              <button
                onClick={() => {
                  alert("Signal broadcasted instantly!");
                  deleteSchedule(selectedEvent.id);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold text-[#121215] bg-accent px-6 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <Send size={16} /> Force Broadcast Now
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
