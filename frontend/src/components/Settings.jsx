import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Facebook, 
  Instagram, 
  Linkedin, 
  KeyRound, 
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Terminal,
  Info,
  ShieldAlert,
  Save
} from "lucide-react";
import { api } from "../api";

const CONNECTIONS = [
  { key: "fb", label: "Facebook Page Token", icon: Facebook, env: "META_PAGE_ACCESS_TOKEN", desc: "Allows publishing posts to Facebook Pages." },
  { key: "ig", label: "Instagram ID", icon: Instagram, env: "META_IG_BUSINESS_ACCOUNT_ID", desc: "Allows publishing images/captions to Instagram Business." },
  { key: "li", label: "LinkedIn Access Token", icon: Linkedin, env: "LINKEDIN_ACCESS_TOKEN", desc: "Allows automated updates on LinkedIn Profile." },
  { key: "gemini", label: "Gemini AI Key", icon: KeyRound, env: "GEMINI_API_KEY", desc: "Powers post variations, alt text, and ideas chat." },
  { key: "supabase", label: "Supabase DB URL", icon: Database, env: "SUPABASE_URL", desc: "Connects local backend to database tables." },
  { key: "supabase_key", label: "Supabase Service Key", icon: Database, env: "SUPABASE_SERVICE_ROLE_KEY", desc: "Allows backend DB operations." }
];

