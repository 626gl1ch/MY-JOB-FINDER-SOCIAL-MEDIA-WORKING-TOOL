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
  facebook_group: { icon: Users, color: "text-[#43FFB0]", bg: "bg-[#43FFB0]/10", border: "border-[#43FFB0]/20" },
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
    <div className="p-8 relative min-h-screen">
      {/* Background glow */}
      <div className="glow-blob w-[500px] h-[500px] bg-[#8B7CFF]/3 -bottom-20 -left-10 opacity-50" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#8B7CFF]">
            <CalendarClock size={12} className="text-[#8B7CFF]" /> Calendar Planner
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white mt-1.5">
            Scheduler
          </h1>
          <p className="text-[#8B93A7] text-xs mt-0.5">
            View, reschedule, and delete automatically queued platform broadcasts.
          </p>
        </div>

        {/* Date navigations */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-[#090C12] border border-white/5 rounded-xl p-1">
            <button 
              onClick={() => setActiveWeekOffset(o => o - 1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-[#8B93A7] hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] font-mono font-medium px-2 text-[#E4E7EC] min-w-[150px] text-center select-none">
              {getWeekRangeLabel()}
            </span>
            <button 
              onClick={() => setActiveWeekOffset(o => o + 1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-[#8B93A7] hover:text-white transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Grid Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 relative z-10">
        {DAYS_OF_WEEK.map((day) => {
          const events = getEventsByDay(day);
          const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }) === day && activeWeekOffset === 0;

          return (
            <div 
              key={day} 
              className={`glass-panel rounded-2xl p-4 flex flex-col gap-3 min-h-[300px] border transition-colors ${
                isToday ? "border-[#43FFB0]/20 bg-[#43FFB0]/[0.01]" : "border-white/5"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className={`text-xs font-semibold ${isToday ? "text-[#43FFB0]" : "text-white"}`}>
                  {day.slice(0, 3)}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43FFB0] pulse-dot" />
                )}
              </div>

              {/* Day Events */}
              <div className="space-y-2 flex-1 overflow-y-auto scrollbar-none">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#8B7CFF]/30 cursor-pointer transition-all duration-200 hover:scale-[1.02] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[#5C6478]">
                        {new Date(event.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-1">
                        {event.post_variants?.map((v) => {
                          const meta = PLATFORM_ICONS[v.platform] || { icon: Users, color: "text-[#8B93A7]" };
                          const Icon = meta.icon;
                          return (
                            <Icon key={v.id} size={10} className={meta.color} />
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-[10px] text-[#8B93A7] leading-normal line-clamp-3">
                      {event.base_content}
                    </p>
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="h-full flex items-center justify-center py-10 text-[9px] font-mono text-[#5C6478] uppercase tracking-wider text-center">
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
        <div className="fixed inset-0 bg-[#06080C]/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 space-y-5 border border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white font-mono uppercase flex items-center gap-2">
                <Clock size={14} className="text-[#8B7CFF]" /> Broadcast Details
              </h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-[#8B93A7] hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] font-mono text-[#5C6478] uppercase">Scheduled Time</p>
              <p className="text-xs text-white font-mono">
                {new Date(selectedEvent.scheduled_for).toLocaleString()}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] font-mono text-[#5C6478] uppercase">Base Content</p>
              <p className="text-xs text-[#8B93A7] leading-relaxed bg-[#090C12]/50 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                {selectedEvent.base_content}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-mono text-[#5C6478] uppercase">Distribution Targets</p>
              <div className="space-y-2">
                {selectedEvent.post_variants?.map((v) => {
                  const meta = PLATFORM_ICONS[v.platform] || { icon: Users, color: "text-[#8B93A7]", bg: "bg-white/5", border: "border-white/5" };
                  const Icon = meta.icon;
                  return (
                    <div key={v.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.01] border border-white/5 text-[11px]">
                      <div className="flex items-center gap-2">
                        <Icon size={12} className={meta.color} />
                        <span className="capitalize text-white font-mono">{v.platform.replace("_", " ")}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#43FFB0] bg-[#43FFB0]/10 px-1.5 py-0.5 rounded border border-[#43FFB0]/15">
                        ready
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <button
                onClick={() => deleteSchedule(selectedEvent.id)}
                className="flex items-center gap-1 text-xs font-semibold text-[#FF5C7A]"
              >
                <Trash2 size={13} /> Unschedule
              </button>
              <button
                onClick={() => {
                  alert("Signal broadcasted instantly!");
                  deleteSchedule(selectedEvent.id);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-[#43FFB0]"
              >
                <Send size={13} /> Force Broadcast Now
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
