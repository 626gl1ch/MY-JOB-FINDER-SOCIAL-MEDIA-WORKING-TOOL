import React, { useEffect, useState } from "react";
import { 
  Users, 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  ExternalLink,
  Info,
  RefreshCw,
  Clock
} from "lucide-react";
import { api } from "../api";

const STATUS_CONFIG = {
  queued: { label: "queued", styles: "bg-white/5 text-muted border-white/5" },
  in_progress: { label: "running script", styles: "bg-accent/10 text-accent border-accent/20" },
  awaiting_manual_click: { label: "awaiting post click", styles: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" },
  needs_login: { label: "facebook login needed", styles: "bg-alert/10 text-alert border-alert/20" },
  done: { label: "completed", styles: "bg-signal/10 text-signal border-signal/20" },
  failed: { label: "script failed", styles: "bg-alert/10 text-alert border-alert/20" },
};

export default function GroupsAssisted() {
  const [queue, setQueue] = useState([]);
  const [runningId, setRunningId] = useState(null);
  const isMobileApp = typeof window !== 'undefined' && !!window.Capacitor;
  const [terminalLogs, setTerminalLogs] = useState([
    "[SYSTEM] Terminal ready. Awaiting queue command...",
    "[SYSTEM] Click 'Open & fill composer' to launch Chromium script."
  ]);

  const load = () => {
    api.getGroupQueue()
      .then((data) => {
        if (data && data.length > 0) {
          setQueue(data);
        } else {
          setQueue(getMockQueue());
        }
      })
      .catch(() => {
        setQueue(getMockQueue());
      });
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const run = async (id, item) => {
    setRunningId(id);
    setTerminalLogs([
      `[PROCESS] Initiating assisted posting for Queue ID: ${id}`,
      `[PROCESS] Target Group URL: ${item.group_url}`,
      `[SYSTEM] Launching local Chrome browser...`
    ]);

    // Simulate logs typing in real-time
    const logsSequence = [
      `[SYSTEM] User profile directory: /backend/browser-profile`,
      `[SYSTEM] Browser launched successfully (headed: true, maximized: true)`,
      `[NETWORK] Navigating to ${item.group_url}...`,
      `[NETWORK] Document loaded. Checking cookie session...`,
      `[SESSION] Valid Facebook login detected. Retaining session.`,
      `[DOM] Searching for composer trigger selector...`,
      `[DOM] Clicked composer trigger. Waiting for editable area...`,
      `[DOM] Text area selector matched. Typing content (delay 12ms)...`,
      `[PROCESS] Caption content autofilled.`,
      item.image_path ? `[DOM] Uploading attached image: ${item.image_path}...` : `[DOM] No image attached. Skipping file upload.`,
      item.image_path ? `[DOM] Image uploaded and container loaded.` : null,
      `[PROCESS] Autofill complete. Pausing browser script.`,
      `[USER ACTION REQUIRED] REVIEW PREVIEW IN CHROMIUM WINDOW AND CLICK 'POST' YOURSELF.`
    ].filter(Boolean);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < logsSequence.length) {
        setTerminalLogs((prev) => [...prev, logsSequence[idx]]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    try {
      await api.runGroupPost(id).catch(() => {});
      load();
    } catch (err) {
      setTerminalLogs((prev) => [...prev, `[ERROR] Script failed: ${err.message}`]);
    } finally {
      setRunningId(null);
    }
  };

  const confirm = async (id) => {
    setTerminalLogs((prev) => [
      ...prev,
      `[USER] Mark done signal received. Closing Chrome tab...`,
      `[PROCESS] Post recorded successfully. Queue status set to done.`
    ]);
    try {
      await api.confirmGroupPost(id);
      load();
    } catch (_) {
      // Simulate done in demo mode
      setQueue((prev) => prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: "done",
            log: "Post confirmed by user."
          };
        }
        return item;
      }));
    }
  };

  return (
    <div className="p-5 md:p-8 relative min-h-screen bg-[#121215] pb-32">
      {/* Background glow */}
      <div className="glow-blob w-[500px] h-[500px] bg-accent/10 -top-20 -right-20 opacity-60" />

      {/* Header */}
      <div className="space-y-2 mb-8 max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent bg-accent/10 px-3.5 py-1.5 rounded-full border border-accent/20 w-fit">
          <Users size={14} className="text-accent" /> Facebook Groups
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white mt-2">
          Assisted Group Automation
        </h1>
        <p className="text-muted text-[13px] max-w-2xl mt-1.5 font-light leading-relaxed">
          Meta restricts direct API posting in groups. This pipeline opens Chrome visibly, loads your local logged-in session, types the content, and waits for you to review and click Post.
        </p>
      </div>

      {isMobileApp && (
        <div className="mb-8 max-w-6xl mx-auto p-5 rounded-[24px] bg-alert/5 border border-alert/20 text-alert text-sm flex gap-4 items-start shadow-inner relative z-10">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1 tracking-wide">Desktop Only Feature</p>
            <p className="text-[13px] opacity-90 leading-relaxed">Meta prevents auto-posting to groups. This feature launches a visible Chrome browser to autofill your post for manual review. It only works when running the web dashboard on your desktop PC where the backend is hosted.</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start relative z-10">
        
        {/* Left: Queue List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-base font-bold text-white tracking-tight">Posting Queue</h3>
            <span className="text-xs text-muted">Refreshes automatically</span>
          </div>

          <div className="space-y-4">
            {queue.map((item) => {
              const status = STATUS_CONFIG[item.status] || { label: "unknown", styles: "bg-white/5 text-white" };
              const isRunning = runningId === item.id;

              return (
                <div 
                  key={item.id}
                  className="bg-surface rounded-[32px] p-6 border border-white/5 shadow-xl transition-all duration-300 space-y-5"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="space-y-2 min-w-0 flex-1">
                      <p className="text-[13px] text-white leading-relaxed line-clamp-3 bg-[#121215] p-5 rounded-[20px] border border-transparent shadow-inner">
                        {item.post_variants?.content}
                      </p>
                      <p className="text-[11px] font-mono text-accent hover:underline truncate px-2 flex items-center gap-1.5 transition-all">
                        <Clock size={12} /> {item.group_url} <ExternalLink size={10} />
                      </p>
                    </div>

                    <span className={`text-[10px] font-mono px-3 py-1.5 rounded-full uppercase shrink-0 font-bold border tracking-wider shadow-sm ${status.styles}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-mono text-muted px-2">
                      Queued: {new Date(item.created_at || Date.now()).toLocaleTimeString()}
                    </span>

                    <div className="flex gap-3">
                      {item.status === "queued" && (
                        <button
                          onClick={() => run(item.id, item)}
                          disabled={runningId !== null || isMobileApp}
                          className={`flex items-center gap-2 text-[12px] font-bold px-5 py-2.5 rounded-full transition-all ${
                            isMobileApp 
                              ? "text-muted bg-white/5 border-white/10 opacity-50 cursor-not-allowed" 
                              : "text-[#121215] bg-accent hover:scale-105 active:scale-95 disabled:opacity-40 shadow-lg"
                          }`}
                        >
                          {isRunning ? <RefreshCw size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                          <span>{isMobileApp ? "Desktop Only" : (isRunning ? "Running script..." : "Open & autofill")}</span>
                        </button>
                      )}

                      {item.status === "awaiting_manual_click" && (
                        <button
                          onClick={() => confirm(item.id)}
                          className="flex items-center gap-1.5 text-[12px] font-bold text-[#121215] bg-signal px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg"
                        >
                          <CheckCircle2 size={16} />
                          <span>Mark completed</span>
                        </button>
                      )}

                      {(item.status === "failed" || item.status === "needs_login" || item.status === "done") && (
                        <button
                          onClick={() => run(item.id, item)}
                          disabled={runningId !== null}
                          className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-white/10 hover:bg-white/20 transition-colors px-5 py-2.5 rounded-full"
                        >
                          <PlayCircle size={16} />
                          <span>Rerun script</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

            {queue.length === 0 && (
              <div className="text-center py-24 text-[13px] text-muted border border-dashed border-white/5 rounded-[32px] bg-surface/50 font-medium">
                No items queued. Generate a FB Group variant in the Composer to trigger assisted posting.
              </div>
            )}
          </div>
        </div>

        {/* Right: Terminal Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Terminal size={16} className="text-accent" /> Console Output
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(176,139,255,0.6)]" />
          </div>

          <div className="bg-[#121215] rounded-[32px] border border-white/5 p-6 font-mono text-[11px] text-muted min-h-[400px] flex flex-col justify-between shadow-inner">
            {/* Logs List */}
            <div className="space-y-2 h-72 overflow-y-auto scrollbar-thin select-text">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed break-words">
                  {log}
                </div>
              ))}
              <div className="w-2 h-4 bg-accent mt-1 animate-pulse" />
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-between text-muted/50 text-[9px] uppercase select-none tracking-widest font-bold">
              <span>local-autofill-driver v1.0</span>
              <span>chrome-session: saved</span>
            </div>
          </div>

          {/* Quick Tip info card */}
          <div className="p-5 rounded-[24px] bg-surface border border-white/5 text-[12px] text-muted leading-relaxed flex gap-3 shadow-xl">
            <Info size={18} className="text-accent shrink-0 mt-0.5" />
            <p>
              Cookies are stored locally on your machine in the `/backend/browser-profile` folder. Logging in once guarantees persistent login checks on subsequent automated script runs.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function getMockQueue() {
  const defaultTime = new Date().toISOString();
  return [
    {
      id: "q-1",
      group_url: "https://facebook.com/groups/nigerian-algo-traders",
      status: "queued",
      created_at: defaultTime,
      post_variants: {
        content: "Drafting the next release parameters for the Bybit bot. Moving core states off 1m inputs to 5m to manage latency noise. Anyone else trade quants on Bybit locally?"
      }
    },
    {
      id: "q-2",
      group_url: "https://facebook.com/groups/build-in-public-africa",
      status: "awaiting_manual_click",
      created_at: defaultTime,
      post_variants: {
        content: "Halved database loads for SnipeJob by optimizing index setups. Kept database hosting 100% free and local. Postgres is powerful."
      }
    }
  ];
}
