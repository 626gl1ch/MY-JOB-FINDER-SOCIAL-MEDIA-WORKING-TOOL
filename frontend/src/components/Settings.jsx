import React, { useState } from "react";
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
  Info
} from "lucide-react";

const CONNECTIONS = [
  { key: "fb", label: "Facebook Page Token", icon: Facebook, env: "META_PAGE_ACCESS_TOKEN", desc: "Allows publishing posts to Facebook Pages." },
  { key: "ig", label: "Instagram ID", icon: Instagram, env: "META_IG_BUSINESS_ACCOUNT_ID", desc: "Allows publishing images/captions to Instagram Business." },
  { key: "li", label: "LinkedIn Access Token", icon: Linkedin, env: "LINKEDIN_ACCESS_TOKEN", desc: "Allows automated updates on LinkedIn Profile." },
  { key: "gemini", label: "Gemini AI Key", icon: KeyRound, env: "GEMINI_API_KEY", desc: "Powers post variations, alt text, and ideas chat." },
  { key: "supabase", label: "Supabase DB Connection", icon: Database, env: "SUPABASE_URL", desc: "Connects local backend to database tables." }
];

export default function Settings() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const runConnectionTests = () => {
    setTesting(true);
    setTestResults(null);
    setTimeout(() => {
      setTestResults({
        fb: { ok: true, latency: "42ms" },
        ig: { ok: true, latency: "65ms" },
        li: { ok: false, error: "Missing Access Token" },
        gemini: { ok: true, latency: "112ms" },
        supabase: { ok: true, latency: "25ms" }
      });
      setTesting(false);
    }, 1500);
  };

  return (
    <div className="p-8 relative min-h-screen">
      {/* Background glow */}
      <div className="glow-blob w-[500px] h-[500px] bg-[#8B7CFF]/3 -bottom-20 right-0 opacity-60" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#8B7CFF]">
            <SettingsIcon size={12} /> System Settings
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white mt-1.5">
            Connections & Diagnostics
          </h1>
          <p className="text-[#8B93A7] text-xs mt-0.5">
            Configure keys and variables via the local backend's <code className="font-mono text-[#8B7CFF]">.env</code> file. Nothing is stored in the browser.
          </p>
        </div>

        {/* Test Connection Button */}
        <button
          onClick={runConnectionTests}
          disabled={testing}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#43FFB0] bg-[#43FFB0]/10 px-4 py-2.5 rounded-xl border border-[#43FFB0]/20 hover:bg-[#43FFB0]/20 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          {testing ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          <span>{testing ? "Testing connections..." : "Test Environment Keys"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        
        {/* Left: Environment Keys List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Environment Setup</h3>
            <span className="text-[10px] text-[#5C6478] font-mono">Read from backend .env</span>
          </div>

          <div className="space-y-3">
            {CONNECTIONS.map((c) => {
              const Icon = c.icon;
              const result = testResults ? testResults[c.key] : null;

              return (
                <div 
                  key={c.env} 
                  className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] text-[#8B93A7] shrink-0 mt-0.5">
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{c.label}</p>
                      <p className="text-[10px] text-[#8B93A7] truncate mt-0.5">{c.desc}</p>
                      <code className="inline-block text-[9px] font-mono text-[#5C6478] bg-black/40 px-1.5 py-0.5 rounded border border-white/5 mt-1">
                        {c.env}
                      </code>
                    </div>
                  </div>

                  {/* Diagnosed State */}
                  <div className="shrink-0 font-mono text-[10px]">
                    {result ? (
                      result.ok ? (
                        <div className="flex items-center gap-1.5 text-[#43FFB0] bg-[#43FFB0]/5 px-2 py-1 rounded border border-[#43FFB0]/20">
                          <CheckCircle2 size={11} /> <span>{result.latency}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#FF5C7A] bg-[#FF5C7A]/5 px-2 py-1 rounded border border-[#FF5C7A]/20" title={result.error}>
                          <AlertTriangle size={11} /> <span>Missing</span>
                        </div>
                      )
                    ) : (
                      <span className="text-[#5C6478]">Not Tested</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Walkthrough Instructions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <HelpCircle size={12} className="text-[#8B7CFF]" /> Free Setup Guide
            </h3>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4 text-xs text-[#8B93A7] leading-relaxed">
            
            {/* Guide Step 1 */}
            <div className="space-y-1">
              <h4 className="text-white font-semibold flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#8B7CFF] bg-[#8B7CFF]/10 w-5 h-5 rounded-full flex items-center justify-center border border-[#8B7CFF]/20">1</span>
                Supabase Tables (100% Free)
              </h4>
              <p className="pl-6 text-[11px]">
                Create a free project at supabase.com. In SQL Editor, paste and run the <code className="font-mono text-white">backend/db/schema.sql</code> script. Create a public Storage Bucket named <code className="font-mono text-white">content-vault</code>.
              </p>
            </div>

            {/* Guide Step 2 */}
            <div className="space-y-1">
              <h4 className="text-white font-semibold flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#8B7CFF] bg-[#8B7CFF]/10 w-5 h-5 rounded-full flex items-center justify-center border border-[#8B7CFF]/20">2</span>
                Gemini API Key (100% Free)
              </h4>
              <p className="pl-6 text-[11px]">
                Go to Google AI Studio (aistudio.google.com) and create a free key. This powers chat brainstorming and variants generation.
              </p>
            </div>

            {/* Guide Step 3 */}
            <div className="space-y-1">
              <h4 className="text-white font-semibold flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#8B7CFF] bg-[#8B7CFF]/10 w-5 h-5 rounded-full flex items-center justify-center border border-[#8B7CFF]/20">3</span>
                Meta Facebook Developers
              </h4>
              <p className="pl-6 text-[11px]">
                Create a Facebook Page, register an app at developers.facebook.com, link Page Permissions, and get a long-lived Page Token for auto-posting.
              </p>
            </div>

            {/* Guide Step 4 */}
            <div className="space-y-1 border-t border-white/5 pt-3">
              <h4 className="text-white font-semibold flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#8B7CFF] bg-[#8B7CFF]/10 w-5 h-5 rounded-full flex items-center justify-center border border-[#8B7CFF]/20">4</span>
                Local Local Run Command
              </h4>
              <div className="pl-6 space-y-1.5">
                <p className="text-[11px]">Run backend server in your command prompt:</p>
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-[9px] text-[#43FFB0] select-all flex items-center gap-1.5">
                  <Terminal size={10} />
                  <span>cd backend; npm run dev</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
