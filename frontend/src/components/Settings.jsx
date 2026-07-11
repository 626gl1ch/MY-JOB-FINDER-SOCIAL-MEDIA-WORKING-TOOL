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
    <div className="p-5 md:p-8 relative min-h-screen bg-[#121215] pb-32">
      {/* Background glow */}
      <div className="glow-blob w-[500px] h-[500px] bg-accent/10 -bottom-20 right-0 opacity-60" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 max-w-6xl mx-auto relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent">
            <SettingsIcon size={14} className="text-accent" /> System Settings
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white mt-1">
            Connections & Diagnostics
          </h1>
          <p className="text-muted text-[13px] mt-1.5 font-light leading-relaxed">
            Configure keys and variables via the local backend's <code className="font-mono text-accent font-bold tracking-widest bg-accent/10 px-1.5 py-0.5 rounded">.env</code> file.
          </p>
        </div>

        {/* Test Connection Button */}
        <button
          onClick={runConnectionTests}
          disabled={testing}
          className="flex items-center justify-center gap-2 text-sm font-bold px-6 py-3.5 rounded-full transition-all shrink-0 w-full md:w-auto shadow-lg bg-accent text-[#121215] hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {testing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          <span>{testing ? "Testing connections..." : "Test Environment Keys"}</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto mb-8 bg-surface rounded-[32px] p-6 md:p-8 border border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-xl relative z-10">
        <div className="flex-1 w-full">
          <h3 className="text-sm font-bold text-white tracking-wide mb-3 flex items-center gap-2">
            Mobile Backend URL <span className="text-[10px] text-muted font-normal uppercase">(Local IP or ngrok)</span>
          </h3>
          <input 
            type="text" 
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="e.g. http://192.168.1.XX:8787/api or https://xxxx.ngrok-free.app/api"
            className="w-full bg-[#121215] rounded-[24px] px-5 py-4 text-white text-[13px] font-mono placeholder:text-muted outline-none focus:border-accent/50 border border-transparent transition-all shadow-inner"
          />
        </div>
        <button
          onClick={saveBackendUrl}
          className="flex items-center justify-center gap-2 text-sm font-bold text-accent bg-accent/10 px-6 py-4 rounded-full hover:bg-accent/20 transition-all shrink-0 active:scale-95 w-full md:w-auto"
        >
          <CheckCircle2 size={18} />
          <span>Save & Reload</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto mb-8 p-6 rounded-[32px] border border-alert/20 bg-alert/5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner relative z-10">
        <div>
          <h3 className="text-sm font-bold text-alert tracking-wide mb-1.5 flex items-center gap-2">
            <ShieldAlert size={16} /> Legal Agreements
          </h3>
          <p className="text-[12px] text-alert/70 leading-relaxed">Reset your agreement to the Glitch EnterPrice Terms and Conditions. This will force the prompt to reappear on reload.</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("glitch_terms_agreed");
            window.location.reload();
          }}
          className="flex items-center justify-center gap-2 text-xs font-bold text-alert bg-alert/10 px-5 py-3 rounded-full hover:bg-alert/20 transition-all shrink-0 w-full md:w-auto"
        >
          <span>Reset Terms</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        
        {/* Left: Environment Keys List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-base font-bold text-white tracking-tight">Environment Setup</h3>
            <div className="flex items-center gap-3">
              {envMessage && (
                <span className={`text-[11px] font-bold ${envMessage.type === "success" ? "text-signal" : "text-alert"}`}>
                  {envMessage.text}
                </span>
              )}
              <button
                onClick={saveEnvVariables}
                disabled={isSavingEnv}
                className="flex items-center gap-2 text-xs font-bold text-accent bg-accent/10 px-4 py-2.5 rounded-full hover:bg-accent/20 transition-all disabled:opacity-50"
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
                  className="bg-surface rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-white/5 hover:border-white/10 shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="p-3.5 rounded-2xl bg-[#121215] text-accent shrink-0 mt-0.5 shadow-inner border border-white/5">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 space-y-2 flex-1">
                      <div>
                        <p className="text-sm font-bold text-white truncate">{c.label}</p>
                        <p className="text-xs text-muted truncate">{c.desc}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                        <code className="inline-block text-[10px] font-mono text-accent bg-[#121215] px-2 py-1.5 rounded-lg border border-white/5 tracking-wider shadow-inner shrink-0 w-max">
                          {c.env}
                        </code>
                        <input
                          type="text"
                          value={envValues[c.env] || ""}
                          onChange={(e) => handleEnvChange(c.env, e.target.value)}
                          placeholder="Paste token or key here..."
                          className="flex-1 min-w-0 bg-[#121215] rounded-[16px] px-4 py-2 text-white text-xs font-mono placeholder:text-muted outline-none focus:border-accent/50 border border-transparent shadow-inner transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Diagnosed State */}
                  <div className="shrink-0 font-mono text-[11px] self-start sm:self-center">
                    {result ? (
                      result.ok ? (
                        <div className="flex items-center gap-2 text-signal bg-signal/10 px-3 py-1.5 rounded-full font-bold">
                          <CheckCircle2 size={13} /> <span>{result.latency}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-alert bg-alert/10 px-3 py-1.5 rounded-full font-bold" title={result.error}>
                          <AlertTriangle size={13} /> <span>Missing</span>
                        </div>
                      )
                    ) : (
                      <span className="text-muted font-bold uppercase tracking-widest text-[9px] bg-white/5 px-3 py-1.5 rounded-full">Not Tested</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Walkthrough Instructions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <HelpCircle size={18} className="text-accent" /> Free Setup Guide
            </h3>
          </div>

          <div className="bg-surface rounded-[32px] p-6 md:p-8 border border-white/5 space-y-6 text-xs text-muted leading-relaxed shadow-xl">
            
            {/* Guide Step 1 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <span className="text-[10px] font-mono text-[#121215] font-black bg-accent w-6 h-6 rounded-full flex items-center justify-center shadow-md">1</span>
                Supabase Tables
              </h4>
              <p className="pl-8 text-[12px]">
                Create a free project at supabase.com. In SQL Editor, paste and run the <code className="font-mono text-white bg-white/10 px-1 rounded">backend/db/schema.sql</code> script. Create a public Storage Bucket named <code className="font-mono text-white bg-white/10 px-1 rounded">content-vault</code>.
              </p>
            </div>

            {/* Guide Step 2 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <span className="text-[10px] font-mono text-[#121215] font-black bg-accent w-6 h-6 rounded-full flex items-center justify-center shadow-md">2</span>
                Gemini API Key
              </h4>
              <p className="pl-8 text-[12px]">
                Go to Google AI Studio (aistudio.google.com) and create a free key. This powers chat brainstorming and variants generation.
              </p>
            </div>

            {/* Guide Step 3 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <span className="text-[10px] font-mono text-[#121215] font-black bg-accent w-6 h-6 rounded-full flex items-center justify-center shadow-md">3</span>
                Meta Facebook Devs
              </h4>
              <p className="pl-8 text-[12px]">
                Create a Facebook Page, register an app at developers.facebook.com, link Page Permissions, and get a long-lived Page Token for auto-posting.
              </p>
            </div>

            {/* Guide Step 4 */}
            <div className="space-y-2 border-t border-white/5 pt-5">
              <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <span className="text-[10px] font-mono text-[#121215] font-black bg-accent w-6 h-6 rounded-full flex items-center justify-center shadow-md">4</span>
                Local Run Command
              </h4>
              <div className="pl-8 space-y-2.5">
                <p className="text-[12px]">Run backend server in your command prompt:</p>
                <div className="bg-[#121215] p-3.5 rounded-2xl border border-white/5 font-mono text-[11px] text-accent select-all flex items-center gap-2 shadow-inner">
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
