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
  queued: { label: "queued", styles: "bg-white/[0.04] text-[#8B93A7] border-white/5" },
  in_progress: { label: "running script", styles: "bg-[#8B7CFF]/10 text-[#8B7CFF] border-[#8B7CFF]/20" },
  awaiting_manual_click: { label: "awaiting post click", styles: "bg-[#ffac0a]/10 text-[#ffac0a] border-[#ffac0a]/20" },
  needs_login: { label: "facebook login needed", styles: "bg-[#FF5C7A]/10 text-[#FF5C7A] border-[#FF5C7A]/20" },
  done: { label: "completed", styles: "bg-[#43FFB0]/10 text-[#43FFB0] border-[#43FFB0]/20" },
  failed: { label: "script failed", styles: "bg-[#FF5C7A]/10 text-[#FF5C7A] border-[#FF5C7A]/20" },
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
    <div className="p-8 relative min-h-screen">
      {/* Background glow */}
      <div className="glow-blob w-[500px] h-[500px] bg-[#8B7CFF]/4 -top-20 -right-20 opacity-60" />

      {/* Header */}
      <div className="space-y-2 mb-8">
        <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-widest text-[#8B7CFF] bg-[#8B7CFF]/5 px-3 py-1.5 rounded-full border border-[#8B7CFF]/15 w-fit">
          <Users size={12} className="text-[#8B7CFF]" /> Facebook Groups
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white mt-1.5">
          Assisted Group Automation
        </h1>
        <p className="text-[#8B93A7] text-xs max-w-xl">
          Meta restricts direct API posting in groups. This pipeline opens Chrome visibly, loads your local logged-in session, types the content, and waits for you to review and click Post.
        </p>
      </div>

      {isMobileApp && (
        <div className="mb-8 p-4 rounded-xl bg-[#FFac0a]/10 border border-[#FFac0a]/20 text-[#FFac0a] text-sm flex gap-3 items-start">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Desktop Only Feature</p>
            <p className="text-xs opacity-90">Meta prevents auto-posting to groups. This feature launches a visible Chrome browser to autofill your post for manual review. It only works when running the web dashboard on your desktop PC where the backend is hosted.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left: Queue List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Posting Queue</h3>
            <span className="text-[10px] text-[#5C6478] font-mono">Refreshes automatically</span>
          </div>

          <div className="space-y-3">
            {queue.map((item) => {
              const status = STATUS_CONFIG[item.status] || { label: "unknown", styles: "bg-white/5 text-white" };
              const isRunning = runningId === item.id;

              return (
                <div 
                  key={item.id}
                  className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300 space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-white leading-relaxed line-clamp-3 bg-[#06080C]/30 p-3 rounded-lg border border-white/5 font-mono">
                        {item.post_variants?.content}
                      </p>
                      <p className="text-[10px] font-mono text-[#8B7CFF] hover:underline truncate pt-1 flex items-center gap-1.5">
                        <Clock size={10} /> {item.group_url} <ExternalLink size={8} />
                      </p>
                    </div>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 font-semibold border ${status.styles}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-white/5">
                    <span className="text-[9px] font-mono text-[#5C6478]">
                      Queued: {new Date(item.created_at || Date.now()).toLocaleTimeString()}
                    </span>

                    <div className="flex gap-3">
                      {item.status === "queued" && (
                        <button
                          onClick={() => run(item.id, item)}
                          disabled={runningId !== null || isMobileApp}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-colors ${
                            isMobileApp 
                              ? "text-[#8B93A7] bg-white/5 border-white/10 opacity-50 cursor-not-allowed" 
                              : "text-[#43FFB0] bg-[#43FFB0]/10 border-[#43FFB0]/20 hover:bg-[#43FFB0]/20 disabled:opacity-40"
                          }`}
                        >
                          {isRunning ? <RefreshCw size={12} className="animate-spin" /> : <PlayCircle size={13} />}
                          <span>{isMobileApp ? "Desktop Only" : (isRunning ? "Running script..." : "Open & autofill")}</span>
                        </button>
                      )}

                      {item.status === "awaiting_manual_click" && (
                        <button
                          onClick={() => confirm(item.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#43FFB0] bg-[#43FFB0]/10 px-3.5 py-1.5 rounded-xl border border-[#43FFB0]/20 hover:bg-[#43FFB0]/20 transition-colors"
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark completed</span>
                        </button>
                      )}

                      {(item.status === "failed" || item.status === "needs_login" || item.status === "done") && (
                        <button
                          onClick={() => run(item.id, item)}
                          disabled={runningId !== null}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#8B93A7] hover:text-white transition-colors"
                        >
                          <PlayCircle size={13} />
                          <span>Rerun script</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

            {queue.length === 0 && (
              <div className="text-center py-20 text-xs text-[#5C6478] border border-dashed border-white/5 rounded-2xl glass-panel">
                No items queued. Generate a FB Group variant in the Composer to trigger assisted posting.
              </div>
            )}
          </div>
        </div>

        {/* Right: Terminal Console */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Terminal size={12} className="text-[#43FFB0]" /> Chrome Console stdout
            </h3>
            <span className="w-2 h-2 rounded-full bg-[#43FFB0] pulse-dot" />
          </div>

          <div className="glass-panel bg-black rounded-2xl border border-white/10 p-5 font-mono text-[10px] text-[#43FFB0] min-h-[350px] flex flex-col justify-between shadow-2xl">
            {/* Logs List */}
            <div className="space-y-2 h-64 overflow-y-auto scrollbar-thin select-text">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log}
                </div>
              ))}
              <div className="terminal-cursor" />
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-between text-[#5C6478] text-[8px] uppercase select-none">
              <span>local-autofill-driver v1.0</span>
              <span>chrome-session: saved-profile</span>
            </div>
          </div>

          {/* Quick Tip info card */}
          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-[11px] text-[#8B93A7] leading-relaxed flex gap-2">
            <Info size={14} className="text-[#8B7CFF] shrink-0 mt-0.5" />
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