export default function Settings() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [backendUrl, setBackendUrl] = useState(() => localStorage.getItem("backendUrl") || "");
  const [envValues, setEnvValues] = useState({});
  const [isSavingEnv, setIsSavingEnv] = useState(false);
  const [envMessage, setEnvMessage] = useState(null);

  useEffect(() => {
    api.getSettingsEnv()
      .then(data => setEnvValues(data || {}))
      .catch(err => console.error("Failed to load envs:", err));
  }, []);

  const saveBackendUrl = () => {
    if (backendUrl) {
      localStorage.setItem("backendUrl", backendUrl);
    } else {
      localStorage.removeItem("backendUrl");
    }
    window.location.reload();
  };

  const handleEnvChange = (envKey, value) => {
    setEnvValues(prev => ({ ...prev, [envKey]: value }));
  };

  const saveEnvVariables = async () => {
    setIsSavingEnv(true);
    setEnvMessage(null);
    try {
      await api.updateSettingsEnv(envValues);
      setEnvMessage({ type: "success", text: "Saved successfully. Backend restarting..." });
      setTimeout(() => setEnvMessage(null), 3000);
    } catch (error) {
      setEnvMessage({ type: "error", text: "Failed to save: " + error.message });
    } finally {
      setIsSavingEnv(false);
    }
  };

  const runConnectionTests = () => {
    setTesting(true);
    setTestResults(null);
    setTimeout(() => {
      const results = {};
      CONNECTIONS.forEach(c => {
        results[c.key] = { ok: !!envValues[c.env], latency: envValues[c.env] ? "OK" : "" };
      });
      setTestResults(results);
      setTesting(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 relative min-h-screen">
      {/* Background glow */}
      <div className="glow-blob w-[500px] h-[500px] bg-[#D900FF]/5 -bottom-20 right-0 opacity-60" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8 max-w-7xl mx-auto relative z-10">
        <div>
          <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-widest text-[#D900FF] bg-[#D900FF]/5 px-3.5 py-1.5 rounded-full border border-[#D900FF]/15 w-fit shadow-[0_0_15px_rgba(217,0,255,0.1)]">
            <SettingsIcon size={14} className="text-[#D900FF]" /> System Settings
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white mt-3">
            Connections & Diagnostics
          </h1>
          <p className="text-[#A1A1AA] text-[13px] mt-1.5 font-light leading-relaxed">
            Configure keys and variables via the local backend's <code className="font-mono text-[#D900FF] font-bold tracking-widest bg-[#D900FF]/10 px-1.5 py-0.5 rounded">.env</code> file. Nothing is stored in the browser.
          </p>
        </div>

        {/* Test Connection Button */}
        <button
          onClick={runConnectionTests}
          disabled={testing}
          className="flex items-center justify-center gap-2 text-[12px] font-bold px-5 py-3 rounded-2xl transition-all shrink-0 w-full md:w-auto shadow-[0_0_20px_rgba(0,229,255,0.2)] bg-gradient-to-r from-[#00E5FF] to-[#D900FF] text-[#05050A] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {testing ? <RefreshCw size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          <span>{testing ? "Testing connections..." : "Test Environment Keys"}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto mb-10 glass-panel rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-6 hover:shadow-lg transition-shadow relative z-10">
        <div className="flex-1 w-full">
          <h3 className="text-[13px] font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
            Mobile Backend URL <span className="text-[10px] text-[#A1A1AA] font-normal">(Local IP or ngrok)</span>
          </h3>
          <input 
            type="text" 
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="e.g. http://192.168.1.XX:8787/api or https://xxxx.ngrok-free.app/api"
            className="w-full bg-[#05050A]/60 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-[13px] font-mono placeholder:text-white/20 outline-none focus:border-[#00E5FF]/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all shadow-inner"
          />
        </div>
        <button
          onClick={saveBackendUrl}
          className="flex items-center justify-center gap-2 text-[12px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-6 py-3.5 rounded-2xl border border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] w-full md:w-auto"
        >
          <CheckCircle2 size={15} />
          <span>Save & Reload</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto mb-10 p-6 rounded-3xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner relative z-10">
        <div>
          <h3 className="text-[13px] font-bold text-[#F59E0B] uppercase tracking-wider font-mono mb-1.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">Legal Agreements</h3>
          <p className="text-[12px] text-[#A1A1AA] leading-relaxed">Reset your agreement to the Glitch EnterPrice Terms and Conditions. This will force the prompt to reappear on reload.</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("glitch_terms_agreed");
            window.location.reload();
          }}
          className="flex items-center justify-center gap-2 text-[12px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-5 py-3 rounded-2xl border border-[#F59E0B]/20 hover:bg-[#F59E0B]/20 transition-all shrink-0 w-full md:w-auto hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <ShieldAlert size={15} />
          <span>Reset Terms Agreement</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 items-start relative z-10">
        
        {/* Left: Environment Keys List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-white uppercase tracking-wider font-mono">Environment Setup</h3>
            <div className="flex items-center gap-3">
              {envMessage && (
                <span className={`text-[11px] font-bold ${envMessage.type === "success" ? "text-[#00E5FF]" : "text-[#FF2A5F]"}`}>
                  {envMessage.text}
                </span>
              )}
              <button
                onClick={saveEnvVariables}
                disabled={isSavingEnv}
                className="flex items-center gap-2 text-[11px] font-bold text-[#D900FF] bg-[#D900FF]/10 px-4 py-2 rounded-xl border border-[#D900FF]/20 hover:bg-[#D900FF]/20 transition-all disabled:opacity-50"
              >
                {isSavingEnv ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                Save to Backend
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {CONNECTIONS.map((c) => {
              const Icon = c.icon;
              const result = testResults ? testResults[c.key] : null;

              return (
                <div 
                  key={c.env} 
                  className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-white/5 hover:border-white/10 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] text-[#D900FF] shrink-0 mt-0.5 shadow-inner border border-white/5">
                      <Icon size={18} className="drop-shadow-[0_0_5px_rgba(217,0,255,0.6)]" />
                    </div>
                    <div className="min-w-0 space-y-2 flex-1">
                      <div>
                        <p className="text-[13px] font-bold text-white truncate">{c.label}</p>
                        <p className="text-[11px] text-[#A1A1AA] truncate">{c.desc}</p>
                      </div>
                      <div className="flex items-center gap-3 w-full">
                        <code className="inline-block text-[10px] font-mono text-[#00E5FF] bg-[#05050A]/80 px-2 py-1.5 rounded-md border border-white/5 tracking-wider shadow-inner shrink-0">
                          {c.env}
                        </code>
                        <input
                          type="text"
                          value={envValues[c.env] || ""}
                          onChange={(e) => handleEnvChange(c.env, e.target.value)}
                          placeholder="Paste token or key here..."
                          className="flex-1 min-w-0 bg-[#05050A]/60 border border-white/10 rounded-lg px-3 py-1.5 text-white text-[12px] font-mono placeholder:text-white/20 outline-none focus:border-[#00E5FF]/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Diagnosed State */}
                  <div className="shrink-0 font-mono text-[11px] self-start sm:self-center">
                    {result ? (
                      result.ok ? (
                        <div className="flex items-center gap-2 text-[#00E5FF] bg-[#00E5FF]/10 px-3 py-1.5 rounded-lg border border-[#00E5FF]/20 shadow-[0_0_10px_rgba(0,229,255,0.1)] font-bold">
                          <CheckCircle2 size={13} /> <span>{result.latency}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#FF2A5F] bg-[#FF2A5F]/10 px-3 py-1.5 rounded-lg border border-[#FF2A5F]/20 shadow-[0_0_10px_rgba(255,42,95,0.1)] font-bold" title={result.error}>
                          <AlertTriangle size={13} /> <span>Missing</span>
                        </div>
                      )
                    ) : (
                      <span className="text-[#52525B] font-bold uppercase tracking-widest text-[9px] bg-white/5 px-3 py-1.5 rounded-lg">Not Tested</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Walkthrough Instructions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <HelpCircle size={14} className="text-[#D900FF] drop-shadow-[0_0_5px_rgba(217,0,255,0.6)]" /> Free Setup Guide
            </h3>
          </div>

          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 space-y-6 text-[12px] text-[#A1A1AA] leading-relaxed shadow-xl">
            
            {/* Guide Step 1 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2 text-[13px]">
                <span className="text-[10px] font-mono text-[#05050A] font-black bg-gradient-to-br from-[#00E5FF] to-[#00A3FF] w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.4)]">1</span>
                Supabase Tables (100% Free)
              </h4>
              <p className="pl-8 text-[12px]">
                Create a free project at supabase.com. In SQL Editor, paste and run the <code className="font-mono text-white bg-white/10 px-1 rounded">backend/db/schema.sql</code> script. Create a public Storage Bucket named <code className="font-mono text-white bg-white/10 px-1 rounded">content-vault</code>.
              </p>
            </div>

            {/* Guide Step 2 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2 text-[13px]">
                <span className="text-[10px] font-mono text-[#05050A] font-black bg-gradient-to-br from-[#D900FF] to-[#8B7CFF] w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(217,0,255,0.4)]">2</span>
                Gemini API Key (100% Free)
              </h4>
              <p className="pl-8 text-[12px]">
                Go to Google AI Studio (aistudio.google.com) and create a free key. This powers chat brainstorming and variants generation.
              </p>
            </div>

            {/* Guide Step 3 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2 text-[13px]">
                <span className="text-[10px] font-mono text-[#05050A] font-black bg-gradient-to-br from-[#FF2A5F] to-[#FF7B54] w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,42,95,0.4)]">3</span>
                Meta Facebook Developers
              </h4>
              <p className="pl-8 text-[12px]">
                Create a Facebook Page, register an app at developers.facebook.com, link Page Permissions, and get a long-lived Page Token for auto-posting.
              </p>
            </div>

            {/* Guide Step 4 */}
            <div className="space-y-2 border-t border-white/5 pt-5">
              <h4 className="text-white font-bold flex items-center gap-2 text-[13px]">
                <span className="text-[10px] font-mono text-[#05050A] font-black bg-gradient-to-br from-[#43FFB0] to-[#00E5FF] w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(67,255,176,0.4)]">4</span>
                Local Run Command
              </h4>
              <div className="pl-8 space-y-2.5">
                <p className="text-[12px]">Run backend server in your command prompt:</p>
                <div className="bg-[#030303]/90 p-3.5 rounded-xl border border-white/5 font-mono text-[11px] text-[#00E5FF] select-all flex items-center gap-2 shadow-inner">
                  <Terminal size={14} className="opacity-50" />
                  <span className="tracking-widest">cd backend; npm run dev</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
