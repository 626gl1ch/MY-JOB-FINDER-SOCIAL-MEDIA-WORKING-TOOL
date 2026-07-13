import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2, Lock, Key, CreditCard, Sparkles, Loader2 } from "lucide-react";
import { getUsageCount, isSubscribed, setSubscribed, setAdmin, verifyAdminCredentials } from "../utils/usage";

export default function PaywallModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  
  // Paystack Payment State
  const [email, setEmail] = useState("");
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  
  // Admin Login State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminMessage, setAdminMessage] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Monitor usage events
  const checkStatus = () => {
    const subscribed = isSubscribed();
    const count = getUsageCount();
    if (!subscribed && count >= 3) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    checkStatus();
    window.addEventListener("glitch-usage-change", checkStatus);
    window.addEventListener("nav-change", checkStatus);
    return () => {
      window.removeEventListener("glitch-usage-change", checkStatus);
      window.removeEventListener("nav-change", checkStatus);
    };
  }, []);

  // Dynamically load Paystack Inline JS script
  const loadPaystackScript = () => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve(window.PaystackPop);
      script.onerror = () => reject(new Error("Failed to load Paystack SDK"));
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Please enter your email to proceed.");
      return;
    }

    setIsProcessingPay(true);
    try {
      const PaystackPop = await loadPaystackScript();
      
      // Load keys
      const keys = JSON.parse(localStorage.getItem("glitch_keys") || "{}");
      // Fallback to a standard test key if they haven't configured their own
      const paystackKey = keys.PAYSTACK_PUBLIC_KEY || "pk_test_a6e1a49f57dfcbde8416d8a39dcd750c2b2e8a60"; 

      const handler = PaystackPop.setup({
        key: paystackKey,
        email: email.trim(),
        amount: 10 * 100 * 1650, // $10 USD in NGN (assuming ~1650 NGN/$1 exchange rate = 16,500 NGN)
        currency: "NGN",
        callback: function (response) {
          setIsProcessingPay(false);
          if (response && response.status === "success") {
            setSubscribed(true);
            alert("Payment successful! Welcome to Glitch Broadcast Pro!");
            setIsVisible(false);
          } else {
            alert("Payment completed but status was not successful.");
          }
        },
        onClose: function () {
          setIsProcessingPay(false);
          alert("Payment window closed.");
        },
      });
      handler.openIframe();
    } catch (err) {
      setIsProcessingPay(false);
      alert(`Paystack Initialization Error: ${err.message}. Make sure your Internet is active.`);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAdminMessage({ type: "error", text: "Please enter both fields." });
      return;
    }

    setIsLoggingIn(true);
    setAdminMessage(null);

    try {
      const isValid = await verifyAdminCredentials(adminEmail, adminPassword);
      if (isValid) {
        setAdmin(true);
        setAdminMessage({ type: "success", text: "Admin Access Granted! Loading Unlimited License." });
        setTimeout(() => {
          setIsVisible(false);
          setShowAdminForm(false);
          setAdminEmail("");
          setAdminPassword("");
          setAdminMessage(null);
        }, 1500);
      } else {
        setAdminMessage({ type: "error", text: "Invalid administrator credentials." });
      }
    } catch (err) {
      setAdminMessage({ type: "error", text: "Error during validation: " + err.message });
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-[32px] border border-white/10 flex flex-col overflow-hidden shadow-2xl relative p-6 bg-[#101015]/95">
        
        {/* Floating gradient glow behind paywall */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

        {/* Content Toggle between Paywall & Admin Login */}
        {!showAdminForm ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-gradient flex items-center justify-center text-white shadow-[0_8px_20px_-6px_rgba(176,139,255,0.6)]">
              <Lock size={26} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent flex items-center justify-center gap-1">
                <Sparkles size={12} className="text-accent" /> Premium Paywall
              </span>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                Trial Limit Reached
              </h2>
              <p className="text-xs text-[#8B93A7] px-2 leading-relaxed">
                You have reached your limit of 3 free broadcast generations/messages. Upgrade to Pro for unlimited content scheduling, alt-text generation, and AI assistance.
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase font-mono text-[#8B93A7] mb-1.5 ml-1">
                  Billing Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter email to upgrade..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121215] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-muted focus:border-accent/40 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingPay}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#06080C] bg-accent px-6 py-3.5 rounded-2xl border border-accent hover:bg-accent/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg cursor-pointer"
              >
                {isProcessingPay ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#06080C]" />
                    <span>Processing Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} className="text-[#06080C]" />
                    <span>Subscribe to Pro ($10/mo)</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-muted font-mono text-[10px]">Method: Paystack checkout</span>
              <button
                onClick={() => setShowAdminForm(true)}
                className="text-accent hover:text-white font-semibold transition-colors flex items-center gap-1"
              >
                <Key size={12} /> Team Admin Login
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-display font-bold text-white tracking-tight">
                Team Bypass Authentication
              </h2>
              <p className="text-xs text-[#8B93A7]">
                Enter your administrative credentials to activate your free unlimited developer license.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-[#8B93A7] mb-1.5 ml-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@email.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#121215] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-muted focus:border-accent/40 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#8B93A7] mb-1.5 ml-1">
                  Backdoor Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#121215] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-muted focus:border-accent/40 focus:outline-none transition-all shadow-inner"
                />
              </div>

              {adminMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs border ${
                    adminMessage.type === "success"
                      ? "bg-signal/10 border-signal/20 text-signal"
                      : "bg-alert/10 border-alert/20 text-alert"
                  }`}
                >
                  {adminMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#06080C] bg-[#43FFB0] px-6 py-3.5 rounded-2xl border border-[#43FFB0] hover:bg-[#43FFB0]/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#06080C]" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-[#06080C]" />
                    <span>Authorize Bypass</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-white/5 text-center">
              <button
                onClick={() => {
                  setShowAdminForm(false);
                  setAdminMessage(null);
                }}
                className="text-xs text-muted hover:text-white font-medium transition-colors"
              >
                Back to Paywall
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
