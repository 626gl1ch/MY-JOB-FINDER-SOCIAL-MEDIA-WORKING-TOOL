import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export default function TermsModal({ onAgree }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const agreed = localStorage.getItem("glitch_terms_agreed");
    if (!agreed) {
      setIsVisible(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem("glitch_terms_agreed", "true");
    setIsVisible(false);
    if (onAgree) onAgree();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFac0a]/10 text-[#FFac0a]">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-tight">Terms & Conditions</h2>
              <p className="text-xs text-[#8B93A7] mt-1 font-mono">Glitch EnterPrice Software License Agreement</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto scrollbar-thin space-y-6 text-sm text-[#8B93A7] leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-white font-semibold">1. Acceptance of Terms</h3>
            <p>
              By accessing and using Glitch Broadcast (the "Software"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Software.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">2. Limitation of Liability & "As Is" Provision</h3>
            <p>
              The Software is provided "AS IS" and "AS AVAILABLE", without warranty of any kind, express or implied. Under no circumstances shall Glitch EnterPrice, the developer, or any affiliated parties be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Software.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">3. Third-Party Platforms & Account Risks</h3>
            <p>
              This Software interfaces with third-party platforms (including but not limited to Meta, Facebook, Instagram, and LinkedIn) through both official APIs and browser automation (Puppeteer). 
            </p>
            <div className="bg-[#FF5C7A]/10 border border-[#FF5C7A]/20 p-4 rounded-xl mt-3 text-[#FF5C7A]">
              <p className="font-semibold mb-1">CRITICAL NOTICE REGARDING ACCOUNT BANS:</p>
              <p className="text-xs opacity-90">
                Using browser automation scripts (such as the Facebook Groups assisted posting feature) violates the Terms of Service of some third-party platforms. You acknowledge and accept that using these features carries an inherent risk of having your social media accounts restricted, suspended, or permanently banned. <strong>Glitch EnterPrice is not responsible for any account bans, loss of data, or loss of revenue resulting from your use of this Software.</strong>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">4. Data Privacy & Local Storage</h3>
            <p>
              Glitch Broadcast operates primarily as a local-first environment. Your API keys, access tokens, and passwords are not transmitted to or stored on any central server owned by Glitch EnterPrice. You are entirely responsible for securing your environment, ngrok tunnels, database credentials, and local devices.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">5. Modifications</h3>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Software constitutes your consent to such changes.
            </p>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-6 border-t border-white/5 bg-black/40 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[#5C6478] font-mono text-center sm:text-left">
            You must agree to these terms to continue using the application.
          </p>
          <button
            onClick={handleAgree}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-[#06080C] bg-[#43FFB0] px-6 py-3 rounded-xl border border-[#43FFB0] hover:bg-[#43FFB0]/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <CheckCircle2 size={18} />
            <span>I Understand and Agree</span>
          </button>
        </div>
      </div>
    </div>
  );
}
